/********************************************************************
 * Publishing all the collections relevant to the current module.
 * Subscriptions are in the corresponding folder in the client module
 * or in Routes.js in the corresponding folder
********************************************************************/

Meteor.startup(function(){
  /*****************************************************************
  * Publish Task related collections
  ******************************************************************/
  Meteor.publish("graphs", function(){
	  return Graphs.find();
  });
  Meteor.publish("nodes", function(){
	  return Nodes.find();
  });
  Meteor.publish("edges", function(){
	  return Edges.find();
  });
});
