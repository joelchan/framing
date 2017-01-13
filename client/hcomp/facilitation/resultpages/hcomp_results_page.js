 // // Configure logger for server tests
 var logger = new Logger('Client:HcompResults');
 // // Comment out to use global logging level
 Logger.setLevel('Client:HcompResults', 'trace');
 // //Logger.setLevel('Client:Clustering', 'debug');
 // //Logger.setLevel('Client:Clustering', 'info');
 // //Logger.setLevel('Client:Clustering', 'warn');

/*******************************************************************
 * ***************  HcompResultsPage Template **********************
 * ****************************************************************/
// Name for filters applied to idea list of unclustered ideas
var allIdeasFilterName = "Ideas Filter"; 
var allClustersFilterName = "All Clusters"

/********************************************************************
* Attaches sortable to idea and cluster lists, new cluster area.
********************************************************************/
Template.HcompResultsPage.rendered = function(){

  //Create isInCluster filter
  // FilterManager.create(allIdeasFilterName,
  //     Session.get("currentUser"),
  //     "ideas",
  //     "clusterIDs",
  //     []
  // );
  
  // start with a fresh set of filters
  FilterManager.reset(allIdeasFilterName,
    Session.get("currentUser"),
    "ideas");
  
  FilterManager.create(allIdeasFilterName, 
    Session.get("currentUser"), 
    "ideas", 
    "prompt._id", 
    Session.get("currentPrompt")._id);
  // FilterManager.create("total ideas overall", 
  //   Session.get("currentUser"), 
  //   "ideas", 
  //   "prompt._id", 
  //   Session.get("currentPrompt")._id);
  FilterManager.create(allClustersFilterName, 
    Session.get("currentUser"), 
    "clusters", 
    "promptID", 
    Session.get("currentPrompt")._id);
  FilterManager.create(allClustersFilterName, 
    Session.get("currentUser"), 
    "clusters", 
    "isTrash", 
    false);
  Session.set("currentIdeators", []);
  Session.set("currentSynthesizers", []);
  Session.set("searchQuery","");

  //Setup filters for users and filter update listener
  // updateFilters();
  // //Update filters when current group changes
  // Groups.find({_id: Session.get("currentGroup")._id}).observe({
  //   changed: function(newDoc, oldDoc) {
  //     //Setup filters for users and filter update listener
  //     updateFilters();
  //   } 
  // });
};
/********************************************************************
* HcompResultsPage template Helpers
********************************************************************/
Template.HcompResultsPage.helpers({
  promptQuestion : function() {
    var prompt =  Session.get("currentPrompt");
    return prompt.title;
  },
  numIdeasOverall : function() {
    // return 
    var sessionPromptID = Session.get("currentPrompt")
    return Ideas.find({promptID: sessionPromptID._id}).fetch().length;
  },
  Clusters : function() {
    // return Clusters.find();
    // return getFilteredClusters(allClustersFilterName);
    var sessionPromptID = Session.get("currentPrompt")
    return Clusters.find({promptID: sessionPromptID._id}).fetch();
  },
  ifShowAll : function() {
    if (this.showAllIdeas == true) {
      return true;
    }
    else {
      return false
    }
  },
})

/********************************************************************
* themeIdeasList template Helpers
********************************************************************/
Template.themeIdeasList.helpers({
  hasMoreThanThreeIdeas : function(cluster) {
    var IDs = cluster.ideaIDs;
    var ideasArray = Ideas.find({_id:{$in: IDs}}).fetch();
    if (ideasArray.length > 3) {
      return true;
    }
    else {
      return false;
    }
  },
  themeIdeas : function(cluster) {
    var IDs = cluster.ideaIDs;
    var unsortedIdeas = Ideas.find({_id:{$in: IDs}}).fetch();
    function compare(a,b) {
      if (a.votes.length < b.votes.length)
         return -1;
      if (a.votes.length > b.votes.length)
        return 1;
      return 0;
    }
    var sortedIdeas = unsortedIdeas.sort(compare);
    //take out top 3 ideas
    for (var i = 0; i < 3; i++) {
      sortedIdeas.pop(i);
    }
    return sortedIdeas.reverse();
  },
  topThemeIdeas : function(cluster) {
    var IDs = cluster.ideaIDs;
    var unsortedIdeas = Ideas.find({_id:{$in: IDs}}).fetch();
    function compare(a,b) {
      if (a.votes.length < b.votes.length)
         return -1;
      if (a.votes.length > b.votes.length)
        return 1;
      return 0;
    }
    var sortedIdeas = unsortedIdeas.sort(compare);
    sortedIdeas.reverse();
    var topIdeas = [];
    //get the top 3 ideas
    for (var i = 0; i < 3; i++) {
      if (sortedIdeas[i] != null) {
        topIdeas.push(sortedIdeas[i]);
      }
    }
    return topIdeas;
  },
  themeName : function(cluster) {
    return cluster.name;
  },
  clusterID : function(cluster) {
    return cluster._id;
  },
  numThemeIdeas : function(cluster) {
    var arrayOfThemeIdeas = Ideas.find({_id:{$in: cluster.ideaIDs}}).fetch();
    return arrayOfThemeIdeas.length;
  },
})
/********************************************************************
* themeIdeasItem template Helpers
********************************************************************/
Template.themeIdeasItem.rendered = function() {
  $(this.firstNode).draggable({containment: 'body',
    revert: true,
    zIndex: 50,
  });
  $(this.firstNode).droppable({accept: ".themeIdea-item",
    tolerance: "pointer",
  });
};

Template.themeIdeasItem.helpers({
  gameChangerStatus : function(){
    return this.isGamechanger;
  },
  isNotInCluster: function() {
    return (this.clusterIDs.length === 0) ? true : false;
  },
  voteNum: function() {
    return this.votes.length;
  },
  hasVotes: function() {
    if (this.votes.length > 0) {
      return true
    } else {
      return false
    }
  },
})
/********************************************************************
* allIdeasList template Helpers
********************************************************************/
Template.allIdeasList.helpers({
  ideas : function(){
    // var allIdeasInBrainstorm = FilterManager.performQuery(allIdeasFilterName, 
    //   Session.get("currentUser"), 
    //   "ideas").fetch();
    // // return filteredIdeas;
    // var sortedAllIdeasInBrainstorm = allIdeasInBrainstorm.sort(function(a,b) { 
    //   return b.time - a.time
    // });
    // return sortedAllIdeasInBrainstorm;
    //return Ideas.find();
    return getFilteredIdeas(allIdeasFilterName);
  },
  numAllIdeas : function(){
    // var arrayOfIdeas = FilterManager.performQuery(allIdeasFilterName, 
    //   Session.get("currentUser"), 
    //   "ideas").fetch();
    // return arrayOfIdeas.length;
    return getFilteredIdeas(allIdeasFilterName).length;
  },
});

/********************************************************************
* allIdeasItem template Helpers
********************************************************************/
Template.allIdeasItem.rendered = function() {
  $(this.firstNode).draggable({containment: 'body',
    revert: true,
    zIndex: 50,
  });
  $(this.firstNode).droppable({accept: ".allIdea-item",
    tolerance: "pointer",
  });
};

Template.allIdeasItem.helpers({
  gameChangerStatus : function(){
    return this.isGamechanger;
  },
  isNotInCluster: function() {
    return (this.clusterIDs.length === 0) ? true : false;
  },
})

