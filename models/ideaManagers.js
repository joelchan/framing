// Configure logger for Filters
var logger = new Logger('Model:Managers');
// Comment out to use global logging level
 Logger.setLevel('Model:Managers', 'trace');
//Logger.setLevel('Model:Managers', 'debug');
//Logger.setLevel('Model:Managers', 'info');
//Logger.setLevel('Model:Managers', 'warn');

IdeaFactory = (function() {
  return {
    create: function(content, user, prompt, isDummy) {
      logger.trace("Creating new Idea");
      var trimmed = removeCR(content);
      if (trimmed !== "") {
        var idea = new Idea(trimmed, user, prompt);
          if (isDummy) {
              logger.trace("Creating new DUMMY Idea");
              idea._id = DummyIdeas.insert(idea);
          }
          else {
            logger.trace("Creating new Idea");
            idea._id = Ideas.insert(idea);
          }
        return idea;
      }
    },
    toggleGameChanger: function(idea) {
      idea.isGamechanger = !idea.isGamechanger;
      Ideas.update({_id: idea._id}, 
        {$set: {isGamechanger: idea.isGamechanger}
      });
    },
    upVote: function(idea, user) {
      idea.votes.push(user._id);
      Ideas.update({_id: idea._id}, 
        {$push: {votes: user._id}});
    },
    downVote: function(idea, user) {
      removeMember(idea.votes, user._id)
      Ideas.update({_id: idea._id}, 
        {$pull: {votes: user._id}});
    },
    read: function(idea, user) {
      // idea.readIDs.push(user._id);
       Ideas.update({_id: idea._id},
        {$push: {readIDs: user._id}});
    },
    removeRead: function(idea, user) {
      // idea.readIDs.push(user._id);
      Ideas.update({_id: idea._id},
        {$pull: {readIDs: user._id}});
    },
    getWithIDs: function(ids) {
      if (hasForEach(ids)) {
        return Ideas.find({_id: {$in: ids}});
      } else {
        return Ideas.findOne({_id: ids});
      }
    },
    
    //Generates test cards 
    createDummy: function(user, prompt, num) {          
      if (!num) {
        num = 1;
      }

      logger.trace("Creating Dummy Ideas: #" + num);
      var content;
      var ideas = [];
      for (var i=0; i<num; i++) {
       
      var content = "Creating a dummy list element. # " + i;
        ideas.push(this.create(content, user, prompt));
      }
       return ideas;
    },
    remove: function(ideas) {
      if (hasForEach(ideas)) {
        ids = getIDs(ideas);
        //for (var i=0; i<ideas.length; i++) {
          //ids.push(ideas._id);
        //} 
        if (Meteor.isServer) {
          Ideas.remove({_id: {$in: ids}});
        } else {
          ids.forEach(function(id) {
            Ideas.remove({_id: id});
          });
        }
      } else {
        Ideas.remove({_id: ideas._id});
      }
    },
    removeAmount : function (amount) {
    for(var i  =  0; i < amount; i++ ){ IdeaFactory.remove(Ideas.findOne());}  
    }, 
    updateZoomSpaceFlag: function(ideaID, operation) {
     /**************************************************************
       * Update whether a given idea is in the zoom space for the current user
       * @Params
       *    ideaID (string) - id of the idea to be updated
       *    operation (string) - either "add" or "remove")
       * ***********************************************************/
      var idea = Ideas.findOne({_id: ideaID});
      var userID = Session.get("currentUser")._id;
      if (operation == "add") {
        Ideas.update({_id: ideaID}, {$addToSet: {zoomSpace: userID}});
      } else if (operation == "remove") {
        Ideas.update({_id: ideaID}, {$pull: {zoomSpace: userID}});
      } else {
        // default to add
        Ideas.update({_id: ideaID}, {$addToSet: {zoomSpace: userID}});
      }
    },

  };
}());

ClusterFactory = ( function() {
  return {
    insertIdeaToCluster: function(idea, cluster) {
      logger.trace("Inserting idea into cluster");
      
      cluster.ideaIDs.push(idea._id);
      logger.debug(cluster);
      idea.clusterIDs.push(cluster._id);
      logger.debug(idea);
      //Update the corresponding db entries for each idea and cluster
      Ideas.update({_id: idea._id}, { $push: {'clusterIDs': cluster._id}});
      Clusters.update({_id: cluster._id}, { $push: {'ideaIDs': idea._id}});
    },
    getIdeas: function(cluster) {
      var c = Clusters.find({_id: cluster._id})
      return Ideas.find({"_id": {$in: c.ideaIDs}});
    },
    create: function(user, prompt, ideas) {
      logger.trace("Creating new Cluster");
      var cluster = new Cluster(user, prompt);
      cluster._id = Clusters.insert(cluster);
      var factory = this;
      if (hasForEach(ideas)) {
        ideas.forEach(function(idea) {
          logger.trace("Adding idea with id + " + idea._id + " to cluster");
          ClusterFactory.insertIdeaToCluster(idea, cluster);
        });
      } else if (ideas) {
        logger.trace("Adding idea with id + " + ideas._id + " to cluster");
        ClusterFactory.insertIdeaToCluster(ideas, cluster);
      } else {
        logger.trace("No ideas, not adding ideas to cluster");
        logger.trace("idea manager cluster interface " + this.id) 
      }
      return cluster;
    },
    setName: function(cluster, name) {
      Clusters.update({_id: cluster._id},
        {$set: {name: name}}
      );
    },
    removeIdeaFromCluster: function(idea, cluster) {
      var deleteCluster = false;
      logger.trace("Removing idea from cluster");
      logger.debug("Cluster has " + cluster.ideaIDs.length + " ideas");
      removeMember(cluster.ideaIDs, idea._id);
      // if (cluster.ideaIDs.length === 0) {
      //   deleteCluster = true;
      // }
      logger.debug("Cluster has " + cluster.ideaIDs.length + " ideas after remove");
      logger.debug("Idea has " + idea.clusterIDs.length + " clusters");
      removeMember(idea.clusterIDs, cluster._id);
      logger.debug("Idea has " + idea.clusterIDs.length + " clusters after remove");
      //Update the corresponding db entries for each idea and cluster
      Ideas.update({_id: idea._id}, 
          {$pull: 
            {clusterIDs: cluster._id}
      });
      if (deleteCluster) {
        logger.debug("Deleting Cluster");
        EventLogger.logDeletingCluster(cluster);
        this.remove(cluster);
      } else {
        Clusters.update({_id: cluster._id},
            {$pull:
              {ideaIDs: idea._id}
        });
      }
    },
    removeIdeaFromTrashCluster: function(idea, cluster) {
      logger.trace("Removing idea from cluster before trashing cluster");
      logger.debug("Cluster has " + cluster.ideaIDs.length + " ideas");
      logger.debug("Cluster has " + cluster.ideaIDs.length + " ideas after remove");
      logger.debug("Idea has " + idea.clusterIDs.length + " clusters");
      removeMember(idea.clusterIDs, cluster._id);
      logger.debug("Idea has " + idea.clusterIDs.length + " clusters after remove");
      //Update the corresponding db entries for each idea and cluster
      Ideas.update({_id: idea._id}, 
          {$pull: 
            {clusterIDs: cluster._id}
      });
    },
    getWithIDs: function(ids) {
      if (hasForEach(ids)) {
        return Clusters.find({_id: {$in: ids}});
      } else {
        return Clusters.findOne({_id: ids});
      }
    },
    updatePosition: function(cluster, position){
      Clusters.update({_id: cluster._id},
        {$set: {position: position}
      });
      cluster.position = position;
    },
    createDummy: function(ideas, num, user, prompt) {
      if (!num) {
        num = 1;
      }
      if (!user) {
        user = Session.get("currentUser");
      }
      if (!prompt) {
        prompt = Session.get("currentPrompt");
      }
      logger.trace("Creating Dummy Clusters: #" + num);
      var clusters = [];
      for (var i=0; i<num; i++) {
        logger.debug("Creating cluster " + i + " for prompt: " + JSON.stringify(prompt));
        var clusterID = this.create(user, prompt);
        logger.trace("Created cluster with id " + clusterID);
        clusters.push(Clusters.findOne({_id: clusterID}));
      }
      return clusters;
    },
    trash: function(clusters) {
      if (hasForEach(clusters)) {
        clusters.forEach(function(cluster) {
          var ideaIDs = cluster.ideaIDs;
          logger.trace("Deleting cluster from ideas with ids: " + JSON.stringify(ideaIDs));
          for (var i=0; i<ideaIDs.length; i++) {
            var id = ideaIDs[i];
            logger.trace(ideaIDs);
            logger.trace("Deleting cluster from idea with id: " + id);

            var idea = Ideas.findOne({_id: id});
            this.removeIdeaFromTrashCluster(idea, cluster);
          };
          logger.trace("ideaIDs after delete: " + JSON.stringify(ideaIDs));
          Clusters.update({_id: cluster._id}, {$set:
            {'isTrash': true}
          });
        });
      } else {
        if (clusters) {
          var ideaIDs = clusters.ideaIDs;
          logger.trace("Deleting cluster from ideas with ids: " + JSON.stringify(ideaIDs));
          for (var i=0; i<ideaIDs.length; i++) {
            var id = ideaIDs[i];
            logger.trace(ideaIDs);
            logger.trace("Deleting cluster from idea with id: " + id);

            var idea = Ideas.findOne({_id: id});
            this.removeIdeaFromTrashCluster(idea, clusters);
          };
          logger.trace("ideaIDs after delete: " + JSON.stringify(ideaIDs));
          Clusters.update({_id: clusters._id}, {$set:
            {'isTrash': true}
          });
          logger.trace(Clusters.findOne({_id: clusters._id}));
        }
      }
    },
    remove: function(clusters) {
      if (hasForEach(clusters)) {
        ids = getIDs(clusters);
        //for (var i=0; i<clusters.length; i++) {
          //ids.push(clusters._id);
        //} 
        if (Meteor.isServer) {
          Clusters.remove({_id: {$in: ids}});
        } else {
          ids.forEach(function(id) {
            Clusters.remove({_id: id});
          });
        }
      } else {
        if (clusters) 
          Clusters.remove({_id: clusters._id});
      }
    },
    upVote: function(cluster, user) {
      cluster.votes.push(user._id);
      Clusters.update({_id: cluster._id}, 
        {$push: {votes: user._id}});
    },
    downVote: function(cluster, user) {
      removeMember(cluster.votes, user._id)
      Clusters.update({_id: cluster._id}, 
        {$pull: {votes: user._id}});
    },
  };
}());
