/********************************************************************
* Currrently holds all subscriptions to all collections. These should
* be moved to relevant locations (e.g. routes.js and specific
* Templates where the data is actually needed) in client as logic 
* becomes more developed. Publications are located in 
* brainstorm/models/publications.js for now.
********************************************************************/

Meteor.startup(function(){
  /************************************************************
  * Subscribe to models.js collections
  ************************************************************/

  Meteor.subscribe("clusters");
  Meteor.subscribe("prompts");
  Meteor.subscribe("myUsers");
  Meteor.subscribe("roles");
  Meteor.subscribe("groups");
  Meteor.subscribe("groupTemplates");
  Meteor.subscribe("userTypes");
  /************************************************************
  * Subscribe to Filtering collections
  ************************************************************/
  Meteor.subscribe("filters");
  /************************************************************
  * Subscribe to experimentModels.js collections
  ************************************************************/
  Meteor.subscribe("experiments");
  Meteor.subscribe('exp-conditions');
  Meteor.subscribe("consents");
  Meteor.subscribe("participants");
  Meteor.subscribe("SurveyResponses");
  /************************************************************
  * Subscribe to loggingModels.js collection
  ************************************************************/
  Meteor.subscribe("eventTypes");
  Meteor.subscribe("events");

});

