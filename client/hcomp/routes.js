// Configure logger for Tools
var logger = new Logger('Client:Hcomp:Routes');
// Comment out to use global logging level
Logger.setLevel('Client:Hcomp:Routes', 'trace');
//Logger.setLevel('Client:Hcomp:Routes', 'debug');
//Logger.setLevel('Client:Hcomp:Routes', 'info');
// Logger.setLevel('Client:Hcomp:Routes', 'warn');

//Maps routes to templates
Router.map(function () {
  /***************************************************************
   * Define custom routes for hcomp pages
   * *************************************************************/
  this.route('CrowdPromptPage', {
      name: 'CrowdPromptPage',
      path: 'crowd/Brainstorms/:userID',
      template: 'CrowdPromptPage',
    waitOn: function() {
      var uid = this.params.userID;
      return [
          Meteor.subscribe('prompts', {userID: uid}),
          Meteor.subscribe('myUsers', {_id: uid}),
          Meteor.subscribe('groups'),
          Meteor.subscribe('experiments'),
          Meteor.subscribe('exp-variables'),
          Meteor.subscribe('exp-conditions'),
          Meteor.subscribe('workflows'),
          Meteor.subscribe('graphs'),
          Meteor.subscribe('nodes'),
          Meteor.subscribe('edges'),
      ];
    },
    onBeforeAction: function() {
      if (this.ready()) {
        logger.debug("Data ready");
        if (!Session.get("currentUser")) {
          var user = MyUsers.findOne({_id: this.params.userID});
          LoginManager.loginUser(user.name);
          Session.set("currentUser", user);
        }
        this.next();
      }
    },
  });


  this.route('subroute', {
     path: 'crowd/subroute/:promptID/:userID/',
     template: 'SubrouteSandbox',
    waitOn: function() {
      var uid = this.params.userID;
      return [
          Meteor.subscribe('prompts', {userID: uid}),
          Meteor.subscribe('myUsers', {_id: uid}),
          Meteor.subscribe('ideas'),
          Meteor.subscribe('groups'),
          Meteor.subscribe('experiments'),
          Meteor.subscribe('graphs'),
          Meteor.subscribe('nodes'),
          Meteor.subscribe('edges'),
          Meteor.subscribe('tasks'),
          Meteor.subscribe('zoomPositions'),
      ];
    },
    onBeforeAction: function() {
      if (this.ready()) {
        logger.debug("Data ready");
        if (!Session.get("currentUser")) {
          var user = MyUsers.findOne({_id: this.params.userID});
          LoginManager.loginUser(user.name);
          Session.set("currentUser", user);

          var prompt = Prompts.findOne({_id: this.params.promptID});
          Session.set("currentPrompt", prompt);
        }
        this.next();
      }
    },
  });


  this.route('ExpDashboard', {
    path: 'crowd/DashboardExp/:promptID/:userID/:expID',
    template: 'HcompDashboard',
    onRun: function() {
      //Session.set("currentUser", MyUsers.findOne({_id: "db"}));
    },
    waitOn: function() {
      //var group = Session.get("currentGroup");
      //console.log(group['assignments']['Ideator']);
      //console.log("************************************************");
      //var ideatorIDs = getIDs(group['assignments']['Ideator'])
      //var synthIDs = getIDs(group['assignments']['Synthesizer'])
      var pID = this.params.promptID;
      return [
          Meteor.subscribe('prompts'),
          Meteor.subscribe('groups'),
          Meteor.subscribe('ideas', {promptID: pID}),
          Meteor.subscribe('clusters', {promptID: pID}),
          Meteor.subscribe('myUsers'),
          Meteor.subscribe('tasks', {promptID: pID}),
          Meteor.subscribe('questions'),
          Meteor.subscribe('assignments', {promptID: pID}),
          Meteor.subscribe('sorters'),
      ];
    },
    onBeforeAction: function() {
      if (this.ready()) {
        logger.debug("Data ready");
        if (!Session.get("currentUser")) {
          var user = MyUsers.findOne({_id: this.params.userID});
          LoginManager.loginUser(user.name);
          Session.set("currentUser", user);
        }
        var prompt = Prompts.findOne({_id: this.params.promptID});
        if (prompt) {

          logger.debug("setting current prompt");
          Session.set("currentPrompt", prompt);

          // FilterManager.create("Ideas Filter", Session.get("currentUser"), "ideas", "prompt._id", Session.get("currentPrompt")._id);
          // FilterManager.create("IdeaWordCloud Filter", Session.get("currentUser"), "ideas", "prompt._id", Session.get("currentPrompt")._id);
          // FilterManager.create("Tasks Filter", Session.get("currentUser"), "tasks", "promptID", Session.get("currentPrompt")._id);
          if (prompt.length > 0) {
            Session.set("sessionLength", prompt.length);
          } else {
            Session.set("sessionLength", 10);
          }
        } else {
          logger.warn("no prompt found with id: " + this.params.promptID);
        }
        var exp = Experiments.findOne({_id: this.params.expID});
        if (exp) {
          logger.debug("setting current exp");
          Session.set("currentExp",exp);
          var group = Groups.findOne({_id: exp.groupID})
          Session.set("currentGroup", group);
          // createDefaultIdeasFilter("Ideas Filter");
          // createDefaultIdeasFilter("IdeaWordCloud Filter");
        } else {
          logger.warn("no exp found with id: " + this.params.expID);
        }
        this.next();
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
        //initRolePage();
      }
    }
  });

  this.route('CrowdLoginPage', {
    path: '/crowd/Ideation/Login/:promptID',
    template: 'MturkLoginPage',
    waitOn: function() {
      return [
        Meteor.subscribe('prompts', this.params.promptID)
      ];
    },
    onBeforeAction: function() {
      console.log("before action");
      Session.set("currentUser", null);
      if (this.ready()) {
        logger.debug("Data ready");
        var prompt = Prompts.findOne({_id: this.params.promptID});
        logger.debug("setting current prompt");
        if (prompt) {
        Session.set("currentPrompt", prompt);
        } else {
           logger.warn("no prompt found with id: " + this.params.promptID);
        }
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
      Session.set("nextPage", "ConsentPage");
    },
  });


  this.route('HcompDashboard', {
    path: 'crowd/Dashboard/:promptID/:userID',
    template: 'HcompDashboard',
    onRun: function() {
      //Session.set("currentUser", MyUsers.findOne({_id: "db"}));
    },
    waitOn: function() {
      var pID = this.params.promptID;
      return [
          Meteor.subscribe('prompts'),
          Meteor.subscribe('groups'),
          Meteor.subscribe('ideas', {promptID: pID}),
          Meteor.subscribe('clusters', {promptID: pID}),
          Meteor.subscribe('myUsers'),
          Meteor.subscribe('tasks', {promptID: pID}),
          Meteor.subscribe('questions'),
          Meteor.subscribe('assignments', {promptID: pID}),
          Meteor.subscribe('sorters'),
      ];
    },
    onBeforeAction: function() {
      if (this.ready()) {
        logger.debug("Data ready");
        if (!Session.get("currentUser")) {
          var user = MyUsers.findOne({_id: this.params.userID});
          LoginManager.loginUser(user.name);
          Session.set("currentUser", user);
        }
        var prompt = Prompts.findOne({_id: this.params.promptID});
        if (prompt) {
          var group = Groups.findOne({_id: prompt.groupIDs[0]})
          logger.debug("setting current prompt");
          Session.set("currentPrompt", prompt);
          Session.set("currentGroup", group);
          // FilterManager.create("Ideas Filter", Session.get("currentUser"), "ideas", "prompt._id", Session.get("currentPrompt")._id);
          // FilterManager.create("IdeaWordCloud Filter", Session.get("currentUser"), "ideas", "prompt._id", Session.get("currentPrompt")._id);
          // FilterManager.create("Tasks Filter", Session.get("currentUser"), "tasks", "promptID", Session.get("currentPrompt")._id);
          if (prompt.length > 0) {
            Session.set("sessionLength", prompt.length);
          } else {
            Session.set("sessionLength", 10);
          }
        } else {
          logger.warn("no prompt found with id: " + this.params.promptID);
        }
        this.next();
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
        //initRolePage();
      }
    }
  });

  this.route('MturkLoginPage', {
    // path: '/crowd/Ideate/Login/:promptID',
    path: '/crowd/Ideate/Login/:expID',
    template: 'MturkLoginPage',
    waitOn: function() {
      return [
        Meteor.subscribe('experiments', this.params.expID),
        Meteor.subscribe('prompts', this.params.promptID)
      ];

    },
    onBeforeAction: function() {
      console.log("before action");
      Session.set("currentUser", null);
      if (this.ready()) {
        logger.debug("Data ready");
        var exp = Experiments.findOne({_id: this.params.expID})

        if (exp) {
          logger.debug("setting current experiment");
          Session.set("currentExp", exp);
          var pID = exp.promptID
          var prompt = Prompts.findOne({_id: pID});
          logger.debug("setting current prompt");
          Session.set("currentPrompt", prompt);
        } else {
          // logger.warn("no prompt found with id: " + this.params.promptID);
          logger.warn("no experiment found with id: " + this.params.expID);
        }
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
      Session.set("nextPage", "HcompConsentPage");
    },
  });

  this.route('SynthesisExp', {
    path: 'synthexp/:partID',
    template: 'SubrouteSandbox',
    subscriptions: function() {
        logger.debug("Waiting on...");
        this.subscribe('ideas', {promptID: this.params.promptID})
        this.subscribe('prompts', {_id: this.params.promptID}).wait();
        this.subscribe('clusters');
        this.subscribe('synthSubsets');
        this.subscribe('zoomPositions');
      },
    onBeforeAction: function(pause) {
        if (this.ready()) {
          var part = Participants.findOne({_id: this.params.partID});
          logger.trace("participant: " + part.userName);
          Session.set("currentParticipant", part);
          var user = MyUsers.findOne({_id: part.userID});
          logger.trace("user: " + user.name);
          // MyUsers.update({_id: user._id}, {$set: {route: 'SynthesisPlaceholder'}});
          Session.set("currentUser", user);
          var exp = Experiments.findOne({_id: part.experimentID});
          if (exp) {
            logger.trace("Found exp with id: " + part.experimentID)
            Session.set("currentExp", exp);
          } else {
            logger.warn("no experiment found with id: " + part.experimentID);
          }
          var prompt = Prompts.findOne({_id: exp.promptID});
          if (prompt) {
            logger.trace("Found prompt with id: " + exp.promptID);
            Session.set("currentPrompt", prompt);
          } else {
            logger.warn("no prompt found with id: " + exp.promptID);
          }
          this.next();
        } else {
          logger.debug("Not ready");
        }
    },
    onAfterAction: function() {
      insertExitStudy();
    },
  });

  this.route('TutorialControl', {
      path: 'tutorial/ideate/:promptID/:expID/:userID/:sequence',
      template: 'TutorialControl',
    waitOn: function() {
      var pID = this.params.promptID;
      if (Session.get("currentUser")) {
        return [
          Meteor.subscribe('prompts'),
          Meteor.subscribe('fluencyMeasures'),
          Meteor.subscribe('participants'),
          Meteor.subscribe('experiments'),
          Meteor.subscribe('exp-conditions'),
          Meteor.subscribe('workflows'),
          Meteor.subscribe('progresses'),
          Meteor.subscribe('dummyIdeas'),
          Meteor.subscribe('fluencyMeasures'),
          ]
      } else {
        return [
          Meteor.subscribe('prompts'),
          Meteor.subscribe('fluencyMeasures')
        ]
      }
    },
    onBeforeAction: function(pause) {
        logger.debug("before action for tutorial control");
        if (this.ready()) {
          logger.debug("Data ready");
          var expID = this.params.expID;
          var exp = Experiments.findOne({_id: expID});
          var user = MyUsers.findOne({_id: this.params.userID});
          var part = Participants.findOne({userID: user._id, expID: exp._id});
          Session.set("currentParticipant", part);
          Session.set("currentExp", exp);
          Session.set("initPage", true);
          logger.trace("participant: " + part.userName);
          logger.trace("user: " + user.name);
          // MyUsers.update({_id: user._id}, {$set: {route: 'TutorialControl'}});
          Session.set("currentUser", user);
          Session.set("problemSequence", parseInt(this.params.sequence));
          // var exp = Experiments.findOne({_id: this.params.expID});
          if (exp) {
            logger.trace("Found exp with id: " + expID)
            Session.set("currentExp", exp);
          } else {
            logger.warn("no experiment found with id: " + expID);
          }
          var pID = this.params.promptID;
          var prompt = Prompts.findOne({_id: pID});
          if (prompt) {
            logger.trace("Found prompt with id: " + prompt._id);
            Session.set("currentPrompt", prompt);
          } else {
            logger.warn("no prompt found with id: " + pID);
          }
          this.next();
        } else {
          logger.debug("Not ready");
        }
    },
    action: function(){
      if(this.ready()) {
        Session.set("useTimer", true);
        Session.set("isTutorialTimer", true);
        this.render();
      } else
        this.render('loading');
    },
    onAfterAction: function() {
      if (this.ready()) {
        // initRolePage();
        insertExitStudy();
      }
      //Session.set("nextPage", "MturkIdeationControl");
    },
  });

  this.route('TutorialTreatment', {
      path: 'tutorial/ideation/:expID/:userID',
      template: 'TutorialTreatment',
    waitOn: function() {
      return [
          Meteor.subscribe('experiments'),
          Meteor.subscribe('fluencyMeasures')
      ];

    },
    onBeforeAction: function(pause) {
        logger.debug("before action");
        if (this.ready()) {
          logger.debug("Data ready");
          var part = Participants.findOne({_id: this.params.partID});
          logger.trace("participant: " + part.userName);
          Session.set("currentParticipant", part);
          var user = MyUsers.findOne({_id: part.userID});
          logger.trace("user: " + user.name);
          // MyUsers.update({_id: user._id}, {$set: {route: 'TutorialTreatment'}});
          LoginManager.loginUser(user.name);
          Session.set("currentUser", user);
          var exp = Experiments.findOne({_id: part.experimentID});
          if (exp) {
            logger.trace("Found exp with id: " + part.experimentID)
            Session.set("currentExp", exp);
          } else {
            logger.warn("no experiment found with id: " + part.experimentID);
          }
          var prompt = Prompts.findOne({_id: exp.promptID});
          if (prompt) {
            logger.trace("Found prompt with id: " + exp.promptID);
            Session.set("currentPrompt", prompt);
          } else {
            logger.warn("no prompt found with id: " + exp.promptID);
          }
          this.next();
        } else {
          logger.debug("Not ready");
        }
    },
    action: function(){
      if(this.ready()) {
        Session.set("useTimer", true);
        Session.set("isTutorialTimer", true);
        this.render();
      } else
        this.render('loading');
    },
    onAfterAction: function() {
        //Session.set("nextPage", "MturkIdeation");
        if (this.ready()) {
          //initRolePage();
          insertExitStudy();
        }
    },
  });

  this.route('MturkIdeationControl', {
      name: 'MturkIdeationControl',
      path: 'crowd/Ideate/:promptID/:expID/:userID/:sequence',
      template: 'MturkIdeationPageControl',
      subscriptions: function() {
        logger.debug("Waiting on...");
        this.subscribe('ideas', {promptID: this.params.promptID})
        this.subscribe('prompts').wait();
        this.subscribe('experiments').wait();
        this.subscribe('myUsers').wait();
        this.subscribe('assignments').wait();
        this.subscribe('tasks', {promptID: this.params.promptID});
        this.subscribe('exp-conditions').wait();
        this.subscribe('workflows').wait();
        this.subscribe('progresses').wait();
      },
    onBeforeAction: function(pause) {
        logger.debug("before action Ideation Control Page");
        //if (!Session.get("currentUser")) {
          ////if there is no user currently logged in, then render the login page
          //this.render('MTurkLoginPage', {'promptID': this.params.promptID});
          ////Pause rendering the given page until the user is set
          //pause();
        //}
        if (this.ready()) {
          logger.debug("Data ready");
          var expID = this.params.expID;
          // Experiments.findOne({_id: this.params.expID});
          var user = MyUsers.findOne({_id: this.params.userID});
          var part = Participants.findOne({userID: user._id, expID: expID});
          Session.set("currentParticipant", part);
          Session.set("currentExpID", expID);
          Session.set("initPage", true);
          // var pID = exp.promptID;
          var pID = this.params.promptID;

          logger.trace("user: " + user.name);
          // MyUsers.update({_id: user._id}, {$set: {route: 'MturkIdeationControl'}});
          // LoginManager.loginUser(user.name);
          logger.trace("Logging in the user");
          Session.set("currentUser", user);
          var prompt = Prompts.findOne({_id: pID});
          if (prompt) {
            Session.set("currentPrompt", prompt);
          } else {
            logger.warn("no prompt found with id: " + pID);
          }
          Session.set("problemSequence", parseInt(this.params.sequence));
          this.next();
        } else {
          logger.debug("Not ready");
        }
    },
    action: function(){
      if(this.ready()) {
        logger.debug("rendering the page");
        Session.set("useTimer", true);
        Session.set("useFluencyTimer", false);
        Session.set("isTutorialTimer", false);
        this.render();
      } else
        this.render('loading');
    },
    onAfterAction: function() {
      if (this.ready()) {
        logger.debug("After rendering the page");
        // initRolePage();
        insertExitStudy();
      }
    }
  });

  this.route('MturkIdeationTreatment', {
      name: 'MturkIdeationTreatment',
      path: 'crowd/Ideation/:promptID/:partID',
      template: 'MturkIdeationPage',

      subscriptions: function() {
        logger.debug("Waiting on data for ideation treatment...");
        this.subscribe('ideas', {promptID: this.params.promptID});
        this.subscribe('prompts').wait();
        this.subscribe('experiments').wait();
        this.subscribe('myUsers').wait();
        this.subscribe('assignments').wait();
        this.subscribe('tasks', {promptID: this.params.promptID});
      },

      // waitOn: function() {
      // logger.debug("Waiting on...");
      // // var part = Participants.findOne({_id: this.params.partID});
      // // logger.trace("Participant is: " + JSON.stringify(part));
      // // Session.set("currentParticipant", part);
      // // var exp = Experiments.findOne({_id: part.experimentID})
      // // var pID = exp.promptID;
      // return [
        // Meteor.subscribe('ideas', {promptID: this.params.promptID}),
        // Meteor.subscribe('prompts'),
        // Meteor.subscribe('experiments'),
        // Meteor.subscribe('myUsers'),
        // Meteor.subscribe('assignments'),
        // Meteor.subscribe('tasks', {promptID: this.params.promptID}),
      // ];
    // },
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
          var part = Participants.findOne({_id: this.params.partID});
          Session.set("currentParticipant", part);
          var exp = Experiments.findOne({_id: part.experimentID});
          Session.set("currentExp",exp);
          var pID = exp.promptID;
          var user = MyUsers.findOne({_id: part.userID});
          logger.trace("user: " + user.name);
          // MyUsers.update({_id: user._id}, {$set: {route: 'MturkIdeationTreatment'}});
          LoginManager.loginUser(user.name);
          Session.set("currentUser", user);
          var prompt = Prompts.findOne({_id: pID});
          if (prompt) {
            Session.set("currentPrompt", prompt);
          } else {
            logger.warn("no prompt found with id: " + pID);
          }
          this.next();
        } else {
          logger.debug("Not ready");
          this.next();
        }
    },
    action: function(){
      if(this.ready()) {
        Session.set("useTimer", true);
        Session.set("useFluencyTimer", false);
        Session.set("isTutorialTimer", false);
        this.render();
      } else
        this.render('loading');
    },
    onAfterAction: function() {
      if (this.ready()) {
        logger.debug("on after action ideation treatment")
        // Session.set("useTimer", true);
        // Session.set("useFluencyTimer", false);
        // Session.set("isTutorialTimer", false);
        // initRolePage();
        insertExitStudy();
      }
    }

  });

  this.route('CrowdIdeation', {
      path: 'crowd/Ideations/:promptID/:userID',
      template: 'MturkIdeationPage',
      subscriptions: function() {
        logger.debug("Waiting on...");
        this.subscribe('ideas', {promptID: this.params.promptID})
        this.subscribe('prompts', {_id: this.params.promptID}).wait();
        this.subscribe('assignments').wait();
        this.subscribe('tasks', {promptID: this.params.promptID});
      },
    onBeforeAction: function(pause) {
        logger.debug("before action");
        if (this.ready()) {
          logger.debug("Data ready");
          var user = MyUsers.findOne({_id: this.params.userID});
          logger.trace("user: " + user.name);
          // MyUsers.update({_id: user._id}, {$set: {route: 'MturkIdeationTreatment'}});
          LoginManager.loginUser(user.name);
          Session.set("currentUser", user);
          var prompt = Prompts.findOne({_id: this.params.promptID});
          if (prompt) {
            Session.set("currentPrompt", prompt);
            var group = Groups.findOne({_id: prompt.groupIDs[0]});
            Session.set("currentGroup", group);
          } else {
            logger.warn("no prompt found with id: " + pID);
          }
          this.next();
        } else {
          logger.debug("Not ready");
          this.next();
        }
    },
    action: function(){
      if(this.ready()) {
        Session.set("useTimer", true);
        Session.set("isTutorialTimer", false);
        this.render();
      } else
        this.render('loading');
    },
    onAfterAction: function() {
      if (this.ready()) {
        setNextPage("MturkSynthesis",
          {promptID: Session.get("currentPrompt")._id,
            userID: Session.get("currentUser")._id
          }
        );
        //initRolePage();
      }
    }
  });
  this.route('SurveyPage', {
    path: 'crowd/survey/:condition/:userID/:expID/:sequence',
    template: 'SurveyPage',
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
          // Toggle Session variable based on params passed
          switch (this.params.condition) {
            case "0":
              logger.debug("Setting session for control condition survey");
              Session.set("isTreatment", false);
              break;
            case "1":
              logger.debug("Setting session for treatment condition survey");
              Session.set("isTreatment", true);
              break;
            default:
              break;
          }
          this.next();
        } else {
          logger.debug("Not ready");
        }
    },
    action: function(){
      if(this.ready()) {
        Session.set("isDecrementing", false);
        Session.set("useTimer",false);
        this.render();
      } else {
        this.render('loading');
      }
    },
    onAfterAction: function() {
      insertExitStudy();
    },
  });

  this.route('MTurkFinalPage', {
    path: 'crowd/mt/finished/:expID/:userID',
    template: 'FinalizePage',
    waitOn: function() {
      logger.debug("Waiting on...");
      return [
        Meteor.subscribe('prompts'),
        Meteor.subscribe('myUsers'),
        Meteor.subscribe('participants'),
        Meteor.subscribe('exp-conditions'),
        Meteor.subscribe('workflows'),
        Meteor.subscribe('progresses'),
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
          var user = MyUsers.findOne({_id: this.params.userID});
          Session.set("currentUser", user);
          var part = Participants.findOne({expID: exp._id, userID: user._id});
          Session.set("currentParticipant", part);
          this.next();
        } else {
          logger.debug("Not ready");
        }
    },
    action: function(){
      if(this.ready())
        this.render();
      else
        this.render('loading');
    },

  });

  this.route('LegionFinalPage', {
    path: 'crowd/finished/:partID/',
  	template: 'LegionFinalPage',
    waitOn: function() {
      logger.debug("Waiting on...");
      return [
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
          var part = Participants.findOne({_id: this.params.partID});
          Session.set("currentParticipant", part);
          this.next();
        } else {
          logger.debug("Not ready");
        }
    },
    action: function(){
      if(this.ready())
        this.render();
      else
        this.render('loading');
    },

  });

  this.route("HcompResultsPage", {
    path: "/results/:promptID/:userID",
    template: "HcompResultsPage",
    waitOn: function() {
      var pID = this.params.promptID;
      if (Session.get("currentUser")) {
        return [
          Meteor.subscribe('ideas', {promptID: pID}),
          Meteor.subscribe('clusters', {promptID: pID}),
          Meteor.subscribe('prompts'),
          ]
      } else {
        return [
          Meteor.subscribe('ideas', {promptID: pID}),
          Meteor.subscribe('clusters', {promptID: pID}),
          Meteor.subscribe('prompts'),
        ]
      }
    },
    onBeforeAction: function() {
        console.log("before action");
        // if (!Session.get("currentUser")) {
        //   //if there is no user currently logged in, then render the login page
        //   this.render('MTurkLoginPage', {'promptID': this.params.promptID});
        //   //Pause rendering the given page until the user is set
        //   pause();
        // }
        if (this.ready()) {
          logger.debug("Data ready");
          if (Session.get("currentUser")) {
            var user = MyUsers.findOne({_id: this.params.userID});
            LoginManager.loginUser(user.name);
            Session.set("currentUser", user);
          }
          var prompt = Prompts.findOne({_id: this.params.promptID});
          if (prompt) {
            Session.set("currentPrompt", prompt);
          } else {
            logger.warn("no prompt found with id: " + this.params.promptID);
          }
          this.next();
        }
    },
    action: function(){
      if(this.ready())
        this.render();
      else
        this.render('loading');
    },
  });

  this.route("Visualization", {
    path: "/vizualization/:promptID/:userID",
    template: "Visualization",
    waitOn: function() {
      if (Session.get("currentUser")) {
        return [
          Meteor.subscribe('ideas'),
          Meteor.subscribe('clusters'),
          Meteor.subscribe('prompts'),
          ]
      } else {
        return [
          Meteor.subscribe('ideas'),
          Meteor.subscribe('clusters'),
          Meteor.subscribe('prompts'),
        ]
      }
    },
    onBeforeAction: function() {
        console.log("before action");
        // if (!Session.get("currentUser")) {
        //   //if there is no user currently logged in, then render the login page
        //   this.render('MTurkLoginPage', {'promptID': this.params.promptID});
        //   //Pause rendering the given page until the user is set
        //   pause();
        // }
        if (this.ready()) {
          logger.debug("Data ready");
          if (Session.get("currentUser")) {
            var user = MyUsers.findOne({_id: this.params.userID});
            LoginManager.loginUser(user.name);
            Session.set("currentUser", user);
          }
          var prompt = Prompts.findOne({_id: this.params.promptID});
          if (prompt) {
            Session.set("currentPrompt", prompt);
          } else {
            logger.warn("no prompt found with id: " + this.params.promptID);
          }
          this.next();
        }
    },

    action: function(){
      if(this.ready())
        this.render();
      else
        this.render('loading');
    },
  });
});

var insertTimer = function() {
  if ($('.timer').length == 0 && Session.get("useFluencyTimer")) {
    logger.info("using a timer");
    Session.set("hasTimer",true);
    Blaze.render(Template.TockTimer, $('#nav-right')[0]);
  }
};

insertExitStudy = function() {
  if ($('.exitStudy').length == 0) {
    Blaze.render(Template.ExitStudy, $('.login')[0]);
  }
  //Add event handler for the exit study button
  $('.exitStudy').click(function() {
    logger.info("exiting study early");
    EventLogger.logExitStudy();
    EventLogger.logEndRole();
    // ExperimentManager.logParticipantCompletion(Session.get("currentParticipant"));
    var exp = Session.get("currentExp");
    var user = Session.get("currentUser");
    var part = Session.get("currentParticipant");
    // if (exp.isSynthesis) {
      var verifyCode = Random.hexString(20).toLowerCase();
      Participants.update({_id: part._id},
          {$set: {verifyCode: verifyCode}})
      Router.go("MTurkFinalPage", {
        'userID': user._id,
        'expID': exp._id,
      });
    // } else {
      // Router.go("LegionFinalPage", {
        // 'partID': part._id
      // });
    // }

  });
};

var initFluencyPage = function() {
  logger.debug("Initializing fluency page");
  var fluencyTaskLength = 3;
  //Add timer
  if ($('.timer').length == 0 && Session.get("useFluencyTimer")) {
    logger.info("using a timer");
    Session.set("hasTimer", true);
    Blaze.render(Template.Timer, $('#nav-right')[0]);
    //Setup timer for decrementing onscreen timer with 17 minute timeout
  }
  if (Session.get("useFluencyTimer")) {
        logger.debug("Checking to Setting fluency timer length");
        logger.trace("Fluency is decrementing: " + Session.get("fluencyIsDecrementing"));
    if (!Session.get("fluencyIsDecrementing")) {
        logger.debug("Setting fluency timer length");
        Session.set("fluencyTimeLeft", fluencyTaskLength);
    }
    $('#time').text(fluencyTaskLength);
    logger.debug("checking if setting timer decrement");
    logger.trace("Use fluency Timer: " + JSON.stringify(Session.get("useFluencyTimer")));
    logger.trace("Tutorial timer: " + JSON.stringify(Session.get("isTutorialTimer")));
    if (!Session.get("isTutorialTimer") &&
        !Session.get("fluencyIsDecrementing") ){
      logger.debug("************Setting decrement for fluency timer*************");
      Session.set("fluencyIsDecrementing", true);
      Meteor.setTimeout(decrementFluencyTimer, 60000);
      // Meteor.setTimeout(decrementFluencyTimer, 1000);
    }
  }
};

var initRolePage = function() {
  /****************************************************************
   * This has local routes.js scope only
   * *************************************************************/
  logger.debug("Initializing a role page");
  //Add timer
  var prompt = Session.get("currentPrompt");
  if (prompt.length > 0) {
    if ($('.timer').length == 0 && Session.get("useTimer")) {
      logger.info("using a timer");
      Session.set("hasTimer", true);
      Blaze.render(Template.TockTimer, $('#nav-right')[0]);
      //Setup timer for decrementing onscreen timer with 17 minute timeout
    }
    if (Session.get("useTimer")) {
      logger.debug("Checking to Setting timer length");
      logger.trace(Session.get("isDecrementing"));
      if (!Session.get("isDecrementing")) {
        logger.debug("Setting timer length");
        Session.set("timeLeft", prompt.length);
      }
      $('#time').text(prompt.length);
      logger.debug("checking if setting timer decrement");
      logger.trace("Use Timer: " + JSON.stringify(Session.get("useTimer")));
      logger.trace("Tutorial timer: " + JSON.stringify(Session.get("isTutorialTimer")));
      if (!Session.get("isTutorialTimer") &&
          !Session.get("isDecrementing") ){
        logger.debug("************Setting decrement for timer*************");
        Session.set("isDecrementing", true);
        Meteor.setTimeout(decrementTimer, 60000);
        // Meteor.setTimeout(decrementTimer, 1000);
      }
    }
  } else {
    logger.info("not using a timer");
    $('.timer').remove();
  }
};
