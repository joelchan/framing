// Configure logger for Tools
var logger = new Logger('Client:Base:Test');
// Comment out to use global logging level
Logger.setLevel('Client:Base:Test', 'trace');
// Logger.setLevel('Client:Base:Test', 'debug');
// Logger.setLevel('Client:Base:Test', 'info');
// Logger.setLevel('Client:Base:Test', 'warn');

Template.IdeaReplay.onRendered(function() {
  logger.debug("Finished rendering IdeaReplay page");
  var user = Session.get("currentUser");
  var idea = Ideas.findOne({}, {$sort: {'time': 1}});
  logger.trace("Start idea: ");
  logger.trace(idea);
  var startTime = idea.time - 1;
  FilterManager.reset("ReplayFilter", user, "ideas");
  ReplayManager.init("ReplayFilter", user, "ideas", startTime);
});


Template.IdeaReplay.helpers({
  ideas: function() {
    return FilterManager.performQuery("ReplayFilter",
          Session.get("currentUser"),
          "ideas"
          );
  }
});

Template.IdeaReplay.events({
  'click #replay-btn': function(e) {
    logger.debug("Clicked play button");
    ReplayManager.play();
  },
});

