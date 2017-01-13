// Configure logger for ExperimentManager
var logger = new Logger('Managers:Experiment');
// Comment out to use global logging level
Logger.setLevel('Managers:Experiment', 'trace');
//Logger.setLevel('Managers:Experiment', 'debug');
// Logger.setLevel('Managers:Experiment', 'info');
// Logger.setLevel('Managers:Experiment', 'warn');

ExperimentManager = (function () {
  /****************************************************************
  * Object that allows for most experiment manipulations including 
  *   assignment, creation, and modification
  ****************************************************************/
  return {
    create: function(desc) {
      /**************************************************************
       * Create a new experiment
       * @Params
       *    desc (string) - name of experiment
       * @Return
       *    expID - id of created experiment, false if unsuccessful
       ************************************************************/
       logger.trace("Beginning ExperimentManager.create");
       var exp = new Experiment(desc);
       expID = Experiments.insert(exp);
       if (expID) {
         logger.trace("Successfully created new experiment with id " + expID);
         return expID;
       } else {
         return false;
       }
    },
    createVariable: function(expID) {
      var variable = new ExpVariable(expID, "", []);
      variable._id = Variables.insert(variable);
      Experiments.update({_id: expID}, 
        {$push: {variableIDs: variable._id}}
      );
      return variable;
    },
    updateExpName: function(expID, name) {
      Experiments.update({_id: expID}, {$set: {decription: name}});
    },
    updateDefaultNumParts: function(expID, val) {
      /**************************************************************
       * Updated the number of participants for the experiment
       ************************************************************/
      logger.trace("Updating default number of participants:", expID, val);
       Experiments.update({_id: expID}, {$set: {partNum: val}});
    },
    defineVariable: function(expID, name, values) {
      /**************************************************************
       * Define a new experimental variable and associate it
       * with the given experiment specified by expID
       * @Params
       *    expID - the id of the associated experiment
       *    name (string) - a label for the variable
       *    values (list of strings) - a list of labels for all the values that the variable can take on
       * @Return
       *    the variable that was defined
       ************************************************************/
       logger.trace("Defining a new variable");
       var variable = new ExpVariable(expID, name, values);
       variable['_id'] = Variables.insert(variable);
       Experiments.update({_id: expID}, {$push: {variables: variable}});
       return variable;
    },
    updateVarName: function(varID, name) {
      /*************************************************************
       * Update the variable name
       ************************************************************/ 
      Variables.update({_id: varID}, {$set: {name: name}});
    },
    updateVarValues: function(varID, vals) {
      /*************************************************************
       * Update the variable values
       ************************************************************/ 
      Variables.update({_id: varID}, {$set: {values: vals}});
    },
    generateConditions: function(expID) {
      /**************************************************************
       * Once an experiment has been formed and variables have been set, 
       * this will create all of the conditions an mark the
       * experiment as being ready to accept participants
       * @Params
       *    expID - the id of the associated experiment

       ************************************************************/
      var exp = Experiments.findOne({_id: expID});

      //Initialize conditions given all the variables
      var vars = Variables.find({_id: {$in: exp.variableIDs}}).fetch();
      logger.trace("********************");
      logger.trace("Generating Conditions with exp: ", exp);
      var conds = this.initConditions(vars, exp.partNum);
      conds.forEach(function(cond) {
        Experiments.update(
          {_id: expID}, 
          {$addToSet: {conditionIDs: cond._id}}
        );    
      });


    },
    updateCondParts: function(condID, num) {
      // Update the number of participants in this condition
      Conditions.update({_id: condID}, {$set: {partNum: num}});
    },
    updateCondName: function(condID, name) {
      // Update the number of participants in this condition
      Conditions.update({_id: condID}, {$set: {description: name}});
    },
    beginExperiment: function(expID) {
      // Mark experiment as ready to begin
      Experiments.update({_id: expID}, {$set: {hasBegun: true}});
    },
    addCondition: function(expID, name, partNum) {
      // Add a condition manually to an experiment instead of
      // relying on those generated by the variables
      var cond = new ExpCondition(expID, name, partNum);
      cond['_id'] = Conditions.insert(cond);
      Experiments.update({_id: expID}, {$addToSet: {conditionIDs: cond._id}});
    },
    initConditions: function(variables, partNum, pname) {
      /**************************************************************
       * Once an experiment has been formed and variables have been set, 
       * @Params
       *    variables (list of ExpVariable) - list of variables
       *        on which to permute to generate conditions
       *    partNum (integer > 0) - number of participants to initialize each condition to
       *    pname (optional string) - a string to concatenate
       *        to each condition name to support recursion
       * @Return
       *    List of conditions
       ************************************************************/
      result = [];
      if (variables.length == 0) {
        logger.error("Attempting to initialize conditions with no variables specified");
      } else if (variables.length == 1) {
        var v = variables[0];
        logger.debug("Initializing conditions on 1 variable", v);
        if (pname) {
          v.values.forEach(function(val) {
            logger.debug("Val: %s, prefix: %s", val, pname);
            var cond = new ExpCondition(v.expID, pname + val, partNum);
            cond['_id'] = Conditions.insert(cond);
            result.push(cond);
          });  
        } else {
          v.values.forEach(function(val) {
            logger.debug("Val: %s", val);
            var cond = new ExpCondition(v.expID, val, partNum);
            cond['_id'] = Conditions.insert(cond);
            result.push(cond);
          });  
        }
      } else {
        logger.debug("Initializing conditions on variables ", variables);
        var v = variables[0];
        if (pname) {
          v.values.forEach(function(val) {
            result = result.concat(ExperimentManager.initConditions(variables.slice(1), partNum, pname + val + '-'));
            logger.trace("Added to conditions generated", result);
          });
        } else {
          v.values.forEach(function(val) {
            result = result.concat(ExperimentManager.initConditions(variables.slice(1), partNum, val + '-'));
            logger.trace("Added to conditions generated", result);
          });
        }
      }
      logger.trace("All conditions generated: ", result);
      return result;
    },

    updateNumPart: function(condID, num) {
      Conditions.update({_id: condID}, {$set: {partNum: num}});
    },
    updateCondData: function(condID, field, val) {
      // Update the Misc object for the given field with given value
      var c = Conditions.findOne({_id: condID});
      c.misc[field] = val;
      Conditions.update({_id: condID}, {$set: {misc: c.misc}});
    },

    assignSynthSubset: function(partID, condID) {
       /**************************************************************
       * #### Deprecated ####
      * Randomly sample a subset from a condition and assign to participant
      * Need to figure out how to deal with the potential problem of unfinished subsets
      * @Params
      *     partID (str) - the condition object to process
      *     condID (array) - array of route names - order matters!
      * ***********************************************************/
      var part = Participants.findOne({_id: partID});
      if (part.misc) {
        if (part.misc.subsetID) {
          logger.debug("Already has a subset assigned. Doing nothing");
        } 
      } else {
        logger.debug("Assigning a new subset");
        var cond = Conditions.findOne({_id: condID});
        var availableSubsets = SynthSubsets.find({condID: condID, users: []}).fetch();
        logger.debug(availableSubsets.length + " available out of " + cond.misc.subsetIDs.length + " total subsets in this condition ");
        var subset = getRandomElement(availableSubsets);
        logger.trace("Assigning subset with id " + subset._id + " to participant");
        Participants.update({_id: part._id}, {$set: {'misc.subsetID': subset._id}});
      }
    },


    getUsersInCond: function(expID, condID) {
       /**************************************************************
       * Convenience function to get all userIDs assigned to a
       * given condition
       * @Params
       *    expID - ID of experiment object
       *    condID - ID of condition
       * @Return
       *    userIDs - list of userIDs assigned to the condition
       * ***********************************************************/
       var cond = Conditions.findOne({_id: condID});
       logger.trace("Found cond: ", cond);
       // exp.conditions.forEach(function(c) {
       //  if (c.description == "Treatment") {
       //    condID = c._id;
       //    break;
       //  }
       // });
       // var cond = Conditions.findOne({_id: condID});
       var partIDs = cond.assignedParts;
       var participants = Participants.find({_id: {$in: partIDs}}).fetch();
       var userIDs = getIDs(participants);
       // participants.forEach(function(p) {
        // logger.trace("Participant " + JSON.stringify(p));
        // logger.trace("PartID " + p._id + ": UserID " + p.userID);
        // userIDs.push(p.userID);
       // });
       return userIDs;
    },

    getChosenCondition: function(exp, condName) {
      /****************************************************************
        * Get a chosen condition from the experiment 
        * (matching given condName param)
        * should return cond id
        ****************************************************************/      
      logger.debug("Assigning to chosen condition: " + condName);
      var condID = "";
      exp.conditions.forEach(function(cond) {
        if (cond.description == condName) {
          condID = cond._id;
          logger.trace("Matching condition id: " + condID);
        }
      });
      return condID;
    },

    getRandomCondition: function(expID) {
        /****************************************************************
        * Get a random condition from the experiment
        * Probably of sampling a condition is inversely proportional
        * to the number of assigned participants
        * should return cond id
        ****************************************************************/
        //Create an array with length = number of slot
        // var slots = [];
        var unlimitedRecruitment;
        var randCond;
        var cutOffs = [];
        var wantedRecruits = [];
        var exp = Experiments.findOne({_id: expID});
        for (var i=0; i<exp.conditionIDs.length; i++) {
          //Determin number of participants expected - number already 
          //  assigned
          var cond = Conditions.findOne({_id: exp.conditionIDs[i]})
          // desired number of participants
          var numPartWanted = cond.partNum;
          // number of participants currently assigned
          // var numPartAssigned = cond.assignedParts.length; 
          var numPartCompleted = cond.completedParts.length;
          logger.debug(numPartWanted + " participants wanted for " + cond.description + " condition, " + numPartCompleted + " completed so far");
              
          // Cube the number to heavily bias in favor conditions with fewer assigned participants
          // var numToRecruit = numPartWanted - numPartAssigned;
          var numToRecruit = numPartWanted - numPartCompleted;
          wantedRecruits.push(numToRecruit);
          logger.debug("Need to recruit " + numToRecruit + " for " + cond.description);
          var thisCutOff = Math.pow(numToRecruit,3); // this is the width between each point on the number line
          // Construct the sampling space
          // Each element in cutOffs is a condition
          if (cutOffs.length == 0) {
            logger.trace("Cutoff for " + cond.description + ": " + thisCutOff);
            cutOffs.push(thisCutOff);  
          } else {
            cutOffs.push(thisCutOff + cutOffs[cutOffs.length-1]);
          }
        }
        logger.trace("Number line is :", cutOffs);
        
        // Randomly assign to any condition if experiment is full
        if (cutOffs.length == 0) {
            randCond = getRandomElement(exp.conditions);
            logger.trace("Randomly drew " + randCond.description + " condition");
            return randCond._id;
        } else {
          var max = cutOffs[cutOffs.length-1]
          if (max <= 0) {
            logger.debug("Conditions are all full, randomly sampling smaller condition", wantedRecruits);
            var condIndex = _.indexOf(wantedRecruits,_.max(wantedRecruits));
            logger.trace("Drawing from wantedRecruits: ",wantedRecruits);
            logger.debug("Drew condition index: " + condIndex);
            randCondID = exp.conditionIDs[condIndex];
            logger.trace("Randomly drew ID:" + randCondID + " condition");
            return randCondID;    
          } else {

            // Define the sample space to draw from
            logger.trace("Max for sample is " + max);
            
            // Randomly sample a number
            var sample = Math.random() * (max-1) + 1;
            logger.trace("Drew random sample: " + sample);
            
            // Sample a condition
            var condIndex = 0;
            for (var i=0; i<cutOffs.length; i++) {
              logger.trace("Comparing sample to cutoff: " + cutOffs[i]);
              if (sample <= cutOffs[i]) {
                logger.trace("Sample of " + sample + " is less than cutoff " + cutOffs[i]);
                condIndex = i;
                break;
              } 
            }
            randCondID = exp.conditionIDs[condIndex];
            var c = Conditions.findOne({_id: randCondID});
            logger.trace("Randomly drew " + c.description + " condition");
            return randCondID;
          }
        }
    },


    addExperimentParticipant: function (expID, user) {
      //Look for duplicate participant with same userID and expID
      logger.trace("Adding user with id " + user._id + " as a participant");
      var part = Participants.findOne({userID: user._id, expID: expID});
      if (part) {
        logger.info("repeat participant");
        return part;
      } else {
        //Create new participant if no duplicates found
        
        // assign to a condition
        var condID = this.getRandomCondition(expID);
        // var condID = this.getChosenCondition(exp, "Treatment");
        var part = new Participant(expID, user._id, condID);
        part._id = Participants.insert(part);

        // log assignment to the experiment
        Experiments.update({_id: expID}, {$addToSet: {participantIDs: part._id}});

        // log assignment to the condition in Conditions collection
        Conditions.update({_id: condID}, {$addToSet: {assignedParts: part._id}});

        logger.trace("Added new participant with id " + part._id);
        
        return part;
      }
    },

    logParticipantCompletion: function(participant){
      Participants.update({_id: participant._id}, 
        {$set: {'misc.hasFinished': true}}
      );
      Conditions.update({_id: participant.conditionID}, 
        {$addToSet: {completedParts: participant._id}}
      );
      logger.trace("Logged experiment completion for participant");
    },

    logParticipantReady: function(participant) {
       /**************************************************************
       * Mark a participant as ready to proceed from tutorial and
       * begin experiment
       * @Params
       *    participant (object) - the participant
       * @Return
       *    boolean - true if successful
       * ***********************************************************/
      Participants.update({_id: participant._id}, 
        {$set: {'misc.isReady': true}}
      );
      Conditions.update({_id: participant.conditionID}, 
        {$addToSet: {readyParts: participant._id}}
      );
      logger.trace("Logged participant ready for participant: " + participant._id);
    },
   
    canParticipate: function (expID, userName) {
      var exp = Experiments.findOne({_id: expID});
      if (exp.excludeUsers === undefined) {
        return true;
      }
      //checks if user is on list of prohibitied users
      for (var i=0; i<exp.excludeUsers.length; i++) {
        if (exp.excludeUsers[i] == userName) {
            EventLogger.logDenyParticipation();
            return false;
        }
      }
      //checks if user is on list of current participants marked as finished
      var part = Participants.findOne({userName: userName, expID: exp._id});
      if (part) {
        if (part.misc.hasFinished) {
          return false;
        } else {
          return true;
        }
      } 
      return true;
    },

    addExcludeUsers: function(expID, userNames) {
      var currentExclusions = Experiments.findOne({_id: expID}).excludeUsers;
      userNames.forEach(function(userName) {
        Experiments.update({_id: expID}, 
          {$addToSet: {excludeUsers: userName}}
        );  
      });
    },

    removeExcludeUsers: function(expID, userNames) {
      userNames.forEach(function(userName) {
        Experiments.update({_id: expID}, 
          {$pull: {excludeUsers: userName}});
      });
    },
    remove: function(exps) {
      if (hasForEach(exps)) {
        ids = getIDs(exps);
        //for (var i=0; i<exps.length; i++) {
          //ids.push(exps._id);
        //} 
        if (Meteor.isServer) {
          Experiments.remove({_id: {$in: ids}});
        } else {
          ids.forEach(function(id) {
            Experiments.remove({_id: id});
          });
        }
      } else {
        Experiments.remove({_id: exps._id});
      }

    },


  };
}());


SynthExperiment = (function () {
  return {
    initCondition: function(cond) {
      /* Set the metadata for the route parameters and the route name itself */
      var condition = Conditions.findOne({_id: cond._id});
      var insp = Inspirations.findOne({name: condition.desc});
      var misc = condition.misc;
      misc['inspirationID'] = insp._id;
      misc['route'] = 'IdeateInspire';
      Conditions.update({_id: condition._id}, {$set: {misc: misc}});
    }

  };

}());

KAlignExperiment = (function() {
  return {
    getFocusArea: function() {
      var part = Session.get("currentParticipant");
      var condition = Conditions.findOne({_id: part.conditionID});
      var kTest = KnowledgeTestResponses.findOne({'participant._id': part._id}).responses;
      var results = {};
      for (var f in kTest) {
        var score = kTest[f];
        if (results.hasOwnProperty(score)) {
          var items = results[score];
          items.push(f);
          results[score] = items;
        } else {
          results[score] = [f];
        }
      }
      // var ideas = [];
      // Ideas.find({userID: Session.get("currentUser"), inCluster: false}).forEach(function(idea) {
      //   ideas.push(idea.content);
      // });
      var alignType = Session.get("alignType");
      // Meteor.call('pathSampler', kTest, ideas, alignType, function(err, res) {
      //   EventLogger.logPathSample(res.rankings, res.selection, alignType);
      //   Session.set("focusArea", res.selection);
      // });
      var selection;
      if (alignType == "a") {
        // try to pick the top ones first
        for (var i=4; i>0; i--) {
          var possibleItems = results[i];
          // only try to sample if there are actually results at that score
          if (possibleItems) {
            // randomly sample to deal with the "ties" case
            selection = getRandomElement(possibleItems);
            break;
          }
        }
      } else {
        for (var i=1; i<5; i++) {
          var possibleItems = results[i];
          if (possibleItems) {
            selection = getRandomElement(possibleItems);
            break;
          }
        }
      }
      EventLogger.logPathSample(kTest, selection);
      Session.set("focusArea", selection);
    }
  }
}());