// Configure logger for WorkflowManager
var logger = new Logger('Managers:Workflow');
// Comment out to use global logging level
Logger.setLevel('Managers:Workflow', 'trace');
//Logger.setLevel('Managers:Workflow', 'debug');
// Logger.setLevel('Managers:Workflow', 'info');
// Logger.setLevel('Managers:Workflow', 'warn');

WorkflowManager = (function () {
  return {
    create: function(name) {
      var w = new Workflow(name);
      w._id = Workflows.insert(w);
      return w;
    },
    copy: function(id) {
      var copy = Workflows.findOne({_id: id});
      var w = new Workflow(copy.name);
      w.routes = copy.routes;
      w._id = Workflows.insert(w);
      return w;
    },
    updateDescription: function(id, desc) {
      logger.debug("Updating workflow: %s with description: ", id, desc);
      Workflows.update({_id: id}, {$set: {description: desc}});
    },
    addRoute: function(id, name, metadata) {
      logger.debug("Adding Route to workflow:", id, name, metadata);
      if (!name) {
        name = "";
      }
      if (!metadata) {
        metadata = {};
      }
      var r = new UserRoute(name, metadata);
      Workflows.update({_id: id}, {$push: {routes: r}});
    },
    updateRouteName: function(workflowID, index, name) {
      var w = Workflows.findOne({_id: workflowID});
      w.routes[index].name = name;
      Workflows.update({_id: workflowID}, {$set: {routes: w.routes}});
    },
    updateRouteDataFieldName: function(id, index, field, newField) {
      var w = Workflows.findOne({_id: id});
      w.routes[index].metadata[newField] = w.routes[index].metadata[field];
      delete w.routes[index].metadata[field];
      //w.routes[index].metadata[field] = undefined;
      Workflows.update({_id: id}, {$set: {routes: w.routes}});
    },
    updateRouteData: function(id, index, field, val) {
      var w = Workflows.findOne({_id: id});
      w.routes[index].metadata[field] = val;
      Workflows.update({_id: id}, {$set: {routes: w.routes}});
    },
    setupWorkflow: function(userID, workflowID) {
      // Call this to initiate a workflow before setting next page
      logger.debug("Creating a new progress tracker");
      progress = new Progress(workflowID, userID)
      progress.index = -1;
      progress['_id'] = Progresses.insert(progress);
    },
    setNextPage: function(userID, workflowID, currentIndex) {
      // If not index is given, set page to the beginning
      var progress = Progresses.findOne({userID: userID, workflowID: workflowID});
      var workflow = Workflows.findOne({_id: workflowID});
      var now = new Date().getTime();
      if (!currentIndex) {
        logger.debug("no index given, using index stored in progress:", progress.index);
        currentIndex = progress.index;
      }
      // Set NExt Page based on found progress
      var i = 0;
      if (currentIndex < progress.steps.length - 1) {
        logger.debug("Incrementing index: ", currentIndex);
        i = currentIndex + 1;
        logger.debug("index: ", i);
      } else {
        logger.debug("Not Incrmmenting index: ", currentIndex);
        i = currentIndex;
        logger.debug("index: ", i);
      }
      logger.debug("initiating from currentIndex: ", currentIndex);
      logger.debug("initiating from index: ", i);
      Router.setNextPage(
        workflow.routes[i].name, 
        workflow.routes[i].metadata
      );
      Router.setNextPageParam("userID", userID);
    },

    goToNextPage: function(userID, workflowID) {
      logger.trace("Going to next page", userID, workflowID);
      var p = Progresses.findOne({userID: userID, workflowID: workflowID});
      var i = p.index;
      var now =  new Date().getTime();
      if (i >= 0) {
        p.steps[i]['finish'] = now;
      }
      if (i < p.steps.length - 1) {
        p.steps[i+1]['begin'] = now;
        p.index = i+1;
      }
      logger.trace("updating user workflow progress: ", p);
      Progresses.update({_id: p._id}, {$set: {index: p.index, steps: p.steps}});
      Router.goToNextPage();
    },

  };
}());
