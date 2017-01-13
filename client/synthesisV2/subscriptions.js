/********************************************************************
 * Subscriptions for collections relevant to the core function of 
 * this module
********************************************************************/

Meteor.startup(function(){
		/************************************************************
		* Subscribe to all graph related collections
		************************************************************/
		Meteor.subscribe("graphs");
		Meteor.subscribe("nodes");
		Meteor.subscribe("edges");

});

