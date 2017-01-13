// Configure logger for Tools
var logger = new Logger('Client:Crowd:InspireIdeate');
// Comment out to use global logging level
Logger.setLevel('Client:Crowd:InspireIdeate', 'trace');
//Logger.setLevel('Client:Crowd:InspireIdeate', 'debug');
//Logger.setLevel('Client:Crowd:InspireIdeate', 'info');
//Logger.setLevel('Client:Crowd:InspireIdeate', 'warn');

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
        // console.log('end');
        if (Session.equals("isFluency", true)) {
          grabFluencyData();
        }
        if (Session.equals("problemSequence", 1)) {
          logger.debug("Next is first problem in sequence");
          alert("Now you will work on the first of the two problems. Click ok to begin!");
          EventLogger.logBeginIdeation();
          // Session.set("alerted", true);
        } else if (Session.equals("problemSequence", 2)) {
          logger.debug("Next is second problem in sequence");
          alert("Now you will work on the second of the two problems. " +
            "After this problem, you will complete a short survey to finish the HIT. Click ok to begin!");
          EventLogger.logBeginIdeation();
          // Session.set("alerted", true);
        } else if (Session.equals("problemSequence", 3)) {
          logger.debug("Next is survey");
          alert("All done! Now we'll take you to the survey.")
          // EventLogger.logFluencyTaskBegin();
          
        } else {
          logger.debug("Nothing");
        }
        logger.info("Exiting current page");
        var cond = Conditions.findOne({_id: Session.get("currentParticipant").conditionID});
        WorkflowManager.goToNextPage(Session.get("currentUser")._id, cond.misc.workflowID);
        // Router.go("SurveyPage", {
              // 'partID': Session.get("currentParticipant")._id
            // });
    }
});

var fluencyLength = 1;

// var part = Session.get("currentParticipant");
// var cond = Conditions.findOne({_id: part.conditionID});

initializeTimer = function() {
  var prompt = Session.get("currentPrompt");
  var timerLength;
  if (Session.equals("isFluency", true)) {
    timerLength = fluencyLength*60000;
  } else {
    timerLength = prompt.length*60000;
  }
  if ($('.timer').length == 0 && prompt.length > 0) {
    logger.info("using a timer");
    // Session.set("hasTimer",true);
    Blaze.render(Template.TockTimer, $('#nav-right')[0]);
    // countdown.start(prompt.length*60000);
    countdown.start(timerLength)
  } else if (prompt.length > 0) {
    // countdown.start(prompt.length*60000);
    countdown.start(timerLength)
  }
  Session.set("initPage", false);
};

initializeTutorialTimer = function() {
  if ($('.timer').length == 0) {
    logger.info("using a timer");
    Blaze.render(Template.TockTimer, $('#nav-right')[0]);
  } 
  Session.set("initPage", false);
};

// probably want to make into a convenience function
var createDummyClusters = function() {
  logger.trace("Creating dummy clusters");
  var testLabels = ["A sample inspiration", 
                    "Another sample inspiration",
                    "Sometimes the inspirations are quite long",
                    "Yet another sample inspiration",
                    "Here is an interesting way to look at the problem",
                    "Here is an interesting approach to solving the problem"]
  numTestClusters = Clusters.find({userID: Session.get("currentUser")._id, 
    promptID: Session.get("currentPrompt")._id}).count();
  
  if (numTestClusters < 1) {
    for (i=0; i < 6; i++) {
      var testCluster = ClusterFactory.create(Session.get("currentUser"), Session.get("currentPrompt"), null);
      ClusterFactory.setName(testCluster, testLabels[i]);
      if (i == 0) {
        var firstDummyClusterSelector = "#inspiration-" + testCluster._id;
        logger.trace("First dummy cluster is: " + firstDummyClusterSelector);
        $(firstDummyClusterSelector).addClass("first-dummy-cluster");
      }
    }
  }
}

// probably want to make into a convenience function
var deleteDummyClusters = function() {
  logger.trace("Removing dummy clusters");
  // remove all the dummy ideas and dummy inspirations 
  // in prep for fluency task
  var testClusters = Clusters.find({userID: Session.get("currentUser")._id, 
                                    promptID: Session.get("currentPrompt")._id});
  testClusters.forEach(function(c) {
    Clusters.remove({_id: c._id});
  });
}

var createTutorial = function(tour) {
  
  var spacer = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
  var inspireTour = new Tour({
        template: "<div class='popover tour'>" +
            "<div class='arrow'></div>" +
            "<h3 class='popover-title'></h3>" +
            "<div class='popover-content'></div>" +
            "<div class='popover-navigation'>" +
                "<button class='btn btn-default' data-role='prev'>« Prev</button>" +
                "<button class='btn btn-default' data-role='next'>Next »</button>" +
            "</div>" +
          "</div>",
        steps: [
        {
          element: "#lpheader",
          title: "Instructions tutorial (Step 1 of 8)" + spacer,
          content: "Welcome! In this HIT you will brainstorm ideas for two problems (for 8 minutes, each). " +
          "Before you begin, please follow this brief 8-step tutorial to familiarize you with the interface.",
          backdrop: true,
          placement: "bottom",
          // orphan: true,
          onNext: function() {
            EventLogger.logTutorialStarted();
          }
        },
        {
          element: ".brainstorming-prompt",
          title: "Instructions tutorial (Step 2 of 8)" + spacer,
          content: "The brainstorming problem you are working on will be described here.", 
          backdrop: true,
          placement: "bottom",
        },
        {
          element: ".main-prompt",
          title: "Instructions tutorial (Step 3 of 8)" + spacer,
          content: "You will enter your ideas for the problem here. " +
          "Hit enter or click submit to submit an idea. " + 
          "Each idea should be its own entry.", 
          backdrop: true,
          placement: "right",
          onNext: function() {
            createDummyClusters();
          },
        },
        {
          element: "#list-section",
          title: "Instructions tutorial (Step 4 of 8)" + spacer,
          content: "Here we will provide you with inspirations to boost your creativity. " + 
          "Feel free to create variations on them, elaborate on them, recombine them into new ideas, " +
          "or simply use them to stimulate your thinking. ",
          backdrop: true,
          placement: "left",
          onPrev: function() {
            deleteDummyClusters();
          }
        },
        {
          element: ".first-dummy-cluster",
          title: "Instructions tutorial (Step 5 of 8)" + spacer,
          content: "If you find an inspiration to be helpful for your thinking, please let us know by clicking on the star button! " + 
          "This will help us provide better inspirations to future brainstormers.",
          backdrop: true,
          placement: "left",
        },
        {
          element: "#nav-right",
          title: "Instructions tutorial (Step 6 of 8)" + spacer,
          content: "The time remaining for the current problem will be shown in the top right corner of the page. " +
            "When your time is up, you will automatically be taken to the next page. " +
            "After completing the second problem, you will be automatically taken to a brief survey page, and then your completion code.",
          // backdrop: true,
          placement: "bottom",
          onPrev: function() {
            createDummyClusters();
          }
        },
        {
          element: "#nav-right",
          title: "Instructions tutorial (Step 7 of 8)" + spacer,
          content: "You may exit the study at any time by clicking on the \"Exit Early\" button. " +
                    "Your compensation will be pro-rated based on how long you participated. ",
          // backdrop: true,                  
          placement: "bottom",
          onNext: function() {
            deleteDummyClusters();
          }
        }],
        onEnd: function(tour) {
          // $(".idea-entry input").prop("disabled", false);
          // $(".idea-entry textArea").prop("disabled", false);
          // $(".submit-idea").prop("disabled", false);
          // cleanUpTutorial();
          EventLogger.logTutorialComplete();
          logger.debug("Next is fluency task");
          alert("Ready, set, go! Click 'ok' and the timer will start!")
          EventLogger.logFluencyTaskBegin();
          var cond = Conditions.findOne({_id: Session.get("currentParticipant").conditionID});
          WorkflowManager.goToNextPage(Session.get("currentUser")._id, cond.misc.workflowID);
        },
      });

  inspireTour.addStep({
    element: ".main-prompt",
    title: "Instructions tutorial (Step 8 of 8)" + spacer,
    content: "Let's practice the interface with a warm-up task! " +
    "For the next 1 minute, try to think of as many (alternative) uses as you can for a bowling pin (e.g., juggling props, paperweight). " +
    "Feel free to get creative! When you are ready, click \"Begin\".",
      backdrop: true,
      placement: "right",
      template: "<div class='popover tour'>" +
        "<div class='arrow'></div>" +
        "<h3 class='popover-title'></h3>" +
        "<div class='popover-content'></div>" +
        "<div class='popover-navigation'>" +
            "<button class='btn btn-default' data-role='prev'>« Prev</button>" +
            "<button class='btn btn-default' data-role='end'>Begin!</button>" +
        "</div>" +
      "</div>",
  });
  inspireTour.init();
  return inspireTour;

};

// probably want to make into a convenience function
var grabFluencyData = function() {
  logger.debug("Grabbing fluency data");
  var answers = DummyIdeas.find(
                  {userID: Session.get("currentUser")._id,
                  'prompt._id': Session.get("currentPrompt")._id}).fetch();
  logger.trace("Answers: " + JSON.stringify(answers));
  var measure = new FluencyMeasure(answers, Session.get("currentParticipant"));
  var measureID = FluencyMeasures.insert(measure);
  if (measureID) {
    logger.trace("Fluency measure for " + 
      Session.get("currentParticipant")._id + 
      ": " + JSON.stringify(measure));
  } else {
    logger.debug("Failed to grab the data")
  }        
  var part = Session.get("currentParticipant");
  var condName = Conditions.findOne({_id: part.conditionID}).description;
  EventLogger.logFluencyTaskComplete();
}

/********************************************************************
 * Whole Inspiration Page
********************************************************************/
Template.InspireIdeate.onRendered(function() {
  
  //Set height of elements to viewport height
  var height = $(window).height() - 50; //Navbar height=50
  logger.debug("window viewport height = " + height.toString());
  $(".main-prompt").height(height);
  $(".main-prompt").css("max-height", height);

  var ideaHeader = $(".ideator-directions").height() + $(".idea-input-box").height() + 10 + 10 + 20;
  $(".idea-list-box").css("max-height", height - ideaHeader);

  var header = $(".brainstorming-prompt").height();
  $("#list-section").height(height - header - 20);
  $("#each-inspirations").css("max-height", height - header - 20 - $(".inspiration-header").height());

  //Had to shift this out of routes to prevent dynamic autoreload
  Session.set("currentExp", Experiments.findOne({_id: Session.get("currentExpID")._id}));
  var group = Groups.findOne({_id: Session.get("currentPrompt").groupIDs[0]});
  Session.set("currentGroup", group);
  
  this.autorun(function(c) {
    logger.trace("Calling autorun");
    if (Session.equals("initPage", true) && Session.equals("isTutorial", false)) {
      logger.trace("init page = true and is tutorial is false");

      EventLogger.logEnterIdeation(); 
      logger.trace("rendered Ideation page");
      var part = Session.get("currentParticipant");
      var cond = Conditions.findOne({_id: part.conditionID});
      WorkflowManager.setNextPage(
        part.userID, 
        cond.misc.workflowID,
        Session.get("problemSequence")
      );
      
      //Insert a Timer into the navbar
      initializeTimer();
    }
  });
  if (Session.equals("isTutorial", true)) {
    var tour = createTutorial();
    logger.trace("rendering Ideation Inspire tutorial");
    var part = Session.get("currentParticipant");
    var cond = Conditions.findOne({_id: part.conditionID});
    WorkflowManager.setNextPage(part.userID, 
                                cond.misc.workflowID,
                                Session.get("problemSequence"));
    // Router.setNextPageParam("userID", part.userID);
    initializeTutorialTimer();
    tour.restart();
  } 
});

/********************************************************************
 * Inspiration List box
********************************************************************/
Template.InspirationList.onCreated(function() {
  logger.trace("created inspiration frame");
});
Template.InspirationList.onRendered(function() {
  var inspInstructions = "<p>Below are some inspirations to boost your creativity. " +
  "Feel free to create variations on them, elaborate on them, recombine them into new ideas, " + 
  "or simply use them to stimulate your thinking. " +
  "If you find an inspiration to be helpful for your thinking, " + 
  "please let us know by clicking on the star button! " + 
  "This will help us provide better inspirations to future brainstormers.</p>"
  $('#inspiration-info').tooltipster({
      content: $(inspInstructions),
      trigger: 'click',
      // autoClose: false,
      // hideOnClick: true,
      // theme: 'tooltipster-shadow',
      position: 'right',
      offset: 40,
      speed: 200,
      maxWidth: 400
  });
});
Template.InspirationList.helpers({
  isRealPrompt: function() {
    if (Session.equals("isTutorial", false) && Session.equals("isFluency", false)) {
      return true;
    } else {
      return false;
    }
  },
  inspirations: function() {
    var clusters;
    if (Session.equals("isTutorial", true) || Session.equals("isFluency", true)) {
      logger.trace("in tutorial/fluency, pulling from dummy clusters");
      clusters = Clusters.find({userID: Session.get("currentUser")._id, promptID: Session.get("currentPrompt")._id})
    } else {
      logger.trace("in real study, pulling from inspiration clusters");
      var inspirations = Session.get("currentInspiration");
      clusters = Clusters.find({_id: {$in: inspirations.clusterIDs}});
    }
    return clusters;
  },
  prompt: function() {
    if (Session.equals("isTutorial", true)) {
      return "This is where the brainstorming problem will be described";
    } else if (Session.equals("isFluency", true)) {
      return "Alternative uses for a bowling pin";
    } else {
      return Session.get("currentPrompt").question;  
    }
  },
});

Template.inspiration.helpers({
  hasVoted: function() {
    if (isInList(Session.get("currentUser")._id, this.votes)) {
      // logger.debug("User has already voted");
      return true;
    } else {
      // logger.debug("User has not voted");
      return false;
    }
  },
});

Template.inspiration.events({
  'click .up-vote': function(e, elm) {
    if (!isInList(Session.get("currentUser")._id, this.votes)) {
      logger.debug("voting for cluster");
      ClusterFactory.upVote(this, Session.get("currentUser"));
      EventLogger.logStarCluster(this);
    } else {
      logger.debug("undo voting for cluster");
      ClusterFactory.downVote(this, Session.get("currentUser"));
      EventLogger.logUnstarCluster(this);
    }
  },
})
