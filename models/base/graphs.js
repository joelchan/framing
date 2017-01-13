// Configure logger for Tools
var logger = new Logger('Models:Graphs');
// Comment out to use global logging level
//Logger.setLevel('Models:Graphs', 'trace');
//Logger.setLevel('Models:Graphs', 'debug');
Logger.setLevel('Models:Graphs', 'info');
//Logger.setLevel('Models:Graphs', 'warn');

Graphs = new Mongo.Collection("graphs");
Nodes = new Mongo.Collection("nodes");
Edges = new Mongo.Collection("edges");


/* list of minimum required fields for a given node type */
NODE_TYPES = {
  'idea': ['ideaID', 'content', 'time', 'vote', 'numVotes'],
  'theme': ['name', 'time', 'isTrash', 'isMerged', 
      'position', 'isCollapsed'],
  'forest_precluster': ['num_ideas', 'idea_node_ids', 'child_leaf_ids'],
  'forest_idea': ['ideaID', 'content', 'is_clustered'],
  'forest_leaf': ['label', 'idea_node_ids', 'child_leaf_ids'],
  'root': ['promptID'],
};

/* list of minimum required fields for a given edge type */
EDGE_TYPES = {
  'parent_child': ['parentID', 'childID'],
  'merged': ['sourceID', 'targetID'],
  'graph_link': ['sharedNodeID', 'userNodeID'],
  'similarity': ['cos'],
  'same_ideas': ['sourceID', 'targetID'],
};

/* list of known graph types thus far */
GRAPH_TYPES = [
  'user_graph', 'shared_graph', 'pre_forest', 'data_forest'
];

Graph = function(promptID, groupID, userID, type, data) {
  /********************************************************************
  * Graph constructor
  *
  * @Params
  *   promptID - The id of the prompt associated with this graph
  *   groupID - The id of the group associated with this graph
  *   userID - The id of the user associated with this graph (if at all)
  *   type - A string specifying a type for the graph
  *
  * @return {object} Graph object 
  ********************************************************************/
  this.promptID = promptID;
  this.groupID = groupID;
  if (userID) {
    this.userID = userID;
  } else {
    this.userID = null;
  }
  if (type) {
    this.type = type;
  } else if(userID) {
    this.type = "UserGraph";
  } else {
    this.type = "SharedGraph";
  }
  if (data) {
    // Add metadata fields if any are given
    var fields = Object.keys(data);
    for (var i=0; i<fields.length; i++) {
      this[fields[i]] = data[fields[i]];
    }
  }
  this.nodeIDs = [];
  this.edgeIDs = [];


};

GraphNode = function(graphID, promptID, type, data) {
  /********************************************************************
  * GraphNode constructor
  *
  * @params
  *   graph - the parent graph of this edge
  *   type - a string that matches a field in the NODE_TYPES enum
  *   data(optional) - a key-value object of additional metadata 
  *       to store as key-value pairs for the edge.
  *
  * @return {object} GraphNode object 
  ********************************************************************/
  this.graphID = graphID;
  this.promptID = promptID;
  this.type = type;
  if (data) {
    // Add metadata fields if any are given
    var fields = Object.keys(data);
    for (var i=0; i<fields.length; i++) {
      this[fields[i]] = data[fields[i]];
    }
  }
};

GraphEdge = function(type, promptID, sourceID, targetID, data) {
  /********************************************************************
  * GraphEdge constructor
  *
  * @params
  *   type - string used to classify the function of the edge
  *   source - the source node of the edge
  *   target - the destination node of the edge
  *   data(optional) - a key-value object of additional metadata 
  *       to store as key-value pairs for the edge.
  *
  * @return {object} GraphEdge object 
  ********************************************************************/
  //this.graphID = graph._id;
  this.type = type;
  this.promptID = promptID;
  this.sourceID = sourceID;
  this.targetID = targetID;
  this.nodeIDs = [sourceID, targetID];
  if (data) {
    var fields = Object.keys(data);
    for (var i=0; i<fields.length; i++) {
      this[fields[i]] = data[fields[i]];
    }
  }

};


getNodeChildren = function (parent) {
  logger.debug("getting children of node: " + JSON.stringify(parent));
  var edges = Edges.find({type: 'parent_child',
    parentID: parent._id
  });
  var childIDs = [];
  edges.forEach(function(edge) {
    childIDs.push(edge.childID);
  });
  logger.trace(childIDs);
  return Nodes.find({_id: {$in: childIDs}});
};
