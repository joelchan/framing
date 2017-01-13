// Configure logger for Filters
var logger = new Logger('Model:Hcomp:TaskManagers');
// Comment out to use global logging level
// Logger.setLevel('Model:Hcomp:TaskManagers', 'trace');
//Logger.setLevel('Model:Hcomp:TaskManagers', 'debug');
Logger.setLevel('Model:Hcomp:TaskManagers', 'info');
// Logger.setLevel('Model:Hcomp:TaskManagers', 'warn');


//Meteor remote invocation
//Meteor.methods({
  //'TaskManager_create': function(user, prompt, group, desc, 
              //type, priority, num, inspiration ) {
    //return TaskManager.create(user, prompt, group, desc,
      //type, priority, num, inspiration);
  //},
  //'TaskManager_attachIdeas': function(task, ideas, user) {
    //return TaskManager.attachIdeas(task, ideas);
  //},
  //'TaskManager_addQuestion': function(question, task, user) {
    //return TaskManager.addQuestion(question, task);
  //},
  //'TaskManager_addResponse': function(response, question, task, user) {
    //return TaskManager.addResponse(response, question, task);
  //},
  //'TaskManager_editQuestion': function(newQuestion, question, task, user) {
    //return TaskManager.editQuestion(newQuestion, question, task);
  //},
  //'TaskManager_editResponse': function(newResponse, question, task, user) {
    //return TaskManager.editResponse(newResponse, question, task);
  //},
  //'TaskManager_assignTask': function(prompt, user) {
    //var tasks = TaskManager.assignTask(prompt, user);
    //return tasks;
  //},
  //'TaskManager_remove': function(tasks) {
    //return TaskManager.remove(tasks);
  //}
//});

TaskManager = (function() {
  return {
    types: ['timed', 'quantity', 'open'],
    create: function(user, prompt, group, desc, 
              type, priority, num, ideas, ideasRequested, minutesRequested) {
      /**************************************************************
       * Creates a new task, inserts into DB, and returns it
       * @Params
       *  user - the author user of the task
       *  prompt - the prompt associated with the task
       *  group - the group the task is assigned to
       *  desc - the string description of the task
       *  type - Either, time, quantity, open. TaskType object
       *  priority - a number from 1-5 with 5 being highest priority
       *  num - the number of people who can accept the task
       *  ideas - (Optional) idea(s) that are inspriration for the task
       * @Return
       *  task - the newly created task
       * **********************************************************/
      var task = new Task(user, prompt, group, 
        desc, type, priority, num, ideasRequested, minutesRequested);
      //Attach inspiration to task
      task._id = Tasks.insert(task);
      if (ideas) {
        //Do nothing for now
      }
      return task;
    },
    attachIdeas: function(task, ideas) {
      /**************************************************************
       * Attach inspiration ideas to a given task and update DB
       * @Params
       *  task - the task to modify
       *  idea - the idea(s) to append to the task
       * @Return
       *  the modified task
       *************************************************************/
      if (hasForEach(ideas)) {
        //Update list of attached ideas
        ideas.forEach(function(idea) {
          task.attachments.push(idea);
        });
        //Update DB
        Tasks.update({_id: task._id},
            {$push: {attachments: {$each: ideas}}});
      } else {
        //ideas is only a single idea
        task.attachments.push(ideas);
        //Update DB
        Tasks.update({_id: task._id},
            {$push: {attachments: ideas}});
      }
      return task;

    },
    assignTask: function(prompt, user, groupID) {
      logger.debug("assigning a task");
      var tasks = Tasks.find({promptID: prompt._id,
          groupID: groupID}, 
          {sort: {priority: -1, time: -1}}).fetch()
      logger.trace(tasks);
      for (var i=0; i<tasks.length; i++) {
        var task = tasks[i];
        logger.trace("looking at task: ");
        logger.trace(task);
        logger.debug("Task assignments: " + task.assignments.length +
          " Number of tasks: " + task.num);
        if (task.assignments.length < task.num) {
          if (this.isAssignedToTask(task, user)) {
            logger.debug("assigning task");
            return this.assignUserToTask(task, user); 
          }
        }
      }
      //No unassigned tasks, so returning null;
      return null;
    },
    
    /**************************************************************
       * Checks to see if there are any available tasks for the
       * current user
       * Helper to disable and enable the inspire me button 
       * **********************************************************/
    areTasksAvailable: function(prompt, user, groupID) {
      logger.trace("Getting tasks for group: " + groupID);
      var tasks = Tasks.find({promptID: prompt._id, 
        groupID: groupID},
        {assignments: {$nin: [user._id]}}).fetch();
      logger.trace("THE AVAILABLE TASKS ARE  " + JSON.stringify(tasks));
      logger.trace("TASK LENGTH IS = " + tasks.length);
      for (var i=0; i<tasks.length; i++) {
        var task = tasks[i];
        logger.trace("looking at task: ");
        logger.trace(task);
        logger.debug("Task assignments: " + task.assignments.length +
          " Number of tasks: " + task.num);
        if (task.assignments.length < task.num) {
          if (this.isAssignedToTask(task, Session.get("currentUser"))) {
              logger.trace("TASKMANAGER TASK AVAILABLE");
              return true;
            } 
        }   
      }
      logger.trace("TASKMANAGER TASK NOT AVAILABLE");
      return false;
    },
      
    isAssignedToTask: function (task, user) {
      return (!isInList({userID: user._id}, task.assignments, 'userID'))
    },
    assignUserToTask: function (task, user) {
      logger.debug("Assigning " + user.name + " to task");
      var assignment = new Assignment(task, user);
      assignment._id = Assignments.insert(assignment);
      task.assignments.push(assignment)
      Tasks.update({_id: task._id}, {$push: {assignments: assignment}});
      return task;
    },
    getAssignedTasks: function (prompt, user) {
      logger.debug("Getting all tasks assigned to " + user.name);
      var tasks = Tasks.find({promptID: prompt._id}, 
          {sort: {priority: -1, time: -1}}).fetch()
      logger.trace(tasks);
      
    },
    addIdeaToTask: function (idea, task) {
      var cluster = Clusters.findOne({_id: task.ideaNodeID});
      ClusterFactory.insertIdeaToCluster(idea, cluster);
    },
    addQuestion: function (question, task, user) {
      var q = new Question(question, user);
      q.taskID = task._id;
      q.commentIndex = task.comments.length;
      q._id = Questions.insert(q);
      task.comments.push(q);
      Tasks.update({_id: task._id}, {comments: task.comments});
      return question;
    },
    addResponse: function (response, question, task, user) {
      question.answer = response;
      question.isAnswered = true;
      question.answerUserID = user._id;
      Questions.update({_id: q._id}, 
          {answer: response, isAnswered: true, answerUserID: user._id});
      task.comments[q.commentIndex] = q;
      Tasks.update({_id: task._id}, {comments: task.comments});
      return question;
    },
    editQuestion: function (newQuestion, question, task, user) {
      question.question = newQuestion;
      Questions.update({_id: question._id}, {question: newQuestion});
      task.comments[question.commentIndex] = question;
      Tasks.update({_id: task._id}, {comments: task.comments});
      return question
    },
    editResponse: function (newResponse, question, task, user) {
      question.answer = newResponse;
      question.answerUserID = user._id;
      Questions.update({_id: q._id}, 
          {answer: newResponse, answerUserID: user._id});
      task.comments[question.commentIndex] = question;
      Tasks.update({_id: task._id}, {comments: task.comments});
      return question;
    },
    remove: function(tasks) {
      /**************************************************************
       * Remove the task(s) from the DB
       * @Params
       *  tasks - a single task or a list of tasks
       *************************************************************/
      if (hasForEach(tasks)) {
        ids = getIDs(tasks);
        //for (var i=0; i<tasks.length; i++) {
          //ids.push(tasks._id);
        //} 
        if (Meteor.isServer) {
          Tasks.remove({_id: {$in: ids}});
        } else {
          ids.forEach(function(id) {
            Tasks.remove({_id: id});
          });
        }
      } else {
        Tasks.remove({_id: tasks._id});
      }
    },
    
  };
}());

var TaskAllocator = function TaskAllocator(prompt, group) {
  /******************************************************************
   * Constructor for Task Allocator object for a given prompt & group
   * @Params
   *  prompt - the prompt associated with the tasks to be managed
   *  group - the group that will be able to accept the tasks
   *****************************************************************/
  this.promptID = prompt._id;
  this.groupID = group._id;

};

