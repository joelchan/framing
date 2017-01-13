// Configure logger for Tools
var logger = new Logger('Client:Hcomp:Tutorial');
// Comment out to use global logging level
// Logger.setLevel('Client:Hcomp:Tutorial', 'trace');
//Logger.setLevel('Client:Hcomp:Tutorial', 'debug');
Logger.setLevel('Client:Hcomp:Tutorial', 'info');
//Logger.setLevel('Client:Hcomp:Tutorial', 'warn');
var myTaskIDs = [];
var tutorialLengthTreatment = 10;
var tutorialLengthControl = 7;
var fluencyTaskLength = 1*60000;

var timer = new Tock({
    callback: function () {
        $('#clockface').text(timer.msToTime(timer.lap()));
    }
});

var countdown = Tock({
    countdown: true,
    interval: 1000,
    callback: function () {
        // console.log(countdown.lap() / 1000);
        $('#countdown_clock').text(timer.msToTimecode(countdown.lap()));
    },
    complete: function () {
        alert("Time's up!");
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
        
        if (condName.indexOf("Control") > -1) {
          $("#control-tutorial-ideaEntryTry").removeClass("visible-tutorial-control");
          $("#control-tutorial-directions").addClass("visible-tutorial-control");
          $("#control-tutorial-ideaEntryTry").addClass("control-tutorial-background");
          $("#ideator-directions-control").css({border: "10px solid #F5A623"});
          $("#directions-content").removeClass("collapse");
          $("#directions-content").addClass("collapse in");
          $('#control-tutorial-ideaEntryTry-gotit').attr('disabled',false);
          $('.control-tutorial-ideaEntryTry-goback').attr('disabled',false);
          EventLogger.logTutorialStepComplete(6,tutorialLengthControl); 
        } else {
          $("#treatment-tutorial-ideaEntryTry").removeClass("visible-tutorial-treatment");
          $("#treatment-tutorial-inspireMe").addClass("visible-tutorial-treatment");
          $("#treatment-tutorial-ideaEntryTry").addClass("treatment-tutorial-background");
          $(".get-task").css({
              border: "10px solid #F5A623",
              "z-index": 60
          });
          $(".idea-input-box").css({
              border: "none",
              "z-index": 20
          });
          var height = $(window).height() - 50; //Navbar height=50
          $(".general-idea-entry").append(
              "<div class='tutorial-backdrop' style='height: " + height + "px;'></div>"
          );
          $('#treatment-tutorial-ideaEntryTry-gotit').attr('disabled',false);
          $('.treatment-tutorial-ideaEntryTry-goback').attr('disabled',false);
          EventLogger.logTutorialStepComplete(6,tutorialLengthTreatment);
        }
    }
});

//CONTROL TUTORIAL
Template.TutorialControl.rendered = function() {
    $(".tutorial-page-control").append(
        "<div class='tutorial-backdrop'></div>"
    );

    //Clear out any Dummy Ideas
    ideas = DummyIdeas.find(
      {'userID': Session.get("currentUser")._id,
      'prompt._id': Session.get("currentPrompt")._id}
    );
    ideas.forEach(function(idea) {
      DummyIdeas.remove({'_id': idea._id});
    });
    // Setup Experimenter push to ideation listener
    logger.trace("Rendering tutorial control page");
    // MyUsers.find({_id: Session.get("currentUser")._id}).observe({
    //   changed: function(newDoc, oldDoc) {
    //     logger.info("change to current user detected");
    //     logger.trace("oldDoc: " + JSON.stringify(oldDoc));
    //     logger.trace("newDoc: " + JSON.stringify(newDoc));
    //     // logger.trace(newDoc.route);
    //     var route = newDoc.route;
    //     logger.debug("Going to page with route: " + route);
    //     var partID = Session.get("currentParticipant")._id;
    //     var promptID = Session.get("currentPrompt")._id;
    //     logger.debug("partID: " + partID);
    //     //
    //     // TODO grab the fluency measure if we haven't!
    //     //
    //     Router.go(route, {'promptID': promptID, 'partID': partID});
    //   },
    // });    
    var part = Session.get("currentParticipant");
    var cond = Conditions.findOne({_id: part.conditionID});
    WorkflowManager.setNextPage(part.userID, 
                                cond.misc.workflowID,
                                Session.get("problemSequence"));
    initializeTutorialTimer();
    EventLogger.logTutorialStarted();
    Session.set("currentTutorialStep",1);
}

//Template.TutorialControl.events({
    //'click button.nextPage': function () {
        //ExperimentManager.logParticipantReady(Session.get("currentParticipant"));
    //},
//});

Template.MturkIdeationPageControlTutorial.rendered = function(){
  //Hide logout
  $(".btn-login").toggleClass("hidden");
  //Set height of elements to viewport height
  var height = $(window).height() - 50; //Navbar height=50
  logger.debug("window viewport height = " + height.toString());
  $(".main-prompt").height(height);
  $(".task-list-pane").height(height-85);
  //Setup Facilitation push to synthesis listener
  // MyUsers.find({_id: Session.get("currentUser")._id}).observe({
  //   changed: function(newDoc, oldDoc) {
  //       logger.info("change to current user detected");
  //       logger.trace(newDoc.route);
  //       var route = newDoc.route;
  //       logger.debug("Going to page with route: " + route);
  //       var partID = Session.get("currentParticipant")._id;
  //       logger.debug("partID: " + partID);
  //       Router.go(route, {'partID': partID});
  //   },
  // });
  
};

Template.TutorialProgressControl.helpers({
  tutorialProgress: function() {
    var step = Session.get("currentTutorialStep");
    logger.trace("Current step:" + step);
    var progress = Math.round(step/tutorialLengthControl*100);
    logger.trace("Progress = " + progress);
    return progress;
  }
});

Template.TutorialProgressTreatment.helpers({
  tutorialProgress: function() {
    var step = Session.get("currentTutorialStep");
    logger.trace("Current step:" + step);
    var progress = Math.round(step/tutorialLengthTreatment*100);
    logger.trace("Progress = " + progress);
    return progress;
  }
});

Template.MturkIdeationPageControlTutorial.helpers({
  prompt: function() {
    return Session.get("currentPrompt").question;
  },
});

Template.MturkIdeaListTutorial.helpers({
  ideas: function() {
    return DummyIdeas.find(
      {userID: Session.get("currentUser")._id,
      'prompt._id': Session.get("currentPrompt")._id},
      {sort: {time: -1}});
  },
  ideaCount: function() { 
    logger.debug("Counting Ideas"); 
    return DummyIdeas.find(
      {userID: Session.get("currentUser")._id,
      'prompt._id': Session.get("currentPrompt")._id}).count();
  }, 
});

Template.MturkIdeaboxTutorial.helpers({
  hasNotVoted: function() {
    if (isInList(Session.get("currentUser")._id, this.votes)) {
      logger.debug("User has already voted");
      return false;
    } else {
      logger.debug("User has not voted");
      return true;
    }
  },
  voteNum: function() {
    return this.votes.length;
  },
});

Template.MturkIdeaboxTutorial.events({
  'click .up-vote': function(e, elm) {
    if (!isInList(Session.get("currentUser")._id, this.votes)) {
      logger.debug("voting for idea");
      IdeaFactory.upVote(this, Session.get("currentUser"));
    } else {
      logger.debug("undo voting for idea");
      IdeaFactory.downVote(this, Session.get("currentUser"));
    }
  },

});

Template.MturkIdeaEntryBoxTutorial.rendered = function(){
    var parentContainer = $(this.firstNode).parent();
    var ideaEntryField = $(this.firstNode).children('textArea');
    // console.log(ideaEntryField);
    if (parentContainer.hasClass('general-idea-entry')) {
      // console.log("Parent is general idea entry");
      ideaEntryField.attr("placeholder", "Enter ideas for the main prompt here")
    } else {
      ideaEntryField.attr("placeholder", "Enter ideas related to this inspiration here")
    };
};

Template.MturkIdeaEntryBoxTutorial.events({
    
  'click .submit-idea': function (e, target) {    
    // if ($("#control-tutorial-ideaEntryTry-gotit").length) {
    //   document.getElementById("control-tutorial-ideaEntryTry-gotit").disabled = false;
    // }
    
    // if ($("#treatment-tutorial-ideaEntryTry-gotit").length) {
    //   document.getElementById("treatment-tutorial-ideaEntryTry-gotit").disabled = false;
    // }
    if ($("#treatment-tutorial-inspirationCardTry-gotit").length) {
      document.getElementById("treatment-tutorial-inspirationCardTry-gotit").disabled = false;
    }
      
    //console.log("event submitted");
    logger.trace("submitting a new idea");
    logger.debug(e.currentTarget);
    logger.debug(target.firstNode);
    //get the input template
    var inputBox = $(target.firstNode).children('.idea-input')
    var content = inputBox.val();
    //Create dummy idea for tutorial page
    var idea = IdeaFactory.create(content, 
        Session.get("currentUser"),
        Session.get("currentPrompt"),
        true
    );
    // Clear the text field
    inputBox.val('');
    //Adding Idea to list of task ideas if this is a task
    logger.debug("parent of idea entry box");
    logger.trace(target.firstNode);
    var parent = $(target.firstNode).parent();
    if (parent.hasClass('ideate-task')) {
      logger.debug("Adding a new idea to a task");
      logger.trace(this);
      TaskManager.addIdeaToTask(idea, this);
      EventLogger.logIdeaSubmission(idea, this, true); 
    } else {
      EventLogger.logIdeaSubmission(idea, null, true); 
    }
  },
  //waits 3 seconds after user stops typing to change isTyping flag to false
  'keyup textarea' : function(e, target){
    logger.debug(e);
    logger.debug(target);
    console.log("key pressed")
    if(e.keyCode===13) {
      logger.debug("enter pressed")
      var btn = $(target.firstNode).children('.submit-idea')
      btn.click();
    }
  }
});

Template.ControlTutorialFlow.events({
    //Welcome
    'click .control-tutorial-welcome-gotit': function() {
        $("#control-tutorial-welcome").removeClass("visible-tutorial-control");
        $("#control-tutorial-timer").addClass("visible-tutorial-control");
        $(".timer").css({border: "10px solid #F5A623","min-width": 150,float: "right",clear: "right", padding: "3px"});
        $(".timer").zIndex(100);
        EventLogger.logTutorialStepComplete(1,tutorialLengthControl);
    },
    //Timer
    'click .control-tutorial-timer-gotit': function() {
        $("#control-tutorial-timer").removeClass("visible-tutorial-control");
        $("#control-tutorial-exit").addClass("visible-tutorial-control");
        $(".timer").css({border: "none"});
        $(".timer").zIndex(0);
        $(".exitStudy").css({border: "10px solid #F5A623"});
        $(".exitStudy").zIndex(51);
        EventLogger.logTutorialStepComplete(2,tutorialLengthControl);
    },
    'click .control-tutorial-timer-goback': function() {
        $("#control-tutorial-timer").removeClass("visible-tutorial-control");
        $("#control-tutorial-welcome").addClass("visible-tutorial-control");
        $(".timer").css({border: "none"});
        $(".timer").zIndex(0);
        EventLogger.logTutorialStepRewind(2,tutorialLengthControl);
    },
    //Exit Early
    'click .control-tutorial-exit-gotit': function() {
        $("#control-tutorial-exit").removeClass("visible-tutorial-control");
        $("#control-tutorial-prompt").addClass("visible-tutorial-control");
        $(".tutorial-backdrop").remove();
        $(".hcomp-ideation-pane-control").append(
            "<div class='tutorial-backdrop'></div>");
        $(".ideation-prompt-control").css({
            border: "10px solid #F5A623",
            background: "#FFF",
            "z-index": "60",
        });
        $(".exitStudy").css({border: "none"});
        $(".exitStudy").zIndex(1);
        EventLogger.logTutorialStepComplete(3,tutorialLengthControl);
    },
    'click .control-tutorial-exit-goback': function() {
        $("#control-tutorial-exit").removeClass("visible-tutorial-control");
        $("#control-tutorial-timer").addClass("visible-tutorial-control");
        $(".timer").css({border: "10px solid #F5A623",width: 200,float: "right",clear: "right"});
        $(".exitStudy").css({border: "none"});
        EventLogger.logTutorialStepRewind(3,tutorialLengthControl);
    },
    //Prompt
    'click .control-tutorial-prompt-gotit': function() {
        $("#control-tutorial-prompt").removeClass("visible-tutorial-control");
        $("#control-tutorial-ideaEntry").addClass("visible-tutorial-control");
        $(".ideation-prompt-control").css({
            border: "none",
            "z-index": 20
        });
        $(".idea-input-box").css({
            border: "10px solid #F5A623",
        });
        $(".main-prompt").css({
            "z-index": 60
        });
        EventLogger.logTutorialStepComplete(4,tutorialLengthControl);
    },
    'click .control-tutorial-prompt-goback': function() {
        $("#control-tutorial-prompt").removeClass("visible-tutorial-control");
        $("#control-tutorial-exit").addClass("visible-tutorial-control");
        $(".ideation-prompt-control").css({
            border:"none",
            "z-index": 20
        });
        $(".tutorial-backdrop").remove();
        $(".tutorial-page-control").append(
            "<div class='tutorial-backdrop'></div>");
        $(".exitStudy").css({
            border: "10px solid #F5A623"});
        EventLogger.logTutorialStepRewind(4,tutorialLengthControl);
    },
    //ideaEntry
    'click .control-tutorial-ideaEntry-gotit': function() {
        $("#control-tutorial-ideaEntry").removeClass("visible-tutorial-control");
        $("#control-tutorial-ideaEntryTry").addClass("visible-tutorial-control");
        // $("#control-tutorial-ideaEntryTry").removeClass("control-tutorial-background");
        $(".idea-input-box").css({border: "none"});
        EventLogger.logTutorialStepComplete(5,tutorialLengthControl);
    },
    'click .control-tutorial-ideaEntry-goback': function() {
        $("#control-tutorial-ideaEntry").removeClass("visible-tutorial-control");
        $("#control-tutorial-prompt").addClass("visible-tutorial-control");
        $(".ideation-prompt-control").css({
            border: "10px solid #F5A623",
            "z-index": "60",
        });
        $(".idea-input-box").css({border: "none"});
        $(".main-prompt").css({
            "z-index": 20 
        });
        EventLogger.logTutorialStepRewind(5,tutorialLengthControl);
    },
    //ideaEntryTry
    'click #control-tutorial-ideaEntryTry-gotit': function() {
        // $("#control-tutorial-ideaEntryTry").removeClass("visible-tutorial-control");
        // $("#control-tutorial-directions").addClass("visible-tutorial-control");
        // $("#control-tutorial-ideaEntryTry").addClass("control-tutorial-background");
        // $("#ideator-directions-control").css({border: "10px solid #F5A623"});
        // $("#directions-content").removeClass("collapse");
        // $("#directions-content").addClass("collapse in");
        // EventLogger.logTutorialStepComplete(6,tutorialLengthControl);
        $('#control-tutorial-ideaEntryTry-gotit').attr('disabled',true);
        $('.control-tutorial-ideaEntryTry-goback').attr('disabled',true);
        $("#control-tutorial-ideaEntryTry").removeClass("control-tutorial-background");
        alert("Ready, set, go! Click 'ok' and the timer will start!");
        $('.ideation-prompt-control').text("Alternative uses for a bowling pin");
        var startTime = timer.msToTime(fluencyTaskLength)
        logger.trace("Fluency task length is: " + startTime);
        EventLogger.logFluencyTaskBegin();
        countdown.start(fluencyTaskLength);
    },
    'click .control-tutorial-ideaEntryTry-goback': function() {
        $("#control-tutorial-ideaEntryTry").removeClass("visible-tutorial-control");
        $("#control-tutorial-ideaEntry").addClass("visible-tutorial-control");
        $("#control-tutorial-ideaEntryTry").addClass("control-tutorial-background");
        $(".idea-input-box").css({border: "10px solid #F5A623"});
        EventLogger.logTutorialStepRewind(6,tutorialLengthControl);
    },
    //Directions
    'click .control-tutorial-directions-gotit': function() {
        $("#control-tutorial-directions").removeClass("visible-tutorial-control");
        $("#control-tutorial-pleaseWait").addClass("visible-tutorial-control");
        $("#control-tutorial-pleaseWait").removeClass("control-tutorial-background");
        $("#ideator-directions-control").css({border: "none"});
        // Mark the Particiapant as ready to begin the study
        // ExperimentManager.logParticipantReady(Session.get("currentParticipant"));
        EventLogger.logTutorialStepComplete(7,tutorialLengthControl);
        EventLogger.logTutorialComplete();
    },
    'click .control-tutorial-directions-goback': function() {
        $("#control-tutorial-directions").removeClass("visible-tutorial-control");
        $("#control-tutorial-ideaEntryTry").addClass("visible-tutorial-control");
        $("#ideator-directions-control").css({border: "none"});
        EventLogger.logTutorialStepRewind(7,tutorialLengthControl);
        EventLogger.logTutorialStepComplete(7,tutorialLengthControl);
    },
    //Please Wait
    'click .control-tutorial-pleaseWait-gotit': function() {
        $("#control-tutorial-pleaseWait").removeClass("visible-tutorial-control");
        $("#control-tutorial-pleaseWait").addClass("control-tutorial-background");
        $(".tutorial-backdrop").remove();
        transitionToIdeation();
        EventLogger.logTutorialStepComplete(8,tutorialLengthControl);
    },
    'click .control-tutorial-pleaseWait-goback': function() {
        $("#control-tutorial-pleaseWait").removeClass("visible-tutorial-control");
        $("#control-tutorial-directions").addClass("visible-tutorial-control");
        $("#control-tutorial-pleaseWait").addClass("control-tutorial-background");
        $("#ideator-directions-control").css({border: "10px solid #F5A623"});
        EventLogger.logTutorialStepRewind(8,tutorialLengthControl);
    },
});
 

//TREATMENT TUTORIAL
Template.TutorialTreatment.rendered = function() {
    // Insert greyed out backdrop for tutorial overlay
    $(".tutorial-page-treatment").append(
        "<div class='tutorial-backdrop'></div>"
    );
    //Clear out any Dummy Ideas
    ideas = DummyIdeas.find(
      {'userID': Session.get("currentUser")._id,
      'prompt._id': Session.get("currentPrompt")._id}
    );
    ideas.forEach(function(idea) {
      DummyIdeas.remove({'_id': idea._id});
    });
    //Clear out any Dummy Tasks
    var tasks = DummyTasks.find({'authorID': Session.get("currentUser")._id,
        'promptID': Session.get("currentPrompt")._id})
    tasks.forEach(function(task) {
      logger.debug("removing task with id: " + task._id);
      DummyTasks.remove({'_id': task._id});
    });
    // Setup Experimenter push to ideation listener
    // MyUsers.find({_id: Session.get("currentUser")._id}).observe({
    // changed: function(newDoc, oldDoc) {
    //     logger.info("change to current user detected");
    //     logger.trace("oldDoc: " + JSON.stringify(oldDoc));
    //     logger.trace("newDoc: " + JSON.stringify(newDoc));
    //     var route = newDoc.route;
    //     logger.debug("Going to page with route: " + route);
    //     var partID = Session.get("currentParticipant")._id;
    //     var promptID = Session.get("currentPrompt")._id;
    //     logger.debug("partID: " + partID);
    //     Router.go(route, {'promptID': promptID, 'partID': partID});
    //   },
    // });    
    EventLogger.logTutorialStarted();
    initializeTutorialTimer();
}
//Template.TutorialTreatment.events({
    //'click button.nextPage': function () {
        //ExperimentManager.logParticipantReady(Session.get("currentParticipant"));  
    //},
//});


Template.MturkIdeationPageTreatmentTutorial.rendered = function(){
  //Hide logout
  $(".btn-login").toggleClass("hidden");
  //Set height of elements to viewport height
  var height = $(window).height() - 50; //Navbar height=50
  logger.debug("window viewport height = " + height.toString());
  $(".main-prompt").height(height);
  $(".task-list-pane").height(height-85);
};

Template.MturkTaskListsTreatmentTutorial.helpers({
  getMyTasks: function() {
    logger.debug("Getting a list of all tasks assigned to current user");
//    var assignments = 
//      Assignments.find({userID: Session.get("currentUser")._id,
//        promptID: Session.get("currentPrompt")._id}, 
//        {sort: {'assignmentTime': -1}}).fetch();
//    logger.trace(assignments);
//    var taskIDs = getValsFromField(assignments, 'taskID');
//    logger.trace(taskIDs);
      var allMyTasks = DummyTasks.find({
        authorID: Session.get("currentUser")._id,
        promptID: Session.get("currentPrompt")._id,
      }, {sort: {time: -1}});
      
//    var tasks = DummyTasks.find({_id: {$in: myTaskIDs}}).fetch();
//    for (var i=0; i<taskIDs.length; i++) {
//      tasks.push(DummyTasks.findOne({_id: taskIDs[i]}));
//    };
    //var tasks = Tasks.find({_id: {$in: taskIDs}});
    //Sort tasks by assignment time
    return allMyTasks;
  },
  prompt: function() {
    var prompt = Session.get("currentPrompt");
    return prompt.question;
  },
});

Template.MturkTaskListsTreatmentTutorial.events({ 
  'click .get-task': function(e, t) {
    EventLogger.logRequestInspiration(Session.get("currentPrompt"));
    document.getElementById("treatment-tutorial-inspireMeTry-gotit").disabled = false;
      
    var groupID = Session.get("currentUser").groupID;
    var group = Groups.findOne({_id : groupID});

    var dummy1 = new Task(Session.get('currentUser'), Session.get('currentPrompt'), group, "This is an inspiration!", 'open', priority=3, num=50); 
      dummy1._id = DummyTasks.insert(dummy1);
      
    logger.debug("Retrieving a new task"); 
//    var task = DummyTasks.findOne({_id: {$nin: myTaskIDs}});
      
      DummyTasks.update({_id: dummy1._id}, {$push: {assignments: Session.get("currentUser")}});
      
    if (dummy1) {
      logger.info("Got a new task");
      EventLogger.logInspirationRequestSuccess(
        Session.get("currentPrompt"),
        dummy1
      );
      logger.trace(dummy1);
    } else {
      logger.info("No new task was assigned");
      EventLogger.logInspirationRequestFail(
        Session.get("currentPrompt")
      );
      //alert("Sorry, there are no new tasks. Just keep on trying");
      $("#hcomp-new-task-modal").modal('show');
    }
  },
});

var getTaskIdeas = function (task) {
  logger.debug("Getting Idea list");
  logger.debug("Cluster ID: "  + task.ideaNodeID);
    var cluster = Clusters.findOne({_id: task.ideaNodeID});
    logger.trace(cluster.ideaIDs)
    logger.trace("Current UserID: " + Session.get("currentUser")._id);
    logger.trace("Current PromptID: " + Session.get("currentPrompt")._id);
    var ideas = DummyIdeas.find(
      {
        _id: {$in: cluster.ideaIDs},
        userID: Session.get("currentUser")._id,
        'prompt._id': Session.get("currentPrompt")._id
      },
      {sort: {time: -1}}
    );
    logger.trace(ideas);
    return ideas;

}


Template.TaskIdeaListTreatmentTutorial.helpers({
  ideas: function() {
    logger.debug("getting idea list for task");
    logger.trace(this);
    return getTaskIdeas(this);
  },
  ideaCount: function() { 
    logger.debug("Counting Ideas"); 
    logger.trace(this); 
    return getTaskIdeas(this).count();
  }, 
});

Template.TreatmentTutorialFlow.events({
    //Welcome
    'click .treatment-tutorial-welcome-gotit': function() {
        $("#treatment-tutorial-welcome").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-timer").addClass("visible-tutorial-treatment");
        $(".timer").css({border: "10px solid #F5A623",width: 200,float: "right",clear: "right"});
        EventLogger.logTutorialStepComplete(1,tutorialLengthTreatment);
    },
    //Timer
    'click .treatment-tutorial-timer-gotit': function() {
        $("#treatment-tutorial-timer").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-exit").addClass("visible-tutorial-treatment");
        $(".timer").css({border: "none"});
        $(".exitStudy").css({border: "10px solid #F5A623"});
//        $(".ideation-prompt-treatment").css({"z-index": 100});
        EventLogger.logTutorialStepComplete(2,tutorialLengthTreatment);
    },
    'click .treatment-tutorial-timer-goback': function() {
        $("#treatment-tutorial-timer").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-welcome").addClass("visible-tutorial-treatment");
        $(".timer").css({border: "none"});
        EventLogger.logTutorialStepRewind(2,tutorialLengthTreatment);
    },
    //Exit Early
    'click .treatment-tutorial-exit-gotit': function() {
        $("#treatment-tutorial-exit").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-prompt").addClass("visible-tutorial-treatment");
        $(".ideation-prompt-treatment").css({
            border: "10px solid #F5A623",
            "z-index": 60
        });
        $(".exitStudy").css({border: "none"});
        $(".tutorial-backdrop").remove();
        var height = $(window).height() - 50; //Navbar height=50
        $(".task-list-header").append(
            "<div class='tutorial-backdrop' style='height: " + height + "px;'></div>"
        );
        $(".general-idea-entry").append(
            "<div class='tutorial-backdrop'></div>"
        );
        $(".ideation-prompt-treatment").zIndex(60);
        EventLogger.logTutorialStepComplete(3,tutorialLengthTreatment);
    },
    'click .treatment-tutorial-exit-goback': function() {
        $("#treatment-tutorial-exit").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-timer").addClass("visible-tutorial-treatment");
        $(".timer").css({border: "10px solid #F5A623",width: 200,float: "right",clear: "right"});
        $(".exitStudy").css({border: "none"});
        EventLogger.logTutorialStepRewind(3,tutorialLengthTreatment);
    },
    //Prompt
    'click .treatment-tutorial-prompt-gotit': function() {
        $("#treatment-tutorial-prompt").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-ideaEntry").addClass("visible-tutorial-treatment");
        $(".ideation-prompt-treatment").css({
            border:"none",
            "z-index": 20
        });
        $(".idea-input-box").css({
          border: "10px solid #F5A623",
          "z-index": "60",
          position: "relative"
        });
        EventLogger.logTutorialStepComplete(4,tutorialLengthTreatment);
    },
    'click .treatment-tutorial-prompt-goback': function() {
        $("#treatment-tutorial-prompt").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-exit").addClass("visible-tutorial-treatment");
        $(".ideation-prompt-treatment").css({
            border: "none",
            "z-index": 20 
        });
        $(".tutorial-backdrop").remove();
        var height = $(window).height() - 50; //Navbar height=50
        $(".tutorial-page-treatment").append(
            "<div class='tutorial-backdrop' style='height: " + height + "px;'></div>"
        );
        $(".exitStudy").css({border: "10px solid #F5A623"});
        EventLogger.logTutorialStepRewind(4,tutorialLengthTreatment);
    },
    //ideaEntry
    'click .treatment-tutorial-ideaEntry-gotit': function() {
        $("#treatment-tutorial-ideaEntry").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-ideaEntryTry").addClass("visible-tutorial-treatment");
        // $("#treatment-tutorial-ideaEntryTry").removeClass("treatment-tutorial-background");
        $(".idea-input-box").css({border: "none"});
        $(".general-idea-entry .tutorial-backdrop").remove();
        $("#treatment-tutorial-highlight-ideaEntryTry").remove();
        EventLogger.logTutorialStepComplete(5,tutorialLengthTreatment);
    },
    'click .treatment-tutorial-ideaEntry-goback': function() {
        $("#treatment-tutorial-ideaEntry").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-prompt").addClass("visible-tutorial-treatment");
        $(".ideation-prompt-treatment").css({border: "10px solid #F5A623"});
        $(".idea-input-box").css({
            border: "none",
            "z-index": 20
        });
        $(".ideation-prompt-treatment").css({
            border: "10px solid #F5A623",
            "z-index": 60
        });
        EventLogger.logTutorialStepRewind(5,tutorialLengthTreatment);
    },
    
    //ideaEntryTry
    'click #treatment-tutorial-ideaEntryTry-gotit': function() {
        $('#treatment-tutorial-ideaEntryTry-gotit').attr('disabled',true);
        $('.treatment-tutorial-ideaEntryTry-goback').attr('disabled',true);
        // $("#treatment-tutorial-ideaEntryTry").removeClass("treatment-tutorial-background");
        // $('.treatment-tutorial-background').zIndex(51);
        $("#treatment-tutorial-highlight-ideaEntryTry").remove();
        alert("Ready, set, go! Click 'ok' and the timer will start!");
        $('.ideation-prompt-treatment').text("Alternative uses for a bowling pin");
        var startTime = timer.msToTime(fluencyTaskLength);
        logger.trace("Fluency task length is: " + startTime);
        EventLogger.logFluencyTaskBegin();
        countdown.start(fluencyTaskLength);
    },
    'click .treatment-tutorial-ideaEntryTry-goback': function() {
        $("#treatment-tutorial-ideaEntryTry").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-ideaEntry").addClass("visible-tutorial-treatment");
        $(".get-task").css({
            border: "none",
            "z-index": 20 
        });
        $(".idea-input-box").css({
            border: "10px solid #F5A623",
            "z-index": 60 
        });
        $(".idea-input-box").css({border: "10px solid #F5A623"});
        var height = $(window).height() - 50; //Navbar height=50
        $(".general-idea-entry").append(
            "<div class='tutorial-backdrop' style='height: " + height + "px;'></div>"
        );
        // $('.treatment-tutorial-background').zIndex("auto");
        $("#treatment-tutorial-ideaEntryTry").append(
          "<div id='treatment-tutorial-highlight-ideaEntryTry' class='treatment-tutorial-highlight-container'><div class='treatment-tutorial-highlight'></div></div>"
        );
        logger.trace("IDEA ENTRY TRY");
        EventLogger.logTutorialStepRewind(6,tutorialLengthTreatment);
    },
    
    //Inspire Me 
    'click .treatment-tutorial-inspireMe-gotit': function() {
        $("#treatment-tutorial-inspireMe").removeClass("visible-tutorial-treatment");
        // $("#treatment-tutorial-inspireMeTry").addClass("visible-tutorial-treatment");
        $("#treatment-tutorial-inspirationCardTry").addClass("visible-tutorial-treatment");
//        $("#treatment-tutorial-inspireMeTry").removeClass("treatment-tutorial-background");
        $(".get-task").removeClass("get-task-disabled");
        if ($(".ideate-task").length == 0) {
          logger.debug("Found no tasks yet, getting a task");
          $(".get-task").click();
        } else {
          logger.debug("Task has already been pulled");
        }
        $(".ideate-task").css({
            border: "10px solid #F5A623",
            "z-index": 60
        });
        $(".get-task").css({
            border: "none",
            "z-index": 20 
        });
        document.getElementById("treatment-tutorial-inspirationCardTry-gotit").disabled = true;
        // var height = $(window).height() - 50; //Navbar height=50
        // $(".task-list-header").append(
            // "<div class='tutorial-backdrop' style='height: " + height + "px;'></div>"
        // );
        //$(".task-list-header .tutorial-backdrop").remove();
        EventLogger.logTutorialStepComplete(7,tutorialLengthTreatment);
    },
    'click .treatment-tutorial-inspireMe-goback': function() {
        $("#treatment-tutorial-inspireMe").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-ideaEntryTry").addClass("visible-tutorial-treatment");
//        $("#treatment-tutorial-ideaEntryTry").removeClass("treatment-tutorial-background");
        $(".get-task").css({
            border: "none",
            "z-index": 20
        });
        $(".general-idea-entry .tutorial-backdrop").remove();
        //$(".task-list-header").append(
            //"<div class='tutorial-backdrop'></div>"
        //);
        EventLogger.logTutorialStepRewind(7,tutorialLengthTreatment);
    },
    
    //Inspiration Card Try
    'click #treatment-tutorial-inspirationCardTry-gotit': function() {
        logger.trace("Inspiration card try*****************");
        $("#treatment-tutorial-inspirationCardTry").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-inspirationCardMany").addClass("visible-tutorial-treatment");
//        $("#treatment-tutorial-ideaEntryTry").addClass("treatment-tutorial-background");
//      // Move backdrop to same hierachical level as the task-list-pane
        $(".task-list-header .tutorial-backdrop").remove();
        //$(".task-lists").append(
            //"<div class='tutorial-backdrop'></div>"
        //);
        //$(".task-list-pane").css({
            //border: "10px solid #F5A623", 
            //height: "auto",
            //"z-index": 60
        //});
        // $(".get-task").click();
        // $(".get-task").click();
        $(".ideate-task").css({
            border: "none",
            "z-index": 20 
        });
        EventLogger.logTutorialStepComplete(8,tutorialLengthTreatment);
    },
    'click .treatment-tutorial-inspirationCardTry-goback': function() {
        $("#treatment-tutorial-inspirationCardTry").removeClass("visible-tutorial-treatment");
        // $("#treatment-tutorial-inspirationCard").addClass("visible-tutorial-treatment");
//        $("#treatment-tutorial-ideaEntryTry").addClass("treatment-tutorial-background");
        $(".ideate-task").css({
            border: "none",
            "z-index": 20
        });
        // $(".task-list-header .tutorial-backdrop").remove();
        $("#treatment-tutorial-inspireMe").addClass("visible-tutorial-treatment");
//        $("#treatment-tutorial-inspireMe").addClass("treatment-tutorial-background");
        $(".get-task").addClass("get-task-disabled");
        $(".get-task").css({
            border: "10px solid #F5A623",
            "z-index": 60
        });
        if ($(".ideate-task").length > 0) {
          logger.debug("Removing existing pulled tasks");
          var tasks = DummyTasks.find({'authorID': Session.get("currentUser")._id,
              'promptID': Session.get("currentPrompt")._id})
          tasks.forEach(function(task) {
            logger.debug("removing task with id: " + task._id);
            DummyTasks.remove({'_id': task._id});
          });
        }
        EventLogger.logTutorialStepRewind(8,tutorialLengthTreatment);
    },
    
    //Inspiration Card Many 
    'click .treatment-tutorial-inspirationCardMany-gotit': function() {
        $("#treatment-tutorial-inspirationCardMany").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-directions").addClass("visible-tutorial-treatment");
//        $("#treatment-tutorial-pleaseWait").removeClass("treatment-tutorial-background");
        // $(".task-list-pane").css({
            // border: "none",
            // "z-index": 20
        // });
        $(".get-task").zIndex(20);
        var height = $(window).height() - 50; //Navbar height=50
        $(".task-list-header").append(
            "<div class='tutorial-backdrop' style='height: " + height + "px;'></div>"
        );
        //$(".general-idea-entry .tutorial-backdrop").remove();
        //$("#directions-container-treatment").css({
            //position: "relative",
            //background: "#F5F5F5",
            //"z-index": 60
        //});
        $(".ideator-directions-treatment").css({
            border: "10px solid #F5A623",
            background: "#FFF",
            position: "relative",
            "z-index": 60
        });
        $(".hcomp-ideation-pane").zIndex(10);
        $("#directions-content").removeClass("collapse");
        $("#directions-content").addClass("collapse in");
        EventLogger.logTutorialStepComplete(9,tutorialLengthTreatment);
    },
    'click .treatment-tutorial-inspirationCardMany-goback': function() {
        $("#treatment-tutorial-inspirationCardMany").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-inspirationCardTry").addClass("visible-tutorial-treatment");
        var height = $(window).height() - 50; //Navbar height=50
        $(".task-list-header").append(
            "<div class='tutorial-backdrop' style='height: " + height + "px;'></div>"
        );
        $(".ideate-task").css({
            border: "10px solid #F5A623",
            "z-index": 60
        });
        EventLogger.logTutorialStepRewind(9,tutorialLengthTreatment);
    },
    
    //Directions
    'click .treatment-tutorial-directions-gotit': function() {
        $("#treatment-tutorial-directions").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-pleaseWait").addClass("visible-tutorial-treatment");
        $("#treatment-tutorial-pleaseWait").removeClass("treatment-tutorial-background");
        //$("#directions-container-treatment").css({
            //border: "none",
            //"z-index": 20
        //});
        $(".ideator-directions-treatment").css({
            border: "none",
            background: "#F5F5F5",
            position: "relative",
            "z-index": 20
        });
        // Mark the Participant as ready to begin
        // ExperimentManager.logParticipantReady(Session.get("currentParticipant"));  
        EventLogger.logTutorialStepComplete(10,tutorialLengthTreatment);
        EventLogger.logTutorialComplete();
    },
    'click .treatment-tutorial-directions-goback': function() {
        $("#treatment-tutorial-directions").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-inspirationCardMany").addClass("visible-tutorial-treatment");
        $(".ideator-directions-treatment").css({
            border: "none",
            background: "#F5F5F5",
            position: "relative",
            "z-index": 20
        });
        //$(".task-list-pane").css({border: "10px solid #F5A623", height: "auto"});
        //$(".general-idea-entry").append(
            //"<div class='tutorial-backdrop'></div>"
        //);
        $(".task-list-header .tutorial-backdrop").remove();
        EventLogger.logTutorialStepRewind(10,tutorialLengthTreatment);
    },
    //Please Wait
    'click .treatment-tutorial-pleaseWait-gotit': function() {
        $(".tutorial-backdrop").remove();
        $("#treatment-tutorial-pleaseWait").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-pleaseWait").addClass("treatment-tutorial-background");
        transitionToIdeation();
        EventLogger.logTutorialStepComplete(11,tutorialLengthTreatment);
    },
    'click .treatment-tutorial-pleaseWait-goback': function() {
        $("#treatment-tutorial-pleaseWait").removeClass("visible-tutorial-treatment");
        $("#treatment-tutorial-directions").addClass("visible-tutorial-treatment");
        $("#treatment-tutorial-pleaseWait").addClass("treatment-tutorial-background");
        $(".ideator-directions-treatment").css({
            border: "10px solid #F5A623",
            background: "#FFF",
            position: "relative",
            "z-index": 60
        });
        EventLogger.logTutorialStepRewind(11,tutorialLengthTreatment);
    },
});

var initializeTutorialTimer = function() {
  if ($('.timer').length == 0) {
    Blaze.render(Template.TockTimer, $('#nav-right')[0]);
    countdown.stop();
  } else {
    countdown.stop();
  }
}

var transitionToIdeation = function() {
  
  logger.debug("Next is first problem in sequence");
  alert("Now you will work on the first of the two problems. Click ok to begin!");
  EventLogger.logBeginIdeation();
    // Session.set("alerted", true);
  var cond = Conditions.findOne({_id: Session.get("currentParticipant").conditionID});
  WorkflowManager.goToNextPage(Session.get("currentUser")._id, cond.misc.workflowID);
  
  // var part = Session.get("currentParticipant");
  // logger.debug("Updating route for user with id: " + part.userID);
  // var cond = Conditions.findOne({_id: part.conditionID});
  // // var exp = Experiments.findOne({_id: part.experimentID});
  // var routeName = "MturkIdeation" + cond.description;
  // logger.debug("Sending to route: " + routeName);
  // MyUsers.update({_id: part.userID}, {$set: {'route': routeName}});
  // Router.go(routeName, {'promptID': cond.promptID, 'partID': part._id});
}
