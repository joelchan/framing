// Configure logger for Tools
var logger = new Logger('Client:Routes');
// Comment out to use global logging level
Logger.setLevel('Client:Routes', 'trace');
// Logger.setLevel('Client:Routes', 'debug');
// Logger.setLevel('Client:Routes', 'info');
// Logger.setLevel('Client:Routes', 'warn');

//Maps routes to templates
Router.map(function () {
  this.route("Home", {
      path: '/',
      template: 'HcompLoginPage',
  });
  this.route("landingPageHome", {
      path: '/landingPageHome',
      template: 'LandingPage',
  });
  this.route('CustomConsentPage', {
      //path: 'ConsentPage/:_id',
      path: 'consent/:_id',
      template: 'ConsentPage',
      waitOn: function() {
        return Meteor.subscribe('prompts');
      }
  });
  this.route('MTurkConsentPage', {
      path: 'ConsentPage/:_id',
      template: 'ConsentPage',
  });
  this.route('FinalizePage', {
    path: 'FinalizePage/:_id',
    template: 'FinalizePage'
  });
  this.route('IdeationSurvey', {
    path: 'IdeationSurvey/',
    template: 'IdeationSurvey'
  });
  this.route('SynthesisSurvey', {
    path: 'SysnthesisSurvey/',
    template: 'SynthesisSurvey'
  });
  this.route('FacilitatorSurvey', {
    path: 'FacilitatorSurvey/',
    template: 'FacilitatorSurvey'
  });
  this.route('NoParticipation', {
    path: 'participation/', 
    template: 'NoParticipationPage',
  });
});

/* Testing replay fucntions */
Router.route('replay/', {
  name: 'TestReplay',
  template: 'IdeaReplay',
  subscriptions: function() {
    return [
      Meteor.subscribe('ideas'),
    ];
  },
  onBeforeAction: function() {
    var user = MyUsers.findOne();
    LoginManager.loginUser(user.name);
    Session.set("currentUser", user);
    this.next();
  },
});

//Sets layout for all routes to IdeaGen template
Router.configure({
	layoutTemplate: 'IdeaGen',
  waitOn: function() {
      return [Meteor.subscribe('myUsers')];
  },
  onBeforeAction: function(pause) {
    if (!Session.get("currentUser")) {
      //if there is no user currently logged in, then render the login page
      //this.render('LoginPage');
      //Pause rendering the given page until the user is set
      //pause();
      this.next();
    } else {
      this.next();
    }
  },
  action: function(){
    if(this.ready())
      this.render();
    else
      this.render('loading');
  }
});

// var initRolePage = function() {
//   if ($('.exitStudy').length == 0) {
//     var exitStudyBtn = UI.render(Template.ExitStudy);
//     UI.insert(exitStudyBtn, $('.login')[0]);
//   }
//   //Add event handler for the exit study button
//   $('.exitStudy').click(function() {
//     logger.info("exiting study early");
//     EventLogger.logExitStudy();
//     EventLogger.logEndRole();
//     exitPage();
//   });
//   //Add timer
//   var prompt = Session.get("currentPrompt");
//   if (prompt.length > 0) {
//     if ($('.timer').length == 0) {
//       Session.set("hasTimer", true);
//       var timerTemplate = UI.render(Template.Timer);
//       UI.insert(timerTemplate, $('#nav-right')[0]);
//       //Setup timer for decrementing onscreen timer with 17 minute timeout
//       Session.set("timeLeft", prompt.length + 1);
//       $('#time').text(prompt.length);
//       Meteor.setTimeout(decrementTimer, 60000);
//     }
//   }
// }

setNextPage = function (routeName, routeParams) {
  Session.set("nextPage", routeName);
  Session.set("nextPageParams", routeParams);
}

Router.setNextPage = setNextPage;

Router.setNextPageParam = function (key, value) {
  var params = Session.get("nextPageParams");
  if (params == null) {
    params = {};
  }
  params[key] = value;
  Session.set("nextPageParams", params);
}

Router.goToNextPage = function () {
  logger.debug("Going to next page");
  var next = Session.get("nextPage");
  var params = Session.get("nextPageParams");
  if (next) {
    logger.debug("Next page is " + next, params);
    Router.go(next, params);
  } else {
    logger.warn("Attempted to go to next page, but no next page set");
  }
}
