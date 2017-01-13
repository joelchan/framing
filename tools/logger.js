/********************************************************************
 * Configuring Pince logger to enable multi-level logging for 
 * system monitoring to console
 *******************************************************************/
//Set global message logging level
Logger.setLevel('info');

// Configure logger for event logging 
var logger = new Logger('Tools:Logging');
// Comment out to use global logging level
Logger.setLevel('Tools:Logging', 'trace');
//Logger.setLevel('Tools:Logging', 'debug');
// Logger.setLevel('Tools:Logging', 'info');
//Logger.setLevel('Tools:Logging', 'warn');

EventLogger = (function () {
  return {
    /*****************************************************************
    * Global object for logging high level system events to database
    ******************************************************************/
    log: function(msg, data) {
      /*
      *  log any event. If insufficient data is given, warning is
      *  logged, but does not throw error
      *   Input:
      *   type - the EventType associated with this event
      *   data - (Optional) the data to be associated with the event
      *       Specified as an object where only fieldNames specified
      *       in type are stored
      */ 
      //The current user is assumed to have generated the event
      var user = Session.get("currentUser");
      var event = new Event(msg, user);
      //Index participantID and experimentID if experiment is set
      var exp = Session.get("currentExp");
      if (exp) {
        var part = Session.get("currentParticipant");
        if (part) {
          event['participantID'] = part._id;
          event['conditionID'] = part.conditionID;
        }
        event['expID'] = exp._id;
      }
        
      //Set each field provided in data
      if (typeof data != undefined) { 
        for (var field in data) {
          event[field] = data[field];
        }
      }
      //Insert into db
      event._id = Events.insert(event);
      return event;
    },

    remove: function(events) {
      /**************************************************************
       * Remove a set of logged events
       *    This is primarily to support tests and needs to eventually
       *    be secured.
       * @params
       *    events: an array or cursor of events to be removed
       * @return
       *    n/a
       *************************************************************/
      if (hasForEach(events)) {
        ids = getIDs(events); 
        if (Meteor.isServer) {
          Events.remove({_id: {$in: ids}});
        } else {
          events.forEach(function(event) {
            Events.remove({_id: event._id});
          });
        }
      } else {
        Events.remove({_id: events._id});
      }

    },
  
    logUserLogin: function () {
      var msg = "User logged into experiment";
      //var type = EventTypeManager.get(msg);
      this.log(msg);
    },
    logBeginRole: function() {
      var role = Session.get("currentRole");
      var prompt = Session.get("currentPrompt");
      var msg = "User began role " + role.title;
      //var type = EventTypeManager.get(msg);
      var data = {'promptID': prompt._id,
          'role': role.title
      };
      this.log(msg, data);
    },
    logEndRole: function() {
      var role = Session.get("currentRole");
      var prompt = Session.get("currentPrompt");
      var msg = "User ended role " + role.title;
      //var type = EventTypeManager.get(msg);
      var data = {'promptID': prompt._id,
          'role': role.title
      };
      this.log(msg, data);
    },
    /** Experiment Events**/
    logConsent: function () {
      var msg = "User consented to experiment";
      //var type = EventTypeManager.get(msg);
      this.log(msg);
    },
    logDenyParticipation: function() {
      var msg = "User was denied participation in experiment";
      //var type = EventTypeManager.get(msg);
      var exp = Session.get("currentExperiment")
      var data = {'expID': exp._id, 'expDescr': exp.description}
      this.log(msg, data);
    },
    logExitStudy: function() {
      var msg = "User exited study early";
      var prompt = Session.get("currentPrompt");
      var role = Session.get("currentRole");
      //var type = EventTypeManager.get(msg);
      var data = {'promptID': prompt._id,
          'role': role.title
      };
      this.log(msg, data);
      var part = Session.get("currentParticipant");
      Participants.update({_id: part._id},
        {$set: {'misc.exitedEarly': true}});
    },
    logTutorialStarted: function () {
      var msg = "User started a tutorial";
      //var type = EventTypeManager.get(msg);
      this.log(msg);
      var part = Session.get("currentParticipant");
      Participants.update({_id: part._id},
        {$set: {'misc.tutorialStarted': true}});
    },
    logTutorialStepRewind: function (current, max) {
      //current is the current step before rewinding
      var msg = "User rewound a tutorial step";
      //var type = EventTypeManager.get(msg);
      var data = {"currentTaskStepNum": current, 
        "taskStepMax": max
      };
      this.log(msg, data);
      if (current < max) {
        Session.set("currentTutorialStep",current);  
      }
    },
    logTutorialStepComplete: function (num, max) {
      var msg = "User finished a tutorial step";
      //var type = EventTypeManager.get(msg);
      var data = {"taskStepNum": num, "taskStepMax": max};
      this.log(msg, data);
      logger.debug("Finished tutorial step " + num + " of " + max);
      if (num < max) {
        Session.set("currentTutorialStep",num+1);
      }
    },
    logFluencyTaskBegin: function () {
      var msg = "User started fluency measure task";
      //var type = EventTypeManager.get(msg);
      this.log(msg);
      // logger.debug(msg);
      var part = Session.get("currentParticipant");
      Participants.update({_id: part._id},
        {$set: {'misc.fluencyStarted': true}});
    },
    logFluencyTaskComplete: function () {
      var msg = "User finished fluency measure task";
      //var type = EventTypeManager.get(msg);
      this.log(msg);
      // logger.debug(msg);
      var part = Session.get("currentParticipant");
      Participants.update({_id: part._id},
        {$set: {'misc.fluencyFinished': true}});
    },
    logTutorialComplete: function () {
      var msg = "User finished a tutorial";
      //var type = EventTypeManager.get(msg);
      this.log(msg);
      logger.debug(msg);
      ExperimentManager.logParticipantReady(Session.get("currentParticipant"));  
    },
    logEnterIdeation: function() {
      var msg = "User entered ideation";
      //var type = EventTypeManager.get(msg);
      this.log(msg);
    },
    logBeginIdeation: function() {
      var msg = "User began ideation";
      //var type = EventTypeManager.get(msg);
      this.log(msg);
      var part = Session.get("currentParticipant");
      if (part) {
        Participants.update({_id: part._id},
        {$set: {'misc.hasStarted': true}});  
      }
    },
    logSurveyBegan: function () {
      var msg = "User began survey";
      //var type = EventTypeManager.get(msg);
      this.log(msg);
      var part = Session.get("currentParticipant");
      if (part) {
        Participants.update({_id: part._id},
        {$set: {'misc.surveyStarted': true}});  
      }
    },
    logSurveyComplete: function () {
      var msg = "User completed survey";
      //var type = EventTypeManager.get(msg);
      this.log(msg);
    },
    logSubmittedSurvey: function(response) {
      var msg = "User submitted survey";
      var exp = Session.get("currentExp");
      logger.trace("Current experiment: " + JSON.stringify(exp));
      //var type = EventTypeManager.get(msg);
      var data = {'responseID': response._id,
          'expID': exp._id
      };
      this.log(msg, data);
    },

  /** Notification Drawer Events**/
    logNotificationHandled: function(notification){
      var msg = "User handled a notification";
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      var data = {"notificationID": notification._id,
          'promptID': prompt._id
      };
      this.log(msg, data);
    },
    
    logNotificationExpanded: function(notification){
      var msg = "User expanded a notification";
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      var data = {"notificationID": notification._id,
          'promptID': prompt._id
      };
      this.log(msg, data);
    },

    logNotificationCollapsed: function(notification){
      var msg = "User collapsed a notification";
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      var data = {"notificationID": notification._id,
          'promptID': prompt._id
      };
      this.log(msg, data);
    },

    /** Notification events**/
    logSendExamples: function(notification){
      var msg = "Dashboard user sent examples";
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      var data  = {"sender": notification.sender,
              "recipientIDs": notification.recipientIDs,
              "type": notification.type,
              "examples": notification.examples,
              'promptID': prompt._id
      };
      this.log(msg, data);
    },

    logChangePrompt: function(notification){
      console.log(notification);
      var msg = "Dashboard user changed prompt";
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      var data  = {"sender": notification.sender,
              "recipientIDs": notification.recipientIDs,
              "type": notification.type,
              "prompt": notification.prompt,
              'promptID': prompt._id
      };
      this.log(msg, data);
      //var user = notification.sender;
      //console.log(user);
      //misc = [{name: "sender", data: notification.sender._id},
              //{name: "recipient", data: notification.recipient},
              //{name: "type", data: notification.type},
              //{name: "prompt", data: notification.prompt}];
      //this.logEvent(msg, user, "notification", misc);
    },

    logSendTheme: function(notification){
      var msg = "Dashboard user sent theme";
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      console.log(type);
      var data  = {"sender": notification.sender,
              "recipientIDs": notification.recipientIDs,
              "type": notification.type,
              "theme": notification.theme,
              'promptID': prompt._id
      };
      this.log(msg, data);
      //var user = notification.sender;
      //misc = [{name: "sender", data: notification.sender._id},
              //{name: "recipient", data: notification.recipient},
              //{name: "type", data: notification.type},
              //{name: "theme", data: notification.theme}];
      //this.logEvent(msg, user, "notification", misc);
    },

    logRequestHelp: function(notification){
      var msg = "Ideator requested help";
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      var data  = {"sender": notification.sender,
              "recipientIDs": notification.recipientIDs,
              "type": notification.type,
              'promptID': prompt._id
      };
      this.log(msg, data);
      //var user = notification.sender;
      //misc = [{name: "sender", data: notification.sender._id},
              //{name: "recipient", data: notification.recipient},
              //{name: "type", data: notification.type}];
      //this.logEvent(msg, user, "notification", misc);
    },

    /** Ideation events **/
    logIdeaSubmission: function(idea, task, tutorial) {
      var msg = "User submitted idea";
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      var data = {"ideaID": idea._id,
          'ideaContent': idea.content,
          'ideaFocus': idea.inCluster,
          'promptID': prompt._id,
      };
      if (task) {
        data['taskID'] = task._id;
      }
      if (idea.hasOwnProperty("focusArea")) {
        data['ideaFocusArea'] = idea.focusArea;
      }
      if (tutorial) {
        data['tutorial'] = true;
      } else {
        data['tutorial'] = false;
      }

      this.log(msg, data);
    },

    /** Clustering events **/
    logSynthExpPartialFinish: function () {
      var msg = "User attempted to finish synth exp with some missing labels";
      //var type = EventTypeManager.get(msg);
      this.log(msg);
    },
    logDisplayToZoom: function(idea, pos) {
      var msg = "User sent idea from display to zoom space";
      var data = {"ideaID": idea._id,
                  "position": pos};
      this.log(msg, data);
    },
    logDisplayToCluster: function(idea, cluster) {
      var msg = "User sent idea from display to cluster";
      var data = {"clusterID": cluster._id,
                  "ideaID": idea._id}
      this.log(msg, data);
    },
    logMoveZoomIdea: function(idea, pos, prevPos) {
      var msg = "User moved idea in zoom space";
      var data = {"ideaID": idea._id,
                  "position": pos,
                  "prevPosition": prevPos};
      this.log(msg, data);
    },
    logZoomToCluster: function(idea, cluster) {
      var msg = "User sent idea from zoom to cluster";
      var data = {"clusterID": cluster._id,
                  "ideaID": idea._id}
      this.log(msg, data);
    },
    logClusterToZoom: function(idea, cluster, pos) {
      var msg = "User sent idea from cluster to zoom space";
      var data = {"clusterID": cluster._id,
                  "ideaID": idea._id,
                  "position": pos}
      this.log(msg, data);
    },
    logClusterToCluster: function(idea, prevCluster, newCluster) {
      var msg = "User moved idea from cluster to a new cluster";
      var data = {"prevClusterID": prevCluster._id,
                  "newClusterID": newCluster._id,
                  "ideaID": idea._id}
      this.log(msg, data);
    },
    logClusterToDisplay: function(idea, cluster) {
      var msg = "User sent idea back to display from cluster";
      var data = {"clusterID": cluster._id,
                  "ideaID": idea._id}
      this.log(msg, data);
    },
    logClusterCollapse: function(cluster) {
      var msg = "User toggled cluster collapse"
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      var data = {"clusterID": cluster._id,
          'newState': !cluster.isCollapsed,
      };
      this.log(msg, data);
    },
    logToggleGC: function(idea) {
      var msg = "User toggled idea game changer"
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      var data = {"ideaID": idea._id,
          'newState': !idea.isGamechanger,
      };
      this.log(msg, data);
    },
    logChangeClusterName: function(cluster, name, oldName) {
      var msg = "User modified cluster name"
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      if (oldName) {
        var data = {"clusterID": cluster._id,
            'newName': name,
            'oldName': oldName,
        };
      } else {
        var data = {"clusterID": cluster._id,
            'newName': name,
        };
      }
      this.log(msg, data);
    },
    logMovedCluster: function(cluster, pos, prevPos) {
      var msg = "User moved cluster"
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      if (prevPos) {
        var data = {"clusterID": cluster._id,
            'position': pos,
            'prevPosition': prevPos,
        };
      } else {
        var data = {"clusterID": cluster._id,
            'position': pos,
        };
      }
      this.log(msg, data);
    },
    logDeletingCluster: function(cluster) {
      var msg = "Empty Cluster is being deleted"
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      var data = {"clusterID": cluster._id,
          'name': cluster.name,
      };
      this.log(msg, data);
    },
    logIdeaRemovedFromCluster: function(idea, source, target) {
      var msg = "User removed Idea from cluster"
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      var targetID = null;
      if (target) {
        targetID = target._id;
      } 
      var data = {"ideaID": idea._id,
          'sourceID': source._id,
          'targetID': targetID,
      };
      this.log(msg, data);
    },
    logCreateCluster: function(target, idea, source) {
      var msg = "User created new cluster"
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      var sourceID = null;
      if (source) {
        sourceID = source._id;
      } 
      if (idea) {
        var data = {"ideaID": idea._id,
            'sourceID': sourceID,
            'targetID': target._id,
        };
      } else {
        var data = {'sourceID': sourceID,
            'targetID': target._id,
        };
      }
      
      this.log(msg, data);
    },
    logIdeaClustered: function(idea, source, target) {
      var msg = "User inserted idea to cluster"
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      var sourceID = null;
      if (source) {
        sourceID = source._id;
      } 
      var data = {"ideaID": idea._id,
          'sourceID': sourceID,
          'targetID': target._id,
      };
      this.log(msg, data);
    },
    logIdeaUnclustered: function(idea, source) {
      var msg = "User unclustered idea"
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      var data = {"ideaID": idea._id,
          'sourceID': source._id,
      };
      this.log(msg, data);
    },
    logStarCluster: function(cluster) {
      var msg = "User starred a cluster";
      var data = {"clusterID": cluster._id}
      this.log(msg, data);
    },
    logUnstarCluster: function(cluster) {
      var msg = "User unstarred a cluster";
      var data = {"clusterID": cluster._id}
      this.log(msg, data);
    },

    /** Dashboard events **/
    logToggleUserFilter: function(user, filterUserID, state) {
      var msg = "User toggled user filter over ideas"
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      var data = {"userID": user._id,
          'filterUserID': filterUserID,
          'state': state,
      };
      this.log(msg, data);
    },
    logToggleClusterFilter: function(user, filterClusterID, state) {
      var msg = "User toggled cluster filter over ideas"
      var prompt = Session.get("currentPrompt");
      //var type = EventTypeManager.get(msg);
      var data = {"userID": user._id,
          'filterClusterID': filterClusterID,
          'state': state,
      };
      this.log(msg, data);
    },
    logRequestInspiration: function (prompt) {
      var msg = "User requested an inspiration";
      //var type = EventTypeManager.get(msg);
      var data = {"promptID": prompt._id};
      this.log(msg, data);
    },
    logInspirationRequestSuccess: function (prompt, task) {
      var msg = "User received an inspiration";
      //var type = EventTypeManager.get(msg);
      var data = {"promptID": prompt._id, "taskID": task._id};
      this.log(msg, data);
    },
    logInspirationRequestFail: function (prompt) {
      var msg = "User did not receive an inspiration";
      //var type = EventTypeManager.get(msg);
      var data = {"promptID": prompt._id};
      this.log(msg, data);
    },
    logShowHideClick: function(isHidden) {
      var msg = "User clicked show/hide instructions";
      //var type = EventTypeManager.get(msg);
      var data = {'isHidden': isHidden};
      logger.debug(data);
      this.log(msg, data);
    },
    logPathSample: function(rankings, selection, alignType) {
      var msg = "User was assigned to a path";
      var data = {'selection': selection,
                  'rankings': rankings,
                  'alignType': alignType}
      this.log(msg, data);
    },
    logFocusIdeaState: function(ideaState) {
      var msg = "Current status of focus idea";
      var data = {'content': ideaState}
      this.log(msg, data);
    },
    logKnowledgeTestStart: function() {
      var msg = "User began knowledge test";
      this.log(msg);
    },
    logKnowledgeTestSubmit: function(response) {
      var msg = "User submitted knowledge test";
      var exp = Session.get("currentExp");
      logger.trace("Current experiment: " + JSON.stringify(exp));
      //var type = EventTypeManager.get(msg);
      var data = {'responseID': response._id,
          'expID': exp._id
      };
      this.log(msg, data);
    },

  };
}());

// EventTypeManager = (function() {
  // return {
    // create: function(desc, fields) {
      // var type = new EventType(desc, fields); 
      // type._id = EventTypes.insert(type);
      // return type;
    // },
    // get: function(desc, fields) {
      // var create = false;
      // if (fields) {
        // logger.trace("Looking for EventType with matching fields");
        // var results = EventTypes.find(
          // {desc: desc,
            // fields: fields
          // });
        // if (results.count() > 0) {
          // logger.trace("found " + results.count() + " matching results");
          // return results.fetch()[0];
        // }
      // } else {
        // logger.trace("Looking for EventType with matching desc");
        // var results = EventTypes.find({desc: desc});
        // if (results.count() > 0) {
          // logger.trace("found " + results.count() + " matching results");
          // return results.fetch()[0];
        // }
      // }
      // //No result foudn, so return newly created type
      // logger.trace("no match creating new EventType");
      // return this.create(desc, fields);
    // },
    // remove: function(types) {
      // if (hasForEach(types)) {
        // ids = getIDs(types);
        // if (Meteor.isServer) {
          // EventTypes.remove({"_id": {$in: ids}}); 
        // } else {
          // types.forEach(function(type) {
            // EventTypes.remove({"_id": type._id}); 
          // });
        // } 
      // } else {
        // //types is just a single EventType object, not an array
        // EventTypes.remove({_id: types._id});  
      // }
    // }
  // };
// }());
