// Configure logger for Tools
var logger = new Logger('Client:SynthesisV2:Routes');
// Comment out to use global logging level
Logger.setLevel('Client:SynthesisV2:Routes', 'trace');
//Logger.setLevel('Client:SynthesisV2:Routes', 'debug');
//Logger.setLevel('Client:SynthesisV2:Routes', 'info');
//Logger.setLevel('Client:SynthesisV2:Routes', 'warn');


//Maps routes to templates
Router.map(function () {
  /***************************************************************
   * Define custom routes for SynthesisV2 pages
   * *************************************************************/
  this.route('MturkSynthLoginPage', {
    path: '/crowd/Categorize/Login/:promptID',
    template: 'MturkLoginPage',
    waitOn: function() {
      logger.debug("Waiting on...");
      return Meteor.subscribe('prompts', this.params.promptID);
    },
    onBeforeAction: function() {
      console.log("before action");
      Session.set("currentUser", null);
      if (this.ready()) {
        logger.debug("Data ready");
        var prompt = Prompts.findOne({_id: this.params.promptID});
        if (prompt) {
          logger.debug("setting current prompt");
          Session.set("currentPrompt", prompt);
        } else {
          logger.warn("no prompt found with id: " + this.params.promptID);
        }
        this.next();
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
      Session.set("nextPage", "MturkSynthesis");
    },
  });
  this.route('MturkSynthesis', {
    path: 'crowd/Categorize/:promptID/:userID',
  	template: 'MturkClustering',
    waitOn: function() {
      logger.debug("Waiting on...");
      var pID = this.params.promptID;
      return [
        Meteor.subscribe('ideas', {promptID: pID}),
        Meteor.subscribe('graphs', {promptID: pID}),
        Meteor.subscribe('nodes', {promptID: pID}),
        Meteor.subscribe('edges', {promptID: pID}),
        ];
    },
    onBeforeAction: function() {
        logger.debug("before action");
        if (this.ready()) {
          var user = MyUsers.findOne({_id: this.params.userID});
          LoginManager.loginUser(user.name);
          Session.set("currentUser", user);
          //MyUsers.update({_id: user._id}, {$set: {route: 'MturkSynthesis'}});
          logger.debug("Data ready");
          var prompt = Prompts.findOne({_id: this.params.promptID});
          if (prompt) {
            logger.debug("setting current Prompt");
            Session.set("currentPrompt", prompt);
            Session.set("filtersSet", false);
          } else {
            logger.warn("no prompt found with id: " + this.params.promptID);
          }
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
    onAfterAction: function() {
      if (this.ready()) {
        initRolePage();
      }
    }

  });

});

var insertExitStudy = function() {
  if ($('.exitStudy').length == 0) {
    var exitStudyBtn = UI.render(Template.ExitStudy);
    UI.insert(exitStudyBtn, $('.login')[0]);
  }
  //Add event handler for the exit study button
  $('.exitStudy').click(function() {
    logger.info("exiting study early");
    EventLogger.logExitStudy();
    EventLogger.logEndRole();
    Router.go("LegionFinalPage", {
      'promptID': Session.get("currentPrompt")._id,
      'userID': Session.get("currentUser")._id
    });
  });
};

var initRolePage = function() {
  //Add timer
  var prompt = Session.get("currentPrompt");
  if (prompt.length > 0) {
    if ($('.timer').length == 0 && Session.get("useTimer")) {
      logger.debug("using a timer");
      Session.set("hasTimer", true);
      var timerTemplate = UI.render(Template.Timer);
      UI.insert(timerTemplate, $('#nav-right')[0]);
      //Setup timer for decrementing onscreen timer with 17 minute timeout
      Session.set("timeLeft", prompt.length + 1);
      $('#time').text(prompt.length);
      if (Session.get("useTimer")) {
        Meteor.setTimeout(decrementTimer, 60000);
      }
    }
  }
};

