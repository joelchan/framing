/********************************************************************
* User Routing Framework
*
* Supports predesigned routing of users including speicifying page 
* specific metadata
********************************************************************/

// Holds the set of all user workflows/routing sequences
Workflows = new Meteor.Collection("workflows");
Progresses = new Meteor.Collection("progresses");

Workflow = function(desc) {
  this.description = desc;
  // the series of routes in the workflow
  this.routes = [];
};

Progress = function(workflowID, userID) {
  this.userID = userID;
  this.workflowID = workflowID;
  var w = Workflows.findOne({_id: workflowID});
  // Should be -1 until workflow has been initiated
  this.index = -1;
  // logs time stamps for each step in the workflow
  this.steps = _.map(w.routes, function(val, i) {
    return {
      index: i,
      name: val.name,
      begin: false,
      finish: false
    };
  });
}


UserRoute = function(name, metadata) {
  // a containter for a specific page
  // @params:
  //    name - the name of the route to navigate to (key used by Router)
  //    metadata (object) - set of keys and values that shoudl be passed
  //          to the router

    this.name = name;
    this.metadata = metadata;
};
