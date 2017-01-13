 // Configure logger for server tests
 var logger = new Logger('Client:Clustering');
 // Comment out to use global logging level
 Logger.setLevel('Client:Synthesis:Clustering', 'trace');
 //Logger.setLevel('Client:Synthesis:Clustering', 'debug');
 //Logger.setLevel('Client:Synthesis:Clustering', 'info');
 //Logger.setLevel('Client:Synthesis:Clustering', 'warn');
/*******************************************************************
 * ******************  Clustering Template ************************
 * ****************************************************************/
// Name for filters applied to idea list of unclustered ideas
var ideaFilterName    = "Unclustered Ideas"; 
var clusterFilterName = "Clustering droppable";

/********************************************************************
* Attaches sortable to idea and cluster lists, new cluster area.
********************************************************************/
Template.MturkClustering.rendered = function() {
  
  logger.debug("Rendering Clustering page");
  Session.set("searchQuery","");
  //Set height of elements to viewport height
  //Navbar height=50, header up to idealist = 150, clustering interface header=63
  var clusterHeaderHeight = $(".mturk-cluster-header").height() + 10; //10px margin
  var navbarHeight = $("#header").height();
  var height = $(window).height() - navbarHeight - clusterHeaderHeight - 5;
  logger.debug("window viewport height = " + height.toString());
  $("#left-clustering").height(height);
  var ideaHeaderHeight = $('.idea-box-header').height() + 
  $("#filterbox-header").height() + 75; //unknown manual tweak
  $("#idealist").height(height - ideaHeaderHeight);
  $("#middle-clustering").height(height);
  var themeHeaderHeight = $(".cluster-list h3").height() +
  $("#new-cluster").height() + 80;
  $("#clusterlist").height(height-themeHeaderHeight);
  $("#right-clustering").height(height);

  // Set draggable and droppable properties of appropriate components 
  $('.cluster-idea-list').droppable({accept: ".idea-item",
    tolerance: "pointer",
    drop: function(event, ui) {
      receiveDroppable(event, ui, this);
    }
  }); 
  $('#new-cluster').droppable({accept: ".idea-item",
    tolerance: "pointer",
    hoverClass: 'ui-state-hover',
    drop: function(event, ui) {
      receiveDroppable(event, ui, this);
    }
  });

  $('.cluster-item').droppable({accept: ".idea-item",
    tolerance: "pointer",
    hoverClass: "ui-state-hover",
    drop: function(event, ui) {
      receiveDroppable(event, ui, this);
    }
  });

  $('.cluster-trash-can').droppable({accept: ".cluster",
    tolerance: "pointer",
    hoverClass: 'ui-state-hover',
    drop: function(event, ui) {
      trashCluster(event, ui, this);
    }
  });

  //Get Data and setup listeners
  var prompt = Session.get("currentPrompt");
  var group = Groups.findOne({_id: prompt.groupIDs[0]});
  
  Session.set("currentGroup", group);
  //var group = Groups.findOne({_id: Session.get("currentGroupID")});
  var group = Session.get("currentGroup");
  var user = Session.get("currentUser");
  //Get user graph
  var userGraph = Graphs.findOne({
    'promptID': prompt._id,
    'groupID' : group._id,
    'userID'  : user._id
  });
  
  logger.trace(userGraph);
  
  if (!userGraph) {
    logger.info("No user graph found.  Initializing new graph");
    Meteor.call("graphCreate", prompt._id, group._id, user._id,
      function (error, result) {
        logger.trace("User graph create error msg: " + JSON.stringify(error));
        logger.debug("Setting User graph");
        var cg = Graphs.findOne({_id: result});
        Session.set("currentGraph", cg);
       
        if (Session.get("sharedGraph")) {
          logger.debug("setting filters after getting userGraph");
          setFilters(cg, Session.get("sharedGraph"));
        }
       
        Tracker.autorun(function(c) {
          logger.debug("Attempting to set shared graph listener.");
          if (Session.get("sharedGraph")) {
            setSharedGraphListener(Session.get("sharedGraph"), cg);
            //c.stop();
          } 
        });
        //startServerListener();
      }
    );
  } else {
    logger.debug("Found and Setting User graph");
    Session.set("currentGraph", userGraph);
    Tracker.autorun(function(c) {
      logger.debug("Attempting to set shared graph listener");
      if (Session.get("sharedGraph")) {
        setSharedGraphListener(Session.get("sharedGraph"), userGraph);
        //c.stop();
      } 
    });
    //startServerListener();
  }
  
  //Get shared graph
  var sharedGraph = Graphs.findOne({
    'promptID': prompt._id,
    'groupID': group._id,
    'userID': null,
  });
  logger.trace(sharedGraph);
  
  if (!sharedGraph) {
    logger.info("No shared graph found.  Initializing new graph");
    Meteor.call("graphCreate", prompt._id, group._id, null,
      function (error, result) {
        logger.trace("Shared graph create error: " + JSON.stringify(error));
        logger.debug("Setting shared graph");
        var sg = Graphs.findOne({_id: result});
        Session.set("sharedGraph", sg);
        if (Session.get("currentGraph")) {
          logger.debug("setting filters after getting sharedGraph");
          setFilters(Session.get("currentGraph"), sg);
        }
      });
  } else {
    logger.debug("Found and Setting shared graph");
    Session.set("sharedGraph", sharedGraph);
  }


  logger.debug("Setting base idea and theme filters");
  ////Reset all the filters before initializing
  FilterManager.reset(ideaFilterName, Session.get("currentUser"),"nodes"); 
  FilterManager.reset(clusterFilterName,Session.get("currentUser"), "nodes"); 
  Session.set("filtersSet", false);
  //Create base filters for ideas
  FilterManager.create(ideaFilterName,
      Session.get("currentUser"), "nodes", "type", 'idea');
  //Create base filters for themes
  FilterManager.create(clusterFilterName,Session.get("currentUser"),"nodes",
      "type",
      'theme'
  );
  FilterManager.create(clusterFilterName,
      Session.get("currentUser"),
      "nodes",
      "isTrash",
      false 
  );
  if (Session.get("currentGraph") && Session.get("sharedGraph")) {
    logger.debug("setting filters immediately");
    setFilters(
        Session.get("currentGraph"), 
        Session.get("sharedGraph")
    );
  } else {
    FilterManager.create(
        ideaFilterName,
        Session.get("currentUser"),
        "nodes",
        "graphID",
        ""
    ); 
    FilterManager.create(clusterFilterName,
        Session.get("currentUser"),
        "nodes",
        "graphID",
        ""
    ); 
  }
};

var setSharedGraphListener = function(sharedGraph, userGraph) {
  logger.debug("Setting up shared graph listener");
  Tracker.autorun(function() {
    logger.debug("*********Setting up shared graph listener *************");
    if (!Session.get("duplicatingNode")) {
      var sharedThemes = Nodes.find({ graphID: sharedGraph._id, type: 'theme'});
      var userThemes = Nodes.find({graphID: userGraph._id, 
          type: 'theme'});
      var sharedIDs = getIDs(sharedThemes);
      var userNodeIDs = getIDs(userThemes);
      var syncedThemes = Edges.find({type: 'graph_link', 
        sharedNodeID: {$in: sharedIDs}, 
          userNodeID: {$in: userNodeIDs}
      });
      var syncedIDs = getValsFromField(syncedThemes, 'sharedNodeID');
      var unsyncedIDs = _.difference(sharedIDs, syncedIDs);
      logger.trace("All Theme IDs: " + JSON.stringify(sharedIDs));
      logger.trace("User Node IDs: " + JSON.stringify(userNodeIDs));
     
      logger.trace("Synchronized Theme IDs: " + JSON.stringify(syncedIDs));
      logger.trace("Unsynchronized Theme IDs: " + JSON.stringify(unsyncedIDs));
     
      if (unsyncedIDs.length !== 0) {
        logger.debug("Graph not syncronized with shared graph, " + 
          "copying unsynchronized theme nodes");
        var gID = Session.get("currentGraph")._id;
       
        for (var i=0; i<unsyncedIDs.length; i++) {
          logger.debug("creating duplicate shared node");
          Session.set("duplicatingNode", true);
          Meteor.call("graphDuplicateShared", unsyncedIDs[i], gID,
            function(error, result) {
              logger.debug("finished creating duplicate shared node");
              Session.set("duplicatingNode", false);
            }
          );
  
        }
      } else {
        logger.debug("Graph syncronized with shared graph");
        logger.trace("All Theme IDs: " + JSON.stringify(sharedIDs));
        logger.trace("Synchronized Theme IDs: " + 
            JSON.stringify(syncedIDs));
        var unsyncedIDs = _.difference(sharedIDs, syncedIDs);
        logger.trace("Unsynchronized Theme IDs: " + 
            JSON.stringify(unsyncedIDs));
      }
    }
  });
};

var setFilters = function(userGraph, sharedGraph) {
  logger.debug("Removing old filters with null graphID");
  logger.trace("User Graph: "   + JSON.stringify(userGraph));
  logger.trace("Shared Graph: " + JSON.stringify(sharedGraph));
  FilterManager.remove(ideaFilterName,
      Session.get("currentUser"),
      "nodes",
      "graphID",
      ""
  ); 
  FilterManager.remove(clusterFilterName,
      Session.get("currentUser"),
      "nodes",
      "graphID",
      ""
  );
  logger.debug("Updating filters with graphID");
  FilterManager.create(ideaFilterName,
      Session.get("currentUser"),
      "nodes",
      "graphID",
      sharedGraph._id
  );
  FilterManager.create(clusterFilterName,
      Session.get("currentUser"),
      "nodes",
      "graphID",
      userGraph._id
  );
  Session.set("filtersSet", true);
}

startServerListener = function() {
  logger.debug("Starting Idea listener on the server");
  //Update Idea Listener when new members join group
  //logger.debug("creating group listener for new users");
  //Groups.find({_id: group._id}).observe({
    //changed: function(newDoc, oldDoc) {
      //var users = newDoc.users;
      //setIdeaListener(users, Session.get("currentPrompt"));
    //},
  //});
  var group = Groups.findOne({_id: Session.get("currentGroupID")});
  Meteor.call("graphIdeaListener",
    Session.get("currentGraph")._id, 
    getIDs(group.users),
    Session.get("currentPrompt")._id,
    function(error, result) {
      logger.debug("Idea Listener started");
    }
  );
};


//var setIdeaListener = function(users, prompt) {
  ////Get user graph
  //var userGraph = Session.get("currentGraph");
  //var nodes = Nodes.find({graphID: userGraph._id});
  //var ideaIDs = getValsFromField(nodes, 'ideaID');
  //logger.trace("IdeaIDs already in graph at load time");
  //logger.trace(ideaIDs);
  //var currentListener = Session.get("ideaObserver");
  //var userIDs = getIDs(users);
  //var observer = Ideas.find({$and: [
      //{userID: {$in: userIDs}},
      //{promptID: prompt._id},
      //{_id: {$nin: ideaIDs}} ]}).observe({
    //added: function(idea) {
      //createIdeaNode(idea);
    //},
  //});
//};

var createIdeaNode = function(idea) {
  logger.debug("creating node for idea");
  Meteor.call("graphCreateIdeaNode", 
    Session.get("currentGraph")._id, idea._id, null,
    function(error, result) {
      logger.trace("Created Graph Idea Node");
    }
  );
};


//createTheme = function(theme) {
  ////Test function for creating a theme
  //var graph = Session.get("sharedGraph");
  //var type = theme;
  //var data = {name: "Test Theme1",
      //time:  new Date().getTime(),
      //isTrash: false,
      //isMerged: false
  //};
  //Meteor.call("graphCreateNode", graphID, type, data);
//};
   

/********************************************************************
* IdeaList template Helpers
********************************************************************/
Template.MturkClusteringIdeaList.helpers({
  ideas : function(){
    logger.debug("Retrieving list of ideas");
    if (Session.get("filtersSet")) {
	    var result = FilterManager.performQuery(
        ideaFilterName, 
		    Session.get("currentUser"), 	
		    "nodes"
      );
      logger.trace("total number of ideas: " + result.count());
      return result;
    } else {
      logger.debug("Filters are not set");
      return null;
    }
  },

  numIdeas : function(){
    if (Session.get("filtersSet")) {
	    return FilterManager.performQuery(
        ideaFilterName, 
		    Session.get("currentUser"), "nodes").count();
    } else {
      return 0;
    }
  },
});

/********************************************************************
* ClusterIdeaItem template Helpers
********************************************************************/
Template.MturkClusterIdeaItem.rendered = function() {
  $(this.firstNode).draggable({containment: '.mturk-cluster-interface',
    revert: true,
    zIndex: 50,
    helper: 'clone',
    appendTo: ".mturk-cluster-interface",
    refreshPositions: true,
    start: function(e, ui) {
      logger.debug("Began dragging an idea");
      logger.trace(ui.helper[0]);
      var width = $(this).css('width');
      logger.trace(width);
      $(ui.helper[0]).css('width', width);
    },
  });
  $(this.firstNode).droppable({accept: ".idea-item",
    tolerance: "pointer",
  });
};

Template.MturkClusterIdeaItem.helpers({
  isNotInCluster: function() {
    var num = Edges.find({nodeIDs: this._id}).count();
    return (num === 0) ? true : false;
  },
  hasNotVoted: function() {
    return this.vote;
  },
  voteNum: function() {
    return Nodes.find({ideaID: this.ideaID, 
      vote: true}).count();
  },
  hasVotes: function() {
    logger.debug("ClusterIdeaItem has votes?");
    return false
    var num =  Nodes.find({ideaID: this.ideaID, 
      vote: true}).count();
    if (num > 0) {
      return true
    } else {
      return false
    }
  },
})

Template.MturkClusterIdeaItem.events({
  'click .up-vote': function(e, elm) {
    logger.debug("updating vote for node with ID: " + this._id);
    Nodes.update({_id: this._id}, {$set: {vote: !this.vote}});
    Meteor.call('graphUpdateIdeaVotes', this._id, 
      function(error, result) {
        logger.debug("Finished updating all votes to: " + result);
    });
  },

});

/********************************************************************
* ClusteringIdeaListIdeaItem template Helpers
********************************************************************/
Template.MturkClusteringIdeaListIdeaItem.rendered = function() {
  $(this.firstNode).draggable({containment: '.mturk-cluster-interface',
    revert: true,
    zIndex: 50,
    helper: 'clone',
    appendTo: ".mturk-cluster-interface",
    refreshPositions: true,
    start: function(e, ui) {
      logger.debug("Began dragging an idea");
      logger.trace(ui.helper[0]);
      var width = $(this).css('width');
      logger.trace(width);
      $(ui.helper[0]).css('width', width);
    },
  });
  $(this.firstNode).droppable({accept: ".idea-item",
    tolerance: "pointer",
  });
};

Template.MturkClusteringIdeaListIdeaItem.helpers({
  isNotInCluster: function() {
    var num = Edges.find({nodeIDs: this._id}).count();
    return (num === 0) ? true : false;
  },
  hasNotVoted: function() {
    return this.vote;
  },
  voteNum: function() {
    return Nodes.find({ideaID: this.ideaID, 
      vote: true}).count();
  },
  hasVotes: function() {
    logger.debug("IdeaListIdeaItem has votes?");
    return false
    var num =  Nodes.find({ideaID: this.ideaID, 
      vote: true}).count();
    if (num > 0) {
      return true
    } else {
      return false
    }
  },
})

Template.MturkClusteringIdeaListIdeaItem.events({
  'click .up-vote': function(e, elm) {
    logger.debug("updating vote for node with ID: " + this._id);
    Nodes.update({_id: this._id}, {$set: {vote: !this.vote}});
    Meteor.call('graphUpdateIdeaVotes', this._id, 
      function(error, result) {
        logger.debug("Finished updating all votes to: " + result);
        logger.trace(result);
    });
  },
});

/********************************************************************
* ClusterList template Helpers
********************************************************************/
Template.MturkClusterList.helpers({
  clusters : function(){
    logger.debug("Retrieving list of clusters for cluster list");
    if (Session.get("filtersSet")) {
	    var result = FilterManager.performQuery(
        clusterFilterName, 
		    Session.get("currentUser"), 	
		    "nodes"
      );
      logger.debug("******** number of clusters: " + 
          result.count() + " ***********");
      return result;
    } else {
      return null;
    }
  },
});

Template.MturkClusterList.rendered = function() {
  $('.cluster-item').droppable({accept: ".idea-item",
    tolerance: "pointer",
    hoverClass: "ui-state-hover",
    drop: function(event, ui) {
      receiveDroppable(event, ui, this);
    }
  });
};

/********************************************************************
* Clustering Interface template Helpers
********************************************************************/
Template.MturkClustering.helpers({

  clustername : function(){
    logger.trace("**************************************************");
    logger.trace(this);
    return this.name;
    var clu = Clusters.findOne({_id: this.toString()});
    if(clu === undefined) return false
    return clu.name;
  },
    
  prompt : function(){
    return Session.get("currentPrompt").title;
  },

  numClusters : function(){
	  return FilterManager.performQuery(
      clusterFilterName, 
		  Session.get("currentUser"), 	
		  "nodes"
    ).count();
  },

  numUnnamed : function(){
    var nullNames = ["Not named yet", "", " ", "  ", "   ", undefined];
    return Nodes.find({type: 'theme',
      'graphID': Session.get("currentGraph")._id,
      'name': {$in: nullNames}
    }).count();
  }
});

/********************************************************************
* Template event functions. Much of the heavy lifting in the interface*
* is done by the mouseover event.
********************************************************************/
Template.MturkClustering.events({

  //Collapse clusters and makes them unsortable until expanded
  'click .collapser' : function(){
    EventLogger.logClusterCollapse(this);
    // logger.debug("collapsing");
    // console.log(this);
    // var id = trimFromString($(this).parent().attr("id"), "cluster-");
    // logger.debug("collapsed" + id)
    Nodes.update({_id: this._id}, 
    // Clusters.update({_id: id}, 
      {$set: {isCollapsed: !this.isCollapsed}}
    );
  },

});


/*******************************************************************
 * ******************  ClusterArea Template ************************
 * ****************************************************************/
Template.MturkClusterarea.rendered = function(){
     
}

Template.MturkClusterarea.helpers({
  clusters : function(){
    logger.debug("Retrieving list of clusters for cluster area");
    if (Session.get("filtersSet")) {
	    var result =  FilterManager.performQuery(
        clusterFilterName, 
		    Session.get("currentUser"), 	
		    "nodes"
      );
      logger.trace("clusterIDs: " + 
        JSON.stringify(getIDs(result)));
      logger.debug("******** number of clusters: " + 
          result.count() + " ***********");
      return result;
    } else {
      return null;
    }
   
  },
});



/*******************************************************************
 * ******************  Cluster Template ************************
 * ****************************************************************/
Template.MturkCluster.events({
  //updates name field in cluster as user types
  'keyup .namecluster' : function(event, template){
    if(event.keyCode === 13) {
      logger.debug("Updating name of cluster");
      logger.debug(this);
      var clusterName = $(event.target).val();
      logger.debug("new cluster name: " + clusterName);
      var clusterID =  Meteor.call("graphUpdateNodeField", this._id, 
        {'name': clusterName});
      EventLogger.logChangeClusterName(this, clusterName);
    }
  },
});

Template.MturkCluster.rendered = function(){
  $('.cluster').draggable({
    stop: function() {
      logger.debug("dragged object data");
      logger.trace(this);
      var id = trimFromString($(this).attr("id"), "cluster-");
      var theme = Nodes.findOne({_id: id});
      var pos = {'top': parseFloat(trimFromString($(this).css('top'),'px')),
        'left': parseFloat(trimFromString($(this).css('left'),'px'))
      };
      Meteor.call("graphUpdateNodeField", theme._id,
        {'position': pos}
      );
      EventLogger.logMovedCluster(theme, pos);
    },
    grid: [5, 5]
  });
  // $(this.firstNode).find('.cluster-idea-list').droppable({
  $(this.firstNode).find('.cluster').droppable({
    accept: ".idea-item",
    tolerance: "pointer",
    drop: function(event, ui) {
      receiveDroppable(event, ui, this);
    }
  });
  $('.cluster-item').droppable({accept: ".idea-item",
    tolerance: "pointer",
    drop: function(event, ui) {
      receiveDroppable(event, ui, this);
    }
  });
  $('.cluster').droppable({accept: ".idea-item",
    tolerance: "pointer",
    hoverClass: 'ui-state-hover',
    drop: function(event, ui) {
      receiveDroppable(event, ui, this);
    }
  });
}


Template.MturkCluster.helpers({
  clusterideas : function(){
    logger.debug("Getting Cluster Ideas");
    logger.trace("**************** cluster data ***************\n" + 
      JSON.stringify(this));
    return getNodeChildren(this);
  },

  numclusterideas : function() {
    return getNodeChildren(this).count();
    //var ideaIDs = $(this)[0].ideaIDs;
    //var cursor = Ideas.find({_id: {$in: ideaIDs}}).fetch();
    //logger.debug("found cluster with ideas: ")
    ////var edges = Edges.find({type: 'parent_child',
    //return cursor.length;
  },

  named : function(){
    if ($(this)[0].name == "Not named yet")
      return 'text-danger';
    else return false
  },

  isCollapsed : function(){
    return $(this)[0].isCollapsed;
  }

});


Template.MturkClusterModal.events({
  'click #cluster-name-modal .finish': function(e, elm) {
    logger.debug("Clicked finish in new cluster name modal");
    //Get Name from Field
    var name = $("#cluster-name-modal .name-cluster").val();
    //Create new cluster in shared graph
    var sharedGraph = Session.get("sharedGraph");
    var idea = Session.get("insertionIdea");
    Meteor.call("graphCreateThemeNode", sharedGraph._id, 
      {'name': name},
      function(error, newTheme) {
        logger.debug("Shared NodeID: " + JSON.stringify(newTheme._id));
        Tracker.autorun(function (c) {
          logger.trace("***********************************************");
          logger.debug("Connecting Theme with idea nodes with new edge");
          logger.trace("***********************************************");
          var linked = Edges.find({type: 'graph_link',
            sharedNodeID: newTheme._id});
          var linkedIDs = getValsFromField(linked, 'userNodeID');
          var userTheme = Nodes.findOne({type: 'theme',
              graphID: Session.get("currentGraph")._id,
              _id: {$in: linkedIDs}
          });
          logger.trace("Linked node IDs for shared theme: " + 
            JSON.stringify(linkedIDs));
          logger.trace("Matching linked node: " + 
            JSON.stringify(userTheme));
          if (userTheme) {
            logger.debug("Found Theme copy, creating link to idea");
            Meteor.call("graphLinkChild", 
              Session.get("currentGraph")._id, 
              userTheme._id, idea._id, null,
              function(error, newLinkID) {
                logger.debug("Created new Parent/child link");
              }
            );

            c.stop();
          }
        });
      }
    );
    //Clear input field
    $("#cluster-name-modal .name-cluster").val('');
    $("#cluster-name-modal").modal('hide');
  },

  'keyup #cluster-name-modal .name-cluster' : function(e, target){
    if(e.keyCode===13) {
      logger.debug("enter pressed")
      $("#cluster-name-modal .finish").click();
    }
  },
    
});

var getDroppableSource = function(item) {
  /*****************************************************************
   * Return the Cluster associated with origin of item. Return null 
   * if item is from unsorted list
   *****************************************************************/
  var itemSource = $(item.draggable).parent().parent();
  // var itemSource = $(item.draggable);
  logger.trace("idea source: ******************************");
  logger.trace(itemSource);
  // if (itemSource.hasClass("clusterul")) {
  if (itemSource.hasClass("cluster")) {
    logger.trace("idea came from cluster");
    var clusterID = trimFromString(itemSource.attr('id'),
        "cluster-");
    // var clusterID = trimFromString(itemSource.attr('id'),
    //     "cluster-list-");
    logger.trace("found cluster with ID: " + clusterID);
    var cluster = Nodes.findOne({_id: clusterID});
    logger.trace(cluster);
    return cluster
  } else {
    return null;
  }
};

getDraggableIdea = function(item) {
  //Called when an unsorted idea is dropped to create a cluster
  logger.trace("Creating new cluster with idea: \n");
  logger.trace(item.draggable[0]);
  var ideaID = trimFromString(item.draggable[0].id,
    "idea-");
  logger.debug("Creating cluster with idea ID: " + ideaID);
  var idea = Nodes.findOne({_id: ideaID});
  logger.debug("Creating cluster with idea: " + 
    JSON.stringify(idea));
  return idea;
};


receiveDroppable = function(event, ui, context) {
  logger.trace("idealist received idea**********************");
  logger.trace(context);
  logger.trace("********* data of ui object ***************");
  logger.trace($(ui).data());
  var idea = getDraggableIdea(ui)
  logger.debug("************* idea *************");
  logger.debug(idea);
  var source = getDroppableSource(ui)
  logger.debug("************* source *************");
  logger.debug(source);
  var target = $(context)
  logger.debug("************* target *************");
  logger.debug(target);
  var userGraph = Session.get("currentGraph");
  var sharedGraph = Session.get("sharedGraph");
  if (target.hasClass("ideadeck")) {
    logger.info("Removing idea from cluster and unsorting idea");
    if (source) {
      Meteor.call("graphUnlinkChild", source._id, idea._id);
      EventLogger.logIdeaUnclustered(idea, source);
    }
    target = null;
    //ui.item.remove();
  } else if (target.hasClass("cluster")) {
    logger.info("Moving idea to a cluster");
    var targetID = trimFromString(target.attr('id'), 
        "cluster-");
    logger.debug("Adding to cluster with ID: " + targetID);
    target = Nodes.findOne({_id: targetID});
    logger.debug("Cluster: " + JSON.stringify(target));
    //EventLogger.logIdeaClustered(idea, source, target);
  } else if (target.hasClass("clusterul")) {
    logger.info("Moving idea to a cluster");
    var targetID = trimFromString(target.attr('id'), 
        "cluster-list-");
    logger.debug("Adding to cluster with ID: " + targetID);
    target = Nodes.findOne({_id: targetID});
    logger.debug("Cluster: " + JSON.stringify(target));
    //EventLogger.logIdeaClustered(idea, source, target);
  } else if (target.hasClass("newcluster")) {
    logger.info("Creating a new cluster for idea");
    Session.set("insertionIdea", idea);
    $("#cluster-name-modal").modal('show');
    //Meteor.call("graphCreateThemeNode", sharedGraph._id, null, 
      //function(error, newThemeID) {
        //logger.debug("Connecting Theme with idea nodes with new edge");
        //Meteor.call("graphLinkChild", newThemeID, idea._id, null,
          //function(error, newLinkID) {
            //logger.debug("Created new Parent/child link");
          //}
        //);
      //}
    //);
  } else if (target.hasClass("cluster-item")) {
    logger.info("Inserting idea into cluster using cluster list");
    var clusterID = trimFromString(context.id, 'ci-');
    target = Nodes.findOne({_id: clusterID});
    //EventLogger.logIdeaClustered(idea, source, target);
  } else if (target.hasClass('cluster-trash-can')) {
    logger.info("Deleting cluster using droppable trash can");
    logger.trace(target);
    logger.trace(target.attr('id'));
    var targetID = trimFromString(target.attr('id'), 
        "cluster-");
    logger.debug("Adding to cluster with ID: " + targetID);
    target = Nodes.findOne({_id: targetID});
    logger.debug("Cluster: " + JSON.stringify(target));
  }
  if (target !== null) {
    if (source !== null) {
      if (source._id !== target._id) {
        logger.trace("Removing idea from source cluster: " +
          JSON.stringify(source));
        //EventLogger.logIdeaRemovedFromCluster(idea, source, target);
        //ClusterFactory.removeIdeaFromCluster(idea, source);
        Meteor.call("graphUnlinkChild", source._id, idea._id,
          function(error, newLinkID) {
            logger.debug("Removed parent/child link");
          }
        );
        //ClusterFactory.insertIdeaToCluster(idea, target);
        Meteor.call("graphLinkChild", 
            sharedGraph._id, target._id, idea._id, null,
          function(error, newLinkID) {
            logger.debug("Created new Parent/child link");
          }
        );
        //ui.item.remove();
      }
    } else {
      //ClusterFactory.insertIdeaToCluster(idea, target);
      Meteor.call("graphLinkChild", 
          sharedGraph._id, target._id, idea._id, null,
        function(error, newLinkID) {
          logger.debug("Created new Parent/child link");
        }
      );
      //ui.item.remove();
    }
  }
};

function trashCluster (e, obj) {
  logger.debug("Trashing a cluster");
  logger.trace(e);
  logger.trace(obj.draggable[0]);
  var clusterDiv = obj.draggable[0];
  var clusterID = trimFromString($(clusterDiv).attr('id'), 'cluster-');
  logger.debug("Trashing cluster with ID: " + clusterID);
  //var cluster = Nodes.findOne({_id: clusterID});
  Meteor.call("graphUpdateNodeField", clusterID, 
    {'isTrash': true}
  );
};

