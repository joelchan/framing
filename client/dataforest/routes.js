// Configure logger for Tools
var logger = new Logger('Client:Routes');
// Comment out to use global logging level
Logger.setLevel('Client:Routes', 'trace');
//Logger.setLevel('Client:Routes', 'debug');
//Logger.setLevel('Client:Routes', 'info');
//Logger.setLevel('Client:Routes', 'warn');

//Maps routes to templates
//Router.route('Forest', {
Router.route('Forest/:promptID/:userID', {
  name: 'DataForest',
  template: 'Forest',
  subscriptions: function() {

  },
  waitOn: function() {
    var pID = this.params.promptID;
    return [
      Meteor.subscribe('graphs', {promptID: pID}),
      Meteor.subscribe('nodes', {promptID: pID}),
      // Meteor.subscribe('ideas', {promptID: pID}),
    ];
  },
  onBeforeAction: function() {
    logger.debug("before action");
    if (this.ready()) {
      // Login user
      var user = MyUsers.findOne({_id: this.params.userID});
      LoginManager.loginUser(user.name);
      Session.set("currentUser", user);
      logger.debug("Data ready");
      var prompt = Prompts.findOne({_id: this.params.promptID});
      if (prompt) {
        logger.debug("setting current Prompt");
        Session.set("currentPrompt", prompt);
        var groupIDs = prompt.groupIDs;
        logger.trace("group IDS of the prompt");
        logger.trace(groupIDs);
        var group = Groups.findOne({_id: prompt.groupIDs[0]});
        logger.trace(group);
        Session.set("currentGroup", group);
      } else {
        logger.warn("no prompt found with id: " + this.params.promptID);
      }
      this.next();
    } else {
      logger.debug("Not ready");
    }
  },
  onRun: function() {
    logger.debug("One-time Run on route load");
    if(this.ready()) {
      logger.debug("Rendering page");
      this.render();
    } else {
      logger.debug("Rendering loading");
      this.render('loading');
    }
  },
  //action: function() {
    //if(this.ready()) {
      //logger.debug("Rendering page");
      //this.render();
    //} else {
      //logger.debug("Rendering loading");
      //this.render('loading');
    //}
  //},
  onAfterAction: function() {
    logger.debug("After Action");
  },


});
