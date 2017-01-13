// Configure logger for Filters
var logger = new Logger('Server:SynthesisV2:GraphManagers');
// Comment out to use global logging level
// Logger.setLevel('Server:SynthesisV2:GraphManagers', 'trace');
//Logger.setLevel('Server:SynthesisV2:GraphManagers', 'debug');
Logger.setLevel('Server:SynthesisV2:GraphManagers', 'info');
//Logger.setLevel('Server:SynthesisV2:GraphManagers', 'warn');

// Meteor.startup(function() {
  // /****************************************************************
   // * Setup idea listener to create idea nodes in the shared graph
   // * for all ideas in a prompt
   // * ************************************************************/
  // logger.debug("Setting up prompt idea listener");
  // var ideaNodes = Nodes.find({type: 'idea'});
  // var ideaNodeIDs = getValsFromField(ideaNodes, 'ideaID');
  // var prompts = Prompts.find().observe({
    // added: function(prompt) {
      // logger.trace("Setting up listener for prompt with id: " + 
          // JSON.stringify(prompt._id));
      // var groupID = prompt.groupIDs[0];
      // if (!groupID) {
        // groupID = '0';
      // }
    //  
      // var sharedGraph = Graphs.findOne({'promptID': prompt._id, userID: null});
      // logger.trace("Shared Graph: " + JSON.stringify(sharedGraph));
      // if (!sharedGraph) {
        // logger.info("No shared graph found.  Initializing new graph");
        // sharedGraph = GraphManager.createGraph(prompt._id, groupID, '')
      // }
 //  
      // logger.trace("appending ideas to shared graph with id: " + 
          // JSON.stringify(sharedGraph));
    //  
      // Ideas.find({_id: {$nin: ideaNodeIDs}, 'promptID': prompt._id}).
        // observe({
          // added: function(idea) {
            // //logger.debug("New Idea added. Adding matching node to graph");
            // //GraphManager.createIdeaNode(idea, sharedGraph);
        // }
      // });
    // },
// 
  // });
// 
// });

Meteor.methods({
  /****************************************************************
   * Graph management functions
   * *************************************************************/
  graphCreate: function(promptID, groupID, userID) {
    /*************************************************************
     * Create a graph
     * **********************************************************/
    console.log("Creating new Graph");
    var graph = new Graph(promptID, groupID, userID);
    graph._id = Graphs.insert(graph);
    return graph._id;
  },
  graphCreateNode: function(graphID, type, metadata) {
    /*************************************************************
     * Create a graph node
     * **********************************************************/
    logger.debug("Creating new Graph Node");
    var node = GraphManager.createGraphNode(graphID, type, metadata);
    return node._id;
  },
  graphCreateEdge: function(type, sourceID, targetID, metadata) {
    logger.debug("Creating new Graph edge");
    var g = Graphs.findOne({_id: graphID});
    var edge = new GraphEdge(type, g.promptID, sourceID, targetID, metadata);
    edge._id = Edges.insert(edge);
    return edge._id;
  },
  graphDuplicateShared: function(nodeID, targetGraphID) {
    logger.debug("Duplicate a given node into a graph");
    var targetGraph = Graphs.findOne({_id: targetGraphID});
    var node = Nodes.findOne({_id: nodeID});
    //Check if node is in target graph
    if (!isInList(node._id, targetGraph.nodeIDs)) {
      logger.debug("node was not in graph");
      //Remove fields unique for the node & shared graph
      var fields = removeMember(Object.keys(node), '_id');
      fields = removeMember(fields, 'graphID');
      fields = removeMember(fields, 'type');
      var data = {};
      for (var i=0; i<fields.length; i++) {
        data[fields[i]] = node[fields[i]];
      }
      //Create copy of node in target graph
      var copy = GraphManager.createGraphNode(targetGraphID, node.type, data);
      //Create copy edge
      if (!Edges.findOne({$and: [{nodeIDs: node._id},
          {nodeIDs: copy._id}]})) {
        logger.debug("graph_link edge did not exist");
        var g = Graphs.findOne({_id: targetGraphID});
        var metadata = {};
        metadata['sharedNodeID'] = node._id;
        metadata['userNodeID'] = copy._id; 
        var edge = new GraphEdge('graph_link', g.promptID, node._id, copy._id, metadata);
        edge._id = Edges.insert(edge);
      } else {
        logger.debug("graph_link edge exists already");
      }
      return node._id;
    } else {
      logger.warn("Node is already in target graph");
    }
  },
  graphRemoveNodes: function(nodeIDs) {
    var nodes = Nodes.find({_id: {$in: nodeIDs}});
    if (hasForEach(nodes)) {
      nodes.forEach(function(node) {
        Nodes.remove({_id: node._id});
      });
    } else {
      Nodes.remove({_id: nodes._id});
    }
  },
  graphCreateIdeaNode: function(graphID, ideaID, metadata) {
    var idea = Ideas.findOne({_id: ideaID});
    //Only create node if a node for this idea doesn't exist in this graph
    var result = Nodes.findOne({'graphID': graphID,'ideaID': idea._id})
    if (!result) {
      logger.debug("Creating a new node with an idea");
      if (!metadata) {
        metadata = {}
      }
      metadata['ideaID'] = idea._id;
      metadata['content'] = idea.content;
      metadata['time'] = idea.time;
      metadata['vote'] = false;
      metadata['numVotes'] = 0;
      return GraphManager.createGraphNode(graphID, 'idea', metadata);
    } else {
      logger.debug("Node already exists for this idea and graph");
      return result._id;
    }
  },
  graphCreateThemeNode: function(graphID, metadata) {
    if (!metadata) {
      metadata = {}
    }
    logger.debug("Creating a theme node");
    if (!metadata['name']) {
      metadata['name'] = "Not named yet";
    }
    metadata['time'] = new Date().getTime();
    metadata['isTrash'] = false;
    metadata['isMerged'] = false;
    var jitterTop = 30 + getRandomInt(0, 30);
    var jitterLeft = getRandomInt(0, 30);
    metadata['position'] = {top: jitterTop , left: jitterLeft};
    metadata['isCollapsed'] = false; //used only for clustering interface
    logger.trace(metadata);
    return GraphManager.createGraphNode(graphID, 'theme', metadata);
  },
  graphLinkChild: function(parentGraphID, parentID, childID, metadata) {
    logger.debug("Creating a new parent-child graph edge");
    if (!metadata) {
      metadata = {}
    }
    logger.trace(parentID);
    logger.trace(childID);
    metadata['parentID'] = parentID;
    metadata['childID'] = childID;
    logger.trace(metadata);
    var g = Graphs.findOne({_id: parentGraphID});
    var edge = new GraphEdge('parent_child', g.promptID, parentID, childID, metadata);
    edge._id = Edges.insert(edge);
    return edge._id;
    
  },
  graphUnlinkChild: function(parentID, childID) {
    logger.debug("Deleting parent-child graph edge");
    Edges.remove({type: 'parent_child', 
      'parentID': parentID,
      'childID': childID,
    });
  },
  graphUpdateNodeField: function(nodeID, data) {
    logger.debug("Updated fields for a node");
    var fields = Object.keys(data);
    var node = Nodes.findOne({_id: nodeID});
    for (var i=0; i<fields.length; i++) {
      node[fields[i]] = data[fields[i]];
    }
    Nodes.update({_id: nodeID}, {$set: data});
  },

  graphIdeaListener: function(graphID, userIDs, promptID) {
    //Get user graph
    var userGraph = Graphs.findOne({_id: graphID});
    var nodes = Nodes.find({'graphID': graphID});
    var ideaIDs = getValsFromField(nodes, 'ideaID');
    logger.trace("IdeaIDs already in graph at load time");
    logger.trace(ideaIDs);
    //var currentListener = Session.get("ideaObserver");
    logger.debug("Setting Idea Observer");
    var observer = Ideas.find({$and: [
        {userID: {$in: userIDs}},
        {'promptID': promptID},
        {_id: {$nin: ideaIDs}} ]}).observe({
      added: function(idea) {
        logger.debug("Creating Node for new idea");
        logger.trace("Current graph for node: " + graphID);
        createIdeaNode(idea, userGraph);
      },
    });
  },
  graphNaiveUnion: function(graphID, userID, groupID) {
    logger.debug("Naive Union");
    GraphManager.graphUnion(graphID, userID, groupID);
  },
  graphUpdateIdeaVotes: function(nodeID) {
    return GraphManager.updateVotes(nodeID);
  },
  clusterUpdatePsnByUser: function(cluster, position, user) {
    Clusters.update({_id: clusterDoc._id},
      {$set: {'zoomPosition.$': 
        {userID: user._id, top: position.top, left: position.left}}})
  }
    
});


