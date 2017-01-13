// Configure logger for Filters
var logger = new Logger('Client:SynthesisV2:GraphManagers');
// Comment out to use global logging level
Logger.setLevel('Client:SynthesisV2:GraphManagers', 'trace');
//Logger.setLevel('Client:SynthesisV2:GraphManagers', 'debug');
//Logger.setLevel('Client:SynthesisV2:GraphManagers', 'info');
//Logger.setLevel('Client:SynthesisV2:GraphManagers', 'warn');


//Meteor.methods({
  ///****************************************************************
   //* Graph management functions
   //* *************************************************************/
  //graphCreate: function(promptID, groupID, userID) {
    ///*************************************************************
     //* Create a graph
     //* **********************************************************/
    //logger.debug("Creating new Graph");
    //var graph = new Graph(promptID, groupID, userID);
    //graph._id = Graphs.insert(graph);
    //return graph._id;
  //},
  //graphCreateNode: function(graphID, type, metadata) {
    ///*************************************************************
     //* Create a graph node
     //* **********************************************************/
    //logger.debug("Creating new Graph Node");
    //var node = createGraphNode(graphID, type, metadata);
    //return node._id;
  //},
  //graphCreateEdge: function(type, sourceID, targetID, metadata) {
    //logger.debug("Creating new Graph edge");
    //var g = Graphs.findOne({_id: graphID});
    //var edge = new GraphEdge(type, g.promptID, sourceID, targetID, metadata);
    //edge._id = Edges.insert(edge);
    //return edge._id;
  //},
  //graphDuplicateShared: function(nodeID, targetGraphID) {
    //logger.debug("Duplicate a given node into a graph");
    //var targetGraph = Graphs.findOne({_id: targetGraphID});
    //var node = Nodes.findOne({_id: nodeID});
    ////Check if node is in target graph
    //if (!isInList(node._id, targetGraph.nodeIDs)) {
      //logger.debug("node was not in graph");
      ////Remove fields unique for the node & shared graph
      //var fields = removeMember(Object.keys(node), '_id');
      //fields = removeMember(fields, 'graphID');
      //fields = removeMember(fields, 'type');
      //var data = {};
      //for (var i=0; i<fields.length; i++) {
        //data[fields[i]] = node[fields[i]];
      //}
      ////Create copy of node in target graph
      //var copy = createGraphNode(targetGraphID, node.type, data);
      ////Create copy edge
      //if (!Edges.findOne({$and: [{nodeIDs: node._id},
          //{nodeIDs: copy._id}]})) {
        //logger.debug("graph_link edge did not exist");
        //var g = Graphs.findOne({_id: graphID});
        //var edge = new GraphEdge('graph_link', g.promptID, node._id, copy._id, null);
        //edge._id = Edges.insert(edge);
      //} else {
        //logger.debug("graph_link edge exists already");
      //}
      //return node._id;
    //} else {
      //logger.warn("Node is already in target graph");
    //}
  //},
  //graphRemoveNodes: function(nodeIDs) {
    //var nodes = Nodes.find({_id: {$in: nodeIDs}});
    //if (hasForEach(nodes)) {
      //nodes.forEach(function(node) {
        //Nodes.remove({_id: node._id});
      //});
    //} else {
      //Nodes.remove({_id: nodes._id});
    //}
  //},
  //graphCreateIdeaNode: function(graphID, ideaID, metadata) {
    //var idea = Ideas.findOne({_id: ideaID});
    ////Only create node if a node for this idea doesn't exist in this graph
    //var result = Nodes.findOne({'graphID': graphID,'ideaID': idea._id})
    //if (!result) {
      //logger.debug("Creating a new node with an idea");
      //if (!metadata) {
        //metadata = {}
      //}
      //metadata['ideaID'] = idea._id;
      //metadata['content'] = idea.content;
      //metadata['time'] = idea.time;
      //metadata['vote'] = false;
      //return createGraphNode(graphID, 'idea', metadata);
    //} else {
      //logger.debug("Node already exists for this idea and graph");
      //return result._id;
    //}
  //},
  //graphCreateThemeNode: function(graphID, metadata) {
    //if (!metadata) {
      //metadata = {}
    //}
    //logger.debug("Creating a theme node");
    //if (!metadata['name']) {
      //metadata['name'] = "Not named yet";
    //}
    //metadata['time'] = new Date().getTime();
    //metadata['isTrash'] = false;
    //metadata['isMerged'] = false;
    //var jitterTop = 30 + getRandomInt(0, 30);
    //var jitterLeft = getRandomInt(0, 30);
    //metadata['position'] = {top: jitterTop , left: jitterLeft};
    //metadata['isCollapsed'] = false; //used only for clustering interface
    //logger.trace(metadata);
    //return createGraphNode(graphID, 'theme', metadata);
  //},
  //graphLinkChild: function(parentID, childID, metadata) {
    //logger.debug("Creating a new parent-child graph edge");
    //if (!metadata) {
      //metadata = {}
    //}
    //logger.trace(parentID);
    //logger.trace(childID);
    //metadata['parentID'] = parentID;
    //metadata['childID'] = childID;
    //logger.trace(metadata);
    //var g = Graphs.findOne({_id: graphID});
    //var edge = new GraphEdge('parent_child', g.promptID, parentID, childID, metadata);
    //edge._id = Edges.insert(edge);
    //return edge._id;
   // 
  //},
  //graphUnLinkChild: function(parentID, childID) {
    //logger.debug("Deleting parent-child graph edge");
    //Edges.remove({type: 'parent_child', 
      //'parentID': parentID,
      //'childID': childID,
    //});
  //},
  //graphUpdateNodeField: function(nodeID, data) {
    //logger.debug("Updated fields for a node");
    //var fields = Object.keys(data);
    //var node = Nodes.findOne({_id: nodeID});
    //for (var i=0; i<fields.length; i++) {
      //node[fields[i]] = data[fields[i]];
    //}
    //Nodes.update({_id: nodeID}, {$set: data});
  //},
   // 
//});
//
//
///*****************************************************************
 //*    Helper Functions
 //* ***************************************************************/
//
//createGraphNode = function(graphID, type, metadata) {
  //var g = Graphs.findOne({_id: graphID});
  //var node = new GraphNode(graphID, g.promptID, type, metadata);
  //node._id = Nodes.insert(node);
  //Graphs.update({_id: graphID}, {$push: {nodeIDs: node._id}});
  //return node;
//};


