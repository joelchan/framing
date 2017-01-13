/********************************************************************
* Currrently holds all publications for all collections. As the logic
* develops, publications should begin to only publish subsets of the
* collections, and possibly be moved. Subscriptions are located in
* brainstorm/subscriptions.js for now.
********************************************************************/

Meteor.startup(function(){

	if(Meteor.isServer){
		/*****************************************************************
		* Publish models.js collections
		******************************************************************/
		Meteor.publish("ideas", function(){
			return Ideas.find();
		});
		Meteor.publish("clusters", function(){
			return Clusters.find();
		});
		Meteor.publish("prompts", function(){
			return Prompts.find();
		});
		Meteor.publish("myUsers", function(){
			return MyUsers.find();
		});
		Meteor.publish("roles", function(){
			return Roles.find();
		});
		Meteor.publish("groups", function(){
			return Groups.find();
		});
		Meteor.publish("groupTemplates", function(){
			return GroupTemplates.find();
		});
		Meteor.publish("userTypes", function(){
			return UserTypes.find();
		});
		Meteor.publish("filters", function(){
			return Filters.find();
		});
		Meteor.publish("sorters", function(){
			return Sorters.find();
		});				
		Meteor.publish("zoomPositions", function(){
			return ZoomPositions.find();
		});
		Meteor.publish("workflows", function(){
			return Workflows.find();
		});
		Meteor.publish("progresses", function(){
			return Progresses.find();
		});
		/*****************************************************************
		* Publish experimentModels.js collections
		******************************************************************/
		Meteor.publish("experiments", function(){
			return Experiments.find();
		});
		Meteor.publish("consents", function(){
			return Consents.find();
		});
		Meteor.publish("exp-variables", function(){
			return Variables.find();
		});
		Meteor.publish("exp-conditions", function(){
			return Conditions.find();
		});
		Meteor.publish("participants", function(){
			return Participants.find();
		});
		Meteor.publish("SurveyResponses", function(){
			return SurveyResponses.find();
		});
		Meteor.publish("fluencyMeasures", function() {
			return FluencyMeasures.find();
		});
		Meteor.publish("synthSubsets", function() {
			return SynthSubsets.find();
		});
		Meteor.publish("knowledgeTestResponses", function() {
			return KnowledgeTestResponses.find();
		});

		/*****************************************************************
		* Publish loggingModels.js collection
		******************************************************************/
		Meteor.publish("events", function(){
			return Events.find();
		});
		// subscribe to only events that are for that user (this improves performance) 
		Meteor.publish("userEvents", function(userID){
			return Events.find({userID: userID});
		});
		Meteor.publish("eventTypes", function(){
			return EventTypes.find();
		});
		/*****************************************************************
		* Publish notificationModels.js collection
		******************************************************************/
		Meteor.publish("inspirations", function(){
			return Inspirations.find();
		});
	}
});
