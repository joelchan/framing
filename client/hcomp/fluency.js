// Configure logger for Tools
var logger = new Logger('Client:Hcomp:Fluency');
// Comment out to use global logging level
Logger.setLevel('Client:Hcomp:Fluency', 'trace');
// Logger.setLevel('Client:Hcomp:Fluency', 'debug');
// Logger.setLevel('Client:Hcomp:Fluency', 'info');
// Logger.setLevel('Client:Hcomp:Fluency', 'warn');

var timer = new Tock({
    callback: function () {
        $('#clockface').text(timer.msToTime(timer.lap()));
    }
});

var countdown = Tock({
    countdown: true,
    interval: 1000,
    callback: function () {
        // console.log(countdown.lap() / 1000);
        $('#countdown_clock').text(timer.msToTimecode(countdown.lap()));
    },
    complete: function () {
        console.log('end');
        alert("Time's up!");
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
});

var fluencyTaskLength = 1/6*60000;

Template.ExpBaselineFluencyPage.rendered = function(){
  // EventLogger.logEnterIdeation(); 
  //Hide logout
  $(".btn-login").toggleClass("hidden");
  
  logger.debug("checking to show begin ideation modal");
  if (!Session.get("currentParticipant").hasStarted) {
    logger.debug("showing begin ideation modal");
    $("#exp-begin-modal").modal('show');  
  }
  if ($('.timer').length == 0 && Session.get("useFluencyTimer")) {
    logger.info("using a timer");
    Session.set("hasTimer",true);
    Blaze.render(Template.TockTimer, $('#nav-right')[0]);  
  }
  

}

Template.ExpBaselineFluencyPage.events({
  'click .grab-fluency-input' : function () {
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
  },

  'click #startCountdown' : function () {
    // countdown.start($('#countdown_clock').val());
    var startTime = timer.msToTime(fluencyTaskLength)
    logger.trace("Fluency task length is: " + startTime);
    countdown.start(fluencyTaskLength);
  },

  'click #pauseCountdown' : function () {
    countdown.pause();
  },

  'click #stopCountdown' : function () {
    countdown.stop();
  },

  'click #resetCountdown' : function () {
    countdown.stop();
    $('#countdown_clock').val('00:02');
  },

})