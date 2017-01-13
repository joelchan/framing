// Configure logger for Tools
var logger = new Logger('Client:Hcomp:Dashboard');
// Comment out to use global logging level
Logger.setLevel('Client:Hcomp:Dashboard', 'trace');
// Logger.setLevel('Client:Hcomp:Dashboard', 'debug');
// Logger.setLevel('Client:Hcomp:Dashboard', 'info');
// Logger.setLevel('Client:Hcomp:Dashboard', 'warn');


var filters = {
	partFilters: [],
	clusterFilters: [],
	gamchanger: [true, false]
}

MS_PER_MINUTE = 60000;

var forceTimerHandler = "";

Template.HcompDashboard.rendered = function(){
  
  //Set height of elements to viewport height
  //Navbar height=50, header up to idealist = 150, clustering interface header=63
  var height = $(window).height() - 75; 

  logger.debug("window viewport height = " + height.toString());
  $(".ideas-view").height(height);
  $(".tasks-view").height(height);
  $(".notes-view").height(height);
  $(".overall-stats").height(height*0.1);
  $(".vizes").height(height*0.9
                      -4); // clearfixes
  var vizesHeight = $('.vizes').height();
  //logger.debug(height.toString());
  //logger.debug((height*0.7).toString());
  // $("#big-picture-viz").height(height*0.65);
  // $("#big-picture-viz").width(700);
  $("#ideawordcloud").height(vizesHeight
                              -$('.viz-tabs').height());
  var wordCloudHeight = $("#ideawordcloud").height();
  $(".scratchpad-form").height(wordCloudHeight);
  // var scratchpadHeight = $("#scratchpad").height();
  // console.log("Scratchpad height:" + scratchpadHeight);
  // $(".scratchpad-form").height(height*0.38);
  // $(".scratchpad-form").height(scratchpadHeight*0.8);

  // var filterboxContainerHeight = $('.Hcomp-filterbox-container').height();
  var promptHeaderHeight = $('.ideas-view h1').height();
  var filterboxHeaderHeight = $('#filterbox-header').height();
  // var ideaboxHeaderHeight = $('.idea-box-header').height();
  $('.ideadeck-container').height(height
                                  -promptHeaderHeight
                                  -filterboxHeaderHeight
                                  // -ideaboxHeaderHeight
                                  -30); // promptheader margin-top/bottom (30)

  // var facActionsHeight = $('.fac-actions').height();
  var createTaskHeight = $('#create-task-container').height();
  var inspirationsHeaderHeight = $('.task-list-header').height();
  $('#task-card-list').height(height
                              // -facActionsHeight
                              -createTaskHeight
                              -inspirationsHeaderHeight
                              -2); // clearfixes

  Session.set("idealistFilters", filters);
  Session.set("selectedParts", []);
  Session.set("selectedIdeas", []);
  
  // make sure we start with a clean slate on render
  FilterManager.reset("Tasks Filter", Session.get("currentUser"), "tasks");
  FilterManager.create("Tasks Filter", Session.get("currentUser"), "tasks", "promptID", Session.get("currentPrompt")._id);
 
  if (Session.get("currentExp")) {
    FilterManager.create("Tasks Filter", Session.get("currentUser"), "tasks", "groupID", Session.get("currentExp").groupID);
  } else {
    FilterManager.create("Tasks Filter", Session.get("currentUser"), "tasks", "groupID", Session.get("currentGroup")._id);
  }

  var exp = Session.get("currentExp");
  var group = Session.get("currentGroup");
  if (exp) {
    Participants.find({experimentID: exp._id}).observe({
      // added: function(user) {
      changed: function(partNewState, partOldState) {
        logger.trace("Old participant state: " + JSON.stringify(partOldState));
        logger.trace("New participant state: " + JSON.stringify(partNewState));

        if (!partOldState.hasStarted && partNewState.hasStarted) {
          logger.info("new participant began ideation");
          logger.trace("new participatn: " + JSON.stringify(partNewState));
          
          var update = false;
          var cond = Conditions.findOne({_id: partNewState.conditionID});
          if (cond.description == "Treatment") {
            update = true;
          } else {
            logger.debug("Not a treatment participant, not updating inspirations");
          }
           
          if (update) {
            logger.debug("Updating all inspirations");
            var tasks = Tasks.find({groupID: group._id}).fetch();
            tasks.forEach(function(task) {
              var oldNum = task.num;
              var newNum = priorityToNumIdeators(task.priority);
              logger.debug("Updating numideators from " + oldNum + " to " + newNum);
              logger.debug("Updating task with id: " + task._id);
              Tasks.update({ _id: task._id },
                            {$set: {num: newNum}});
            });  
            logger.debug("Updating idea word cloud filter");
            FilterManager.create("IdeaWordCloud Filter", 
              Session.get("currentUser"), "ideas", "userID", partNewState.userID);
          }
        }
      },
    });    
  } else {
    MyUsers.find({groupID: group._id}).observe({
      // added: function(user) {
      added: function(user) {
        logger.trace("Added new user to group: " + JSON.stringify(user));
        logger.debug("Updating all inspirations");
        var tasks = Tasks.find({groupID: group._id}).fetch();
        tasks.forEach(function(task) {
          var oldNum = task.num;
          var newNum = priorityToNumIdeators(task.priority);
          logger.debug("Updating numideators from " + oldNum + " to " + newNum);
          logger.debug("Updating task with id: " + task._id);
          Tasks.update({ _id: task._id },
                        {$set: {num: newNum}});
        });  
      },
    });    
  }
  
  
};

Template.HcompIdeaWordCloud.rendered = function() {
    FilterManager.reset("IdeaWordCloud Filter", Session.get("currentUser"), "ideas");
    //logger.trace("Creating default filter for ideawordcloud filter");
    createDefaultIdeasFilter("IdeaWordCloud Filter");
};
//
Template.HcompBeginSynthesis.events({
  // 'click .begin-synthesis': function() {
  //   logger.info("Pushing Ideators to begin synthesis");
  //   var groupID = Session.get("currentPrompt").groupIDs[0];
  //   var group = Groups.findOne({_id: groupID});
  //   var userIDs = getValsFromField(group.assignments['HcompIdeator'], '_id');
  //   logger.trace(userIDs);
  //   userIDs.forEach(function (id) {
  //     logger.debug("Updating route for user with id: " + id);
  //     MyUsers.update({_id: id}, {$set: {'route': "MturkSynthesis"}});
  //   });
  // },
});







///********************************************************************
//* Template Helpers
//*********************************************************************/


Template.HcompDashIdeabox.helpers({
  prompt : function(){
    return Session.get("currentPrompt").title;
  },
});

Template.HcompOverallStats.helpers({
    // code for ideation stats here
  numIdeasAll : function(){
    // allIdeas = Ideas.find({prompt: {$elemMatch: {_id: Session.get("currentPrompt")._id}}}).fetch();
    // allIdeas = FilterManager.performQuery("Ideas Filter", Session.get("currentUser"), "ideas", "prompt._id").fetch();
    // FilterManager.create("All Ideas Filter", Session.get("currentUser"), "ideas", "prompt._id", Session.get("currentPrompt")._id);
    var allIdeas = FilterManager.performQuery("IdeaWordCloud Filter", 
        Session.get("currentUser"),   
        "ideas").fetch();
    //console.log("ALLIDEAS");
    //console.log(allIdeas);
    return allIdeas.length;
    // return getFilteredIdeas("Ideas Filter").length;
  },

  numIdeatorsAll : function(){
    var userIDs;
    var exp = Session.get("currentExp");
    if (exp) {
      var numIdeators = 0;
      var participants = Conditions.findOne({expID: exp._id, description: "Treatment"}).assignedParts;
      participants.forEach(function(pID) {
        var part = Participants.findOne({_id: pID});
        if (part.hasStarted) {
          numIdeators += 1;
        }
      });
      return numIdeators;
    } else {
      var groupID = Session.get("currentPrompt").groupIDs[0];
      var group = Groups.findOne({_id: groupID});
      userIDs = getValsFromField(group.assignments['HcompIdeator'], '_id');
      return userIDs.length;
    }
  },

  numIdeatorsActive : function(){
    var userIDs;
    var exp = Session.get("currentExp");
    if (exp) {
      var numIdeators = 0;
      var participants = Conditions.findOne({expID: exp._id, description: "Treatment"}).assignedParts;
      participants.forEach(function(pID) {
        var part = Participants.findOne({_id: pID});
        if (part.hasStarted && !part.hasFinished && !part.exitedEarly) {
          numIdeators += 1;
        }
      });
      return numIdeators;
    } else {
      var groupID = Session.get("currentPrompt").groupIDs[0];
      var group = Groups.findOne({_id: groupID});
      userIDs = getValsFromField(group.assignments['HcompIdeator'], '_id');
      return userIDs.length;
    }
  },

});

Template.HcompIdeaWordCloud.helpers({
    ideas : function() {
        // console.log("calling ideas for HcompIdeaWordCloud");
        // cursor = getFilteredIdeas("Ideas Filter"); //getCloudFromIdeas();
        cursor = getCloudFromIdeas();
        return cursor;
    },
    getFontSize : function() {
        var count = this.count;
        //console.log(count);
        //console.log("this:")
        //console.log(this);
        return 10 +(count * 4);
    },
    getWordCount : function() {
        var count = this.count;
        return count;
    },
    getWord : function() {
        var word = this.word;
        return word;
    }
});

Template.TaskCards.helpers({
    tasks : function() {
        // taskList = Tasks.find({ desc: { $exists: true}}).fetch();
        taskList = FilterManager.performQuery("Tasks Filter", Session.get("currentUser"), "tasks").fetch();
        var sortedTaskList = taskList.sort(function(a,b) { return b.time - a.time});
        return sortedTaskList;
    },
    numTasks : function() {
        // taskList = Tasks.find({ desc: { $exists: true}}).fetch();
        taskList = FilterManager.performQuery("Tasks Filter", Session.get("currentUser"), "tasks").fetch();
        var sortedTaskList = taskList.sort(function(a,b) { return b.time - a.time});
        return sortedTaskList.length;
    }

});
//Template.TaskCard.events({
//    'click .show-full-description': function() {
//        $(".card-description").css({height: "auto", overflow: "visible"});
//    },
//}),

Template.TaskCard.helpers({
    getDescription : function() {
        var description = this.desc;
        return description;
    },
    isNotEdit : function() {
        var edited = this.edited;
        if((edited == true)) {
            return false;
        }
        return true;
    },
    getPriority : function() {
        var priority = this.priority;
        // return priority;
        var message = "";
        switch(priority) {
            case 1:
                message = "Lo";
                break;
            case 2:
                message = "Mid";
                break;
            case 3:
                message = "Hi";
                break;
            default:
                message = "";
                break;
        }
        logger.debug("Priority is " + message);
        return message;
    },

    isLoPriority : function() {
      var priority = this.priority;
      if (priority == 1) {
        return true;
      } else {
        return false;
      }
    },

    isMidPriority : function() {
      var priority = this.priority;
      if (priority == 2) {
        return true;
      } else {
        return false;
      }
    },

    isHiPriority : function() {
      var priority = this.priority;
      if (priority == 3) {
        return true;
      } else {
        return false;
      }
    },

    getIdeators : function() {
        var numAssignedUsers = this.assignments.length;
        var availableUsers = this.num;
        var message = "";
        message = numAssignedUsers + "/" + availableUsers;
        return message;
    },
    getIdeas : function() {
        var ideaIDs = Clusters.findOne({_id : this.ideaNodeID}).ideaIDs;
        var ideas = Ideas.find({_id : {$in : ideaIDs}}).fetch();
        return ideas.length;
    },
    ideaContents : function() {
        var ideaIDs = Clusters.findOne({_id : this.ideaNodeID}).ideaIDs;
        var ideas = Ideas.find({_id : {$in : ideaIDs}}).fetch();
        return ideas;
    },
    // getQuestions : function()
    // {
    //     var questions = this.comments;
    //     var count = questions.length;
    //     return count;
    // },
    getIdeatorCount : function() {
        var count = this.num;
        return count;
    },
    // getIdeaCount : function()
    // {
    //     var count = this.ideasRequested;
    //     return count;
    // },
    // getMinuteCount : function()
    // {
    //     var count = this.minutesRequested;
    //     return count;
    // },
    getID : function() {
        var id = this._id;
        return id;
    }
});

/********************************************************************
* Template Events
*********************************************************************/

Template.HcompDashboard.events({
	
  'click .begin-synthesis': function() {
    // logger.info("Pushing Ideators to begin synthesis");
    var groupID = Session.get("currentPrompt").groupIDs[0];
    var group = Groups.findOne({_id: groupID});
    var userIDs = getValsFromField(group.assignments['HcompIdeator'], '_id');
    logger.trace(userIDs);
    // userIDs.forEach(function (id) {
    //   logger.debug("Updating route for user with id: " + id);
    //   MyUsers.update({_id: id}, {$set: {'route': "MturkSynthesis"}});
    // });
    //logger.debug("Sending self to synthesis");
    Router.go('MturkSynthesis', 
        {'promptID': Session.get("currentPrompt")._id, 
        'userID': Session.get("currentUser")._id}
    );
    // MyUsers.update({_id: Session.get("currentUser")._id}, {$set: {'route': "MturkSynthesis"}});
  },

  'click .review-brainstorm' : function() {
    //logger.debug("Sending self to review brainstorm page");
    Router.go('HcompResultsPage', {promptID: Session.get("currentPrompt")._id, userID: Session.get("currentUser")._id});
  },

  'click .goto-prompts-page' : function() {
    //logger.debug("Sending self to prompts page");
    Router.go('CrowdPromptPage', {userID: Session.get("currentUser")._id});
  },

  'click .gamechangestar' : function(){
    EventLogger.logToggleGC(this);
		IdeaFactory.toggleGameChanger(this);
	},

	'click #new-task-btn' : function(){
		$('#new-prompt').val("");
	},


	'click #task-create' : function(e, target){
		var message = $("#task-description").val();
        if (message != "") {
            // var priorityText = $("#task-priority").val();
        // console.log("Creating task with priority: " + priorityText);
            var priorityNum = parseInt($("#CreateTask" + " input[type='radio'][name='taskPriorityOptions']:checked").val());
            var ideatorsVal = priorityToNumIdeators(priorityNum);
        // var ideatorsVal;
        // switch (priorityNum) {
        //   case 1:
        //     ideatorsVal = parseInt(Session.get("currentGroup").users.length*0.33); // change this later once we have group assignment working
        //     break;
        //   case 2:
        //     ideatorsVal = parseInt(Session.get("currentGroup").users.length*0.66);
        //     break;
        //   case 3:
        //     ideatorsVal = parseInt(Session.get("currentGroup").users.length);
        //     break;
        //   default:
        //     ideatorsVal = parseInt(Session.get("currentGroup").users.length*0.66);
        //     break;
        // }
        // var ideatorsVal = $("#task-ideators").val();
            // var ideasVal = $("#task-ideas").val();
            // var minutesVal = $("#task-minutes").val();

            // switch (priorityText)
            // {
            // 	case "Low":
            // 		priorityNum = 1;
            // 		break;
            // 	case "Medium":
            // 		priorityNum = 2;
            // 		break;
            // 	case "High":
            // 		priorityNum = 3;
            // 		break;
            // 	default: 
            // 		priorityNum = 1;
            // 		break;
            // }
            // var task = new Task(Session.get('currentUser'), Session.get('currentPrompt'), Session.get('currentGroup'), message, 'open', priority=priorityNum, num=ideatorsVal, ideasRequested=ideasVal, minutesRequested=minutesVal); 
        var task = new Task(Session.get('currentUser'), Session.get('currentPrompt'), Session.get('currentGroup'), message, 'open', priority=priorityNum, num=ideatorsVal); 
            task._id = Tasks.insert(task);

        // clear the message description
        $("#task-description").val("");
            
            
    //    $('#CreateTask').toggleClass('in');

        $("#CreateTask" + " input[type='radio'][name='taskPriorityOptions'][value='1']").prop("checked",false);
        $("#CreateTask" + " input[type='radio'][name='taskPriorityOptions'][value='2']").prop("checked",true);
        $("#CreateTask" + " input[type='radio'][name='taskPriorityOptions'][value='3']").prop("checked",false);

        // $("#CreateTask" + " input[type='radio'][name='taskPriorityOptions'][value='2']").parent().attr("checked","checked");
        // $("#CreateTask" + " input[type='radio'][name='taskPriorityOptions'][value='2']").attr("checked","checked");
        }
	},
    
  'click #task-create-cancel' : function() {
//    $('#CreateTask').toggleClass('in');
    $("#task-description").val("");
    $("#CreateTask" + " input[type='radio'][name='taskPriorityOptions'][value='1']").prop("checked",false);
    $("#CreateTask" + " input[type='radio'][name='taskPriorityOptions'][value='2']").prop("checked",true);
    $("#CreateTask" + " input[type='radio'][name='taskPriorityOptions'][value='3']").prop("checked",false);
  },

	'click .card-edit' : function() {
		var taskID = $(event.target).parent().parent().parent().attr('id');
		console.log(taskID);
		Tasks.update({ _id: taskID },{$set: { edited: true}});
		
		//var task = new Task(Session.get('currentUser'), Session.get('currentPrompt'), Session.get('currentGroup'), message, 'open', priority=priorityNum, num=ideatorsVal, ideasRequested=ideasVal, minutesRequested=minutesVal); 
		//task._id = Tasks.insert(task);
	},


	'click .task-update' : function() {
		var taskID = $(event.target).parent().parent().parent().parent().attr('id');
		var message = $("#"+taskID + " .task-description").val();
    var priorityNum = parseInt($("#"+taskID + " input[type='radio'][name='taskPriorityOptions']:checked").val());
    var ideatorsVal = priorityToNumIdeators(priorityNum);
		// var priorityText = $("#"+taskID + " .task-priority").val();
		// var priorityNum;
		// var ideatorsVal = $("#"+taskID + " .task-ideators").val();
		// var ideasVal = $("#"+taskID + " .task-ideas").val();
		// var minutesVal = $("#"+taskID + " .task-minutes").val();

		// switch (priorityText)
		// {
		// 	case "Low":
		// 		priorityNum = 1;
		// 		break;
		// 	case "Medium":
		// 		priorityNum = 2;
		// 		break;
		// 	case "High":
		// 		priorityNum = 3;
		// 		break;
		// 	default: 
		// 		priorityNum = 1;
		// 		break;
		// }

		// Tasks.update({ _id: taskID },{$set: { edited: false, desc: message, priority: priorityNum, num: ideatorsVal, ideasRequested: ideasVal, minutesRequested: minutesVal}});
    Tasks.update({ _id: taskID },
                  {$set: {edited: false, 
                          desc: message, 
                          priority: priorityNum, 
                          num: ideatorsVal}});
	},

  'click .task-update-cancel' : function() {
    var taskID = $(event.target).parent().parent().parent().parent().attr('id');
    Tasks.update({ _id: taskID },{$set: { edited: false}});
  },
    
    'keyup textarea' : function(e, target){
        logger.debug(e);
        logger.debug(target);
        console.log("key pressed")
        if(e.keyCode===13) {
          logger.debug("enter pressed")
          $("#task-create").click();
        }
      }, 
         
    'click .hcomp-dashboard .card-description' : function(e, target) {
        logger.debug("Clicked on Description");
        logger.debug(e.target);
        logger.debug(target);
        $(e.target).parent().toggleClass("expandDescription");
    }
});

Template.TaskCard.events({
//    'click .hcomp-dashboard .card-description a' : function(e, target) {
//        logger.debug("Clicked on Description");
//        logger.debug(e);
//        logger.debug(target);
//        $(target).toggleClass("expandDescription");
//    }
})

Template.HcompIdeaWordCloud.events({
  'click .cloudItem' : function() {
    var clickedWord = $(event.target).children().context.text;
    currentSearchQuery = $('#search-query').val();
    
    // toggling logic
    if (currentSearchQuery === clickedWord) { 
      $('.search-remove-btn').click();
    } else {
      $('#search-query').val(clickedWord);
      $('.search-apply-btn').click();  
    }
  },
})

function getCloudFromIdeas() {
	// var ideas = Ideas.find({ content: { $exists: true}}).fetch();
  // var ideas = Ideas.find({ prompt._id : Session.get("currentPrompt")._id}).fetch();
  
  // get prompt specific stopwords
  var promptStopWords = []
  var promptWords = Session.get("currentPrompt").question.split(" ");
  for (var i = 0; i < promptWords.length; i++) {
    promptStopWords[i] = promptWords[i].trim()
                                       .toLowerCase()
                                       .replace(/[^\w\s]|_/g, "")
                                       .replace(/\s{2,}/g," ");
  }
  //logger.debug("Prompt stop words: " + promptStopWords.toString());
  var ideas = FilterManager.performQuery("IdeaWordCloud Filter", 
      Session.get("currentUser"),   
      "ideas").fetch();
	var cloud = [];
	for (var i = 0; i < ideas.length; i++) {
		var idea = ideas[i].content;
		var words = idea.split(" ");
		for (var j = 0; j < words.length; j++) {
			var word = words[j]
                .trim().toLowerCase()
                .replace(/[^\w\s]|_/g, "")
                .replace(/\s{2,}/g," ");

			var cloudItem = {'word': '', 'count': 0, 'likes':0};
			cloudItem.likes = ideas[i].votes.length;
			var containsWord = Boolean(false);
			for (var k = 0; k < cloud.length; k++) {
				if (cloud[k].word == word) {
					cloud[k].count = cloud[k].count + 1;
					containsWord = Boolean(true);
				}
			}
            // && stopWords.words.indexOf(word) >= 0
            // console.log(stopWords);
            // console.log(stopWords.words)
			if(containsWord == false 
        && stopWords.words.indexOf(word) == -1
        && promptStopWords.indexOf(word) == -1
        && word != "") {
				// console.log(stopWords);
        cloudItem.word = word;
				cloudItem.count += 1;
				cloud.push(cloudItem);
			}
		}	
	}
  var sortedCloud = cloud.sort(function(a,b) {
      if(a.word < b.word) return -1;
      if(a.word > b.word) return 1;
      return 0;
  });
  console.log("CLOUD");
  console.log(sortedCloud);
	return sortedCloud;
};

priorityToNumIdeators = function(priorityNum) {
  switch (priorityNum) {
    case 1:
      var prop = 0.67;
      break;
    case 2:
      var prop = 0.67;
      break;
    case 3:
      var prop = 0.67;
      break;
    default:
      var prop = 0.67;
      break;
  }
  var exp = Session.get("currentExp");
  logger.trace("Current experiment: " + JSON.stringify(exp));
  if (exp) {
    var ideators = []
    var participants = Conditions.findOne({expID: exp._id, description: "Treatment"}).assignedParts;
    participants.forEach(function(pID) {
      var part = Participants.findOne({_id: pID});
      if (part.hasStarted) {
        ideators.push(part._id)
      }
    });
    logger.trace("Participants in treatment condition who have started experiment: " + JSON.stringify(ideators));
    var ideatorsValTemp = parseInt(ideators.length*prop);
  } else {
    var ideatorsValTemp = parseInt(Session.get("currentGroup").users.length*prop);
  }
  if (ideatorsValTemp < 1) {
    var ideatorsVal = 1;
  } else {
    var ideatorsVal = ideatorsValTemp;
  }

  return ideatorsVal;
}

/************************
Word Bubble Visualization
*************************/

function drawBubbles(cloud, svg) {

svg.selectAll("*")
    .remove();

var margin = {
    top: 10,
    right: 0,
    bottom: 14,
    left: 0
    },
    width = 700,
    height = 800;

var n = 56,
    m = 1,
    padding = 16,
    radius = d3.scale.sqrt().range([0, 25]),
    color = d3.scale.category10().domain(d3.range(m)),
    x = d3.scale.ordinal().domain(d3.range(m)).rangePoints([0, width/2], 1);


//input the cloudItems, map each item to an object with


var nodes = cloud.map(function (item) {
    var i = Math.floor(Math.random() * m); //color
       // v = (i + 1) / m * -Math.log(Math.random()); //value
    return {
        radius: radius(item.count),
        color: color(i),
        cx: x(i),
        cy: height / 5,
        title: item.word,
        likes: item.likes
    };

});



console.log("nodes are:");
console.log(nodes);

var force = d3.layout.force()
    .nodes(nodes)
    .size([width/2, height])
    .gravity(0)
    .charge(0)
    .on("tick", tick)
    .start();



var rem = svg.selectAll("circle")
    .data(nodes, function(d) {return d})
    .exit()
    .style("fill", "grey");

var rgscale = d3.scale.linear()
              .domain([0,1])
              .range(["red", "green"]);

var circle = svg.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("opacity", function(d) {if (d.title=="") {return 0} else {return .2}})
    .attr("r", function (d) {return d.radius;})
    .attr("fill", function(d) {return rgscale(d.likes);})
    .call(force.drag);

    //circle.remove()


console.log("rem:")
console.log(rem[0])


var tex = svg.selectAll("text")
    .data(nodes)
    .enter().append("text")
    .attr("x", function (d) {
      return d.cx;
    })
    .attr("y", function (d) {
      return d.cy;
    })
    //.attr("dx", -5)
    .text(function(d) {return d.title;})
    .style("font-size", function(d) {return d.radius/3;})
    .style("fill", function(d) {if (d.likes==1) {return "green";} 
                                             else {return "red";};})
    .style("stroke-width", .1)
    .call(force.drag);


function tick(e) {
    circle.each(gravity(.1 * e.alpha))
        .each(collide(.5))
        .attr("cx", function (d) {
        //return d.x;
        return d.x = Math.max(d.radius, Math.min(width - d.radius, d.x));
    })
        .attr("cy", function (d) {
        //return d.y+10;
        return d.y = Math.max(d.radius, Math.min(height - d.radius, d.y));
    });
    tex.each(gravity(.2 * e.alpha))
        .each(collide(.5))
        .attr("x", function (d) {
        return d.x-(d.radius/2);
    })
        .attr("y", function (d) {
        return d.y ;
    });
}
/*
   nodes.attr("cx", function(d) 
    {
      return d.x; 
      //return d.x = Math.max(6, Math.min(width - 6, d.x));
    })
    .attr("cy", function(d) 
    { 
      return d.y; 
      //return d.y = Math.max(6, Math.min(height - 6, d.y));
    });
*/

// Move nodes toward cluster focus.
function gravity(alpha) {
    return function (d) {
        d.y += (d.cy - d.y) * alpha /2;
        d.x += (d.cx - d.x) * alpha /2;
    };
}

// Resolve collisions between nodes.
function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodes);
    return function (d) {
        var r = d.radius + radius.domain()[1] + padding,
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
        quadtree.visit(function (quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== d)) {
                var x = d.x - quad.point.x,
                    y = d.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
                if (l < r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
    };
}

}




Template.HcompOtherViz.rendered = function() {
  //look up Tracker
  var margin = {
    top: 120,
    right: 0,
    bottom: 0,
    left: 0
    },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


  var svg = d3.select("#svgdiv").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .call(d3.behavior.zoom().on("zoom", redrawB))
    .append('svg:g');
  
  function redrawB() {
      console.log("here", d3.event.translate, d3.event.scale);
      svg.attr("transform","translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")"); } 

 


  Deps.autorun(function() {
    //get the new dataset 
    //var ideas = getFilteredIdeas("Ideas Filter");

    //selectAll svg elements that correspond, then bind the relevant data to it

    //enter

    //transition

    //exit....remove()
    
    var cloud =  getCloudFromIdeas();
    console.log("svg is:" + svg);
    drawBubbles(cloud, svg);
  })
  
}

function formatData(rawIdeas) {

  //takes a list of objects creates list of objects 
    // {id:i , idea:content, categories:[], quality:votes.length}

  var newData = [];

  for (var i = 0; i < rawIdeas.length; i++) {
    var id = i+1
    var idea = rawIdeas[i].content
    var quality = rawIdeas[i].votes.length

    var obj = {"id":1, "idea":" ", "categories":[" "], "quality":0 }

    obj.id = id
    obj.idea = idea 
    obj.quality = quality 

    newData.push(obj);
  }

  return newData;
}


Template.Other.rendered = function() {
  var rawIdeas=
  [
  {
    "id":1,
    "idea":"Godzilla wolrd",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":2,
    "idea":"Extraterrestrial Conflict on Distant Alien World",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":3,
    "idea":"Classic Doctor Who: The Giant Robot",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":4,
    "idea":"moonbase colonization",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":5,
    "idea":"A giant pair of legs",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":6,
    "idea":"Gorilla Creature",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":7,
    "idea":"Giant Vampire",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":8,
    "idea":"Science Experiment Gone Wrong",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":9,
    "idea":"Attack of the giant baby",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":10,
    "idea":"Elemental of some sort - Earth, fire, water?",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":11,
    "idea":"Golems -- but not made of rocks",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":12,
    "idea":"Giant Monkey Baby",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":13,
    "idea":"Angry Reagan",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":14,
    "idea":"Different people take turns growing and shrinking",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":15,
    "idea":"Organic/Meat Building Structures",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":16,
    "idea":"Goo Monster",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":17,
    "idea":"startship trooper universe",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":18,
    "idea":"Shadow Monster",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":19,
    "idea":"hulk-like biped monster",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":20,
    "idea":"Lovecraftian Horror",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":21,
    "idea":"Basically Cthulhu",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":22,
    "idea":"giant baby",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":23,
    "idea":"a really bad dream",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":24,
    "idea":"Yeah, Literally a giant chicken",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":25,
    "idea":"Giant Stone Golem",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":26,
    "idea":"Mutated Human",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":27,
    "idea":"Toy worlk",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":28,
    "idea":"Jack and the Beanstalk",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":29,
    "idea":"Giant Mecha",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":30,
    "idea":"Dragon",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":31,
    "idea":"Food-oriented:  rotten food monster, mutated from broken fridge",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":32,
    "idea":"Transformers",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":33,
    "idea":"Demon",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":34,
    "idea":"porridge factory",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":35,
    "idea":"Godzilla",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":36,
    "idea":"Robotic tower",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":37,
    "idea":"Giant \"young\" monster who just wants to play but doesn't understand that destroying stuff is bad.",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":38,
    "idea":"Person attacked by fleas",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":39,
    "idea":"Megacities",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":40,
    "idea":"Enormous Guy wearing an Oculus",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":41,
    "idea":"Jack and the Giant Beanstalk or whatever that fairy tale is called",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":42,
    "idea":"new york city",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":43,
    "idea":"Giant dragons",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":44,
    "idea":"The Iron Giant",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":45,
    "idea":"Kaiju",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":46,
    "idea":"Dinosaur wolrd",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":47,
    "idea":"Wind up tin toys",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":48,
    "idea":"Super Heros Face off with Villainous Machination",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":49,
    "idea":"small godzillas vs. large human",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":50,
    "idea":"person wearing a cursed VR mask that makes them grow into a giant.",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":51,
    "idea":"Grekko Roman Heros Face Mythological Gigabeast",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":52,
    "idea":"Baby as titan trying to get a toy or food",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":53,
    "idea":"Candy kingdom, with the titan as a greedy human trying to eat everything",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":54,
    "idea":"Mouse People Are Attacked by Feral Behemoth Cat",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":55,
    "idea":"Squirrel protecting his nuts against the ants",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":56,
    "idea":"Bipedal Biorganic giant monster",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":57,
    "idea":"Giant fire creature attacked by fire trucks",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":58,
    "idea":"Futuristic Space Colony",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":59,
    "idea":"giant monster standing on weird stilts -- doesn't like getting their actual feet messed up.",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":60,
    "idea":"Garbage Pail Kid",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":61,
    "idea":"Giant robot made of washing machines, attacked by characters from Sesame Street",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":62,
    "idea":"Hostile alien planet",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":63,
    "idea":"A planet being mined for resources",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":64,
    "idea":"children's toy trying to attack them",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":65,
    "idea":"Giant Bug of some sort",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":66,
    "idea":"Giant Crustaceous Abomination Attacks Stranded Pirate Party",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":67,
    "idea":"that one sequel to Honey I Shrunk the Kids",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":68,
    "idea":"mad scientist serum that turns people into abominations",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":69,
    "idea":"Angry God",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":70,
    "idea":"Giant robot with hammer hands",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":71,
    "idea":"Virus trying to convert healthy cells",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":72,
    "idea":"CRYSTALS EVERYWHERE",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":73,
    "idea":"scientist trying to create monsters and switch turns ala Rampage",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":74,
    "idea":"Terminator 2",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":75,
    "idea":"Giant Plantlife-based construction",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":76,
    "idea":"Monkeys...all monkeys (looking at you R)",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":77,
    "idea":"Katamari Damacy -- prince vs. king",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":78,
    "idea":"WITH BIG PURPLE CORRUPTION",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":79,
    "idea":"Chimera Creature made up of multiple parts",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":80,
    "idea":"Summoners and summoing monster like FFX",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":81,
    "idea":"Trolls -- like in the Troll Hunter movie",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":82,
    "idea":"Atlas -- he's shrugging and we don't like it!",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":83,
    "idea":"cartoon villain builds a giant death robot",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":84,
    "idea":"Vampire Hunters Face Golem \n\nComposed of Thousands of Bodies and Graves",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":85,
    "idea":"Creature Made out of book pages",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":86,
    "idea":"Bio-luminescent Creatures",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":87,
    "idea":"Steampunk titan",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":88,
    "idea":"A horribly derailed brainstorming session with the titan as a frustrated clusterizer",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":89,
    "idea":"vine monster",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":90,
    "idea":"Alien Siege Machine Attacks the Pentagon",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":91,
    "idea":"Ice monster trying to get from bottom to top of a mountain before it melts. The villagers try to stop it from getting to the castle at the top",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":92,
    "idea":"a really bad hallucianation -- BRAINSTORM NO RIGHT SPELLING!",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":93,
    "idea":"robin hood: men in titans",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":94,
    "idea":"Ocean?",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":95,
    "idea":"Will Smith and Friends fight giant mechanized spider",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":96,
    "idea":"Oversized Bacteria",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":97,
    "idea":"nanobots attacking a target",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":98,
    "idea":"The titan can shape shift into multiple forms",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":99,
    "idea":"small person puppeteering titan",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":100,
    "idea":"bees / insects attacking invading humans / monsters",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":101,
    "idea":"Kaiju Assault on Coastal City",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":102,
    "idea":"Mother Hen",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":103,
    "idea":"explorers on a planet discover giant creatures while trying to colonize cause urf is gonna die",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":104,
    "idea":"Guy with really big stilts. Like super big",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":105,
    "idea":"FIGHTING FOR ITS CHILDREN",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":106,
    "idea":"Titan is hungry, needs food badly",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":107,
    "idea":"underwater universe",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":108,
    "idea":"Plant Creature",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":109,
    "idea":"FIGHTING FOR GLORY",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":110,
    "idea":"Ice titant",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":111,
    "idea":"titan escaping confinement/experimentation",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":112,
    "idea":"Living Tree",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":113,
    "idea":"Giant robot trying to steal power from a city",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":114,
    "idea":"a monster who sees a different, enjoyable world that they like to smash but everyone else just sees destruction",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":115,
    "idea":"titan retrieving it's young/egg",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":116,
    "idea":"Huge Native American \n\nBear Spirit is Summoned to Ward off Wild West Frontiersman",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":117,
    "idea":"Gargamel vs. the Smurfs",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":118,
    "idea":"Groot",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":119,
    "idea":"rubber suit-era kaiju",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":120,
    "idea":"Bowling pin monster -- you kill it, you get a strike...or a spare if your partner dies.",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":121,
    "idea":"Titan is hunting for treasure",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":122,
    "idea":"titan can only see auras like heat signatures",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":123,
    "idea":"Barren Wasteland littered with remains of other titans",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":124,
    "idea":"Young monster who is afraid of buildings and sees them as scary monsters and wants to smash them but obviously...that is bad...",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":125,
    "idea":"Sid vs. the Toy Story toys",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":126,
    "idea":"Dragons!?",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":127,
    "idea":"Gabe Newell",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":128,
    "idea":"the non-HMD players are bowling pins and the titan is a bowler trapped in a nightmare where the bowling pins are fighting back",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":129,
    "idea":"chefs trying to wrangle a meal from giant food",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":130,
    "idea":"The titan is a... SHARKNADO!",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":131,
    "idea":"Things fighting the titans using tools/weapons made from the titans",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":132,
    "idea":"Computer Virus fighting Anti Virus",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":133,
    "idea":"trogdor the burninator",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":134,
    "idea":"The titan is various historical figures (Lincoln, Cleopatra, etc.)",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":135,
    "idea":"Meat monster with every carrying tiny meat grinders and meat tenderizers",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":136,
    "idea":"Absence -- A void creature (Not lexica void)",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":137,
    "idea":"Manifestation of SHODAN",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":138,
    "idea":"burger king trying to feed the people",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":139,
    "idea":"vegetable monster and everyone is some sort of cow or grass-eating monsters",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":140,
    "idea":"titan is composed of precious materials and others want to take out",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":141,
    "idea":"A Building that has come alive",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":142,
    "idea":"Researcher",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":143,
    "idea":"hungry hungry hill troll",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":144,
    "idea":"Titan is smashing is way to freedom",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":145,
    "idea":"fire breathing titan trying to warm up a cold cold universe",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":146,
    "idea":"Titan acting in defense of it's giant hideous cute baby titans",
    "categories":[""],
    "quality":"1"
  },
  {
    "id":147,
    "idea":"a very very very good looking titan",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":148,
    "idea":"FIGHTING FOR THE ENVIRONMENT",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":149,
    "idea":"dieselpunk with riveted steel and gunpowder cannons",
    "categories":[""],
    "quality":"0"
  },
  {
    "id":150,
    "idea":"Abstract Golem Creatures",
    "categories":[""],
    "quality":"0"
  }
]
    // global intensity of attraction
  var charge = -200;
  // link distance factor used to determine line length;
  var distanceFactor = 140;
  var maxDistance = 250;

  //size of the svg
  var width = 200;
  var height = 200;

  //makes the svg element
  var svg = d3.select("#svgdiv3")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    //.attr("pointer-events", "all")
    .append('svg:g')
    .append('svg:g')
    .call(d3.behavior.zoom().on("zoom", redraw))
    .append('svg:g');

    function redraw() {
      console.log("here", d3.event.translate, d3.event.scale);
      svg.attr("transform","translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")"); } 


    CreateForceDiagram(GetForceData(rawIdeas), svg, width, height);
}

/*
Template.ExperimentalForceV.rendered = function() {

  // global intensity of attraction
  var charge = -200;
  // link distance factor used to determine line length;
  var distanceFactor = 140;
  var maxDistance = 250;

  //size of the svg
  var width = 700;
  var height = 800;

  var color = d3.scale.category10();

  var svg = d3.select("#svgdiv2")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .call(d3.behavior.zoom().scaleExtent([.5, 3]).on("zoom",rescale))
              .append("g")

  function rescale() {
    trans=d3.event.translate;
    scale=d3.event.scale;

    svg.attr("transform",
        "translate(" + trans + ")"
        + " scale(" + scale + ")");
  }
  
  //data
  var rawIdeas = getFilteredIdeas("IdeaWordCloud Filter");
  var newData = formatData(rawIdeas)
  var dataset = processData(GetForceData(newData));

  var nodes1 = dataset.nodes, 
      links1 = dataset.edges

  //force layout
  var f1 = d3.layout.force()
    .nodes(nodes1)
    .links(links1)
    .charge(charge)
    .size([width-90, height-90])
    .linkDistance(function(d) 
    {
      return 50-d.strength;
    })
    .on("tick", tick);

var node1 = svg.selectAll(".node"),
    link1 = svg.selectAll(".link");

// 1. Add three nodes and three links.
setTimeout(function() {
  var a = {text: "a", weight:2, size:6}, b = {text: "b", weight:2, size:8}, c = {text: "c", weight:2, size:10};
  nodes1.push(a, b, c);
  links1.push({source: a, target: b, strength:2}, {source: a, target: c, strength:2}, {source: b, target: c, strength:2});
  start();
}, 9000);

setTimeout(function() {
  var r = {text: "r", weight:2, size:12}
  nodes1.push(r);
  start();
}, 6000);



function start() {

  console.log(dataset.nodes)
  var weights = dataset.nodes.map(function(node) {return node.weight})
  var maxw = Math.max.apply(undefined, weights)
  console.log("max weight:")
  console.log(maxw)
  
  var sizes = dataset.nodes.map(function(node) {return node.size})
  var maxs = Math.max.apply(undefined, sizes)


  var ws = d3.scale.linear()
            .domain([0, maxw])
            .range([10, 1])

  //scaling node size
  var sizescale = d3.scale.linear()
                    .domain([0, maxs])
                    .range([4,12])

  //scaling node color
  var cscale = d3.scale.linear()
                    .domain([0, 1, maxs])
                    .range(["#DCE5E3",
"#FAD8D4",
"#C7548B"])

  var wsc = d3.scale.linear()
            .domain([0, 5, 10])
            .range(["orange", "white", "steelblue"])

  var colorscale = d3.scale.linear()
            .domain([0,1])
            .range(["orange", "white"])

  //scaling opacity
  var wst = d3.scale.linear()
            .domain([0, 7])
            .range([1, .5])

    link1 = link1.data(f1.links())
  link1.enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", "grey")
    .style("opacity", function(d) 
    {
      return d.strength/3;
    })
      .style("stroke-width", function(d) 
    {
      return   (1/10)*(Math.round(Math.sqrt(d.strength)));
    });

  node1 = node1.data(f1.nodes(), function(d) { return d.text;});
  node1.enter().append("circle")
    .attr("class", function(d) { return "node " + d.text; })
    .attr("r", function(d) 
                { 
                  return sizescale(d.size);  
                })
                .style("opacity", function(d, i) 
                {
                  if (d.text=="Nothing") {return 0;}
                  else {return wst(d.weight);}
                })
                .style("stroke-width", function(d,i) { return ws(d.weight);})
                //colors to size 
                .style("fill", function(d,i) {return cscale(d.size);}) 
                .on("mouseover", function(d){mouseAdd(d)})
                .call(f1.drag);
  node1.exit().remove();

  function mouseAdd(d) {

    console.log("mouseing over")
    var newIdeasToAdd = [{name:10, size:d.weight, text:d.text+"1"},{name:11, size:7, text:d.text+"2"},{name:12, size:14, text:d.text+"3"}]

    nodes1.push.apply(nodes1, newIdeasToAdd)
    console.log("calling start")
    start();
  }


  f1.start();

  console.log("nodes:")
  console.log(nodes1)
  console.log("links:")
  console.log(links1)
}

function tick() {
  link1.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
  node1.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
}

  
  Deps.autorun(function() {  

    var newRaw =  getFilteredIdeas("Ideas Filter")
    var newlen = newRaw.length
    var oldlen = rawIdeas.length

    var newIdeasToAdd = [{name:newlen, size:3, text:"idea yay"},{name:newlen-1, size:7, text:"another idea"},{name:newlen-2, size:14, text:"idea3"}]

    nodes1.push.apply(nodes, newIdeasToAdd)
    start();

    if (newlen > oldlen) {

      //get difference between ideas and call

    }
  

    //Old force diagram code
   
    var rawIdeas = getFilteredIdeas("Ideas Filter");

    var newData = formatData(rawIdeas)

    var dataset = processData(GetForceData(newData));

    CreateForceDiagram(dataset, svg, width, height);
    
  })

} */

Template.ForceV.rendered = function() {

  // global intensity of attraction
  var charge = -200;
  // link distance factor used to determine line length;
  var distanceFactor = 140;
  var maxDistance = 250;

  //size of the svg
  var width = 700;
  var height = 800;

  var color = d3.scale.category10();

  var svg = d3.select("#svgdiv2")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .call(d3.behavior.zoom().scaleExtent([.5, 3]).on("zoom",rescale))
              .append("g")

  function rescale() {
    trans=d3.event.translate;
    scale=d3.event.scale;

    svg.attr("transform",
        "translate(" + trans + ")"
        + " scale(" + scale + ")");
  }
  
  // first render
  var rawIdeas = FilterManager.performQuery("IdeaWordCloud Filter", 
        Session.get("currentUser"),   
        "ideas").fetch();
  Session.set("numOld", rawIdeas.length);
  var newData = formatData(rawIdeas)
  var dataset = processData(GetForceData(newData));
  CreateForceDiagram(dataset, svg, width, height);

  // update every minute
  forceTimerHandler = Meteor.setInterval(function(){
    numOld = Session.get("numOld");
    logger.debug("Checking for new ideas to update force diagram");
    rawIdeas = FilterManager.performQuery("IdeaWordCloud Filter", 
          Session.get("currentUser"),   
          "ideas").fetch();
    var numNew = rawIdeas.length - numOld;
    if (numNew >= 10) {
      logger.debug("There are " + numNew + " new ideas since last update")
      newData = formatData(rawIdeas)
      dataset = processData(GetForceData(newData));
      CreateForceDiagram(dataset, svg, width, height);  

      // update the threshold for new ideas
      Session.set("numOld", rawIdeas.length);
    } else {
      logger.debug("Insufficient new ideas (only " + numNew + ") since last update");
    }
  }, 30000);
}

Template.ForceV.destroyed = function () {
  // clear the interval for the force updater
  Meteor.clearInterval(forceTimerHandler);
}
 
function GetForceData(ideaData)
{
  // Get Category Affinity Matrix
  var categoryAffinity = getCategoryAffinity(ideaData);

  // Get Term Affinity Matrix
  var termAffinity = getTermAffinity(ideaData);

  // Get Combined Affinity Matrix
  var combinedAffinity = getCombinedAffinity(categoryAffinity, termAffinity)

  //var forceData = createForceData(categoryAffinity, ideaData);
  //var forceData = createForceData(termAffinity, ideaData);
  var forceData = createForceData(termAffinity, ideaData);

  return forceData;
}

/********************************************************************
* Visualization - Create Graph Data Logic
********************************************************************/


function generateIdeaData()
{
  createGraph();
  
}

function createGraph()
{
  var promptID = 0;
  var groupID = 0;
  var userID = 0;
  Meteor.call('graphCreate', promptID, groupID, userID, function (error, result)  
  {
    var graphId = result;
    //var graph = Graphs.findOne({'_id': graphId});
    populateGraph(graphId);
  });
}

function populateGraph(graphId)
{
  var metadata = {};
  metadata['name'] = "Action"
  Meteor.call('graphCreateThemeNode', graphId, metadata, function (error, result)   
  {
    var themeNodeId = result._id;
    createAndLinkChild(graphId, themeNodeId);
  });

}

function createAndLinkChild(graphId, themeNodeId)
{
  var idea = Ideas.findOne();
  var ideaId = idea._id;
  var metaData = {'themeId': themeNodeId};
  Meteor.call('graphCreateIdeaNode', graphId, ideaId, metaData, function (error, result)  
  {
    var ideaNodeID = result._id;
    var ideaNode = Nodes.findOne({'graphID': graphId,'_id': ideaNodeID});
    var themeNodeId = ideaNode.themeId;
    Meteor.call('graphLinkChild', themeNodeId, ideaNodeID, {});
  });
}


/********************************************************************
* Visualization - Parse Graph Logic
********************************************************************/


function parseGraph(graphId)
{
  var ideaData = [];
  // Get Graph
  var graph = Graphs.findOne({'_id': graphId});
  // Get Idea Nodes
  var ideaNodes = getIdeaNodes(graph);
  for(var i = 0; i < ideaNodes.length; i++)
  { 
    var ideaNode = ideaNodes[i];
    var ideaNodeID = ideaNode._id;
    var ideaNodeContent = ideaNode.content;
    var ideaNodeVote = ideaNode.vote;
    if(ideaNodeVote == false)
    {
      ideaNodeVote = 1;
    }
    var ideaNodeThemes = getIdeaNodeThemes(ideaNodeID, graphId);
    var ideaDataItem = createIdeaDataItem(ideaNodeID, ideaNodeContent, ideaNodeThemes, ideaNodeVote);
    
    ideaData.push(ideaDataItem);
  } 

  return ideaData;
}

function getIdeaNodes(graph)
{
  var ideaNodes = [];
  for(var i = 0; i < graph.nodeIDs.length; i++)
  {
    var nodeId = graph.nodeIDs[i];
    var node = Nodes.findOne({'graphID': graph._id,'_id': nodeId});
    
    if(node.type == 'idea')
    {
      ideaNodes.push(node);
    }

  }

  //Nodes.find({'graphID': graphId,'type': 'idea'});
  
  return ideaNodes;
}

function getIdeaNodeThemes(ideaNodeID, graphId)
{
  var ideaNodeThemes = [];
  // Get parent-child edges with this node as a child
  var parentChildEdges = Edges.find({'type': 'parent_child', 'childID': ideaNodeID}).fetch();
  // Get parent nodes (themes)
  for(var i = 0; i < parentChildEdges.length; i++)
  {
    var themeId = parentChildEdges[i].parentID;
    var themeNode = Nodes.findOne({'graphID': graphId,'_id': themeId});

    // Used for category membership, we could also use the id to allow duplicate names for different themes
    var themeName = themeNode.name;
    ideaNodeThemes.push(themeName);
  }
  return ideaNodeThemes;
}

function createIdeaDataItem(id, idea, categories, quality)
{
  var ideaDataItem = {'id': id, 'idea': idea, 'categories': categories, 'quality': quality};
  return ideaDataItem;
}


////////////////////////////////////////////////////////////////////////////
//  this.nodeIDs = [];
//  this.edgeIDs = [];
// Meteor.call('graphCreate', prompt, group, user);
// Meteor.call('graphCreateNode', graph, metadata);
// graphCreateThemeNode: function(graphID, metadata)
// graphCreateIdeaNode: function(graphID, ideaID, metadata)
// graphCreateEdge: function(type, sourceID, targetID, metadata)
// graphCreateNode: function(graphID, type, metadata)
//  graphCreate: function(promptID, groupID, userID)
//   graphLinkChild: function(parentID, childID, metadata)

/********************************************************************
* Visualization - Helper Function Logic
********************************************************************/
function getMetaData(ideaData)
{
  //Find all categories and ideaKeys present in data
  var ideaKeys = [];
  var categories = [];
  for(var i = 0; i < ideaData.length; i++)
  {
    var ideaKey = ideaData[i].id;
    ideaKeys[ideaKeys.length] = ideaKey;
    var ideaCategories = ideaData[i].categories;
    for(var j = 0; j < ideaCategories.length; j++)
    {
      var category = ideaCategories[j];
      if(categories.indexOf(category) == -1)
      {
        categories[categories.length] = category;
      }
    }
    

  }
  categories.sort();
  var metaData = {"ideaKeys": ideaKeys, "categories": categories};
  
  return metaData;
}


/********************************************************************
* Visualization - Term Affinity (tf-idf weighting) Logic
********************************************************************/

function getTermAffinity(ideaData)
{
  //Find all ideaKeys present in data
  var metaData = getMetaData(ideaData)
  var ideaKeys = metaData.ideaKeys;

  // Corpus = Collection of all documents
  // Document = One unit of textual data (for example, webpages, ideas, or blog posts)
  // Term = One word from a document that is not a stop word
  var corpus = {"terms":[], "documents": []};
  corpus = populateCorpus(corpus, ideaData)

  //Create raw empty matrix
  var rawEmptyMatrix = createEmptyMatrix(ideaKeys.length, corpus.terms.length);


  // Create Term Weight Matrix
  var termWeightMatrix = createTermMatrix(ideaKeys, corpus.terms, rawEmptyMatrix);

  // Populate Term Weight Matrix
  termWeightMatrix = populateTermMatrix(corpus, termWeightMatrix);
  
  //Normalize Term Weight Matrix
  var normalizedTermWeightMatrix = normalizeMatrix(termWeightMatrix, termWeightMatrix.terms.length);

  //Create pair-wise afinity matrix for Term weights
  var rawAffinityMatrix = populatePairwiseAffinityMatrix(termWeightMatrix, normalizedTermWeightMatrix);

  var termAffinityMatrix = createTermAffinityMatrix(ideaKeys, rawAffinityMatrix);
  return termAffinityMatrix;
}

function createTermMatrix(ideaKeys, terms, rawEmptyMatrix)
{
  // Create Term Weight Matrix
  var termWeightMatrix = 
  {
    "type": "Term_Weighting",
    "ideaKeys": ideaKeys,
    "terms": terms,
    "matrix": rawEmptyMatrix
  }
  return termWeightMatrix;
}

function populateTermMatrix(corpus, termWeightMatrix)
{
  var corpusInverseDocumentFrequencies = getCorpusInverseDocumentFrequencies(corpus);
  
  var documentTermFrequencies = getDocumentTermFrequencies(corpus);

  var tfIdfWeighting = getTermFrequencyInverseDocumentFrequencies(corpusInverseDocumentFrequencies, documentTermFrequencies);
  
  // Populate Term Weight Matrix
  for(var i = 0; i < termWeightMatrix.ideaKeys.length; i++)
  {
    var ideaKey = termWeightMatrix.ideaKeys[i];
    var tfIdfDocument = getTfIdfDocument(ideaKey, tfIdfWeighting);
    for(var j = 0; j < termWeightMatrix.terms.length; j++)
    {
      var term = termWeightMatrix.terms[j].term;
      var termWeight = getTermWeight(term, tfIdfDocument);
      termWeightMatrix.matrix[i][j] = termWeight;
    }
  }
  return termWeightMatrix;
}

function createTermAffinityMatrix(ideaKeys, rawAffinityMatrix)
{
  // Create Term Affinity Matrix
  var termAffinityMatrix = 
  {
    "type": "Term_Similarity",
    "ideaKeys": ideaKeys,
    "matrix": rawAffinityMatrix
  }
  return termAffinityMatrix;
}



/********************************************************************
* Visualization - Term Affinity (tf-idf weighting) Logic
********************************************************************/
function getTermWeight(term, tfIdfDocument)
{
  for(var i = 0; i < tfIdfDocument.terms.length; i++)
  {
    var tfIdfTerm = tfIdfDocument.terms[i];
    if(tfIdfTerm.term == term)
    {
      return tfIdfTerm.tfIdf;
    }
    else
    {
      continue;
    }
  }
  return 0.0;
}

function getTfIdfDocument(ideaKey, tfIdfWeighting)
{
  for(var i = 0; i < tfIdfWeighting.length; i++)
  {
    var tfIdfDocument = tfIdfWeighting[i];
    if(tfIdfDocument.id == ideaKey)
    {
      return tfIdfDocument;
    }
    else
    {
      continue;
    }
  }
}

function getDocumentTerms(ideaText)
{
  var terms = [];
  var words = ideaText.split(" ");
  for (var j = 0; j < words.length; j++) 
  {
    // Get Word
    var word = words[j]
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]|_/g, "")
            .replace(/\s{2,}/g," ");
    
    var containsWord = Boolean(false);
    
    // Increase term count for terms in list of document terms
    for (var k = 0; k < terms.length; k++) 
    {
      if (terms[k].term == word) 
      {
        terms[k].count = terms[k].count + 1;
        containsWord = Boolean(true);
      }
    }

    // Add words that are not in terms or in stopwords to document
    if(containsWord == false && stopWords.words.indexOf(word) == -1) 
    {
      var term = {'term': word, 'count': 1};
      terms.push(term);
    }
  } 
  return terms;
}

function getCorpusTerms(corpus)
{
  for(var i = 0; i < corpus.documents.length; i++)
  {
    var document = corpus.documents[i];
    for(var j = 0; j < document.terms.length; j++)
    {
      var term = document.terms[j].term;
      
      var containsTerm = Boolean(false);
    
      // Increase term count for terms in list of corpus terms
      for (var k = 0; k < corpus.terms.length; k++) 
      {
        if (corpus.terms[k].term == term) 
        {
          corpus.terms[k].count = corpus.terms[k].count + 1;
          containsTerm = Boolean(true);
        }
      }

      // Add words that are not in terms or in stopwords to document
      if(containsTerm == false) 
      {
        var corpusTerm = {'term': term, 'count': 1};
        corpus.terms.push(corpusTerm);
      }
    }
  }
  return corpus;
}

function populateCorpus(corpus, ideaData)
{
  for (var i = 0; i < ideaData.length; i++) 
  {
    var ideaText = ideaData[i].idea;
    var document = {"id": ideaData[i].id, "terms": []};
    document.terms = getDocumentTerms(ideaText);
    corpus.documents.push(document);
  }
  corpus = getCorpusTerms(corpus);
  return corpus;
}

function getCorpusInverseDocumentFrequencies(corpus)
{
  var idfTerms = [];
  for(var i = 0; i < corpus.terms.length; i++)
  {
    
    var numberOfDocuments = corpus.documents.length;
    // Document frequency = Number of documents that contain the term
    var documentFrequency = corpus.terms[i].count;
    // Inverse Document Frequency = Number of Documents / Document Frequency
    var inverseDocumentFrequency = numberOfDocuments / documentFrequency;
    // Dampened Inverse Document Frequency = Log 10(Inverse Document Frequency)
    var dampenedInverseDocumentFrequency = Math.log10(inverseDocumentFrequency);
    var idfTerm = {'term': corpus.terms[i].term, 'idf': dampenedInverseDocumentFrequency};

    idfTerms.push(idfTerm);
  }
  return idfTerms;
}

function getDocumentTermFrequencies(corpus)
{
  var tfDocuments = [];
  for(var i = 0; i < corpus.documents.length; i++)
  {
    var document = corpus.documents[i];
    var tfDocument = {"id": document.id, "terms": []};
    for(var j = 0; j < document.terms.length; j++)
    {
      var term = document.terms[j];
      // Term frequency = Number of times the term appears in this document
      var termFrequency = term.count;
      // Scaled Term Frequency = 1 + Log 10(Term Frequency)
      var scaledTermFrequency = 1 + Math.log10(termFrequency);
      var tfTerm ={'term': term.term, 'tf': scaledTermFrequency};
      tfDocument.terms.push(tfTerm);
    }
    tfDocuments.push(tfDocument)
    
  }
  return tfDocuments;
}

function getTermFrequencyInverseDocumentFrequencies(idfTerms, tfDocuments)
{
  var tfIdfDocuments = [];

  for(var i = 0; i < tfDocuments.length; i++)
  {
    var tfDocument = tfDocuments[i];
    var tfIdfDocument = {"id": tfDocument.id, "terms": []};
    for(var j = 0; j < tfDocument.terms.length; j++)
    {
      var tfTerm = tfDocument.terms[j];
      // Scaled Term Frequency = 1 + Log 10(Term Frequency)
      var scaledTermFrequency = tfTerm.tf;
      // Dampened Inverse Document Frequency = Log 10(Inverse Document Frequency)
      var dampenedInverseDocumentFrequency = getInverseDocumentFrequency(tfTerm.term, idfTerms)
      // Term Frequency - Inverse Document Frequency = (Term Frequency * Inverse Document Frequency)
      var termFrequencyInverseDocumentFrequency = (scaledTermFrequency * dampenedInverseDocumentFrequency);
      var tfIdfTerm ={'term': tfTerm.term, 'tfIdf': termFrequencyInverseDocumentFrequency};
      tfIdfDocument.terms.push(tfIdfTerm);
    }
    tfIdfDocuments.push(tfIdfDocument)
  }

  return tfIdfDocuments;
}

function getInverseDocumentFrequency(term, idfTerms)
{
  var inverseDocumentFrequency = 0;
  for(var i = 0; i < idfTerms.length; i++)
  {
    var idfTerm = idfTerms[i].term;
    var idfWeight = idfTerms[i].idf;
    if(term == idfTerm)
    {
      inverseDocumentFrequency = idfWeight;
      break;
    }
  }
  return inverseDocumentFrequency;
}


/********************************************************************
* Visualization - Category Affinity (category membership) Logic
********************************************************************/

function getCategoryAffinity(ideaData)
{
  //Find all categories and ideaKeys present in data
  var metaData = getMetaData(ideaData)
  var ideaKeys = metaData.ideaKeys;
  var categories = metaData.categories;

  //Create raw empty matrix
  var rawEmptyMatrix = createEmptyMatrix(ideaKeys.length, categories.length);

  // Create Category Weight Matrix
  var categoryWeightMatrix = createCategoryMatrix(ideaKeys, categories, rawEmptyMatrix);

  // Populate Category Weight Matrix
  categoryWeightMatrix = populateCategoryMatrix(ideaData, categoryWeightMatrix);
  
  //Normalize Category Weight Matrix
  var normalizedCategoryWeightMatrix = normalizeMatrix(categoryWeightMatrix, categoryWeightMatrix.categories.length);

  //Create pair-wise afinity matrix for category membership
  var rawAffinityMatrix = populatePairwiseAffinityMatrix(categoryWeightMatrix, normalizedCategoryWeightMatrix);

  var categoryAffinityMatrix = createCategoryAffinityMatrix(ideaKeys, rawAffinityMatrix);
  return categoryAffinityMatrix;
}

function createCategoryMatrix(ideaKeys, categories, rawEmptyMatrix)
{
  // Create Category Weight Matrix
  var categoryWeightMatrix = 
  {
    "type": "Category_Weighting",
    "ideaKeys": ideaKeys,
    "categories": categories,
    "matrix": rawEmptyMatrix
  }
  return categoryWeightMatrix;
}

function createCategoryAffinityMatrix(ideaKeys, rawAffinityMatrix)
{
  // Create Category Affinity Matrix
  var categoryAffinityMatrix = 
  {
    "type": "Category_Similarity",
    "ideaKeys": ideaKeys,
    "matrix": rawAffinityMatrix
  }
  return categoryAffinityMatrix;
}

function populateCategoryMatrix(ideaData, categoryWeightMatrix)
{
  // Populate Category Weight Matrix
  for(var i = 0; i < ideaData.length; i++)
  {
    var ideaCategories = ideaData[i].categories;
    for(var j = 0; j < ideaCategories.length; j++)
    {
      var category = ideaCategories[j];
      var categoryIndex = categoryWeightMatrix.categories.indexOf(category);
      categoryWeightMatrix.matrix[i][categoryIndex] = 1;
    }
  }
  return categoryWeightMatrix;

}

/********************************************************************
* Visualization - Combine Term and Category Affinity Matrices Logic
********************************************************************/
function getCombinedAffinity(categoryAffinity, termAffinity)
{
  var combinedAffinity = createCombinedAffinityMatrix(categoryAffinity);
  for(var i = 0; i < combinedAffinity.ideaKeys.length; i++)
  {
    for(var j = 0; j < combinedAffinity.ideaKeys.length; j++)
    {
      var categoryDampeningFactor = getAverageSimilarity(termAffinity.matrix);
      var dampenedCategoryWeight = categoryDampeningFactor * categoryAffinity.matrix[i][j];
      combinedAffinity.matrix[i][j] = dampenedCategoryWeight + termAffinity.matrix[i][j];
    }
  }
  //var normalizedCombinedAffinity = normalizeMatrix(combinedAffinity, combinedAffinity.ideaKeys.length);
  //combinedAffinity.matrix = normalizedCombinedAffinity
  return combinedAffinity;
}

function createCombinedAffinityMatrix(affinityMatrix)
{
  // Create Combined Affinity Matrix
  var rawAffinityMatrix = createEmptyMatrix(affinityMatrix.ideaKeys.length, affinityMatrix.ideaKeys.length);
  var combinedAffinityMatrix = 
  {
    "type": "Combined_Similarity",
    "ideaKeys": affinityMatrix.ideaKeys,
    "matrix": rawAffinityMatrix
  }
  return combinedAffinityMatrix;
}

function getAverageSimilarity(matrix)
{
  // We are dropping 0s and 1s to get the average similarity
  var totalValue = 0;
  var totalCount = 0;
  for(var i = 0; i < matrix.length; i++)
  {
    for(var j = 0; j < matrix[i].length; j++)
    {
      var value = matrix[i][j];
      if(value > 0 && value < 1)
      {
        totalCount += 1;
        totalValue += value;
      }
    }
  }
  var averageSimilarity = totalValue / totalCount;
  return averageSimilarity;
}


/********************************************************************
* Visualization - General Matrix Logic
********************************************************************/

function createEmptyMatrix(rowCount, columnCount)
{
  //Create raw empty matrix
  var rawEmptyMatrix = new Array(rowCount);
  for(var i = 0; i < rowCount; i++)
  {
    rawEmptyMatrix[i] = new Array(columnCount);
    for(var j = 0; j < columnCount; j++)
    {
      rawEmptyMatrix[i][j] = 0;
    }
  }
  return rawEmptyMatrix;
}

function normalizeMatrix(weightMatrix, columnCount)
{
  //Normalize Weight Matrix
  var ideaCount = weightMatrix.ideaKeys.length;
  var normalizedweightMatrix = createEmptyMatrix(ideaCount, columnCount);

  for(var i = 0; i < ideaCount; i++)
  {
    //Get Normalization Factor (Square Root of Sum of Squares)
    var normalizationFactor = 0;
    var sumOfSquares = 0; 
    for(var j = 0; j < columnCount; j++)
    {
      var rawWeight = weightMatrix.matrix[i][j];
      sumOfSquares += (rawWeight * rawWeight);
    }
    normalizationFactor = Math.sqrt(sumOfSquares);

    //Normalize Weight Matrix
    for(var j = 0; j < columnCount; j++)
    {
      var rawWeight = weightMatrix.matrix[i][j];
      var normalizedWeight = rawWeight/normalizationFactor;
      normalizedweightMatrix[i][j] = normalizedWeight;
    }
  }
  return normalizedweightMatrix;
}

function populatePairwiseAffinityMatrix(weightMatrix, normalizedWeightMatrix)
{
  var ideaCount = weightMatrix.ideaKeys.length;
  //Create pair-wise afinity matrix
  var pairwiseAffinityMatrix = createEmptyMatrix(ideaCount, ideaCount);

  //Populate pair-wise afinity matrix
  for(var i = 0; i < ideaCount; i++)
  {
    var currentIdeaId = weightMatrix.ideaKeys[i];
    var currentIdeaVector = normalizedWeightMatrix[i];
    for(var j = 0; j < ideaCount; j++)
    {
      var targetIdeaId = weightMatrix.ideaKeys[j];
      var targetIdeaVector = normalizedWeightMatrix[j];
      if(currentIdeaId == targetIdeaId)
      {
        pairwiseAffinityMatrix[i][j] = 1;
        continue;
      }
      
      var cosineSimilarity = 0;
      //Get cosine similarity (Normalized Dot Product)
      for(var k = 0; k < currentIdeaVector.length; k++)
      {
        cosineSimilarity += currentIdeaVector[k] * targetIdeaVector[k];
      }
      pairwiseAffinityMatrix[i][j] = cosineSimilarity;
    
    }
  }
  return pairwiseAffinityMatrix;
}

/********************************************************************
* Visualization - Force Data (category and term affinity) Logic
********************************************************************/

function createGraphNode(sourceLabel, sourceId, nodeSize)
{
  var graphNode = 
  {    
    "source_idea_label": sourceLabel,    
    "source_idea_id": sourceId,   
    "size": nodeSize  
  };
  return graphNode;
}

function createGraphEdge(sourceId, targetId, linkStrength)
{
  var graphEdge = 
  {      
    "source_idea_id": sourceId,    
    "target_idea_id": targetId,       
    "strength": linkStrength  
  };
  return graphEdge;
}

function createForceData(affinityMatrix, ideaData)
{
  var totalLinkStrengh = 0;
  var totalLinkCount = 0;
  var forceData = {"nodes": [], "edges": []};
  for(var i = 0; i < ideaData.length; i++)
  {
    var sourceLabel = ideaData[i].idea;
    var sourceId = ideaData[i].id;
    var nodeSize = ideaData[i].quality;

    var graphNode = createGraphNode(sourceLabel, sourceId, nodeSize);
    forceData.nodes.push(graphNode);

    var affinityVector = affinityMatrix.matrix[i];
    for(var j = 0; j < affinityVector.length; j++)
    {
      var targetId = affinityMatrix.ideaKeys[j];
      var linkStrength = affinityVector[j];
      if(linkStrength > 0 && targetId != sourceId)
      {
        totalLinkCount += 1;
        totalLinkStrengh += linkStrength;
        var graphEdge = createGraphEdge(sourceId, targetId, linkStrength);
        forceData.edges.push(graphEdge);
      }
    }
  }
  var linkAverageStrength = totalLinkStrengh / totalLinkCount;
  
  forceData = trimForceData(forceData, linkAverageStrength);
  
  return forceData;
}

function trimForceData(forceData, cutOffValue)
{
  for(var i = 0; i < forceData.edges.length; i++)
  {
    var edge = forceData.edges[i];
    if(edge.strength < cutOffValue)
    {
      forceData.edges.splice(i, 1);
    }
  }
  return forceData;
}


/********************************************************************
* Visualization - Force Directed Graph Logic
********************************************************************/

function processData(forceData){

  //variables for maps and arrays for the nodes and edges of the diagram
  var indexByName = d3.map(),
    nameByIndex = d3.map(),
    nodes = [],
    edges = [],
    sizeMax = 0,
    sizeMin = 0,
    strengthMax = 0,
    strengthMin = 0,
    n = 0;

  //find min and max of the sizes in order to scale them to needed size
  forceData.nodes.forEach(function(d) 
  {
    if(parseInt(d.size) > sizeMax) sizeMax = parseInt(d.size);
    if(parseInt(d.size) < sizeMin) sizeMin = parseInt(d.size);
  });

  //scales the sizes to between 10px and 30px
  var size_scale = d3.scale.linear()
    .domain([sizeMin, sizeMax])
    .range([20, 30]);

  //find min and max of the sizes in order to scale them to needed size
  forceData.edges.forEach(function(d) 
  {
    if(parseFloat(d.strength) > strengthMax) strengthMax = parseFloat(d.strength);
    if(parseFloat(d.strength) < strengthMin) strengthMin = parseFloat(d.strength);
  });

  //scales the sizes to between 10px and 30px
  var strength_scale = d3.scale.linear()
    .domain([strengthMin, strengthMax])
    .range([1, 25]);

  //goes through all of the data and makes sure that it is mapped in the maps
  //also puts the source_idea_label and size into the nodes array
  forceData.nodes.forEach(function(d) 
  {
    if (!indexByName.has(d.source_idea_id)) 
    {
      nameByIndex.set(n, d.source_idea_id);
      nodes.push({name: d.source_idea_id, size: size_scale(parseInt(d.size)), text: d.source_idea_label});
      indexByName.set(d.source_idea_id, n);
      n++;
          }
  });

  //loops through the data array and looks up all the edges and puts them into the edges array
  for(var x = 0; x < forceData.edges.length; x++) 
  {
    var sourceNode = parseInt(indexByName.get(forceData.edges[x].source_idea_id));
        var targetNode = parseInt(indexByName.get(forceData.edges[x].target_idea_id));
        var linkStrength = parseInt(strength_scale(forceData.edges[x].strength)); 

        edges.push({source: sourceNode, target: targetNode, strength: linkStrength});
  }

  //creates the dataset object that contains the arrays of nodes and edges
  var dataset = { nodes: nodes, edges: edges}; 

  return dataset;


}

function CreateForceDiagram(dataset, svg, w, h)
{
  svg.selectAll("*")
   .remove();
  // global intensity of attraction
  var charge = -200;
  // link distance factor used to determine line length;
  var distanceFactor = 140;
  var maxDistance = 250;

  //size of the svg
  var width = w-200;
  var height = h;

  //in order to use the force layout for d3, the dataset has to be an object with two elements, nodes and edges, with each element being an array of objects.
    
  //ordinal scale in order to color the nodes
  var colors = d3.scale.category20();
  
  //var dataset = processData(forceData);

  //this sets up the force layout - it needs where the nodes and links are and the size of the space, as well as optional parameters like how long you want the distance between them to be and how much you want the nodes to repel each other
  var force = d3.layout.force()
    .nodes(dataset.nodes)
    .links(dataset.edges)
    .size([width-90, height-90])
    //.linkDistance(100)
    .linkDistance(function(d) 
    {
      return 50-d.strength;
    })
    .charge(charge)
    .start();

  var edgescale = d3.scale.linear()
                    .domain([0, 10])
                    .range([.1, .5])


  //making the svg lines that connect the nodes
  var edges = svg.selectAll(".link")
    .data(dataset.edges)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", "grey")
    .style("opacity", function(d) 
    {
      return edgescale(d.strength);
    })
      .style("stroke-width", function(d) 
    {
      return   (1/10)*(Math.round(Math.sqrt(d.strength)));
    });

   
  var colors = d3.scale.linear()
          .domain([0,2])
          .range(["#edf8b1","#7fcdbb","#2c7fb8"]);

  //making the svg text that are the nodes
  //choosing colors from the ordinal scale for the text
  var nods = svg.selectAll(".node")
    .data(dataset.nodes)
    .enter()
    .append("g")

  console.log(dataset.nodes)
  var weights = dataset.nodes.map(function(node) {return node.weight})
  var maxw = Math.max.apply(undefined, weights)
  console.log("max weight:")
  console.log(maxw)
  
  var sizes = dataset.nodes.map(function(node) {return node.size})
  var maxs = Math.max.apply(undefined, sizes)


  var ws = d3.scale.linear()
            .domain([0, maxw])
            .range([10, 1])

  var opacityscale = d3.scale.linear()
                      .domain([0, maxw])
                      .range([.2, 1])

  var opacityscale2 = d3.scale.linear()
                      .domain([0, maxw/2])
                      .range([1, .05])

  var sizescale = d3.scale.linear()
                    .domain([0, maxs])
                    .range([.5,5])

  var wsc = d3.scale.linear()
            .domain([0, 5, 10])
            .range(["orange", "white", "steelblue"])

  var colorscale = d3.scale.linear()
            .domain([0,maxs])
            .range(["orange", "beige"])

  var cscale = d3.scale.linear()
                    .domain([0, 1, maxs])
                    .range(["#DCE5E3",
"#FAD8D4",
"#C7548B"])

  

  var nodes = nods.append("circle")
                .attr("class", "node")
                //.attr("class", function(d) {console.log(d.text); return d.text})
                .attr("r", function(d) 
                { 
                  return sizescale(d.size);  
                })
                .style("opacity", function(d, i) 
                {
                  //return colors(i);
                  //return "green";
                  //var ind = (d.source_idea_id)-1;
                  //var cat = incomingIdeaData.ind.categories[0]
                  //return ordColor(cat);
                  if (d.text=="Nothing") {return 0;}
                  else {return opacityscale(d.size);}
                })
                .style("stroke-width", function(d,i) { return ws(d.weight);})
                //colors to size 
                .style("fill", function(d,i) {return cscale(d.size);}) 
                .call(force.drag);//this line is necessary in order for the user to be able to move the nodes (drag them)

  var tex = nods.append("text")
    .text(function(d) { 
      if (d.text=="Nothing") {return ""}
      else {
        if (d.text.length > 13) 
        {
          return d.text.substring(0,13) + "..."
        }
        else 
        {
          return d.text;
        }
      }
    }
        )
    //.attr("fill", function(d,i) {return wsc(d.weight);})
    .style("opacity", function(d,i){return opacityscale2(d.weight)})
    .attr("font-size", "20px")
    .on("mouseover", function() {
      d3.select(this).style("fill","orange")
                     .style("opacity", 1)
                     .text(function(d) {return d.text;})
    })
    .on("mouseout", function() 
    {
      d3.select(this).style("fill","black")
                    .style("opacity", function(d,i){return opacityscale2(d.weight)})
                    .text(function(d) 
        { 
          if (d.text=="Nothing") {return ""}
          else 
          {
            if (d.text.length > 20) 
            {
              return d.text.substring(0,13) + "..."
            }
            else 
            {
              return d.text;
            }
          }
        })
    

    });

    /*.attr("class", function(d) {
      var str = d.text.replace(/\s+/g, '');
      console.log(str);
      return str.substring(0,5)})*/

  nodes.append("title")
    .text(function(d) { if (d.text=="Nothing") {return ""}
                        else {return d.text; };})

  /*nodes.on("mouseover", function() {

    d3.select(this).style("stroke","pink").style("stroke-width",5);

    console.log(this.children[0].innerHTML);

    var txt = this.children[0].innerHTML
    var str = txt.replace(/\s+/g, '');
    var new = str.substring(0,5)


    d3.select("." + new).style("opacity", 1)
                      .attr("font-size", "30px")
                      .style("stroke", "orange")
  });
  nodes.on("mouseout", function() {d3.select(this).style("stroke","none");});

  */
  //this tells the visualization what to do when time passes
  //it updates where the nodes and edges should be
  force.on("tick", function() 
  {
    edges.attr("x1", function(d) 
    { 
      return d.source.x; 
    })
        .attr("y1", function(d) 
    { 
          return d.source.y; 
    })
        .attr("x2", function(d) 
    { 
          return d.target.x; 
        })
        .attr("y2", function(d) 
    { 
          return d.target.y; 
        });

    nodes.attr("cx", function(d) 
    {
      return d.x; 
    })
    .attr("cy", function(d) 
    { 
      return d.y; 
    });

    tex.attr("x", function(d) 
    {
      return d.x; 
    })
    .attr("y", function(d) 
    { 
      return d.y; 
    })
    .attr("dy", -10)
    .attr("dx", -10);

  });
}

function CreateForceDiagram2(forceData)
{

  // global intensity of attraction
  var charge = -200;
  // link distance factor used to determine line length;
  var distanceFactor = 140;
  var maxDistance = 250;

  //size of the svg
  var width = 600;
  var height = 600;

  //makes the svg element
  var svg = d3.select("#svgdiv3")
    .append("svg")
    .attr("width", width)
    .attr("height", height);


  //in order to use the force layout for d3, the dataset has to be an object with two elements, nodes and edges, with each element being an array of objects.
    
  //ordinal scale in order to color the nodes
  var colors = d3.scale.category20();



  //variables for maps and arrays for the nodes and edges of the diagram
  var indexByName = d3.map(),
    nameByIndex = d3.map(),
    nodes = [],
    edges = [],
    sizeMax = 0,
    sizeMin = 0,
    strengthMax = 0,
    strengthMin = 0,
    n = 0;

  //find min and max of the sizes in order to scale them to needed size
  forceData.nodes.forEach(function(d) 
  {
    if(parseInt(d.size) > sizeMax) sizeMax = parseInt(d.size);
    if(parseInt(d.size) < sizeMin) sizeMin = parseInt(d.size);
  });

  //scales the sizes to between 10px and 30px
  var size_scale = d3.scale.linear()
    .domain([sizeMin, sizeMax])
    .range([20, 30]);

  //find min and max of the sizes in order to scale them to needed size
  forceData.edges.forEach(function(d) 
  {
    if(parseFloat(d.strength) > strengthMax) strengthMax = parseFloat(d.strength);
    if(parseFloat(d.strength) < strengthMin) strengthMin = parseFloat(d.strength);
  });

  //scales the sizes to between 10px and 30px
  var strength_scale = d3.scale.linear()
    .domain([strengthMin, strengthMax])
    .range([1, 25]);

  //goes through all of the data and makes sure that it is mapped in the maps
  //also puts the source_idea_label and size into the nodes array
  forceData.nodes.forEach(function(d) 
  {
    if (!indexByName.has(d.source_idea_id)) 
    {
      nameByIndex.set(n, d.source_idea_id);
      nodes.push({name: d.source_idea_id, size: size_scale(parseInt(d.size)), text: d.source_idea_label});
      indexByName.set(d.source_idea_id, n);
      n++;
          }
  });

  //loops through the data array and looks up all the edges and puts them into the edges array
  for(var x = 0; x < forceData.edges.length; x++) 
  {
    var sourceNode = parseInt(indexByName.get(forceData.edges[x].source_idea_id));
        var targetNode = parseInt(indexByName.get(forceData.edges[x].target_idea_id));
        var linkStrength = parseInt(strength_scale(forceData.edges[x].strength)); 

        edges.push({source: sourceNode, target: targetNode, strength: linkStrength});
  }

  //creates the dataset object that contains the arrays of nodes and edges
  var dataset = { nodes: nodes, edges: edges}; 

  //this sets up the force layout - it needs where the nodes and links are and the size of the space, as well as optional parameters like how long you want the distance between them to be and how much you want the nodes to repel each other
  var force = d3.layout.force()
    .nodes(dataset.nodes)
    .links(dataset.edges)
    .size([width-100, height-100])
    //.linkDistance(100)
    .linkDistance(function(d) 
      {
        return 20-d.strength;
      })
    .gravity(.05)
    .charge(charge)
    .start();

  //making the svg lines that connect the nodes
  var edges = svg.selectAll(".link")
    .data(dataset.edges)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", "grey")
    .style("opacity", function(d) 
    {
      return d.strength/7;
    })
      .style("stroke-width", function(d) 
    {
      return   (1/10)*(Math.round(Math.sqrt(d.strength)));
    });

   
  var colors = d3.scale.linear()
          .domain([0,10])
          .range(["#edf8b1","#7fcdbb","#2c7fb8"]);

  //making the svg text that are the nodes
  //choosing colors from the ordinal scale for the text
  var nods = svg.selectAll(".node")
    .data(dataset.nodes)
    .enter()
    .append("g")
  
  var nodes = nods.append("circle")
                .attr("class", "node")
                .attr("r", function(d) 
                { 
                  return d.size/3; 
                })
                .style("fill", function(d, i) 
                {
                  //return colors(i);
                  //return "green";
                  //var ind = (d.source_idea_id)-1;
                  //var cat = incomingIdeaData.ind.categories[0]
                  //return ordColor(cat);
                  return colors(d.size);
                })
                .call(force.drag);//this line is necessary in order for the user to be able to move the nodes (drag them)

  var tex = nods.append("text")
    .text(function(d,i) { 
      if (i%20===0) {return d.text;}
      else {return " ";}
    })
    .attr("fill", "black")
    .attr("font-size", "20px");

  nodes.append("title")
    .text(function(d) { return d.text; });

    

  nodes.on("mouseover", function() {d3.select(this).style("stroke","orange").style("stroke-width",1);});
  nodes.on("mouseout", function() {d3.select(this).style("stroke","none");});
  //this tells the visualization what to do when time passes
  //it updates where the nodes and edges should be
  force.on("tick", function() 
  {
    edges.attr("x1", function(d) 
    { 
      return d.source.x; 
    })
        .attr("y1", function(d) 
    { 
          return d.source.y; 
    })
        .attr("x2", function(d) 
    { 
          return d.target.x; 
        })
        .attr("y2", function(d) 
    { 
          return d.target.y; 
        });

    nodes.attr("cx", function(d) 
    {
      return d.x; 
      //return d.x = Math.max(6, Math.min(width - 6, d.x));
    })
    .attr("cy", function(d) 
    { 
      return d.y; 
      //return d.y = Math.max(6, Math.min(height - 6, d.y));
    });

    tex.attr("x", function(d) 
    {
      return d.x; 
      //return d.x = Math.max(6, Math.min(width - 6, d.x));
    })
    .attr("y", function(d) 
    { 
      return d.y;
      //return d.y = Math.max(6, Math.min(height - 6, d.y)); 
    })
    .attr("dy", -10)
    .attr("dx", -10);


  });
}