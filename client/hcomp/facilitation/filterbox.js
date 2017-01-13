// Configure logger for Tools
var logger = new Logger('Client:Hcomp:Filterbox');
// Comment out to use global logging level
Logger.setLevel('Client:Hcomp:Filterbox', 'trace');
// Logger.setLevel('Client:Hcomp:Filterbox', 'debug');
// Logger.setLevel('Client:Hcomp:Filterbox', 'info');
//Logger.setLevel('Client:Hcomp:Filterbox', 'warn');

Template.HcompFilterbox.rendered = function(){
	//Create isInCluster filter
	// console.log("rendering");
	Session.set("searchQuery","");
	FilterManager.reset("Ideas Filter", Session.get("currentUser"), "ideas");
	logger.trace("Creating default ideas filter upon render");
	createDefaultIdeasFilter("Ideas Filter");

	FilterManager.reset("IdeaWordCloud Filter", Session.get("currentUser"), "ideas");
  logger.trace("Creating default filter for ideawordcloud filter");
  createDefaultIdeasFilter("IdeaWordCloud Filter");
	// Ideas.ensureIndex({ content: "text" }); // to enable text search

    var exp = Session.get("currentExp");
    if (exp) {
      Participants.find({experimentID: exp._id}).observe({
        // added: function(user) {
        changed: function(partNewState, partOldState) {
          logger.trace("Old participant state: " + JSON.stringify(partOldState));
          logger.trace("New participant state: " + JSON.stringify(partNewState));

          if (!partOldState.hasStarted && partNewState.hasStarted) {
            logger.info("new participant began ideation");
            logger.trace("new participant: " + JSON.stringify(partNewState));
            
            var update = false;
            var cond = Conditions.findOne({_id: partNewState.conditionID});
            if (cond.description == "Treatment") {
              update = true;
            } else {
              logger.debug("Not a treatment participant, not updating inspirations");
            }
    
            if (update) {
              logger.debug("Updating participant ideas filter");
              FilterManager.create("Ideas Filter", Session.get("currentUser"), "ideas", "userID", partNewState.userID);
            }
          }
        },
      });    
  }
}

Template.HcompFilterBoxHeader.rendered = function(){
	$('.all-ideas-filter-btn').click();
	FilterManager.createSorter("Ideas Filter", Session.get("currentUser"), "ideas", "time", -1, 1);
}

var filterName;

Template.HcompFilterbox.helpers({
	setFilterName : function(name){
		filterName = name + "IdeasFilter";
		console.log(filterName);
		//doesn't work
	},
	participants : function(){
		return MyUsers.find({type: "Ideator"});
	},
	ideas : function(){
		filteredIdeas = getFilteredIdeas("Ideas Filter");
		return filteredIdeas;
	},
	currentClusters: function(){
		return Clusters.find({_id: {$ne: "-1"}});
	},
	numIdeas : function() {
		return getFilteredIdeas("Ideas Filter").length;
	}, hasRead: function() {
  
   if(isInList(Session.get("currentUser")._id, this.readIDs)) {
      return(true); 
    }else{
      return(false);
    }
   },
});

Template.HcompFilterBoxIdeaItem.rendered = function() {
  
  $(this.firstNode).draggable({containment: '.hcomp-dashboard',
    revert: true,
    zIndex: 50,
    helper: 'clone',
    appendTo: ".hcomp-dashboard",
    refreshPositions: true,
  
  start: function(e, ui) {
      logger.debug("Began dragging an idea");
      logger.trace(ui.helper[0]);
      var width = $(this).css('width');
      logger.trace(width);
      $(ui.helper[0]).css('width', width);
    },
  });
};

Template.HcompFilterBoxIdeaItem.helpers({
	gameChangerStatus: function() {
		return this.isGamechanger;
	},
  hasNotVoted: function() {
    if (isInList(Session.get("currentUser")._id, this.votes)) {
      logger.debug("User has already voted");
      return false;
    } else {
      logger.debug("User has not voted");
      return true;
    }
  },
  voteNum: function() {
    return this.votes.length;
  },
  hasVotes: function() {
  	if (this.votes.length > 0) {
  		return true
  	} else {
  		return false
  	}
  },
});

Template.HcompFilterBoxIdeaItem.rendered(function() {
  // Reset sorting filters to nothing  
  FilterManager.resetSorters("Ideas Filter", 
      Session.get("currentUser"), 
      "ideas"
  );
});

Template.HcompFilterBoxIdeaItem.events({
  'click .up-vote': function(e, elm) {
    if (!isInList(Session.get("currentUser")._id, this.votes)) {
      logger.debug("voting for idea");
      IdeaFactory.upVote(this, Session.get("currentUser"));
    } else {
      logger.debug("undo voting for idea");
      IdeaFactory.downVote(this, Session.get("currentUser"));
    }
  },
});

Template.HcompFilterBoxIdeaItem.events({
'mouseover .filterbox-idea-content': function(e, elm) {
  logger.debug(this._id);

  if(!isInList(Session.get("currentUser")._id, this.readIDs)) {
   logger.debug("Read Idea");
   // var select =  "#" + this._id;
   // $(select).css("background-color", "#def");
   IdeaFactory.read(this,Session.get("currentUser"));
  }
 },
});

Template.FilterBoxSorter.events({
  	'change #sortingfields' : function(e,target)
  	{
      logger.debug("Changing Sort");
  		var x = $("#sortingfields").val()
      logger.trace("New Sorter Selected: " + JSON.stringify(x));
  		var sorterObject  = JSON.parse(x);
  		var sortingField = sorterObject.field;
  		var sortingOrder = sorterObject.order;
      logger.trace("Sorter Field: " + sortingField);
      logger.trace("Sorter order: " + sortingOrder);

  		FilterManager.resetSorters("Ideas Filter", 
          Session.get("currentUser"), 
          "ideas"
      );
  		FilterManager.createSorter("Ideas Filter", 
          Session.get("currentUser"), 
          "ideas",
          sortingField, 
          sortingOrder,
          1
      );
  		//Session.set("searchQuery","");
  		//getFilteredIdeas("Ideas Filter");
  	},

  	'click #sortButtonTime' : function(e,target)
  	{
  		var sortingField = "time";
  		var sortButtonIconTime = $("[id=sortButtonIconTime]");
  		var sortButtonTime  = $("[id=sortButtonTime]");

  		var sortButtonIconAlpha  = $("[id=sortButtonIconAlpha]");
  		var sortButtonAlpha  = $("[id=sortButtonAlpha]");

  		/* Changing the alphabatical sorting icon to none */
  		sortButtonIconAlpha.removeClass("glyphicon-chevron-down").removeClass("glyphicon-chevron-up");
  		sortButtonAlpha.css("background-color","white");

  		var sortingOrder;

  		if(sortButtonIconTime.hasClass("glyphicon-chevron-down"))
  		{
  			sortButtonIconTime.removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");	
  			sortingOrder = 1;
  		}
  		else if(sortButtonIconTime.hasClass("glyphicon-chevron-up"))
  		{
  			sortButtonIconTime.removeClass("glyphicon-chevron-up");		
  			sortButtonTime.css("background-color","white");
  		}
  		else {
  			sortButtonIconTime.addClass("glyphicon-chevron-down")
  			sortButtonTime.css("background-color","rgb(58, 175, 58)");
  			sortingOrder = -1;
  		}

  		/* If sorting order is not defined, not doing anything */
  		if(sortingOrder)
  		{
  			FilterManager.createSorter("Ideas Filter", Session.get("currentUser"), "ideas",sortingField , sortingOrder,1);
  		}  		
  	},

  	'click #sortButtonAlpha' : function(e,target)
  	{
  		var sortingField = "content";

  		var sortButtonIconTime = $("[id=sortButtonIconTime]");
  		var sortButtonTime  = $("[id=sortButtonTime]");

  		var sortButtonIconAlpha  = $("[id=sortButtonIconAlpha]");
  		var sortButtonAlpha  = $("[id=sortButtonAlpha]");

  		/* Changing the alphabatical sorting icon to none */
  		sortButtonIconTime.removeClass("glyphicon-chevron-down").removeClass("glyphicon-chevron-up");
  		sortButtonTime.css("background-color","white");

  		var sortingOrder;

  		if(sortButtonIconAlpha.hasClass("glyphicon-chevron-down"))
  		{
  			sortButtonIconAlpha.removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");	
  			sortingOrder = 1;
  		}
  		else if(sortButtonIconAlpha.hasClass("glyphicon-chevron-up"))
  		{
  			sortButtonIconAlpha.removeClass("glyphicon-chevron-up");		
  			sortButtonAlpha.css("background-color","white");
  		}
  		else{

  			sortButtonIconAlpha.addClass("glyphicon-chevron-down")
  			sortButtonAlpha.css("background-color","rgb(58, 175, 58)");
  			sortingOrder = -1;
  		}
  		/* If sorting order is not defined, not doing anything */
  		if(sortingOrder)
  		{
  			FilterManager.createSorter("Ideas Filter", Session.get("currentUser"), "ideas",sortingField , sortingOrder,1);
  		}	
  	},
});
Template.HcompFilterBoxHeader.events({
	// apply new full-text search of idea content
	'click .search-apply-btn' : function(){
		var query = $('#search-query').val(); // grab query from text form
		Session.set("searchQuery",query);
		$('.search-apply-btn').toggleClass('btn-success');
		console.log("Created new query: " + Session.get("searchQuery"));

		if ($('.all-ideas-filter-btn').hasClass('btn-success')) {
			$('.all-ideas-filter-btn').removeClass('btn-success');	
		}
	},

	'keyup input' : function(e, target){
	    // logger.debug(e);
	    // logger.debug(target);
	    console.log("key pressed")
	    if(e.keyCode===13) {
	      console.log("enter pressed")
	      var btn = $('.search-apply-btn')
	      btn.click();
	    }
  	},


	// clear full-text search of idea content
	'click .search-remove-btn' : function(){
		Session.set("searchQuery","");
		$('.search-apply-btn').toggleClass('btn-success');
		$('#search-query').val("");

		// re-highlight the "everything" button if we're removing the last filter
		if (isLastFilter()) {
			console.log("Last filter");
			$('.all-ideas-filter-btn').addClass('btn-success');
		}
	},

	'click .all-ideas-filter-btn' : function() {
		// clear all filters
		FilterManager.reset("Ideas Filter", Session.get("currentUser"), "ideas");
		
		// reinstate default filters
		createDefaultIdeasFilter("Ideas Filter");

		$('.misc-ideas-filter-btn').removeClass('btn-success');
		$('.starred-ideas-filter-btn').removeClass('btn-success');
		$('.all-ideas-filter-btn').addClass('btn-success');

		Session.set("searchQuery","");
		$('.search-apply-btn').removeClass('btn-success');
		$('#search-query').val("");
	},

	'click .misc-ideas-filter-btn' : function() {
		
		FilterManager.toggle("Ideas Filter", Session.get("currentUser"), "ideas", "clusterIDs", []);
		
		$('.misc-ideas-filter-btn').toggleClass('btn-success');
		$('.all-ideas-filter-btn').removeClass('btn-success');

		// un-highlight the "everything" button if it's the last filter
		if (isLastFilter()) {
			console.log("Last filter");
			$('.all-ideas-filter-btn').addClass('btn-success');
		}
		
	},

	'click .starred-ideas-filter-btn' : function() {
		// console.log("*******************Toggling votes filter*******************");
		FilterManager.toggle("Ideas Filter", Session.get("currentUser"), "ideas", "votes", [], 'ne');
		$('.starred-ideas-filter-btn').toggleClass('btn-success');
		
		// un-highlight the "everything" button
		if ($('.all-ideas-filter-btn').hasClass('btn-success')) {
			$('.all-ideas-filter-btn').removeClass('btn-success');	
		}

		// re-highlight the "everything" button if we're removing the last filter
		if (isLastFilter()) {
			console.log("Last filter");
			$('.all-ideas-filter-btn').addClass('btn-success');
		}
	},
});

searchQueryMatch = function searchQueryMatch(idea,queryArr) {
	// console.log("calling searchQueryMatch");
	var match = false;
	var ideaContent = idea.content;
	// queryArr.forEach(function(query){
	for (var i = 0; i < queryArr.length; i++) {
		// console.log("processing query array");
		re = new RegExp(queryArr[i],'i')
		// console.log(re);
		if (re.test(ideaContent)){
			match = true;
			break;
		}
	}
	return match;
}

stringToWords = function stringToWords(str) {
  if (str) {
	arr = str.split(" ");
	arr.forEach(function(q) {
		q = q.trim();
	});
	return arr;
  } else {
    return [];
  };
}

createDefaultIdeasFilter = function createDefaultIdeasFilter(ideasFilterName) {
	FilterManager.create(ideasFilterName, Session.get("currentUser"), "ideas", "prompt._id", Session.get("currentPrompt")._id);
	// add different default filter if we are on an experiment dashboard
	var exp = Session.get("currentExp");
	if (exp) {
		logger.debug("On exp dashboard, filtering for treatment participants only");
        // get treatment participant userIDs
        var treatmentIDs = ExperimentManager.getUsersInCond(exp, "Treatment");
		// set dummy filters for edge case of no treatment participants
        if (treatmentIDs.length < 1) {
            logger.debug("No treatment participants, setting dummy filter for userID");
            FilterManager.create(ideasFilterName, Session.get("currentUser"), "ideas", "userID", "dummyStringThatWillNeverMatch");
        // create filter based on those IDs
        } else {            
            logger.debug("There are treatment participants, filtering by treatment participant userIDs");
            logger.trace("Found userIDs for the treatment condition: " + JSON.stringify(treatmentIDs));
            treatmentIDs.forEach(function(tID) {
                FilterManager.create(ideasFilterName, Session.get("currentUser"), "ideas", "userID", tID);
            });    
      }
	}
}

//This is the information to feed to visualization
getFilteredIdeas = function getFilteredIdeas(ideasFilterName) {
	logger.trace("Getting filtered ideas");
	var filteredIdeas = FilterManager.performQuery(ideasFilterName, 
		  Session.get("currentUser"), 	
		  "ideas").fetch();
	// logger.trace("Unsorted ideas: " + JSON.stringify(filteredIdeas));

	// apply search query, if it exists
	var query = Session.get("searchQuery");

	//Will trigger automatic calc of ideas,sorters not used anywhere in this functions
	//var sorters = Session.get("sorters");

	var queriedIdeas = [];
	if (query != "") {
		queryArr = stringToWords(query);
		filteredIdeas.forEach(function(idea){
			if (searchQueryMatch(idea,queryArr)) {
				queriedIdeas.push(idea);
			} else {
			}
		});
		
	} else {
		queriedIdeas = filteredIdeas.slice();
	}

	//var sortedIdeas = queriedIdeas.sort(function(a,b) { return b.time - a.time});
	// console.log(sortedIdeas);
	// return sortedIdeas;
	return queriedIdeas;
}

isLastFilter = function() {
	existingCatFilters = Filters.find({$and: [{name: "Ideas Filter"},
											  {user: Session.get("currentUser")}, 
											  {collection: "ideas"},
											  {field: {$ne: "prompt._id"}}] 
											}).fetch();
	return existingCatFilters.length === 0;
}
