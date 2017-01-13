// Configure logger for Tools
var logger = new Logger('Models:PromptManager');
// Comment out to use global logging level
//Logger.setLevel('Models:PromptManager', 'trace');
//Logger.setLevel('Models:PromptManager', 'debug');
Logger.setLevel('Models:PromptManager', 'info');
//Logger.setLevel('Models:PromptManager', 'warn');


PromptManager  = (function() {
  return {
    create: function(question, user, template, title) {
      logger.debug("Creating  new prompt with question: " + question);
      //Legacy support of no user specified during prompt creation
      if (!user) {
        logger.debug("no user was supplied, using the currentUser");
        user = Session.get("currentUser");
      }
      var newPrompt = new Prompt(question, user);
      //For now, just associate default group template with all prompts
      if (template) {
        newPrompt.template = template;
      } else {
        newPrompt.template = GroupManager.defaultTemplate();
      }
      //Store a shortened title
      if (title) {
        newPrompt.title = title;
      } else {
        newPrompt.title = question;
      }
      newPrompt._id = Prompts.insert(newPrompt);
      logger.trace(prompt);
      return newPrompt;
    },
    addGroups: function(prompt, groups) {
      /**************************************************************
       * Add a group to the given prompt
       * @Params:
       *    prompt: the prompt document to be updated
       *    groups: an array of groups or a single group 
       *        to be added to the prompt
       *************************************************************/
      if (hasForEach(groups)) {
        groups.forEach(function(group) {
          prompt.groupIDs.push(group._id);
          Prompts.update({_id: prompt._id}, 
            {$push: {groupIDs: group._id}});
          //Maybe eventually update group with prompt
          Groups.update({_id: group._id}, 
            {$addToSet: {promptIDs: prompt._id}});
        });
      } else {
        //Groups is only a single group
        prompt.groupIDs.push(groups._id);
        Prompts.update({_id: prompt._id}, 
          {$push: {groupIDs: groups._id}});
        //Maybe eventually update group with prompt
        Groups.update({_id: groups._id}, 
          {$addToSet: {promptIDs: prompt._id}});
      }
    },
    setTitle: function(prompt, title) {
      prompt.title = title;
      Prompts.update({_id: prompt._id}, {$set: {title: title}});
      return prompt;
    },
    addToGroup: function(prompt, user) {

    },
    setLength: function(prompt, time) {
      prompt.length = time;
      Prompts.update({_id: prompt._id}, 
        {$set: {length: time}});
    },
    hasLengthSet: function(prompt) {
      return (prompt.length > 0) ? true : false;
    },
    remove: function(prompts) {
      if (hasForEach(prompts)) {
        ids = getIDs(prompts);
        if (Meteor.isServer) {
          Prompts.remove({"_id": {$in: ids}}); 
        } else {
          ids.forEach(function(id) {
            Prompts.remove({"_id": id}); 
          });
        }
      } else {
        //prompts is just a single prompt object if not an array
        Prompts.remove({_id: prompts._id});  
      }
    }, 
  };
}());
