// Configure logger for Tools
var logger = new Logger('Client:Hcomp:Prompts');
// Comment out to use global logging level
// Logger.setLevel('Client:Hcomp:Prompts', 'trace');
//Logger.setLevel('Client:Hcomp:Prompts', 'debug');
Logger.setLevel('Client:Hcomp:Prompts', 'info');
//Logger.setLevel('Client:Hcomp:Prompts', 'warn');

/********************************************************************
 * Return the list of all prompts
 * *****************************************************************/
Template.CrowdPromptPage.helpers({
});

Template.PromptsTab.helpers({
  prompts: function() {
    return Prompts.find(
        {userIDs: Session.get("currentUser")._id},
        {sort: {time: -1}}
    );
  },
});

Template.ExperimentsTab.helpers({
  experiments: function() {
    //TODO: make experiments owned by a user
    if (Session.get("currentUser").name == "Joel") {
      return Experiments.find(
            {hasBegun: true},
            {sort: {creationTime: -1}});
    } else {
      return [];
    }
  },
});

Template.DataProcessingTab.helpers({
  dataSets: function() {
    //return all the datasets for which there is a preprocessed forest
    //done
    var graphs = Graphs.find({type: 'data_forest', is_processed: true});
    var results = []
    graphs.forEach(function(graph) {
      var result = graph;
      var prompt = Prompts.findOne({_id: graph.promptID});
      result['title'] = prompt.title;
      result['question'] = prompt.question;
      result['userID'] = Session.get('currentUser')._id;
      results.push(result)
    });
    logger.trace(JSON.stringify(results));
    return results;
  },
});

/********************************************************************
 * Prompts tab helpers and events
 * *****************************************************************/
Template.CrowdPromptPage.rendered = function() {
  window.scrollTo(0,0);
};

Template.CrowdBrainstorm.rendered = function() {
  var buttons = $(this.firstNode).find(".center-vertical")
  buttons.each(function(index, elm) {
    var ah = $(elm).height();
    var ph = $(elm).parent().height();
    var mh = Math.ceil((ph-ah) / 2);
    $(elm).css('margin-top', mh);
  });
};

Template.ExperimentsTab.rendered = function() {
  Session.set("workingExperiment", null);
};

Template.CrowdBrainstorm.helpers({
  question: function() {
    return this.question;
  },
  getData: function() {
    logger.debug("Data context: " + JSON.stringify(this._id));
    logger.debug("current user: " + JSON.stringify(Session.get("currentUser")));
    var result = {'promptID': this._id, 'userID': Session.get("currentUser")._id};
    logger.debug("Data object: " + JSON.stringify(result));
    return result;
  },
  participants: function() {
    logger.debug("current prompt: " + JSON.stringify(this));
    var groups = Groups.find({_id: {$in: this.groupIDs}});
    var users = [];
    groups.forEach(function(group) {
      users = users.concat(group.users);
    });
    return users.map(function(user) {
      return user.name;
    });
  },
  hasTime: function() {
    if (this.hasOwnProperty("length")) {
      logger.trace("Prompt has session length defined: " + this.length);
      if (this.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      logger.trace("Prompt does not have session length defined");
      return false;
    }
  },
  hasUsers: function() {
    var groups = Groups.find({_id: {$in: this.groupIDs}});
    var users = [];
    groups.forEach(function(group) {
    logger.debug("Looking at groups: " + JSON.stringify(group));
      logger.debug("group has users: " + JSON.stringify(group.users));
      users = users.concat(group.users);
      logger.debug("users list is now: " + JSON.stringify(users));
    });
    logger.debug("list of users:" + JSON.stringify(users));
    if (users.length > 0) {
      logger.trace("Prompt has users");
      return true;
    } else {
      logger.trace("Prompt has no users");
      return false;
    }
  },
  numWorkers: function() {
    logger.debug("current prompt: " + JSON.stringify(this));
    var groups = Groups.find({_id: {$in: this.groupIDs}});
    var users = [];
    groups.forEach(function(group) {
      users = users.concat(group.users);
    });
    return users.length;
  },
  formUrl: function() {
    //Get absolute base url and trim trailing slash
    return Meteor.absoluteUrl().slice(0,-1);
  },
  promptID: function() {
    return {promptID: this._id};
  },
  isNotPrepped: function() {
    var prompt = Prompts.findOne({_id: this._id})
    logger.trace(prompt)
    if (typeof this['forestGraphID'] === 'undefined') {
      return true;
    } else {
      return false;
    }
  },
});

Template.CrowdBrainstorm.events({
  //'click .dash-button': function() {
    //console.log("go to dash");
    //Router.go("HcompDashboard",
      //{promptID: this._id,
        //userID: Session.get('currentUser')});
  //},
  //'click .review-button': function() {
    //console.log("go to reviewpage");
    //Router.go("HcompResultsPage",
      //{promptID: this._id, userID: Session.get("currentUser")});
  //},
  'click .prep-forest': function () {
    logger.debug("Prepping db for dataforest analysis");
    logger.debug(this);
    ForestManager.initForest(this);
    //var prompt = this;
    //var group = Groups.findOne({_id: prompt.groupIDs[0]});
    //var user = Session.get("currentUser");
    //var type = "data_forest";
    //var data = {is_processed: false};
    //graphID = GraphManager.createGraph(prompt, group, user, type, data);
    //Prompts.update({_id: prompt._id}, {$set: {forestGraphID: graphID}});
  },
});


Template.PromptsTab.events({
    'click button.createPrompt': function () {
      var newQuestion = $("input#prompt-text").val();
      var newTitle = $("input#prompt-title").val();
      var minutes = parseInt($("input#prompt-length").val());
      logger.debug("Session will be: " + minutes + " long");
      var newPrompt = PromptManager.create(newQuestion);
      if (newTitle.trim() !== "") {
        PromptManager.setTitle(newPrompt, newTitle);
      }
      if (!isNaN(minutes)) {
        PromptManager.setLength(newPrompt, parseInt(minutes));
      }
      var group = GroupManager.create(newPrompt.template);
      PromptManager.addGroups(newPrompt, group);
      GroupManager.addUser(group, Session.get("currentUser"),
          RoleManager.defaults['HcompFacilitator'].title);
      //Clear textfield values
      $("input#prompt-text").val("");
      $("input#prompt-title").val("");
      $("input#prompt-length").val(0);

    },
    //'click .dash-button': function () {
      //// Set the current prompt
      //var prompt = Prompts.findOne({'_id': this._id});
      //Session.set("currentPrompt", prompt);
      //var group = Groups.findOne({'_id': this.groupIDs[0]});
      //Session.set("currentGroup", group);
      //var user = Session.get("currentUser");
      //if (prompt) {
        //logger.trace("found current prompt with id: " + prompt._id);
        //Session.set("currentPrompt", prompt);
        //logger.debug("Prompt selected");
        //Router.go('HcompDashboard',
            //{promptID: prompt._id, userID: user._id});
      //} else {
        //logger.error("couldn't find current prompt with id: " +
            //prompt._id);
      //}
    //},
    //'click .review-button': function () {
      //// Set the current prompt
      //var prompt = Prompts.findOne({'_id': this._id});
      //Session.set("currentPrompt", prompt);
      //var group = Groups.findOne({'_id': this.groupIDs[0]});
      //Session.set("currentGroup", group);
      //var user = Session.get("currentUser");
      //if (prompt) {
        //logger.trace("found current prompt with id: " + prompt._id);
        //Session.set("currentPrompt", prompt);
        //logger.debug("Prompt selected");
        //Router.go('Visualization', {promptID: prompt._id, userID: user._id});
      //} else {
        //logger.error("couldn't find current prompt with id: " +
            //prompt._id);
      //}
    //},
});

/********************************************************************
 * Experiments tab helpers and events
 * *****************************************************************/
Template.CrowdExperiment.helpers({
  desc: function() {
    return this.description;
  },
  question: function() {
    var prompt = Prompts.findOne({_id: this.promptID});
    return prompt.question;
  },
  timeLimit: function() {
    var prompt = Prompts.findOne({_id: this.promptID});
    if (prompt.length > 0) {
      return prompt.length;
    } else {
      return "Unlimited";
    }
  },
  url: function() {
    return Router.routes['ExperimentCrowdLogin'].url({expID: this._id});
  },
  conditions: function() {
    return Conditions.find({expID: this._id},
      {sort: {description: 1}});
  },
  getData: function() {
    logger.debug("Data context: " + JSON.stringify(this._id));
    logger.debug("current user: " + JSON.stringify(Session.get("currentUser")));
    var result = {'promptID': this.promptID,
        'userID': Session.get("currentUser")._id,
        'expID': this._id};
    logger.debug("Data object2 " + JSON.stringify(result));
    return result;
  },
  excludeUsers: function() {
    return this.excludeUsers;
  },
  numExcluded: function() {
    if (this.excludeUsers) {
      return this.excludeUsers.length;
    } else {
      return 0;
    }
  },
});
Template.NewExperimentModal.onRendered(function() {
  $('#newExpModal').on('hidden.bs.modal', function () {
      // do something…
      logger.debug("Hiding New Exp Modal");
      var exp = Session.get("workingExperiment");
      if (exp) {
        if (!exp.hasBegun) {
          Experiments.remove({_id: exp._id});
        }
        Session.set("workingExperiment", null);
      }
      $('input#exp-title').val("");
  })
});

Template.NewExperimentModal.helpers({
  isInit: function() {
    if (Session.get("workingExperiment")) {
      return true;
    } else {
      return false;
    }
  },
  IVs: function() {
    var exp = Experiments.findOne({_id: Session.get("workingExperiment")._id});
    return Variables.find({_id: {$in: exp.variableIDs}});
  },
  conditions: function() {
    var exp = Experiments.findOne({_id: Session.get("workingExperiment")._id});
    return Conditions.find({_id: {$in: exp.conditionIDs}});
  },
  prompts: function() {
    logger.trace("Getting prompts...");
    return Prompts.find();
  },
});

Template.NewExperimentModal.events({
  'click #init-exp': function() {
    logger.debug("clicked to initialize experiment with given name");
    var expTitle = $('input#exp-title').val();
    logger.trace("Experiment title: " + expTitle);
    var expID = ExperimentManager.create(expTitle);
    if (expID) {
      var exp = Experiments.findOne({_id: expID});
      Session.set("workingExperiment", exp);
    }
    //$("#createExp").attr("disabled", "enabled");
  },
  'click #num-parts': function(e, target) {
    logger.trace("clicked on num Participants", e);
    logger.trace($(e.currentTarget).val());
    ExperimentManager.updateDefaultNumParts(Session.get("workingExperiment")._id, $(e.currentTarget).val());
    e.stopImmediatePropagation();
  },
  'focusout #num-parts': function(e, target) {
    logger.trace("num Participants lost focus", e);
    logger.trace($(e.currentTarget).val());
    ExperimentManager.updateDefaultNumParts(Session.get("workingExperiment")._id, $(e.currentTarget).val());
    e.stopImmediatePropagation();
  },
  'click .exp-cond-setup .modal-number-input': function(e, target) {
    logger.trace("clicked on num Participants for a conditions", e);
    logger.trace($(e.currentTarget).val());
    ExperimentManager.updateCondParts(this._id, $(e.currentTarget).val());
    e.stopImmediatePropagation();
  },
  'focusout .exp-cond-setup .modal-number-input': function(e, target) {
    logger.trace("clicked on num Participants for a conditions", e);
    logger.trace($(e.currentTarget).val());
    ExperimentManager.updateCondParts(this._id, $(e.currentTarget).val());
    e.stopImmediatePropagation();
  },
  'focusout .exp-iv .iv-name': function(e, target) {
    logger.trace("variable name lost focus", e);
    logger.trace($(e.currentTarget).val());
    ExperimentManager.updateVarName(this._id, $(e.currentTarget).val());
    e.stopImmediatePropagation();
  },
  'focusout .exp-iv .iv-levels': function(e, target) {
    logger.trace("variable levels field lost focus");
    var levels = Tools.String.parseString($(e.currentTarget).val(), ',');
    logger.trace("levels: ", levels);
    ExperimentManager.updateVarValues(this._id, levels);
    e.stopImmediatePropagation();
  },
  'click button.createExp': function () {
    logger.trace("clicked create exp button");
    // get the prompt selection
    // get other data
    var w = Session.get("workingExperiment");
    var expTitle = $('input#exp-title').val();
    logger.trace("Experiment title: " + expTitle);
    ExperimentManager.updateExpName(w._id, expTitle);
    ExperimentManager.beginExperiment(w._id);
    //Clear textfield values
    $('input#exp-title').val("");
    Session.set("workingExperiment", null);
  },
  "click #add-IV": function() {
    logger.debug("Adding an Independent Variable to the experiment");
    ExperimentManager.createVariable(Session.get("workingExperiment")._id);

  },
  "click #gen-conditions": function() {
    logger.debug("Generating Conditions using variables specified");
    ExperimentManager.generateConditions(Session.get("workingExperiment")._id);
    logger.trace("Updated Experiment conditions: ", Experiments.findOne({_id: Session.get("workingExperiment")._id}).conditionIDs);

  },
  "click #gen-custom-condition": function() {
    logger.debug("Generating Conditions using variables specified");
    ExperimentManager.addCondition(Session.get("workingExperiment")._id, "", []);
    logger.trace("Updated Experiment conditions: ", Experiments.findOne({_id: Session.get("workingExperiment")._id}).conditionIDs);
  },
  "click .cancel-create-exp": function() {
    logger.debug("Cancelling experiment creation. Removing old experiment");
    // var exp = Session.get("workingExperiment");
    // Experiments.remove({_id: exp._id});
    // Session.set("workingExperiment", null);
  },

});
Template.WorkflowSelectItem.helpers({
  routesToString: function(routes) {
    var out = "";
    routes.forEach(function(r) {
      if (out == "") {
        out = r.name;
      } else {
        out += ", " + r.name;
      }
    });
    return out;
  },
});
Template.ExperimentConditionSetup.helpers({
  hasWorkflow: function() {
    if (this.misc.workflowID) {
      return true;
    } else {
      return false;
    }
  },
  workflows: function() {
    return Workflows.find();
  },
  workflow: function() {
    logger.trace("Returning workflow", this.misc.workflowID);
    return Workflows.findOne({_id: this.misc.workflowID});
  },
  routes: function() {
    var id = this._id
    return _.map(this.routes, function(val, index) {
      val['index'] = index;
      val['workflowID'] = id;
      return val;
    });
  },

});
Template.ExperimentConditionSetup.events({
  "focusout .workflow .name": function(e, target) {
    logger.trace("Workflow name lost focus", e, target);
    logger.trace($(e.currentTarget).val());
    //ExperimentManager.updateCondName(this._id, $(e.currentTarget).val());
    WorkflowManager.updateDescription(target.data.misc.workflowID, $(e.currentTarget).val());
    e.stopImmediatePropagation();
  },
  "focusout .exp-cond-setup .name": function(e, target) {
    logger.trace("condition name lost focus", e);
    logger.trace($(e.currentTarget).val());
    ExperimentManager.updateCondName(this._id, $(e.currentTarget).val());
    e.stopImmediatePropagation();
  },
  "click .create-workflow": function(e, target) {
    logger.trace("creating workflow", this);
    var selected =  $(e.currentTarget).parent().children("select").val();
    logger.trace("workflow selected: " + selected );
    if (selected == "new") {
      var w = WorkflowManager.create("");
      ExperimentManager.updateCondData(this._id, "workflowID", w._id);
    } else {
      var w = Workflows.findOne({_id: selected});
      ExperimentManager.updateCondData(this._id, "workflowID", selected);
    }
  },
  "click .copy-workflow": function(e, target) {
    logger.trace("creating workflow", this);
    var selected =  $(e.currentTarget).parent().children("select").val();
    logger.trace("workflow selected: " + selected );
    if (selected != "new") {
      var w = WorkflowManager.copy(selected);
      ExperimentManager.updateCondData(this._id, "workflowID", w._id);
    }
  },
  "click .add-route": function(e, target) {
    logger.trace("Clicked to Add route to workflow", target.data.misc.workflowID);
    WorkflowManager.addRoute(target.data.misc.workflowID);
  },
  "click .fa-chevron-down": function(e, target) {
    logger.trace("Clicked to collapse section", $(target).parent());
    $(e.currentTarget).toggleClass("fa-chevron-down").toggleClass("fa-chevron-right");
    $(e.currentTarget).parent().children(".collapse-section").slideToggle();
  },
  "click .fa-chevron-right": function(e, target) {
    logger.trace("Clicked to expand section");
    $(e.currentTarget).toggleClass("fa-chevron-right").toggleClass("fa-chevron-down");
    logger.trace("collapse section: ", $(e.currentTarget).parent().children(".collapse-section"));
    $(e.currentTarget).parent().children(".collapse-section").slideToggle();
  },

});

Template.WorkflowRoute.events({
  "focusout .workflow-route .name": function(e, target) {
    logger.debug("finished editing name of route: ", $(e.currentTarget).val(), this, e, target);
    WorkflowManager.updateRouteName(this.workflowID, this.index, $(e.currentTarget).val());
    e.stopImmediatePropagation();
  },
  "click .workflow-route .add-metadata": function() {
    logger.trace("Adding metadata field to route", this);
    WorkflowManager.updateRouteData(this.workflowID, this.index, "key", "value");
  },

});

Template.WorkflowRoute.helpers({
  fields: function() {
    var o = this;
    return  _.map(_.keys(o.metadata), function(key) {
      return {
        workflowID: o.workflowID,
        index: o.index,
        key: key,
        value: o.metadata[key]
      };
    });;
  },
});

Template.WorkflowRouteMetadataField.events({
  "focusout .metadata-field .key": function(e, target) {
    logger.debug("finished editing key for metadata key ", $(e.currentTarget).val(), this, e, target);
    WorkflowManager.updateRouteDataFieldName(this.workflowID, this.index, this.key, $(e.currentTarget).val());
    e.stopImmediatePropagation();
  },
  "focusout .metadata-field .value": function(e, target) {
    logger.debug("finished editing key for metadata value ", $(e.currentTarget).val(), this, e, target);
    WorkflowManager.updateRouteData(this.workflowID, this.index, this.key, $(e.currentTarget).val());
    e.stopImmediatePropagation();
  },

});
Template.ExperimentPromptItem.helpers({
  question: function() {
    return this.question;
  },
  timeLimit: function() {
    if (this.length > 0) {
      return this.length;
    } else {
      return "No time limit";
    }
  },
});


Template.CrowdExperimentExcludeUser.helpers({
  thisID: function() {
    // buggy at the moment, not sure why
    var userName = this;
    logger.trace("Username to exclude: " + JSON.stringify(userName));
    var user = MyUsers.findOne({"name": userName});
    logger.trace(user);
    // logger.trace("Excluded user: " + JSON.stringify(user));
    return user._id;
  },
});

Template.CrowdExperimentCondition.helpers({
  desc: function() {
    return this.description;
  },
  numAssigned: function() {
    return this.assignedParts.length;
  },
  numBegan: function() {
    var numBegan = 0;
    this.assignedParts.forEach(function(p) {
      var thisP = Participants.findOne({_id: p});
      if (thisP.hasStarted) {
        numBegan += 1;
      }
    });
    return numBegan;
  },
  numCompleted: function() {
    return this.completedParts.length;
  },
  readyProgress: function() {
    var numReady = this.readyParts.length;
    var numAssigned = this.assignedParts.length;
    var progress;
    if (numAssigned == 0) {
      logger.trace("No assigned participants for " + this.description + " condition");
      progress = 0;
    } else {
      logger.trace("Found " + numAssigned + " assigned participants for " + this.description + " condition");
      progress = numReady/numAssigned*100
    }
    logger.trace("Progress = " + progress);
    return Math.round(progress);
  },
  assignedParticipants: function() {
    return Participants.find({conditionID: this._id},
      {sort: {exitedEarly: 1, fluencyStarted: -1, fluencyFinished: -1, isReady: -1}});
  },
});

Template.CondParticipant.helpers({
  partUserName: function() {
    var partID = this;
    logger.trace("Participant: " + JSON.stringify(this));
    // logger.debug("Calling partUserName for participant " + partID);
    // var part = Participants.find({"_id": partID}).fetch()[0];
    // logger.trace("Participants: " + JSON.stringify(Participants.find({}).fetch()));
    // logger.trace("Participant for condition: " + JSON.stringify(part));
    // return part.userName;
    return this.userName;
  },
  status: function() {
    if (this.misc.exitedEarly) {
      return "danger";
    } else if (this.misc.isReady) {
      return "success";
    } else if (this.misc.fluencyFinished) {
      return "warning";
    } else {
      return "";
    }
  },
  tutorialStart: function() {
    if (this.misc.tutorialStarted) {
      var msg = "User started a tutorial";
      return parseTime(this.userID, msg);
      // var time = Events.findOne({userID: this.userID, description: msg}).time;
      // return time.toTimeString().substring(0,9);
    } else {
      return "";
    }
  },
  fluencyStart: function() {
    if (this.misc.fluencyStarted) {
      var msg = "User started fluency measure task";
      return parseTime(this.userID, msg);
      // var time = Events.findOne({userID: this.userID, description: msg}).time;
      // return time.toTimeString().substring(0,9);
    } else {
      return "";
    }
  },
  fluencyEnd: function() {
    // return this.fluencyFinished;
    if (this.misc.fluencyFinished) {
      var msg = "User finished fluency measure task";
      return parseTime(this.userID, msg);
      // var time = Events.findOne({userID: this.userID, description: msg}).time;
      // return time.toTimeString().substring(0,9);
    } else {
      return "";
    }
  },
  tutorialEnd: function() {
    // return this.isReady;
    if (this.misc.isReady) {
      var msg = "User finished a tutorial";
      return parseTime(this.userID, msg);
      // var time = Events.findOne({userID: this.userID, description: msg}).time;
      // return time.toTimeString().substring(0,9);
    } else {
      return "";
    }
  },
  ideationStart: function() {
    // return this.hasStarted;
    if (this.misc.hasStarted) {
      var msg = "User began ideation";
      return parseTime(this.userID, msg);
      // var time = Events.findOne({userID: this.userID, description: msg}).time;
      // return time.toTimeString().substring(0,9);
    } else {
      return "";
    }
  },
  surveyStart: function() {
    // return this.surveyStarted;
    if (this.misc.surveyStarted) {
      var msg = "User began survey";
      return parseTime(this.userID, msg);
      // var time = Events.findOne({userID: this.userID, description: msg}).time;
      // return time.toTimeString().substring(0,9);
    } else {
      return "";
    }
  },
  finishedStudy: function() {
    // return this.hasFinished;
    if (this.misc.hasFinished) {
      var msg = "User submitted survey";
      return parseTime(this.userID, msg);
      // var time = new Date(Events.findOne({userID: this.userID, description: msg}).time);
      // return time.toTimeString().substring(0,9);
    } else {
      return "";
    }
  },
  exitEarly: function() {
    // return this.exitedEarly;
    if (this.misc.exitedEarly) {
      var msg = "User exited study early";
      return parseTime(this.userID, msg);
      // var time = Events.findOne({userID: this.userID, description: msg}).time;
      // return time.toTimeString().substring(0,9);
    } else {
      return "";
    }
  },
});

var parseTime = function(userID, msg) {
  var time = new Date(Events.findOne({userID: userID, description: msg}).time);
  return time.toTimeString().substring(0,9);
}


Template.ExperimentsTab.events({
    'click .init-synth': function () {
        logger.debug("clicked init-synth");
        ExperimentManager.initSynthExp(this._id);
    },
});

Template.CrowdExperiment.events({
  'click .edit-exp': function() {
    logger.debug("editing Experiment", this);
    Session.set("workingExperiment", this);
    $("#new-exp").click();
  },
});
/********************************************************************
 * Data Processing tab helpers and events
 * *****************************************************************/
