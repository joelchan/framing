// Configure logger for Filters
var logger = new Logger('Model:Managers:ForestManager');
// Comment out to use global logging level
Logger.setLevel('Model:Managers:ForestManager', 'trace');
// Logger.setLevel('Model:Managers:ForestManager', 'debug');
// Logger.setLevel('Model:Managers:ForestManager', 'info');
// Logger.setLevel('Model:Managers:ForestManager', 'warn');


ForestManager = (function() {
  /******************************************************************
   * Manager to assist with data management of data forest graph
   * where there are 2 types of "nodes", idea nodes & idea instances
   ****************************************************************/
  return {
    initForest: function(prompt) {
      var group = Groups.findOne({_id: prompt.groupIDs[0]});
      var user = Session.get("currentUser");
      var type = "data_forest";
      var data = {is_processed: false};
      graphID = GraphManager.createGraph(
          prompt, group, user, type, data
      );
      Prompts.update(
        {_id: prompt._id}, 
        {$set: {forestGraphID: graphID}}
      );
      //Setup root node of the forest
      GraphManager.createGraphNode(graphID, 'root', 
          {'child_leaf_ids': []}
      );
    },
    createIdeaNode: function(ideas, label) {
      /**************************************************************
       * Create a idea node which acts as a representation of 
       * semantically equivalent ideas
       *************************************************************/
      logger.debug("Creating a new Idea Node");
      var graphID = ideas[0].graphID;
      var promptID = ideas[0].promptID;
      var type = "forest_leaf";
      //var ideaIDs = [];
      //for (var i=0; i<ideas.length; i++) {
        //ideaIDs.push(ideas[i]['_id']);
      //}
      if (typeof label === undefined) {
        label = "";
      }

      data = {'label': label,
        'idea_node_ids': [],
        'child_leaf_ids': []};
      var idea_node = GraphManager.createGraphNode(graphID, type, data);
      if (ideas) {
        if (!hasForEach(ideas)) {
          ideas = [ideas];
        }
        //Connect idea instance to idea node
        this.groupIdeas(ideas, idea_node);
      }

      return Nodes.findOne({_id: idea_node._id});
    },
    renameNode: function(node, name) {
      /*************************************************************
       * Rename the node
       ************************************************************/ 
      Nodes.update({_id: node._id}, {$set: {label: name}});
      return Nodes.findOne({_id: node._id});
    },
      
    groupIdeas: function(ideas, idea_node) {
      /*************************************************************
       * Connect the idea instances to the idea node in the forest
       ************************************************************/ 
      // var type = "same_ideas";
      if (!hasForEach(ideas)) {
        ideas = [ideas];
      }
      if (ideas.length > 0) { 
        logger.debug("connecting idea instances to idea node with id: " +
            idea_node._id);
        var ideaIDs = [];
        for (var i=0; i<ideas.length; i++) {
          // GraphManager.createEdge(type, idea_node, ideas[i], data);
          ideaIDs.push(ideas[i]['_id']);
        }
        logger.trace("Connecting instances with ids: " + JSON.stringify(ideaIDs));
        logger.trace("Before update: " + 
            JSON.stringify(Nodes.findOne({_id: idea_node._id})));
        Nodes.update({_id: idea_node._id}, 
            {$addToSet: {idea_node_ids: {$each: ideaIDs}}});
        logger.trace("After update: " + 
            JSON.stringify(Nodes.findOne({_id: idea_node._id})));
        // Mark idea nodes as clustered
        if (Meteor.isServer) {
          Nodes.update({_id: {$in: ideaIDs}},{$set: {is_clustered: true}});
        } else {
          for (var i=0; i<ideas.length; i++) {
            Nodes.update({_id: ideas[i]['_id']},{$set: {is_clustered: true}});
          }
        }
      }
    },
    insertToTree: function(parent, child) {
      Nodes.update({_id: parent._id}, 
          {$addToSet: {child_leaf_ids: child._id}});
    },
    removeTree: function(t) {
      var tree = Nodes.findOne({_id: t._id});
      //Get Parent of tree
      var parent = Nodes.findOne({child_leaf_ids: tree._id});
      //Move Children to parent
      var children = Nodes.find({_id: {$in: tree.child_leaf_ids}});
      children.forEach(function(child) {
        ForestManager.insertToTree(parent, child);
      });
      //Uncluster child ideas
      tree['idea_node_ids'].forEach(function(id) {
        Nodes.update({_id: id},{$set: {is_clustered: false}});
      });
      //Remove tree from forest
      this.removeFromTree(parent, tree);
      Nodes.remove({_id: tree._id});
    },
    removeFromTree: function(parent, child) {
      Nodes.update({_id: parent._id}, 
          {$pull: {child_leaf_ids: child._id}});
    },
    getInstanceIdeas: function(node, sorter) {
      /*************************************************************
       * Get children ideas of a given idea node
       *************************************************************/
      // var childEdges = Edges.find({type: "same_ideas",
        // sourceID: node['_id']});
      // logger.trace("Found children edges: " + JSON.stringify(childEdges.fetch()));
      // var childIDs = getValsFromField(childEdges, 'targetID');
      if (node) {
        var node = Nodes.findOne({_id: node._id});
        var children = []
        if (node.idea_node_ids.length > 0) {
          if (sorter) {
            children =  Nodes.find({_id: {$in: node.idea_node_ids}}, 
                {sort: sorter}
            ).fetch()
          } else {
            children =  Nodes.find({_id: {$in: node.idea_node_ids}}).fetch()
          }
        }
        logger.trace("Found children nodes: " + JSON.stringify(children));
        return children;
      } else {
        return []
      }
    },
    getNodeChildren: function(node, sorter) {
      /*************************************************************
       * Get children nodes of a given idea node
       *************************************************************/
      // var childEdges = Edges.find({type: "parent_child",
        // sourceID: node['_id']});
      // logger.trace("Found children edges: " + JSON.stringify(childEdges.fetch()));
      // var childIDs = getValsFromField(childEdges, 'targetID');
      if (node) {
        var node = Nodes.findOne({_id: node._id});
        var children = [];
        if (node.child_leaf_ids.length > 0) {
          if (sorter) {
            children =  Nodes.find({_id: {$in: node.child_leaf_ids}}, 
                  {sort: sorter}
            ).fetch()
          } else {
            children =  Nodes.find({_id: {$in: node.child_leaf_ids}}).fetch()
          }
        }
        logger.trace("Found children nodes: " + JSON.stringify(children));
        return children;
      } else {
        return []
      }
    },
    getNodeName: function(n) {
      /*************************************************************
       * Get the name of the node from the label, and then from
       * the first child instance in an alphabetical sort search, 
       * and then from the first child node (recursive)
       *************************************************************/
      if (n) {
        var node = Nodes.findOne({_id: n._id});
        if (node['label'] != undefined && node['label'] != "") {
          return node['label'];
        } else {
          var instances = this.getInstanceIdeas(node);
          // Use the name of the first idea
          if (instances.length > 0) {
            return instances[0]['content']
          } else {
            //recurse on the first node
            var nodes = this.getNodeChildren(node);
            return this.getNodeName(nodes[0]);
          }
        }
      } else {
        return "";
      }

    },
    mergeNodes: function(sourceNode, targetNode) {
      /*************************************************************
       * Merge sourceNode into targetNode
       * This means all ideas are now part of the targetNode
       * AND we destroy the sourceNode
       * so that it's not dangling off by itself, separate from the forest
       *************************************************************/
      // Transfer children and idea information to targetNode
      Nodes.update({_id: targetNode._id}, 
        {$addToSet: {'child_leaf_ids': {$each: sourceNode.child_leaf_ids}},
          $addToSet: {'idea_node_ids': {$each: sourceNode.idea_node_ids}}})
      // Transfer parent information from sourceNode to targetNode
      if (Meteor.isServer) {
        // have the parents of the sourceNode also now point to the targetNode
        Nodes.update({'child_leaf_ids': sourceNode._id}, 
            {$addToSet: {child_leaf_ids: targetNode._id}});
        // and detach the sourceNode from its parents
        Nodes.update({'child_leaf_ids': sourceNode._id}, 
            {$pull: {child_leaf_ids: sourceNode._id}});
      } else {
        var parents = Nodes.find({'child_leaf_ids': sourceNode._id});
        parents.forEach(function (parent) {
          // have this sourceNode parent point to the targetNode
          Nodes.update({_id: parent._id}, 
              {$addToSet: {child_leaf_ids: targetNode._id}});
          // and detach the sourceNode from this parent
          Nodes.update({_id: parent._id}, 
              {$pull: {child_leaf_ids: sourceNode._id}});
        });
      }
      // Destroy the sourceNode (to clean up)
      Nodes.remove({_id: sourceNode._id});

    },
    swapNodes: function(n1, n2) {
      /*************************************************************
       * Swap the two idea nodes, substituting edges
       * with node2._id with node1._id and vice-versa
       *************************************************************/
      
      // get node1 data
      var node1 = Nodes.findOne({_id: n1._id});
      node1Children = node1.child_leaf_ids
      // node1Ideas = node1.idea_node_ids
      node1Content = node1.content
      
      // get node2 data
      var node2 = Nodes.findOne({_id: n2._id});
      node2Children = node2.child_leaf_ids
      // node2Ideas = node2.idea_node_ids
      node2Content = node2.content

      //Swap the children  of the nodes
      Nodes.update({_id: node1._id}, 
         {$set: {'child_leaf_ids': node2Children, 
             // 'idea_node_ids': node2Ideas
      }})
      Nodes.update({_id: node2._id}, 
         {$set: {'child_leaf_ids': node1Children, 
             // 'idea_node_ids': node1Ideas
      }})
      
      //Swap parent refs of each node
      var n1Parents = Nodes.find({child_leaf_ids: node1._id});
      var n2Parents = Nodes.find({child_leaf_ids: node2._id});
      n1Parents.forEach(function(p) {
        Nodes.update({_id: p._id}, 
            {$push: {child_leaf_ids: node2._id}}
        );
        Nodes.update({_id: p._id}, 
            {$pull: {child_leaf_ids: node1._id}}
        );
      });
      n2Parents.forEach(function(p) {
        Nodes.update({_id: p._id}, 
            {$push: {child_leaf_ids: node1._id}}
        );
        Nodes.update({_id: p._id}, 
            {$pull: {child_leaf_ids: node2._id}}
        );
      });

    },
    createArtificialParent: function(n, label) {
      /*************************************************************
       * Create a node as parent of given node with no ideas linked
       * **********************************************************/
      logger.debug("Creating an artificial Idea Node");
      var node = Nodes.findOne({_id: n._id});
      var graphID = node.graphID;
      var promptID = node.promptID;
      var type = "forest_leaf";
      if (typeof label === undefined) {
        label = "";
      }
      data = {'label': label,
        'idea_node_ids': [],
        'child_leaf_ids': [node._id]};
      var an = GraphManager.createGraphNode(graphID, type, data);
      logger.trace("Artificial node created: " + JSON.stringify(an));
      if (Meteor.isServer) {
        logger.debug("Updating tree for artificial node on server");
        Nodes.update({'child_leaf_ids': node._id}, 
          {$push: {child_leaf_ids: an._id}});
        Nodes.update({'child_leaf_ids': node1._id}, 
          {$pull: {child_leaf_ids: node._id}});
      } else {
        logger.debug("Updating tree for artificial node on client");
        var parents = Nodes.find({$and: [
            {'child_leaf_ids': node._id},
            {'_id': {$ne: an._id}}
        ]});
        parents.forEach(function(parent) {
          logger.trace("Updating parent of node1: " + JSON.stringify(parent));

          Nodes.update({_id: parent._id}, 
            {$push: {child_leaf_ids: an._id}});
          Nodes.update({_id: parent._id}, 
            {$pull: {child_leaf_ids: node._id}});
        });
      }

      return Nodes.findOne({_id: an._id});

    },
    createArtificialNode: function(n1, n2, label) {
      /*************************************************************
       * Create a parent node with no instance children with the
       * given nodes as node children
       *************************************************************/
      logger.debug("Creating an artificial Idea Node");
      var node1 = Nodes.findOne({_id: n1._id});
      var node2 = Nodes.findOne({_id: n2._id});
      var graphID = node1.graphID;
      var promptID = node1.promptID;
      var type = "forest_leaf";
      if (typeof label === undefined) {
        label = "";
      }

      data = {'label': label,
        'idea_node_ids': [],
        'child_leaf_ids': [node1._id, node2._id]};
      var an = GraphManager.createGraphNode(graphID, type, data);
      logger.trace("Artificial node created: " + JSON.stringify(an));
      //Update parents of node1 to point to the new node 
      if (Meteor.isServer) {
        logger.debug("Updating tree for artificial node on server");
        Nodes.update({'child_leaf_ids': node1._id}, 
          {$push: {child_leaf_ids: an._id}});
        Nodes.update({'child_leaf_ids': node1._id}, 
          {$pull: {child_leaf_ids: node1._id}});
      } else {
        logger.debug("Updating tree for artificial node on client");
        var parents = Nodes.find({$and: [
            {'child_leaf_ids': node1._id},
            {'_id': {$ne: an._id}}
        ]});
        parents.forEach(function(parent) {
          logger.trace("Updating parent of node1: " + JSON.stringify(parent));

          Nodes.update({_id: parent._id}, 
            {$push: {child_leaf_ids: an._id}});
          Nodes.update({_id: parent._id}, 
            {$pull: {child_leaf_ids: node1._id}});
        });

      }

      return Nodes.findOne({_id: an._id});
    },
    findOrphans: function() {
      /*************************************************************
       * Find and return any orphan nodes (not attached to the tree)
       * Returns empty list if there aren't any
       *************************************************************/
      orphanLeaves = []
      allLeaves = Nodes.find({type: "forest_leaf"}).fetch();
      allLeaves.forEach(function(leaf) {
        retrievedParent = Nodes.findOne({child_leaf_ids: leaf._id});
        logger.trace("Found a parent: " + JSON.stringify(retrievedParent));
        if (!retrievedParent && !isInList(leaf, orphanLeaves)) {
          orphanLeaves.push(leaf);
        }
      });
      return orphanLeaves;
    },
    cleanOrphans: function() {
      /*************************************************************
       * Clean up the orphans
       *************************************************************/
       orphanLeaves = this.findOrphans();
       if (orphanLeaves.length > 0) {
        logger.debug("Cleaning up " + orphanLeaves.length + " orphan leaves");
        logger.trace("Orphan leaves: " + JSON.stringify(orphanLeaves));
        orphanLeaves.forEach(function(orphanLeaf) {

          if (orphanLeaf.child_leaf_ids.length < 1) {
            // remove idea_node_ids from the cluster
            idea_node_ids = orphanLeaf.idea_node_ids
            idea_node_ids.forEach(function(idea_node_id) {
              Nodes.update({_id: orphanLeaf._id},
                            {$pull: {idea_node_ids: idea_node_id}});
            });
            // set them as unclustered
            idea_node_ids.forEach(function(idea_node_id) {
              Nodes.update({_id: idea_node_id},
                            {$set: {is_clustered: false}});
            });
            // destroy the orphan
            Nodes.remove({_id: orphanLeaf._id});
          } else {
            logger.debug("Has children but no parents - not destroying this leaf");
            logger.trace(JSON.stringify(orphanLeaf));
          }
          
        });
       } else {
        logger.debug("No orphan leaves");
       }
    },
    moveNodeInTree: function(nodesToMove, dest) {
      /**************************************************************
       * Move a node in the tree from a source parent node
       * to a destination parent node
       * @Params
       *    nodesToMove - array of ids of nodes to be moved
       *    dest - id of the desired (destination) parent node
       * ***********************************************************/
       
       destParent = Nodes.findOne({_id: dest});

       nodesToMove.forEach(function(toMove) {
        currentNode = Nodes.findOne({_id: toMove});
        currentParent = Nodes.findOne({child_leaf_ids: toMove});
        ForestManager.removeFromTree(currentParent, currentNode);
        ForestManager.insertToTree(destParent, currentNode);
       });
    },
    clusteredIdeasNotOnTree: function() {
      /**************************************************************
       * Convenience function for debugging
       * We want to know if there are any ideas incorrectly marked
       * as clustered (i.e., is_clustered = false, but they are actually
       * NOT attached to a leaf on the tree)
       * ***********************************************************/
      clusteredButNotOnTree = []
      clusteredIdeas = Nodes.find({type: "forest_idea", is_clustered: true}).fetch()
      clusteredIdeas.forEach(function(idea) {
        // get the parent leaf
        parentLeaves = Nodes.find({type: "forest_leaf", idea_node_ids: idea._id}).fetch();
        if (parentLeaves.length < 1 && clusteredButNotOnTree.indexOf(idea) < 0) {
          clusteredButNotOnTree.push(idea);
        }
      });
      return clusteredButNotOnTree;
    },

    unclusteredIdeasOnTree: function() {
      /**************************************************************
       * Convenience function for debugging
       * We want to know if there are any ideas incorrectly marked
       * as unclustered (i.e., is_clustered = false, but they nevertheless
       * are attached to a leaf on the tree)
       * ***********************************************************/
      unclusteredButOnTree = []
      unclusteredIdeas = Nodes.find({type: "forest_idea", is_clustered: false}).fetch()
      unclusteredIdeas.forEach(function(idea) {
        parentLeaves = Nodes.find({type: "forest_leaf", idea_node_ids: idea._id}).fetch();
        if (parentLeaves.length > 0 && unclusteredButOnTree.indexOf(idea) < 0) {
           unclusteredButOnTree.push(idea);
        }
      });
      return unclusteredButOnTree;
    },

    multipleParentLeaves: function() {
      /**************************************************************
       * Convenience function for debugging
       * Find ideas that are attached to more than one leaf
       * ***********************************************************/
       ideas = Nodes.find({type: "forest_idea"}).fetch()
       multipleParentIdeas = []
       ideas.forEach(function(idea) {
        parents = Nodes.find({idea_node_ids: idea._id, type: "forest_leaf"}).fetch();
        if (parents.length > 1 && multipleParentIdeas.indexOf(ideas) < 0) {
          multipleParentIdeas.push(idea);
        }
       });
       return multipleParentIdeas;
    }

  };
}());
