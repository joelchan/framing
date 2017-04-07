// Configure logger for Tools
var logger = new Logger('Client:Crowd:FocusIdeate');
// Comment out to use global logging level
Logger.setLevel('Client:Crowd:FocusIdeate', 'trace');
//Logger.setLevel('Client:Crowd:FocusIdeate', 'debug');
//Logger.setLevel('Client:Crowd:FocusIdeate', 'info');
//Logger.setLevel('Client:Crowd:FocusIdeate', 'warn');

/********************************************************************
 * Whole Inspiration Page
********************************************************************/
Template.FocusIdeate.onRendered(function() {

  //Set height of elements to viewport height
  var height = $(window).height() - 50; //Navbar height=50
  logger.debug("window viewport height = " + height.toString());
  // $(".focus-prompt").height(height);
  // $(".focus-prompt").css("max-height", height);
  $(".focus-input").height(height);
  $(".focus-input").css("max-height", height);

  // var ideaHeader = $(".ideator-directions").height() + $(".idea-input-box").height() + 10 + 10 + 20;
  // $(".idea-list-box").css("max-height", height - ideaHeader);

  // var header = $(".brainstorming-prompt").height();
  // $("#list-section").height(height - header - 20);

  // Had to shift this out of routes to prevent dynamic autoreload
  Session.set("currentExp", Experiments.findOne({_id: Session.get("currentExpID")._id}));
  var group = Groups.findOne({_id: Session.get("currentPrompt").groupIDs[0]});
  Session.set("currentGroup", group);
  var frameID = Session.get("currentParticipant").misc.frameID;
  if (frameID < 1000) {
    Session.set("isFrame", false);
    Session.set("focusArea", "");
  } else {
    Session.set("isFrame", true);
    Session.set("focusArea", frames[frameID]);
  }



  this.autorun(function(c) {
    logger.trace("Calling autorun");
    if (Session.equals("initPage", true)) {
      logger.trace("init page = true");

      EventLogger.logEnterIdeation();
      logger.trace("rendered Ideation page");
      var part = Session.get("currentParticipant");
      var cond = Conditions.findOne({_id: part.conditionID});
      WorkflowManager.setNextPage(
        part.userID,
        cond.misc.workflowID,
        Session.get("problemSequence")
      );

      initializeTimer();
      // Session.set("initPage", false);

      // give initial instructions
      if (!$('#task-begin-modal').hasClass('in')) {
        $('#modalShower').click();
        Session.set("initPage", false);
      }

    }
  });

  // tinymce.init({
      // selector: '#finalIdea',
      // skin_url: '/packages/teamon_tinymce/skins/lightgray',
      // menubar: false
  // });
});

// Template.FocusIdeate.events({
//   'click #finalIdeaGet': function() {
//     console.log(tinymce.activeEditor.getContent({format: 'raw'}));
//     console.log($('#finalIdea').val())
//   }
// });

Template.FocusPrompt.helpers({
  isFrame: function() {
    return Session.get("isFrame");
  },
  notFluency: function() {
    return !(Session.get("isFluency"));
  },
  // isFocus: function() {
  //   return Session.get("isFocus");
  // },
  path: function() {
    return Session.get("focusArea");
  },
});

Template.KAlignPrompt.helpers({
  path: function() {
    return Session.get("focusArea");
  },
  isFrame: function() {
    return Session.get("isFrame");
  }
});

Template.FocusInput.helpers({
  // isFocus: function() {
  //   return Session.get("isFocus");
  // },
});

Template.KAlignIdeaEntryBox.helpers({
  timesUp: function() {
    return Session.get("timesUp");
  },
});

Template.KAlignIdeaEntryBox.events({
  'click .pre-timesUp-submit': function() {
    alert("Oops, looks like there's still time left on the clock. Remember, We would like you spent at least 5 minutes working on your idea. You will not be able to submit your idea before 5 minutes is up. After 5 minutes is up, you can choose to either submit your idea as is, or keep working on the idea until you feel it is complete, and then submit it.")
  },
  'click .submit-idea': function (e, target) {
    //console.log("event submitted");
    logger.trace("submitting a new idea");
    logger.debug(e.currentTarget);
    logger.debug(target.firstNode);
    //get the input template
    var inputBox = $(target.firstNode).children('.idea-input')
    var content = inputBox.val();

    var idea = IdeaFactory.create(content,
        Session.get("currentUser"),
        Session.get("currentPrompt")
    );
    // if (Session.equals("isFocus", true)) {
    //   logger.debug("Idea is for focus area");
    //   Ideas.update({_id: idea._id},{$set: {focusArea: Session.get("focusArea")}});
    //   Ideas.update({_id: idea._id},{$set: {inCluster: true}});
    // }
    EventLogger.logIdeaSubmission(idea, null);
    var part = Session.get("currentParticipant");
    var cond = Conditions.findOne({_id: part.conditionID});
    WorkflowManager.goToNextPage(Session.get("currentUser")._id, cond.misc.workflowID);
    inputBox.val('');
    // Meteor.clearInterval(ideaLogger);
  },
  'keyup textarea' : function(e, target){
    logger.trace(e);
    logger.trace(target);
    //console.log("key pressed")
    if(e.keyCode===13) {
      logger.debug("enter pressed")
      var btn = $(target.firstNode).children('.submit-idea')
      btn.click();
    }
  },
});

Template.TaskBeginModal.helpers({
  isFluency: function() {
    // return (!Session.get("isFluency") && !(Session.get("isFocus")));
    return Session.get("isFluency");
  },
  instructions: function() {
    var instructions = "";
    if (Session.equals("isFluency", true)) {
      instructions = "Let's get started with a warm-up task to get your creative juices flowing! " +
        "In the next 1 minute, try to think of as many (alternative) uses as you can for a bowling pin. " +
        "Feel free to get creative, but don't worry too much about quality. The goal is to get your creative juices flowing. " +
        "When you are ready, click \"Continue\"!";
    }
    return instructions;
  },
});

Template.TaskBeginModal.events({
  'hidden.bs.modal #task-begin-modal' : function() {
    if (Session.get("isFluency")) {
      EventLogger.logBeginIdeation();
      countdown.start(timerLength);
    } else {
      $('#modalShower2').click();
    }
  },
});

Template.KAlignFocusChooser.helpers({
  path: function() {
    return Session.get("focusArea");
  },
  isFrame: function() {
    return Session.get("isFrame");
  }
});

Template.BrainstormTaskBeginModal.helpers({
  isFrame: function() {
    return Session.get("isFrame");
  },
  path: function() {
    return Session.get("focusArea");
  }
});

Template.BrainstormTaskBeginModal.events({
  'hidden.bs.modal #brainstorm-task-begin-modal' : function() {
    EventLogger.logBeginIdeation();
    countdown.start(timerLength);
  },
});

var timer = new Tock({
    callback: function () {
        $('#clockface').text(timer.msToTime(timer.lap()));
    }
});

var countdown = Tock({
    countdown: true,
    interval: 1000,
    callback: function () {
        // logger.debug(countdown.lap() / 1000);
        $('#countdown_clock').text(timer.msToTimecode(countdown.lap()));
    },
    complete: function () {

        // end of baseline fluency
        if (Session.equals("problemSequence", 0)) {
          alert("Time's up! Click 'ok' to go to the next part of the HIT.");

          grabFluencyData();

          // KAlignExperiment.getFocusArea();

          // EventLogger.logBeginIdeation();

          var cond = Conditions.findOne({_id: Session.get("currentParticipant").conditionID});
          WorkflowManager.goToNextPage(Session.get("currentUser")._id, cond.misc.workflowID);
        // end of focus brainstorming
      } else if (Session.equals("problemSequence", 1)) {
          logger.debug("Next is second problem in sequence");
          alert("Time's up! Click 'ok' to go to the next part of the HIT.");

          // KAlignExperiment.getFocusArea();

          // EventLogger.logBeginIdeation();

          var cond = Conditions.findOne({_id: Session.get("currentParticipant").conditionID});
          WorkflowManager.goToNextPage(Session.get("currentUser")._id, cond.misc.workflowID);
        // end of focus final idea development
        } else if (Session.equals("problemSequence", 3)) {
          logger.debug("Next is survey");
          alert("Time's up! You can now either submit your final idea, " +
            "or continue working on it as long as you'd like to before submitting it." +
            "Once you hit submit, you will be taken to the last part of the HIT.");
          Session.set("timesUp", true);
          // $(".submit-idea").removeClass("disabled");
          // EventLogger.logFluencyTaskBegin();
        } else {
          logger.debug("Nothing");
        }
        logger.info("Exiting current page");
        // var cond = Conditions.findOne({_id: Session.get("currentParticipant").conditionID});
        // WorkflowManager.goToNextPage(Session.get("currentUser")._id, cond.misc.workflowID);
        // Router.go("SurveyPage", {
              // 'partID': Session.get("currentParticipant")._id
            // });
    }
});

// var timerLength = 1;
var multiplier = 6000

initializeTimer = function() {
  // var prompt = Session.get("currentPrompt");
  // var timerLength;
  if (Session.equals("isFluency", true)) {
    timerLength = 1*multiplier;
  } else if (Session.equals("isFocus", false)) {
    timerLength = 3*multiplier;
  } else {
    timerLength = 5*multiplier;
  }
  if ($('.timer').length == 0) {
    Blaze.render(Template.TockTimer, $('#nav-right')[0]);
  }
  // if ($('.timer').length == 0 && prompt.length > 0) {
    // logger.info("using a timer");
    // Session.set("hasTimer",true);
    // Blaze.render(Template.TockTimer, $('#nav-right')[0]);
    // countdown.start(prompt.length*60000);
    // countdown.start(timerLength)
  // } else if (prompt.length > 0) {
    // countdown.start(prompt.length*60000);
    // countdown.start(timerLength)
  // }
  // Session.set("initPage", false);
};

var ideaLogger;

var grabFluencyData = function() {
  logger.debug("Grabbing fluency data");
  var answers = DummyIdeas.find(
                  {userID: Session.get("currentUser")._id,
                  'prompt._id': Session.get("currentPrompt")._id}).fetch();
  logger.trace("Answers: " + JSON.stringify(answers));
  var measure = new FluencyMeasure(answers, Session.get("currentParticipant"));
  var measureID = FluencyMeasures.insert(measure);
  if (measureID) {
    // logger.trace("Fluency measure for " +
      // Session.get("currentParticipant")._id +
      // ": " + JSON.stringify(measure));
  } else {
    logger.debug("Failed to grab the data")
  }
  var part = Session.get("currentParticipant");
  var condName = Conditions.findOne({_id: part.conditionID}).description;
  EventLogger.logFluencyTaskComplete();
}
