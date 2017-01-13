// Configure logger for Tools
var logger = new Logger('Client:Main');
// Comment out to use global logging level
// Logger.setLevel('Client:Main', 'trace');
// Logger.setLevel('Client:Main', 'debug');
Logger.setLevel('Client:Main', 'info');
// Logger.setLevel('Client:Main', 'warn');

Template.IdeaGen.helpers({
  loggedIn: function() {
    if (!Session.get("currentUser")) {
      //console.log('no user is logged in');
      return false;
    } else {
      return true; 
    }
  },
  currentUserName: function() {
/********************************************************************
 * Template function returning a boolean if there is a logged in user
 * *****************************************************************/
    if (Session.get("currentUser")) {
      return Session.get("currentUser").name;
    } else {
      return "Anonymous";
    }
  },
  hasAlias: function() {
    logger.debug("Checking if user has alias");
    logger.trace(this);
    var hasAlias = false;
    if (Session.get("currentUser")) {
      if (Session.get("currentUser").alias == null) {
        logger.debug("User has no alias");
        return false;
      } else {
        logger.debug("User has an alias");
        return true;
      }
    } else {
      logger.debug("No User set when checking alias");
      return false;
    }

  },

  alias: function() {
    logger.debug("Getting user alias");
    logger.trace(this);
    return Session.get("currentUser").alias;
  },

});




Template.IdeaGen.events({
    'click button.submitLogin': function () {
        var user = {'name': $('#header input#userLogin').val().trim()};
        LoginManager.loginUser(user);
    },

    'keyup input#userLogin': function (evt) {
        $(document).ready(function(){
            $('#userLogin').keypress(function(e){
              if(e.keyCode==13)
                $('#submitLogin').click();
            });
        });
    },

    'click button.submitLogout': function () {
        console.log("logging out");
        LoginManager.logout(Session.get("currentUser"));
        //Meteor.logout();
    },

});





decrementTimer = function decrementTimer() {
  /******************************************************************
  * Decrement the onscreen timer
  ******************************************************************/
  var nextTime = Session.get("timeLeft") - 1;
  Session.set("timeLeft", nextTime);
  var time = $('#time').text(nextTime);
  if (nextTime > 0) {
    logger.debug("Decrementing timer");
    Meteor.setTimeout(decrementTimer, 60000);
    // Meteor.setTimeout(decrementTimer, 1000);
  } else {
    logger.info("Exitting current page");
    // Session.set("isDecrementing", false);
    //EventLogger.logEndRole();
    //exitPage();
    
    Router.go(Session.get("nextPage"), Session.get("nextPageParams"));
  }
};

decrementFluencyTimer = function decrementFluencyTimer() {
  /******************************************************************
  * Decrement the onscreen timer
  ******************************************************************/
  var nextTime = Session.get("fluencyTimeLeft") - 1;
  Session.set("fluencyTimeLeft", nextTime);
  var time = $('#time').text(nextTime);
  if (nextTime > 0) {
    logger.debug("Decrementing fluency timer");
    logger.trace(this);
    Meteor.setTimeout(decrementFluencyTimer, 60000);
    // Meteor.setTimeout(decrementFluencyTimer, 1000);
    // Session.set("fluencyTimerTimeoutHandler",handler);
  } else {
    logger.debug("Grabbing fluency data");
    var text = $("#baseFluencyInput").val();
    var answers = text.split("\n");
    logger.trace("Answers: " + JSON.stringify(answers));
    var measure = new FluencyMeasure(answers, Session.get("currentParticipant"));
    var measureID = FluencyMeasures.insert(measure);
    if (measureID) {
      logger.trace("Fluency measure for " + 
        Session.get("currentParticipant")._id + 
        ": " + JSON.stringify(measure));
    } else {
      logger.debug("Failed to grab the data")
    }

    logger.info("Exitting current page");
    // Session.set("fluencyIsDecrementing", false);
    // Session.set("useFluencyTimer", false);
    // var handler = Session.get("fluencyTimerTimeoutHandler");
    // logger.debug("Timeout handler: " + handler);
    // Meteor.clearTimeout(handler);
    //EventLogger.logEndRole();
    //exitPage();
    
    var part = Session.get("currentParticipant");
    var condName = Conditions.findOne({_id: part.conditionID}).description;
    var routeName = "MturkIdeation" + condName;
    var promptID = Experiments.findOne({_id: part.experimentID}).promptID;
    logger.debug("Sending to " + routeName);
    Router.go(routeName, {'promptID': promptID, 'partID': part._id});
  }
};

exitPage = function (destination, params) {
  /******************************************************************
  * switch to next view to end ideation
  ******************************************************************/
  //Run end of page functions
  //$('#submitIdea').click();
  
  //Log exit
  //EventLogger.logEndIdeation(Session.get("currentParticipant"));
  
  //Cleanup Navbar
  if ($('.exitStudy').length > 0) {
    $('.exitStudy').remove();
  }
  //Removing timer from ideation
  if (Session.get("hasTimer")) {
    $('.timer').remove();
    Session.set("hasTimer", false);
  }
  //Transition to next page
  if (Session.get("loggingOut")) {
    if (destination) {
      Router.go(destination, params);
    } else {
      Router.go("Home");
    }
    Session.set("loggingOut", false);
  } else {
    Router.goToNextPage();
  }
};
