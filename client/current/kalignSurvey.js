// Configure logger for Tools
var logger = new Logger('Client:Crowd:KAlignSurvey');
// Comment out to use global logging level
Logger.setLevel('Client:Crowd:KAlignSurvey', 'trace');
//Logger.setLevel('Client:Crowd:KAlignSurvey', 'debug');
// Logger.setLevel('Client:Crowd:KAlignSurvey', 'info');
// Logger.setLevel('Client:Crowd:KAlignSurvey', 'warn');

Template.KAlignSurvey.onRendered(function() {
    // $(".submitForm").click(function() {
    //     logger.info("form submitted");
    //     EventLogger.logSurveyComplete();
    // });

    var part = Session.get("currentParticipant");

    //Scroll to top
    window.scrollTo(0,0);
    var cond = Conditions.findOne({_id: part.conditionID});
    logger.trace("Setting next page: ", Session.get("currentUser")._id, cond.misc.workflowID);
    WorkflowManager.setNextPage(Session.get("currentUser")._id,
                                cond.misc.workflowID);
    EventLogger.logSurveyBegan();
});

Template.KAlignSurvey.helpers({

});

Template.KAlignSurvey.events({

    'click button.submitForm' : function(){
    logger.trace("finishing survey and goint to next page");
    var part = Session.get("currentParticipant");
    var cond = Conditions.findOne({_id: part.conditionID});
    var resp = getResponses();
    resp._id = SurveyResponses.insert(resp);
    logger.trace("Created survey response with ID: " + resp._id);
    EventLogger.logSubmittedSurvey(part, resp);
    //Mark participant as finished
    ExperimentManager.logParticipantCompletion(part);
    logger.trace("finishing survey and goint to next page");
    WorkflowManager.goToNextPage(Session.get("currentUser")._id, cond.misc.workflowID);
    }
})

checkResponse = function(answer) {
  logger.debug("Checking response");
  if (!answer) {
    throw "Incomplete survey error";
  }
}

getResponses = function() {
  var responses = [];
  //Gender
  var answer = $("input[name='gender']:checked").val();
  // checkResponse(answer)
  responses.push(new QuestionResponse("Gender", answer));

  //Age
  answer = $("input[name='age']").val();
  // checkResponse(answer)
  responses.push(new QuestionResponse("Age", answer));
  //English 1st language
  answer = $("input[name='lang1']:checked").val();
  // checkResponse(answer)
  responses.push(new QuestionResponse("Is English your first language", answer));

  // choice
  answer = $("#choiceDescr").val();
  responses.push(new QuestionResponse("Path misc comments", answer));

  answer = $("select#choicePromising").val();
  responses.push(new QuestionResponse("Path Promising", answer));

  answer = $("select#choiceKnowledge").val();
  responses.push(new QuestionResponse("Path Knowledge", answer));

  answer = $("select#choiceNovel").val();
  responses.push(new QuestionResponse("Path Novel", answer));

  // path
  answer = $("select#manipCheckPro").val();
  responses.push(new QuestionResponse("Knowledge is aligned", answer));

  answer = $("select#manipCheckNeg").val();
  responses.push(new QuestionResponse("Knowledge is not aligned", answer));

  answer = $("#pathEngage").val();
  responses.push(new QuestionResponse("General reactions to path", answer));

  // activity/interface feedback
  answer = $("#activityLikeSurvey").val();
  responses.push(new QuestionResponse("Is there anything about the activity that you found particularly challenging", answer));
  answer = $("#intLikeSurvey").val();
  responses.push(new QuestionResponse("Is there anything about the brainstorming interface that you liked", answer));
  answer = $("#intDislikeSurvey").val();
  responses.push(new QuestionResponse("Is there anything about the brainstorming interface that you didn't like", answer));
  var part = Session.get("currentParticipant");
  return new SurveyResponse(responses, part);
}
