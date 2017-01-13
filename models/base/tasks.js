// Configure logger for Tools
var logger = new Logger('Models:Tasks');
// Comment out to use global logging level
Logger.setLevel('Models:Tasks', 'trace');
//Logger.setLevel('Models:Tasks, 'debug');
//Logger.setLevel('Models:Tasks', 'info');
//Logger.setLevel('Models:Tasks', 'warn');

Tasks = new Meteor.Collection("tasks");
DummyTasks = new Meteor.Collection("dummyTasks");
Questions = new Meteor.Collection("questions");
Assignments = new Meteor.Collection("assignments");

Task = function (user, prompt, group, desc, type, priority, num, ideasRequested, minutesRequested) {
  /*****************************************************************
   * Constructor for Ideation Tasks
   * **************************************************************/
  //Author & prompt info
  this.promptID = prompt._id;
  this.authorID = user._id;
  this.groupID = group._id;
  //Written directions of the task
  this.desc = desc;
  //Set type and type specific fields
  this.type = type;
  //switch(type) {
    //case "time":
      //break;
    //case "quantity":
      //break;
    //default:
      //break;
  //}
  //Set the priority of the task
  this.priority = priority;
  //Graph container of the Task. Allows for Task = theme
  var cluster = ClusterFactory.create([], user, prompt);
  ClusterFactory.setName(cluster, this.desc); 
  this.ideaNodeID = cluster._id;
  //Q&A to clarify the task 
  //List of Question objects
  this.comments = [];
  //Creation time of the task
  this.time = new Date().getTime();
  //List of users assigned to this task
  this.assignments = [];
  //Number of people who may accept this task
  this.num = num;
  //List of Ideas for inspiration
  this.attachments = [];
	
	//Number of Ideas requested for this task
	this.ideasRequested = ideasRequested;
	//Minutes requested for this task
	this.minutesRequested = minutesRequested;
	//Is the task being edited?
	this.edited = false;

};

Question = function (question, user) {
  /******************************************************************
   * Constructor for Task Question/Answer objects
   * ***************************************************************/
  this.question = question;
  this.questionUserID = user._id
  this.answer = null;
  this.answerUserID = null;
  this.isAnswered = false;
  //The ID of the task
  this.taskID;
  //the index in the list of comments
  this.commentIndex;
};

Assignment = function (task, user) {
  /*****************************************************************
   * Constructor for storing a user assignment to a task
   *****************************************************************/
  this.userID = user._id;
  this.taskID = task._id;
  this.assignmentTime = new Date().getTime();
  this.promptID = task.promptID;
  this.groupID = task.groupID;
};
