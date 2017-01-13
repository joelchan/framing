/********************************************************************
 * Subscriptions for collections relevant to the core function of 
 * this module
********************************************************************/

Meteor.startup(function(){
		/************************************************************
		* Subscribe to tasks.js collection
		************************************************************/
		//Meteor.subscribe("tasks");
    Meteor.subscribe("dummyIdeas");
    Meteor.subscribe("dummyTasks");
});

