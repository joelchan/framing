// Configure logger for Tools
var logger = new Logger('Client:Exp:Admin');
// Comment out to use global logging level
Logger.setLevel('Client:Exp:Admin', 'trace');
//Logger.setLevel('Client:Exp:Admin', 'debug');
//Logger.setLevel('Client:Exp:Admin', 'info');
//Logger.setLevel('Client:Exp:Admin', 'warn');

/********************************************************************
 * Return the list of all prompts
 * *****************************************************************/
Template.ExpAdminPage.experiments = function() {
  return Experiments.find();
};

Template.ExpAdminPage.roles = function() {
    return RoleManager.defaults;
};

//Template.EPGroupMakeup.role = function() {
  //return RoleManager.getTemplate(String(this));
//};

Template.EPExperiment.formUrl = function() {
  //var startPage = Roles.findOne({'_id': this.groupTemplate.roles[0].role}).workflow[0]
  var startPage = "MturkLoginPage";
  // Need to rewrite this to pull from Experiment.url
  return Meteor.absoluteUrl() + startPage + '/' + this._id;
};

Template.EPGroupMakeup.num = function() {
  if (this.num < 0) {
    return "unlimited"
  } else {
    return this.num;
  }
};

/********************************************************************
 * Return the list of all prompts
 * *****************************************************************/
Template.ExpAdminPage.events({
  /********************************************************************
  * Template function returning a boolean if there is a logged in user
  * *****************************************************************/
    'click button.nextPage': function () {
        //Go to next page
    },

    'click button.new-exp': function () {
        //Create Modal for creating a new experiment
        //Toggling handled by bootstrap.js
        //$('#newPromptModal').modal('toggle');
        
    },

    'click button.createExperiment': function () {
      //Add a prompt to the database 
      console.log("saving experiment");
      var newQuestion = $("textarea#exp-prompt-text").val();
      var newExp = new Experiment(newQuestion);
      console.log($("textarea#exp-desc-text").val());
      newExp.description = $("textarea#exp-desc-text").val();
      console.log($("input#exp-num-groups").val());
      newExp.numGroups = $("input#exp-num-groups").val();
      var roles = new GroupTemplate();
      var role = Roles.findOne({_id: $("select#exp-role1").val()});
      console.log(role);
      console.log(roles);
      roles.addRole(role, $("input#exp-num-role1").val())
      newExp.groupTemplate = roles;
      //newPrompt.addParticipant('test');
      console.log(newExp);
      //Prompts.insert({'prompt': newPrompt});
      Experiments.insert(newExp);

      //var currentPrompt = Prompts.find({'prompt': newPrompt}).fetch();

      //Session.set("currentPrompt", currentPrompt[0]);
      //Router.go('IdeationPage', {'_id': currentPrompt[0]._id});
      //modal taoggled by bootstrap classes
      //$('#newExpModal').modal('hide');
    },

    'click div.clickable': function () {
      // Set the current prompt
      var experiment = Experiments.find({'_id': this._id}).fetch();
      if (prompt.length > 0) {
        //Session.set("currentPrompt", prompt[0]);
        //prompt[0].prompt.addParticipant("test");
        //Router.go('IdeationPage', {'_id': experiment[0]._id});

        //console.log();
      }
    },

});

