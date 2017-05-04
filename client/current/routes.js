// Configure logger for Tools
var logger = new Logger('Client:Routes');
// Comment out to use global logging level
// Logger.setLevel('Client:Routes', 'trace');
// Logger.setLevel('Client:Routes', 'debug');
Logger.setLevel('Client:Routes', 'info');
// Logger.setLevel('Client:Routes', 'warn');

//Maps routes to templates
Router.route('crowd/ideate/c1/:userID/:promptID/:inspirationID/:expID/:isTutorial/:isFluency/:sequence', {
  name: 'IdeateInspire',
  template: 'InspireIdeate',
  subscriptions: function() {
    return [
      Meteor.subscribe('ideas'),
      Meteor.subscribe('clusters'),
      Meteor.subscribe('inspirations'),
      Meteor.subscribe('participants'),
      Meteor.subscribe('experiments'),
      Meteor.subscribe('exp-conditions'),
      Meteor.subscribe('workflows'),
      Meteor.subscribe('progresses'),
      Meteor.subscribe('dummyIdeas'),
      Meteor.subscribe('fluencyMeasures'),
    ];
  },
  onBeforeAction: function() {
    logger.debug("Prepping page for loading");
    var user = MyUsers.findOne({_id: this.params.userID});
    LoginManager.loginUser(user.name);
    Session.set("currentUser", user);
    var prompt = Prompts.findOne({_id: this.params.promptID});
    Session.set("currentPrompt", prompt);
    logger.trace("Current prompt is: " + JSON.stringify(prompt));
    var insp = Inspirations.findOne({_id: this.params.inspirationID});
    Session.set("currentInspiration", insp);
    if (this.params.expID) {
      Session.set("currentExpID", this.params.expID);
      var part = Participants.findOne({expID: this.params.expID, userID: user._id});
      Session.set("currentParticipant", part);
      logger.trace("current participant: ", part);
      Session.set("initPage", true);
      if (this.params.isTutorial == "t") {
        Session.set("isTutorial", true);
      } else {
        Session.set("isTutorial", false);
      }
      if (this.params.isFluency == "t") {
        Session.set("isFluency", true);
      } else {
        Session.set("isFluency", false);
      }
      Session.set("problemSequence", parseInt(this.params.sequence));
      // var cond = Conditions.findOne({_id: part.conditionID});
      // WorkflowManager.setNextPage(user._id, cond.misc.workflowID);
      // Router.setNextPageParam("userID", user._id);
      // Router.setNextPageParam("partID", part._id);
    }
    this.next();
  },
  action: function() {
    if (this.ready()) {
      this.render();
    } else {
      this.render('loading');
    }
  },
  onAfterAction: function() {
    if (this.ready() ) {
      insertExitStudy();
    }
  },
});

Router.route("/crowd/experiment/login/:expID", {
  name: "ExperimentCrowdLogin",
  template: "MturkLoginPage",
  waitOn: function() {
    return [
      Meteor.subscribe('experiments', this.params.expID),
      Meteor.subscribe('clusters'),
      Meteor.subscribe('inspirations'),
      Meteor.subscribe('progresses'),
      Meteor.subscribe('workflows'),
    ];
  },
  onBeforeAction: function() {
    console.log("before action");
    Session.set("currentUser", null);
    if (this.ready()) {
      logger.debug("Data ready");
      // var prompt = Prompts.findOne({_id: this.params.promptID});
      // logger.debug("setting current prompt");
      // Session.set("currentPrompt", prompt);

      var exp = Experiments.findOne({_id: this.params.expID})
      // if (exp) {
      logger.debug("setting current experiment");
      Session.set("currentExp", exp);
        // var pID = exp.promptID
        // var prompt = Prompts.findOne({_id: pID});
        // logger.debug("setting current prompt");
        // Session.set("currentPrompt", prompt);
      // } else {
        // // logger.warn("no prompt found with id: " + this.params.promptID);
        // logger.warn("no experiment found with id: " + this.params.expID);
      // }
      this.next();
    } else {
      logger.warn("Not ready");
    }
  },
  action: function() {
    if (this.ready()) {
      this.render();
    } else {
      this.render('loading');
    }
  },
  onAfterAction: function() {
    if (this.ready() ) {
      /**** Strictly for testing *****/
      if (Inspirations.find().count() == 0) {
        InspirationManager.create()
      }
      /**** end testing code ****/
      var params = {
        expID: this.params.expID,
      }
      Router.setNextPage("HcompConsentPage", params);

    }
  },


});

Router.route('HcompConsentPage', {
    path: 'consent/:expID/:userID/:frameID',
    template: 'HcompConsentPage',
  waitOn: function() {
    return [
      Meteor.subscribe('workflows'),
      Meteor.subscribe('progresses'),
      Meteor.subscribe('experiments', this.params.expID),
      // Meteor.subscribe('synthSubsets'),
      // Meteor.subscribe('inspirations'),
    ];
  },
  onBeforeAction: function(pause) {
      logger.debug("before action");
      //if (!Session.get("currentUser")) {
        ////if there is no user currently logged in, then render the login page
        //this.render('MTurkLoginPage', {'promptID': this.params.promptID});
        ////Pause rendering the given page until the user is set
        //pause();
      //}
      if (this.ready()) {
        logger.debug("Data ready");
        var user = MyUsers.findOne({_id: this.params.userID});
        logger.trace("user: " + user.name);
        MyUsers.update({_id: user._id}, {$set: {route: 'HcompConsentPage'}});
        LoginManager.loginUser(user.name);
        Session.set("currentUser", user);
        var exp = Experiments.findOne({_id: this.params.expID});
        Session.set("currentExp", exp);
        if (exp) {
          logger.trace("found experiment with id: " + this.params.expID);
        } else {
          logger.warn("no experiment found with id: " + this.params.expID);
        }
        Session.set("frameID", this.params.frameID);
        this.next();
      } else {
        logger.debug("Not ready");
      }
  },
  action: function(){
    if(this.ready()) {
      Session.set("useTimer", true);
      this.render();
    } else
      this.render('loading');
  },
  onAfterAction: function() {
    if (this.ready()) {
      var exp = Experiments.findOne({_id: this.params.expID});
      var params = {
        expID: exp._id
      };
      Router.setNextPage("IdeateInspire", params);
    }
  },
});

Router.route("/crowd/k/:userID/:expID/", {
  name: "KnowledgeTest",
  template: "KnowledgeTest",
  waitOn: function() {
    return [
      // Meteor.subscribe('experiments', this.params.expID),
      // Meteor.subscribe('clusters'),
      // Meteor.subscribe('inspirations'),
      Meteor.subscribe('participants'),
      Meteor.subscribe('experiments'),
      Meteor.subscribe('exp-conditions'),
      Meteor.subscribe('workflows'),
      Meteor.subscribe('progresses'),
      Meteor.subscribe('knowledgeTestResponses')
    ];
  },
  onBeforeAction: function() {
    console.log("before action");
    // Session.set("currentUser", null);
    if (this.ready()) {
      logger.debug("Data ready");

      // var prompt = Prompts.findOne({_id: this.params.promptID});
      // logger.debug("setting current prompt");
      // Session.set("currentPrompt", prompt);
      Session.set("currentUser", MyUsers.findOne({_id: this.params.userID}));

      var exp = Experiments.findOne({_id: this.params.expID})
      if (exp) {
        logger.debug("setting current experiment");
        Session.set("currentExp", exp);
        Session.set("currentExpID", this.params.expID);
        var part = Participants.findOne({expID: this.params.expID, userID: Session.get("currentUser")._id});
        Session.set("currentParticipant", part);
        logger.trace("current participant: ", part);
      } else {
        logger.warn("no experiment found with id: " + this.params.expID);
      }
      // Session.set("problemSequence", this.params.sequence);
      this.next();
    } else {
      logger.warn("Not ready");
    }
  },
  action: function() {
    if (this.ready()) {
      this.render();
    } else {
      this.render('loading');
    }
  },
  onAfterAction: function() {
    if (this.ready() ) {
      // var params = {
      //   expID: this.params.expID,
      // }
      // Router.setNextPage("HcompConsentPage", params);
      insertExitStudy();
    }
  },


});

// Router.route("/crowd/ideatef/:userID/:expID/:promptID/:alignType/:isFluency/:isFocus/:sequence", {
Router.route("/crowd/ideatef/:userID/:expID/:promptID/:isFluency/:isFocus/:sequence", {
  name: "FocusIdeate",
  template: "FocusIdeate",
  waitOn: function() {
    return [
      Meteor.subscribe('ideas'),
      // Meteor.subscribe('clusters'),
      Meteor.subscribe('participants'),
      Meteor.subscribe('experiments'),
      Meteor.subscribe('exp-conditions'),
      Meteor.subscribe('workflows'),
      Meteor.subscribe('progresses'),
      Meteor.subscribe('dummyIdeas'),
      Meteor.subscribe('fluencyMeasures'),
      // Meteor.subscribe('knowledgeTestResponses')
    ];
  },
  onRun: function() {
    // set this here because we
    Session.set("initPage", true);
    this.next();
  },
  onBeforeAction: function() {
    console.log("before action");
    // Session.set("currentUser", null);
    if (this.ready()) {
      logger.debug("Data ready");
      var user = MyUsers.findOne({_id: this.params.userID});
      LoginManager.loginUser(user.name);
      Session.set("currentUser", user);
      var prompt = Prompts.findOne({_id: this.params.promptID});
      logger.debug("setting current prompt");
      Session.set("currentPrompt", prompt);
      Session.set("currentExpID", this.params.expID);
      var exp = Experiments.findOne(this.params.expID);
      logger.debug("Setting current experiment for experiment: " + JSON.stringify(exp));
      Session.set("currentExp", exp);
      var part = Participants.findOne({expID: this.params.expID, userID: user._id});
      Session.set("currentParticipant", part);
      logger.trace("current participant: ", part);
      // Session.set("initPage", true);
      // Session.set("alignType", this.params.alignType); // should be either a (aligned) or m (misaligned)
      if (this.params.isFluency == "t") {
        Session.set("isFluency", true);
      } else {
        Session.set("isFluency", false);
      }
      if (this.params.isFocus == "t") {
        Session.set("isFocus", true);
        Session.set("timesUp", false);
      } else {
        Session.set("isFocus", false);
      }
      Session.set("problemSequence", parseInt(this.params.sequence));
      // Session.set("focusArea", "education");

      // var exp = Experiments.findOne({_id: this.params.expID})
      // if (exp) {
      // logger.debug("setting current experiment");
      // Session.set("currentExp", exp);
        // var pID = exp.promptID
        // var prompt = Prompts.findOne({_id: pID});
        // logger.debug("setting current prompt");
        // Session.set("currentPrompt", prompt);
      // } else {
        // // logger.warn("no prompt found with id: " + this.params.promptID);
        // logger.warn("no experiment found with id: " + this.params.expID);
      // }
      this.next();
    } else {
      logger.warn("Not ready");
    }
  },
  action: function() {
    if (this.ready()) {
      this.render();
    } else {
      this.render('loading');
    }
  },
  onAfterAction: function() {
    if (this.ready() ) {
      // var params = {
      //   expID: this.params.expID,
      // }
      // Router.setNextPage("HcompConsentPage", params);
      insertExitStudy();
    }
  },

});

Router.route('KAlignSurvey', {
    path: 'crowd/ksurvey/:userID/:expID/',
    template: 'KAlignSurvey',
    waitOn: function() {
      logger.debug("Waiting on...");
      return [
        Meteor.subscribe('experiments'),
        Meteor.subscribe('exp-conditions'),
        Meteor.subscribe('workflows'),
        Meteor.subscribe('progresses'),
        Meteor.subscribe('participants'),
        Meteor.subscribe('prompts'),
        Meteor.subscribe('myUsers'),
      ];
    },
    onBeforeAction: function(pause) {
        logger.debug("before action");
        //if (!Session.get("currentUser")) {
          ////if there is no user currently logged in, then render the login page
          //this.render('MTurkLoginPage', {'promptID': this.params.promptID});
          ////Pause rendering the given page until the user is set
          //pause();
        //}
        if (this.ready()) {
          logger.debug("Data ready");
          var exp = Experiments.findOne({_id: this.params.expID});
          Session.set("currentExp", exp);
          var part = Participants.findOne({expID: this.params.expID, userID: this.params.userID});
          Session.set("currentParticipant", part);
          var user = MyUsers.findOne({_id: this.params.userID});
          Session.set("currentUser", user);
          Session.set("problemSequence", parseInt(this.params.sequence));
          this.next();
        } else {
          logger.debug("Not ready");
        }
    },
    action: function(){
      if(this.ready()) {
        this.render();
      } else {
        this.render('loading');
      }
    },
    onAfterAction: function() {
      insertExitStudy();
    },
  });
