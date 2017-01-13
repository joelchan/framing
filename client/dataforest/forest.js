var logger = new Logger('Client:DataForest:Forest');
// Comment out to use global logging level
// Logger.setLevel('Client:DataForest:Forest', 'trace');
Logger.setLevel('Client:DataForest:Forest', 'debug');
// Logger.setLevel('Client:DataForest:Forest', 'info');
// Logger.setLevel('Client:DataForest:Forest', 'warn');

//Maps routes to templates

//state machine
	//current step/prompt
		//1. Create idea node/cluster : IdeaNodeCreation
		//2. find best match : FindBestMatch
		//3. generalization : Generalization
			//both -> merge two nodes
				//exit do
			//neither -> artifical node creation
				//exit do
			//idea more general
			//best match more general
//currentNode; is root at beginning of every new node insertion
//ideaNode; node being inserted
//bestMatchNode; node with highest similarity to ideaNode


//ui things to add:
  //possibly undo button? very annoying to implement
	//X -- back button - dependent on tracking path
	//X -- modal asking for confirmation before inserting nodes?
	//X -- fix modals
	//X -- slide down input and label when new cluster is started
	//X -- fix so that "not named" is red whenever a new cluster is created and not yet named
	//X -- relabel tree area?
	//X -- improve general style
	//X -- possibly change some .animate()s to .hide()s as the animation can look strange

//Define which stage in tree traversal user is currently.
var States = {
	NODECREATION: {val: 0, name: "IdeaNodeCreation", 
		prompt: "Subtree Roots"},
	BESTMATCH: {val: 1, name: "FindBestMatch", 
		prompt: "Select most similar node to the node to be inserted (or select no node if none match)"},
	GENERALIZE: {val: 2, name: "Generalization", 
		prompt: "Do the nodes generalize each other in any way?"}
}
Object.freeze(States);

//Session.set("currentNode", "-1"); 
//Session.set("ideaNode", "0"); //node to be inserted
//Session.set("bestMatchNode", "-1"); //node most similar to node being inserted
//Session.set("currentState", States.NODECREATION);
//Session.set("swapped", false);
var path = [-1]; //tracks path starting from root. Used by back button.


/********************************************************************
* Forest Template onRender functions
*********************************************************************/
Template.Forest.rendered = function(){
  var prompt = Session.get("currentPrompt");
  var root = Nodes.findOne({type: 'root', promptID: prompt['_id']});
  Session.set("currentNode", root);
  Session.set("ideaNode", null); //node to be inserted
  Session.set("bestMatchNode", null); //node most similar to node being inserted
  Session.set("currentState", States.NODECREATION);
  Session.set("swapped", false);

  Session.set("moreTrees", 5);
  Session.set("moreIdeas", 20);

}


Template.ForestCreateCluster.onRendered(function() {
  $(".newstack").droppable({
    accept: '.forest-idea-item',
    tolerance: "pointer",
    drop: function(event, ui) {
      logger.debug("New idea dropped into IdeaNode");
      //logger.trace(JSON.stringify(this));
      logger.trace(ui.draggable[0]);
      logger.trace($(ui.draggable[0]).data("node"));
      var myIdeaId = $(ui.draggable[0]).attr('id');
      logger.debug("Recieved idea with nodeID: " + myIdeaId);
      var node = $("#" + myIdeaId).data("node");
      logger.trace(JSON.stringify(node));
      //var nodes = Nodes.find({'_id': data['_id']})
      //logger.debug("matching nodes: " + nodes.count());
      var parent = ui.helper.context.parentElement;
      logger.trace(parent);
      //creates and inserts a new cluster, returns ID
			var currCluster = ForestManager.createIdeaNode([node,]) 
      //sets ID as idea node
      Session.set("ideaNode", currCluster); 
      $("#buildcluster").show()    
      // Blaze.renderWithData(
          // Template.ForestNodeBuilder, 
          // currCluster,
          // $("#forest")[0],
          // $("#tree-viz")[0]
      // );

      // $("#createnode").remove()
      $("#createnode").hide()
    }
  });
});

Template.ForestNodeStatus.onCreated(function() {
  if (Session.get("ideaNode") == undefined) {
    Session.set("ideaNode", null);
  }
  if (Session.get("currentNode") == undefined) {
    Session.set("currentNode", null);
  }
});

Template.ForestNodeStatus.onRendered(function() {
  $("#comparison-node").hide();
  $("#status-children").hide();
  $("#nodestatus").hide();
  //Derive the height of elements above the forest div
  var usedHeight = $("#lpheader").outerHeight(true);
  usedHeight += $("#clusterprompt").outerHeight(true);
  usedHeight += $("#nodestatus h2").outerHeight(true);
  usedHeight += $("#nodestatus h4").outerHeight(true);
  usedHeight += $("#nodestatus #current-idea-node").outerHeight(true);
  // bottom padding
  var height = $(window).height() - usedHeight;
  //Set the Idea list to stretch only to the bottom of the window
  $("#other-node-status").height(height);
});

Template.ForestBestMatch.onRendered(function() {
  $("#best-match").hide();
});

Template.ForestGeneralize.onRendered(function() {
  $("#generalize").hide();
});

Template.ForestIdeaNode.onRendered(function() {
  logger.debug("Rendering idea node: ");
  logger.trace(this);
  var id = this.data['_id'];
  $("#" + id).data("node", this.data);
  var ideaNode = Session.get("ideaNode");
  if (ideaNode == null) {
    $("#list-" + id).toggleClass('hidden');
  } else {
    if (id == Session.get("ideaNode")['_id']) {
      // $("#list-" + id).collapse('show');
      logger.debug("showing node with id: list-" + id);
    } else {
      $("#list-" + id).toggleClass('hidden');
    }
  }

});

Template.ForestIdeaList.onRendered(function() {
  //Determine height of components above the idealist
  var usedHeight = $("#lpheader").outerHeight(true);
  logger.trace("Height: " + usedHeight);
  usedHeight += $("#clusterprompt").outerHeight(true);
  logger.trace("Height: " + usedHeight);
  // usedHeight += $("#createnode").outerHeight(true);
  logger.trace("Height: " + usedHeight);
  usedHeight += this.$("h3").outerHeight(true);
  logger.trace("Height: " + usedHeight);
  //arbitrary
  usedHeight += 65;
  logger.trace("Height: " + usedHeight);
  var height = $(window).height() - usedHeight;
  //Set the Idea list to stretch only to the bottom of the window
  $("#idealist").height(height);
});

Template.ForestIdea.onRendered(function() {
  logger.debug("Rendered idea");
  logger.trace(this);
  // Set the ID according to the _id of the node
  var id = "#" + this.data['_id']
  // this.$(".forest-idea-item").attr("id", this.data['_id']);
  $(id).draggable({
    revert: true,
    helper: 'clone',
    appendTo: ".forest",
    refreshPositions: true,
    start: function(e, ui) {
      logger.debug("Began dragging an idea");
      logger.trace(ui.helper[0]);
      var width = $(this).css('width');
      logger.trace(width);
      $(ui.helper[0]).css('width', width);
    },
  });
  //logger.trace(this.$(".forest-idea-item"))
  $(id).data("node", this.data);

});

Template.ForestNodeBuilder.onCreated(function() {
  if (Session.get("ideaNode") == undefined) {
    Session.set("ideaNode", null);
  }
});

Template.ForestNodeBuilder.onRendered(function() {
  $("#buildcluster").hide();
  $("#buildcluster .form-group").droppable({
    accept: '.forest-idea-item',
    tolerance: "pointer",
    drop: function(event, ui) {
      var myIdeaId = $(ui.draggable[0]).attr('id');
      logger.debug("Recieved idea with nodeID: " + myIdeaId);
      var instance = $("#" + myIdeaId).data("node");
      logger.trace(JSON.stringify(instance));
      var currNode = Session.get("ideaNode");
      ForestManager.groupIdeas([instance], currNode);
    }

  });
  logger.debug("Setting data for new idea node" + 
      JSON.stringify(Session.get("ideaNode")));
  $("#buildcluster .form-group").data(
      "node", Session.get("ideaNode"));
});

Template.ForestViz.onCreated(function() {
  // Initialize the number of nodes to display in the tree
  Session.set("numTrees", 15);
  Session.set("hasMoreTrees", false);
  Session.set("isLoadingTrees", false);
});

Template.ForestViz.onRendered(function() {
  //Derive the height of elements above the forest div
  var usedHeight = $("#lpheader").outerHeight(true);
  usedHeight += $("#clusterprompt").outerHeight(true);
  usedHeight += $("#tree-viz h3").outerHeight(true);
  usedHeight += $("#tree-viz .forest-footer").outerHeight(true);
  usedHeight += 30;
  var height = $(window).height() - usedHeight;
  //Set the Idea list to stretch only to the bottom of the window
  $("#root-tree").height(height);
});

Template.CurrentTree.onRendered(function() {
  $("#single-tree").hide();
});

Template.ForestTree.onCreated(function() {
  //Set Loading to false
  Session.set("isLoadingTrees", false);
});

Template.ForestTree.onRendered(function() {
  logger.trace("Rendering Forest Tree");
  //Set node as draggable
  // this.$(".forest-idea-item").attr("id", this.data['_id']);
  var treeID = "#tree-" + this.data['_id']
  var id = this.data['_id']
  logger.trace(treeID);
  $(treeID).draggable({
    revert: true,
    helper: 'clone',
    appendTo: ".forest",
    refreshPositions: true,
    start: function(e, ui) {
      logger.debug("Began dragging an idea");
      logger.trace(ui.helper[0]);
      var width = $(this).css('width');
      logger.trace(width);
      $(ui.helper[0]).css('width', width);
      $(ui.helper[0]).css('font-size', '1.2em');
    },
  });
  $(treeID).droppable({
    accept: '.forest-tree-node',
    tolerance: "pointer",
    drop: function(event, ui) {
      logger.debug("************************************************");
      logger.debug("Forest tree relocated");
      //logger.trace(JSON.stringify(this));
      logger.debug(ui.draggable[0]);
      logger.debug($(ui.draggable[0]).data());
      var myTreeId = $(ui.draggable[0]).attr('id');
      myTreeId = myTreeId.substring(5);
      logger.debug("Recieved tree with ID: " + myTreeId);
      logger.debug("Relocating to tree with ID: " + id);
      ForestManager.moveNodeInTree([myTreeId], id);
      // var node = $("#" + myIdeaId).data("node");
    },
  });
  //logger.trace(this.$(".forest-idea-item"))

});


/********************************************************************
* Template Helpers
*********************************************************************/
Template.Forest.helpers({
  prompt: function() {
    return Session.get("currentPrompt").question;
  },
});

Template.ForestIdeaList.helpers({
	ideaClusters : function(){
     var nodes =  Nodes.find({
         promptID: Session.get("currentPrompt")._id, 
         type: 'forest_precluster'},
         {sort: {num_ideas: -1, _id: 1}}
     ).fetch();
    var clusteredIDs = []
    for (var i=0; i<nodes.length; i++) {
      clusteredIDs = clusteredIDs.concat(nodes[i]['idea_node_ids']);
    }
    var otherNodes = Nodes.find({
        promptID: Session.get("currentPrompt")._id, 
        type: 'forest_idea',
        is_clustered: false,
        _id: {$nin: clusteredIDs}},
        {fields: {_id: 1}, sort: {_id: 1}}
    ).fetch()
    //Tack all the other ideas not in a precluster onto the end of the
    //preclusters lsit as a pseudo precluster
    nodes = nodes.concat({idea_node_ids: _.pluck(otherNodes, '_id')});
    return nodes
  },
	isClustered : function(){
    if(this.inCluster){
     	return false;
   	} else {
     	return true;
    }
  },
  numIdeas: function() {
    return Nodes.find({
        promptID: Session.get("currentPrompt")._id, 
        type: 'forest_idea',
        is_clustered: false
    }).count();
  },
});

Template.PreforestIdeaCluster.helpers({
  ideas: function() {
    logger.trace("Preforest idea node list: " + JSON.stringify(this.idea_node_ids));
    var nodes =  Nodes.find({
        _id: {$in: this.idea_node_ids},
        is_clustered: false
    });
    logger.debug("Current node has " + nodes.count() + " unclustered ideas") 
    return nodes
  }, 
});

Template.ForestNodeBuilder.helpers({
  //return list of ideas contained by idea node
  ideaNodeIdeas : function(){
    var n = Session.get('ideaNode');
    if (n != null) {
      logger.trace("Node Builder current idea node: " + JSON.stringify(n));
      return ForestManager.getInstanceIdeas(n);
    } else {
      return []
    }
  },
  ideaNodeName : function(){
  	// var currCluster = Nodes.findOne({_id: currNode['_id']});
    var n = Session.get('ideaNode');
    if (n != null) {
      return ForestManager.getNodeName(n);
    } else {
      return "";
    }
  },
  ideaNode : function(){
    var node = Session.get('ideaNode');
    if (node != null) {
  	  return node._id;
    } else {
      return "default-forest-node";
    }
  },
});

Template.ForestNodeStatus.helpers({
  ideaNode : function(){
    var n = Session.get('ideaNode');
    if (n != null) {
      logger.debug("Node Status set to new idea node: " + JSON.stringify(n));
      return [Nodes.findOne({_id: n._id})]
    } else {
      logger.debug("Node Status set to null");
      return [];
    }
  },
  clusterChildren : function(){
    var current = Session.get("currentNode");
    logger.trace("children of current cluster: " + JSON.stringify(current));
    if (current != null) {
      if (current.type == "root") {
        return [];
      } else {
        logger.debug("Node Status current set to new node: " + JSON.stringify(current));
        return ForestManager.getNodeChildren(
            current, 
            {_id: 1}
        );
      }
    } else {
      logger.debug("Node Status current set null");
      return [];
    }
  },
  rootChildren: function() {
    var root = Nodes.findOne({type: 'root', 
        promptID: Session.get("currentPrompt")._id});
    logger.trace("Forest Viz root: " + JSON.stringify(root));
    if (root) {
      logger.debug("Node Status root set: " + JSON.stringify(root));
      return ForestManager.getNodeChildren(
          root, 
          {_id: 1}
      );
    } else {
      logger.debug("Node Status root not found");
      return [];
    }
  },
  isBestMatch: function() {
    var state = Session.get("currentState");
    if (state != undefined) {
      if (Session.get("currentState").val == 1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
  bestMatchNode: function() {
    var n = Session.get('bestMatchNode');
    if (n != null) {
      logger.debug("Node Status best Match set to: " + JSON.stringify(n));
      return [Nodes.findOne({_id: n._id})]
    } else {
      logger.debug("Node Status best Match not found");
      return [];
    }
  },
});

Template.ForestBestMatch.helpers({
  userPrompt : function(){
    if (Session.get("currentState") == undefined) {
      return States.NODECREATION.prompt;
    } else {
  	  return Session.get("currentState").prompt;
    }
  },
  isBestMatch : function(){
    var state = Session.get("currentState");
    if (state) {
  	  if(Session.get("currentState").val === 1)
  		  return true;
  	  return false;
    } else {
      return false;
    }
  },
});

Template.ForestGeneralize.helpers({
  userPrompt : function(){
    if (Session.get("currentState") == undefined) {
      return States.NODECREATION.prompt;
    } else {
  	  return Session.get("currentState").prompt;
    }
  },
});

Template.ForestViz.helpers({
  rootNode: function() {
    var root = Nodes.findOne({type: 'root', 
        promptID: Session.get("currentPrompt")._id});
    logger.trace("Forest Viz root: " + JSON.stringify(root));
    return root
  },
  childNodes: function() {
    var children = ForestManager.getNodeChildren(this, {_id: 1});
    var numTrees = Session.get("numTrees");
    if (children.length > numTrees) {
      Session.set("hasMoreTrees", true);
      logger.trace("Forest Viz children of root: " + 
          JSON.stringify(children.slice(0, numTrees)));
      // Session.set("isLoadingTrees", false);
      return children.slice(0,numTrees);
    } else {
      Session.set("hasMoreTrees", false);
      logger.trace("Forest Viz children of root: " + 
          JSON.stringify(children));
      // Session.set("isLoadingTrees", false);
      return children;
    }
  },
  hasMoreTrees: function() {
    return Session.get("hasMoreTrees");
  },
  isLoading: function() {
    return Session.get("isLoadingTrees");
  },
});

Template.CurrentTree.helpers({
  currentNode: function() {
    var n = Session.get("bestMatchNode");
    return n;
  },
  childNodes: function() {
    var children = ForestManager.getNodeChildren(this, {'label': 1});
    var numTrees = Session.get("numTrees");
    if (children.length > numTrees) {
      Session.set("hasMoreTrees", true);
      logger.trace("Forest Viz children of root: " + 
          JSON.stringify(children.slice(0, numTrees)));
      // Session.set("isLoadingTrees", false);
      return children.slice(0,numTrees);
    } else {
      Session.set("hasMoreTrees", false);
      logger.trace("Forest Viz children of root: " + 
          JSON.stringify(children));
      // Session.set("isLoadingTrees", false);
      return children;
    }
  },
  name: function() {
    return ForestManager.getNodeName(Session.get("bestMatchNode"));
  }
});

Template.ForestTree.helpers({
  name: function() {
    var name = ForestManager.getNodeName(this); 
    logger.trace("Forest tree name: " + name);
    return name
  },
  childNodes: function() {
    var children = ForestManager.getNodeChildren(this, {_id: 1});
    logger.trace("Forest tree children: " + JSON.stringify(children));
    return children
  },
});

Template.ForestIdeaNode.helpers({
  name: function() {
    var name = ForestManager.getNodeName(this); 
    logger.trace("Forest tree name: " + name);
    return name
  },
  childNode: function() {
    return ForestManager.getInstanceIdeas(this);
  },
});

/********************************************************************
* Template Events
*********************************************************************/
Template.Forest.events({
  //collapse and expand clusters
  'click .fa' : function(){
    //toggle the arrow from down to right
    if($(event.target).hasClass('fa-angle-double-down')){
      $(event.target).switchClass('fa-angle-double-down', 
      	'fa-angle-double-right', 10);
    } else {
      $(event.target).switchClass('fa-angle-double-right', 
      	'fa-angle-double-down', 10);
    }
    //$(event.target).parent().children('li').slideToggle("fast");
    return false;
  },
});

Template.ForestBestMatch.events({
  'click #nextStep': function (event) {
    logger.debug("Clicked to continue to next step");
    var bestMatch = Session.get("bestMatchNode");
    // If no node is selected then insert node as child of currNode
    if (bestMatch == null) {
      logger.debug("Setting new node as child of current node: " + 
          JSON.stringify(Session.get("currentNode")));
      //Add node as child of current node
      ForestManager.insertToTree(
          Session.get("currentNode"),
          Session.get("ideaNode")
      );
      //Reset UI
      // $("#nodestatus").remove();
      $("#status-children").hide();
      $("#root-children").show();
      $("#comparison-node").hide();
      $("#nodestatus").hide();
      // $("#best-match").remove();
      $("#best-match").hide();
      // Blaze.render(
          // Template.ForestCreateCluster,
          // $("#ideas")[0],
          // $("#unclustered-ideas")[0]
      // )
      $("#createnode").show();
      $("#ideas").slideToggle()
      showForestView();
      resetState();
    } else {
      //Continue to generalization step
      Session.set("currentState", States.GENERALIZE);
      // $("#best-match").remove();
      $("#best-match").hide();
      $("#status-children").hide();
      $("#root-children").hide();
      $("#comparison-node").show();
      // Blaze.render(
          // Template.ForestGeneralize,
          // $("#forest")[0],
          // $("#tree-viz")[0]
      // );
      $("#generalize").show()
      hideForestView();

    }
    // Reset the selected UI nodes
    $(".selected-node").toggleClass("selected-node");
  },
  // 'click #bmback': function (event) {
    // logger.debug("Clicked to rewind to previous step");
    // // Reset state back to node creation
    // Session.set("currentState", States.NODECREATION);
    // // Setting UI back to node builder state
    // $("#best-match").remove();
    // $("#nodestatus").remove();
    // $("#ideas").show();
    // Blaze.renderWithData(
        // Template.ForestNodeBuilder, 
        // Session.get("ideaNode"),
        // $("#forest")[0],
        // $("#tree-viz")[0]
    // );
  // },
});

Template.ForestGeneralize.events({
  //click to merge
  'click #both' : function(event){
    logger.debug("Clicked to merge idea and tree nodes");
  	//get name and ideas form idea node
    //Grab both the new idea node and the selected node
  	var ideaNode = Nodes.findOne(
        {_id: Session.get("ideaNode")._id}
    );
  	var bestMatchNode = Nodes.findOne(
        {_id: Session.get("bestMatchNode")._id}
    );
    ForestManager.mergeNodes(ideaNode, bestMatchNode);
    //Reset to beginning
    // $("#generalize").remove();
    $("#generalize").hide();
    // $("#nodestatus").remove();
    $("#nodestatus").hide();
    $("#ideas").slideToggle()
    // Blaze.render(
        // Template.ForestCreateCluster,
        // $("#ideas")[0],
        // $("#unclustered-ideas")[0]
    // );
    $("#createnode").show()
    showForestView();
    resetState();
  },

  //create artifical node
  'click #neither' : function(){
    logger.debug("Clicked to create articial parent for idea and tree nodes");
    $("#nameModal").modal('show')
  },

  //idea node more general than best match
  'click #idea-node-parent' : function(){
    logger.debug("Clicked to set tree node as parent to idea node");
    var ideaNode = Session.get("ideaNode")
    var bestMatch =  Session.get("bestMatchNode")
    ForestManager.swapNodes(ideaNode, bestMatch);

    // Swap State variables back to similarity comparison state and
    // traverse down tree with idea node as current node
  	Session.set("currentState", States.BESTMATCH);
  	Session.set("currentNode", ideaNode);
    Session.set("ideaNode", bestMatch);
    Session.set("bestMatchNode", null);
    // Transition UI back to similarity comparison
    // $('#generalize').remove()
    $('#generalize').hide()
    // Blaze.render(
        // Template.ForestBestMatch,
        // $("#forest")[0],
        // $("#tree-viz")[0]
    // );
    $("#best-match").show();
    $("#status-children").show();
    $("#comparison-node").hide();
    showForestView();
  },

  //best match more general than idea node
  'click #best-node-parent' : function(){
    logger.debug("Clicked to set idea node as parent to tree node");
    var ideaNode = Session.get("ideaNode")
    var bestMatch =  Session.get("bestMatchNode")

    // Swap State variables back to similarity comparison state and
    // traverse down tree with best match node as current node
  	Session.set("currentState", States.BESTMATCH);
  	Session.set("currentNode", bestMatch);
    Session.set("bestMatchNode", null);
    // Transition UI back to similarity comparison
    // $('#generalize').remove()
    $('#generalize').hide()
    // Blaze.render(
        // Template.ForestBestMatch,
        // $("#forest")[0],
        // $("#tree-viz")[0]
    // );
    $("#best-match").show();
    $("#status-children").show();
    $("#comparison-node").hide();
    showForestView();
  },

  //go back while in generalization stage of traversal
  'click button#genback' : function(){
    //////////////////// Currently doesn't work ////////////////////
  	Session.set("currentState", States.BESTMATCH);
  	Session.set("bestMatchNode", null);
    // $('#generalize').remove();
    $('#generalize').hide();
    // Blaze.render(
        // Template.ForestBestMatch,
        // $("#forest")[0],
        // $("#tree-viz")[0]
    // );
    $("#best-match").show();
  },

})

Template.ForestIdeaNode.events({
  'click .forest-idea-node .fa': function(event) {
    logger.debug("Clicked on collapse/expand of idea list");
    var id = '#list-' + this['_id'];
    logger.debug("looking at cluster with id: " + id);
    // $(id).collapse('toggle'); 
    $(id).toggleClass('hidden'); 
  },
});

Template.ForestNodeBuilder.events({
  'click button#finish' : function(){
    var label = $("#namecluster").val();
    $("#namecluster").val("");
    //Update the label of the node
  	if(label != undefined || label != "") { 
      ForestManager.renameNode(Session.get("ideaNode"), label);
    }
  	//if current node has no children, insert idea node under current
  	var compareNode = Nodes.findOne({_id: Session.get("ideaNode")['_id']});
    var currNode = Nodes.findOne({_id: Session.get("currentNode")._id});
  	if(ForestManager.getNodeChildren(currNode).length == 0) {
      ForestManager.insertToTree(currNode, compareNode);
      //Reset UI to initial
      $("#createnode").show()
      // Blaze.render(
          // Template.ForestCreateCluster,
          // $("#ideas")[0],
          // $("#unclustered-ideas")[0]
      // );
      // $("#buildcluster").remove();
      $("#buildcluster").hide();
      resetState()
  	} else { //else continue to next state
  		Session.set("currentState", States.BESTMATCH);
      $('#ideas').hide();
  		// $('#ideas').hide(function(){
        // Blaze.renderWithData(
            // Template.ForestNodeStatus, 
            // currNode,
            // $("#forest")[0],
            // $("#tree-viz")[0]
        // );
      $("#nodestatus").show()
      $("#root-children").show()
        // Blaze.render(
            // Template.ForestBestMatch,
            // $("#forest")[0],
            // $("#tree-viz")[0]
        // );
      $("#best-match").show()
  		// });
      // $("#buildcluster").remove();
      $("#buildcluster").hide();
  	}
  	//}
  },
});

Template.ForestNodeName.events({
  'click #make-node': function(event) {
    logger.debug("clicked save-name to make node artificial node"); 
  	var ideaNode = Nodes.findOne(
        {_id: Session.get("ideaNode")._id}
    );
  	var bestMatchNode = Nodes.findOne(
        {_id: Session.get("bestMatchNode")._id}
    );
    var label = $("#artificial-name").val();
    logger.debug("Creating Artificial Node with label: " + label); 
    var an = ForestManager.createArtificialNode(bestMatchNode, ideaNode, label);
    ForestManager.insertToTree(Session.get("currentNode"), an);
    
    //Reset to beginning
    $("#nameModal").modal('hide');
    // $("#generalize").remove();
    $("#generalize").hide();
    // $("#nodestatus").remove();
    $("#nodestatus").hide();
    $("#ideas").slideToggle()
    $("#createnode").show();
    showForestView();
    $(".selected-node").toggleClass("selected-node");
    // Blaze.render(
      // Template.ForestCreateCluster,
      // $("#ideas")[0],
      // $("#unclustered-ideas")[0]
    // );
    resetState();
  },

});

Template.ForestNodeStatus.events({
  'click .forest-idea-node' : function(event){
    logger.debug("clicked on a cluster");
    // logger.trace(this)
    // logger.trace(event.currentTarget)
    // logger.trace(event);
    var id = '#' + this['_id']
    var parent = $(id).parent()
    var target = $(event.target)
    // logger.trace(parent)
    if ($(parent).hasClass("stack") && !$(event.target).hasClass("fa")) {
      logger.debug("clicked on selectable cluster");
      if ($(id).hasClass("selected-node")) {
        $(id).toggleClass("selected-node");
        Session.set("bestMatchNode", null);
        // Swap tree view from current to forest
        showForestView();
      } else {
        //Clear all selected clusters
        $(".selected-node").not(id).toggleClass("selected-node");
        //Mark clicked cluster as selected
        $(id).toggleClass("selected-node");
        //Set selected cluster node as the current best match
        Session.set("bestMatchNode", this);
        hideForestView();
      }
    } else {
      logger.debug("clicked on non-selectable cluster");
    }
  },
});

Template.ForestViz.events({
  "click #get-more-trees": function(event) {
    logger.debug("Requested more trees to display");
    var numTrees = Session.get("numTrees") + Session.get("moreTrees");
    Session.set("numTrees", numTrees);
    Session.set("isLoadingTrees", true);
  },
  'click .forest-tree .fa': function(event) {
    logger.debug("Clicked on collapse/expand of idea list");
    var id = '#ft-' + this['_id'];
    logger.debug("looking at cluster with id: " + id);
    $(id).toggleClass('hidden'); 
  },
  "click #remove-tree": function(event) {
    logger.debug("deleting selected trees and unclustering ideas");
    var treeID = $("#tree-viz .selected-node").attr('id').substring(5);
    logger.debug("removing tree with id: " + treeID);
    var tree = Nodes.findOne({_id: treeID});
    logger.debug(tree);
    ForestManager.removeTree(tree);
  },
  "click #add-parent": function(event) {
    logger.debug("Adding an artificial node as parent");
    var treeID = $("#tree-viz .selected-node").attr('id').substring(5);
    logger.debug("Adding parent to tree with id: " + treeID);
    var tree = Nodes.findOne({_id: treeID});
    logger.trace(tree);
    var label = $("#rename-tree").val();
    $("#rename-tree").val("");
    logger.debug("Naming parent with label: " + label);
    ForestManager.createArtificialParent(tree, label);
  },
  "click #rename-tree-btn": function(event) {
    logger.debug("Renaming selected tree");
    var treeID = $("#tree-viz .selected-node").attr('id').substring(5);
    logger.debug("renaming tree with id: " + treeID);
    var tree = Nodes.findOne({_id: treeID});
    logger.trace(tree);
    var label = $("#rename-tree").val();
    $("#rename-tree").val("");
    logger.debug("Renaming with label: " + label);
    ForestManager.renameNode(tree, label);
  },
});

Template.CurrentTree.events({
  'click .forest-tree .fa': function(event) {
    logger.debug("Clicked on collapse/expand of idea list");
    var id = '#ct-' + this['_id'];
    logger.debug("looking at cluster with id: " + id);
    $(id).toggleClass('hidden'); 
  },
});

Template.ForestTree.events({
  'click .forest-tree-node': function(event) {
    logger.trace(event.target);
    var target = event.target
    var id = '#tree-' + this['_id']
    logger.debug("clicked on forest tree");
    if ($(target).hasClass("selected-node")) {
      logger.debug("Deselecting selected tree");
      $(target).toggleClass("selected-node");
    } else {
      logger.debug("Selecting tree");
      //Clear all selected clusters
      $(".selected-node").not(id).toggleClass("selected-node");
      //Mark clicked cluster as selected
      $(target).toggleClass("selected-node");
    }
    event.stopPropagation();
  },
});
/********************************************************************
* Convenience functions
*********************************************************************/
function resetState() {
  //Reset to beginning
  Session.set("currentState", States.NODECREATION);
  Session.set("ideaNode", null);
  Session.set("bestMatchNode", null);
  var root = Nodes.findOne(
      {type: 'root', promptID: Session.get("currentPrompt")._id}
  );
  logger.trace(root)
  Session.set("currentNode", root);
}

function showForestView() {
  $("#single-tree").hide();
  $("#tree-viz").show();
}

function hideForestView() {
  $("#single-tree").show();
  $("#tree-viz").hide();
}
