// Configure logger for Filters
var logger = new Logger('Model:SynthesisV2:GraphManagers');
// Comment out to use global logging level
Logger.setLevel('Model:SynthesisV2:GraphManagers', 'trace');
//Logger.setLevel('Model:SynthesisV2:GraphManagers', 'debug');
//Logger.setLevel('Model:SynthesisV2:GraphManagers', 'info');
//Logger.setLevel('Model:SynthesisV2:GraphManagers', 'warn');




/*****************************************************************
 *    Helper Functions
 * ***************************************************************/
GraphManager = (function() {
  return {
    createGraph: function(prompt, group, user, type, metadata) {
      /*************************************************************
      * Create a graph
      * **********************************************************/
      console.log("Creating new Graph");
      var graph = new Graph(prompt._id, group._id, user._id, type, metadata);
      graph._id = Graphs.insert(graph);
      return graph._id;
    },

    createGraphNode: function(graphID, type, metadata) {
      var g = Graphs.findOne({_id: graphID});
      var node = new GraphNode(graphID, g.promptID, type, metadata);
      node._id = Nodes.insert(node);
      Graphs.update({_id: graphID}, {$push: {nodeIDs: node._id}});
      return node;
    },

    createEdge: function(type, source, target, metadata) {
      logger.debug("Creating new Graph edge");
      var edge = new GraphEdge(type, 
          source.promptID, source._id, target._id, metadata);
      edge._id = Edges.insert(edge);
      return edge._id;
    },
   
    updateVotes: function (nodeID) {
      logger.debug("Updating votes for node: " + nodeID);
      var ideaNode = Nodes.findOne({_id: nodeID});
      //Quick Hack, needs to eventually match user group
      var count = Nodes.find({type: 'idea', 
        ideaID: ideaNode.ideaID,
        vote: true
      }).count();
      logger.debug("Updating votes on nodes to: " + count);
      Nodes.update({type: 'idea', ideaID: ideaNode.ideaID},
          {$set: {'numVotes': count}},
          {multi: true}
      );
      return count;
    },

    initiatePreforest: function(prompt) {
      //Check if preforest graph already exists
      var g = Graphs.find({type: 'data_forest', promptID: prompt._id})
      if (g.count() == 0) {
        GraphManager.
        Prompts.update({_id: prompt._id}, 
            {$set: {startedForest: true}}
        );
         
      } else {
        logger.warn("Prompt has probably already been processed");
        Prompts.update({_id: prompt._id}, 
            {$set: {startedForest: true}}
        );
      }
    },
   
    getLinkedNodes: function (nodeID) {
      logger.debug("Retrieving list of linked Node IDs");
      //Get shared node
      var shared = Edges.findOne({type: 'graph_link', userNodeID: nodeID});
      if (!shared) {
        logger.debug("Given node is not a user node, looking for shared node");
        shared = Edges.findOne({type: 'graph_link', sharedNodeID: nodeID});
      }
      var links = Edges.find({$and: [{type: 'graph_link'},
          {sharedNodeID: shared.sharedNodeID}
      ]});
      // Filtering edges for nodeIDs
      logger.trace("Num of relevant edges found: " + links.count());
      var linkIDs = getValsFromField(links, 'userNodeID');
      //linkIDs = _.difference(_.uniq(linkIDs), [nodeID]);
      logger.trace("List of linked nodes: " + JSON.stringify(linkIDs));
      return linkIDs;
    },
   
   
    createIdeaNode: function(idea, graph) {
      logger.debug("creating node for idea");
      //Only create node if a node for this idea doesn't exist in this graph
      var result = Nodes.findOne({'graphID': graph._id,'ideaID': idea._id})
      if (!result) {
        logger.debug("Creating a new node with an idea");
        metadata = {};
        metadata['ideaID'] = idea._id;
        metadata['content'] = idea.content;
        metadata['time'] = idea.time;
        metadata['vote'] = false;
        metadata['numVotes'] = 0;
        return this.createGraphNode(graph._id, 'idea', metadata);
      } else {
        logger.debug("Node already exists for this idea and graph");
        return result._id;
      }
    },
   
    graphUnion: function (graphID, userID, groupID) {
      /******************************************************************
      * Creates a naive union of a given graph using its linked shared 
      * graphs.
      *
      * @params
      *    graphID - The ID of the shared graph
      *    userID - The userID of the user generating the union
      *    groupID - The groupID of the group working on the prompt
      * @return
      *    null
      *****************************************************************/
      var graph = Graphs.findOne({_id: graphID});
      var group = Groups.findOne({_id: groupID});
      var groupUserIDs = getIDs(group.users);
      //Generate Idea Nodes
      logger.debug("Generating Idea Nodes for given graph");
      logger.trace("userIDs: " + JSON.stringify(groupUserIDs));
      var ideaNodes = Nodes.find({type: "idea", 
        promptID: graph.promptID,
        graphID: graphID});
      logger.trace("Num Idea Nodes: " + ideaNodes.count());
      var ideas = Ideas.find({promptID: graph.promptID,
        userID: {$in: groupUserIDs},
        _id: {$nin: getValsFromField(ideaNodes, 'ideaID')}
      });
      logger.trace("Num matching Ideas: " + ideas.count());
      if (ideas) {
        ideas.forEach(function(idea) {
          this.createIdeaNode(idea, graph);
        });
      }
      //Go through each theme node and attach ideas
      logger.debug("Connect ideas to each node");
      var themeNodes = Nodes.find({type: "theme",
        promptID: graph.promptID,
        graphID: graph._id
      });
      logger.debug("Num of theme nodes graph: " + themeNodes.count());
      themeNodes.forEach(function(theme) {
        logger.debug("Appending linked ideas to theme node id: " + theme._id);
        //Get all linked nodes
        var linkedEdges = Edges.find({type: 'graph_link',
          sharedNodeID: theme._id
        });
        var linkedNodeIDs = getValsFromField(linkedEdges, 'userNodeID');
        //Get all ideas for all linked nodes
        var childEdges = Edges.find({type: 'parent_child',
          parentID: {$in: linkedNodeIDs}
        });
        var ideaNodeIDs = _.uniq(getValsFromField(childEdges, 'childID'));
        var ideaNodes = Nodes.find({_id: {$in: ideaNodeIDs}});
        var ideaIDs = getValsFromField(ideaNodes, 'ideaID');
        //Get matching nodes within current graph for each idea
        var sharedIdeaNodes = Nodes.find({type: "idea",
          graphID: graphID,
          ideaID: {$in: ideaIDs}
        });
        sharedIdeaNodes.forEach(function(ideaNode) {
          logger.debug("Linking ideanode to current theme");
          Meteor.call("graphLinkChild", 
              graphID, theme._id, ideaNode._id, null,
            function(error, newLinkID) {
              logger.debug("Created new Parent/child link");
            }
          );
   
        });
       
      });
    },
  };
}());
   
