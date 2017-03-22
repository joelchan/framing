// Configure logger for Tools
var logger = new Logger('Client:KAlign:KTest');
// Comment out to use global logging level
Logger.setLevel('Client:KAlign:KTest', 'trace');
//Logger.setLevel('Client:KAlign:KTest', 'debug');
// Logger.setLevel('Client:KAlign:KTest', 'info');
// Logger.setLevel('Client:KAlign:KTest', 'warn');

Template.KnowledgeTest.onRendered(function() {
    $(".submitForm").click(function() {
        logger.info("form submitted");
        // EventLogger.logSurveyComplete();
    });

    // var part = Session.get("currentParticipant");

    //Scroll to top
    window.scrollTo(0,0);
    // var cond = Conditions.findOne({_id: part.conditionID});
    // logger.trace("Setting next page: ", Session.get("currentUser")._id, cond.misc.workflowID);
    // TODO: Edit this
    // WorkflowManager.setNextPage(Session.get("currentUser")._id, 
                                // cond.misc.workflowID,
                                // Session.get("problemSequence"));
    // EventLogger.logSurveyBegan();
});

Template.KnowledgeTest.helpers({
  knowledgeTestItems: function() {
    return kTest;
  }
});

Template.QuestionAnchor.helpers({
  questionID: function() {
    return this.qName;
  }
})

Template.KnowledgeTest.onRendered(function() {
  var part = Session.get("currentParticipant");
  var cond = Conditions.findOne({_id: part.conditionID});
  EventLogger.logKnowledgeTestStart();
  WorkflowManager.setNextPage(part.userID, 
                              cond.misc.workflowID);
})

Template.KnowledgeTest.events({

    'click button.submitForm' : function() {
      // var part = Session.get("currentParticipant");
      // var cond = Conditions.findOne({_id: part.conditionID});
      var resp = getKnowledgeResponses();
      if (resp) {
        console.log(resp);
        resp._id = KnowledgeTestResponses.insert(resp);
        logger.trace("Created knowledge test response with ID: " + resp._id);
        EventLogger.logKnowledgeTestSubmit(resp);
        //Mark participant as finished
        // ExperimentManager.logParticipantCompletion(part);
        logger.trace("finishing knowledge test and going to next page");
        var cond = Conditions.findOne({_id: Session.get("currentParticipant").conditionID});
        WorkflowManager.goToNextPage(Session.get("currentUser")._id, cond.misc.workflowID);
      } else {
        alert("Please answer all the questions!");
      }
    }

});

checkResponse = function(answer) {
  logger.debug("Checking response");
  if (!answer) {
    throw "Incomplete survey error";
  }
}

getKnowledgeResponses = function() {

  var part = Session.get("currentParticipant");

   var finished = true;

  var responses = {};

  var answer = $('#otherKnowledge').val();
  responses['otherKnowledge'] = answer;

  for (i=0; i<kTest.length; i++) {
    var qName = kTest[i].qName;
    var selector = "input[name='" + qName + "']:checked";
    var answer = $(selector).val();
    if (!answer) {
      finished = false;
    }
    responses[qName] = answer;
  }
  if (finished) {
    return new KnowledgeTestResponse(responses, part);  
  } else {
    return null;
  }
  
}
