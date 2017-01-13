Meteor.startup(function() {

  // var natural = Meteor.require('natural'),
  //   tokenizer = new natural.WordTokenizer();
  // console.log(tokenizer.tokenize("your dog has fleas."));

});
//
//Meteor.startup(function() {
  ///****************************************************************
  //* Ensure each screen is inserted into the database
  //****************************************************************/
  ////Define all screens manually
  //var allScreens = [
    //new Screen("Screens Review Page",
               //"Review list of all app views",
               //"ScreensReviewPage"),
    //new Screen("Experiment Admin Page",
               //"Experiment admin",
               //"ExpAdminPage"),
    //new Screen("Login Page",
               //"Generic Login Page",
               //"LoginPage")
  //];
//
  ////Add screen to db if not already present
  //for (var i=0; i<allScreens.length; i++) {
    //if (Screens.find({url: allScreens[i].url}).count() == 0) {
      //Screens.insert(allScreens[i]);
    //}
  //}
//
//});
    // 
//Meteor.startup(function() {
    ///****************************************************************
    //* Setup a simple experiment with 2 conditions for individual 
    //* brainstorming
    //****************************************************************/
//
    ////Initialize roles
    //var newRole
    ////if (Roles.find().count() === 0) {
        ////newRole = new Role("Ideator");
        ////newRole.workflow = ["LoginPage",
          ////"MTurkConsentPage",
          ////"IdeationPage",
          ////"SurveyPage",
          ////"FinalizePage"];
        ////Roles.insert(newRole);
        ////newRole = new Role("Forest Synthesizer");
        ////newRole.workflow = ["LoginPage",
          ////"Forest"];
        ////Roles.insert(newRole);
    ////}
    ////if (Roles.find({'title': "Brainstorm Ideator"}).count() === 0) {
        ////var newRole = new Role("Brainstorm Ideator");
        ////newRole.workflow = ["IdeationPage"];
        ////Roles.insert(newRole);
    ////}
    ////if (Roles.find({'title': "Brainstorm Theme Extractor"}).count() === 0) {
        ////newRole = new Role("Brainstorm Theme Extractor");
        ////newRole.workflow = ["Clustering"];
        ////Roles.insert(newRole);
    ////}
    ////if (Roles.find({'title': "Brainstorm Facilitator"}).count() === 0) {
        ////newRole = new Role("Brainstorm Facilitator");
        ////newRole.workflow = ["Dashboard"];
        ////Roles.insert(newRole);
    ////}
    ////
    ////Initialize generic group template with unlimited ideation,
    ////clustering, and dashboard users
    //if (GroupTemplates.find({isTemplate: true}).count() == 0) {
      //var newTemplate = new GroupTemplate();
      //var roles = ["Brainstorm Ideator", "Brainstorm Theme Extractor",
          //"Brainstorm Facilitator"];
      //for (var i=0; i< roles.length; i++) {
        //var role = Roles.findOne({'title': roles[i]});
        //GroupManager.addRole(newTemplate, role, 100);
      //}
      //newTemplate.isDefault = true;
      //GroupTemplates.insert(newTemplate);
    //}
   // 
//
    ////Initialize experiment hardcoded on boot
    //if (Experiments.find().count() === 0) {
      //var question = "Many people have old iPods or MP3 players that they no longer use. In the next 15 minutes, please brainstorm as many uses as you can for old iPods/MP3 players. Assume that the devices' batteries no longer work, though they can be powered via external power sources. Also be aware that devices may <em>not</em> have displays. Be as specific as possible in your descriptions."
      //var exp = new Experiment();
      //exp.description = "Replicating the effect of priming with common vs rare ideas in individual brainstorming"; 
      //exp._id = Experiments.insert(exp);
      //var cond1 = new ExpCondition(1,
          //exp._id,
          //question,
          //"individual brainstorming primed with rare ideas",
          //30
          //);
      //GroupManager.addRole(cond1.groupTemplate,
          //Roles.findOne({'title': "Ideator"}), 1);
      //cond1._id = Conditions.insert(cond1);
      ////cond1.groupTemplate.addRole(
          ////Roles.findOne({'title': "Ideator"}), 1)
      //var cond2 = new ExpCondition(2, 
          //exp._id,
          //question,
          //"individual brainstorming primed with common ideas",
          //30
          //);
      //GroupManager.addRole(cond2.groupTemplate,
          //Roles.findOne({'title': "Ideator"}), 1);
      //cond2._id = Conditions.insert(cond2);
      ////cond2.groupTemplate.addRole(
          ////Roles.findOne({'title': "Ideator"}), 1)
      //exp.conditions = [cond1, cond2];
      ////Each condition has 30 participants
      //ExperimentManager.setNumGroups(exp, 30);
      //Experiments.update({_id: exp._id},
          //{$set: {conditions: exp.conditions}});
      //ExperimentManager.initGroupRefs(exp);
      ////console.log(Experiments.find().fetch());
    //}
//
    //if (Experiments.find().count() === 1) {
      //var question = "Many people have old iPods or MP3 players that they no longer use. Please brainstorm 50 uses for old iPods/MP3 players. Assume that the devices' batteries no longer work, though they can be powered via external power sources. Also be aware that devices may <em>not</em> have displays. Be as specific as possible in your descriptions."
      //var exp = new Experiment();
      //exp.description = "Testing idea forest synthesis"; 
      //exp._id = Experiments.insert(exp);
      //var cond1 = new ExpCondition(1,
          //exp._id,
          //question,
          //"Synthesizing",
          //30
          //);
      //GroupManager.addRole(cond1.groupTemplate,
          //Roles.findOne({'title': "Forest Synthesizer"}), 1);
      //cond1._id = Conditions.insert(cond1);
      //exp.conditions = [cond1];
      //ExperimentManager.setNumGroups(exp, 1);
      //Experiments.update({_id: exp._id},
          //{$set: {conditions: exp.conditions}});
      //ExperimentManager.initGroupRefs(exp);
      ////console.log(Experiments.find().fetch());
    //}
    //if (Experiments.find().count() == 2) {
      //var question = "Many people have old iPods or MP3 players that they no longer use. In the next 15 minutes, please brainstorm as many uses as you can for old iPods/MP3 players. Assume that the devices' batteries no longer work, though they can be powered via external power sources. Also be aware that devices may <em>not</em> have displays. Be as specific as possible in your descriptions."
      //var exp = new Experiment();
      //exp.description = "Replicating the effect of priming with common vs rare ideas in individual brainstorming with revised interface"; 
      //exp._id = Experiments.insert(exp);
      //var cond1 = new ExpCondition(1,
          //exp._id,
          //question,
          //"individual brainstorming primed with rare ideas",
          //30
          //);
      //GroupManager.addRole(cond1.groupTemplate,
          //Roles.findOne({'title': "Ideator"}), 1)
      //cond1._id = Conditions.insert(cond1);
      //var cond2 = new ExpCondition(2, 
          //exp._id,
          //question,
          //"individual brainstorming primed with common ideas",
          //30
          //);
      //GroupManager.addRole(cond2.groupTemplate,
          //Roles.findOne({'title': "Ideator"}), 1)
      //cond2._id = Conditions.insert(cond2);
      //exp.conditions = [cond1, cond2];
      ////Each condition has 30 participants
      //ExperimentManager.setNumGroups(exp, 30);
      //var excludeList = ["A4EF1F3YS1LZ6", "A4CX7I79NKBQA", 
          //"A28N4YR1LYTKOC", "A27LGC4MU1R7PQ", "A1RYC2OETJVEG7", 
          //"A2F79GFUWU5O96", "A21Y22J7Q0KSGN", "A0017268R9SKD8U2Y3F",
          //"A1H95TGQZSN1P1", "A1Z048705962W6", "A2V3P1XE33NYC3",
          //"A39M1U0GJ1YWBD", "A6WK319U256SM",  "A69KEZJP0BY6B",
          //"A1R8A1ZKR80MRA", "A2DNWDHMMBSHWT", "A2CZGKI3K6ZT7R",
          //"A1Y8BAQ5RYDUEN", "A38ZV8LBZ034IZ", "A68EM6DOP6D80", 
          //"A19KF02ULCISTQ", "A3V4RQCV749KKJ", "AKLV0WIZZ356X",
          //"A3FJE9AUW0O41D", "A2TPIS2HB11T7R", "AVHC83KXLJUOW", 
          //"AX6JQ37WUHFSH"
      //];
      //exp.excludeUsers.concat(excludeList);
      //Experiments.update({_id: exp._id},
          //{$set: {conditions: exp.conditions},
           //$push: {excludeUsers: {$each: excludeList}}});
      //ExperimentManager.initGroupRefs(exp);
    //}
//});
//
//
//Meteor.startup(function() {
    ///****************************************************************
    //* Ensure basic admin user is in the database
    //****************************************************************/
    //var adminName = "ProtoAdmin";
    //var adminUsers = MyUsers.find({name: adminName});
    //if (adminUsers.count() > 0) {
      //if (adminUsers.count() > 1) {
        //MyUsers.remove({name: adminName});
        //var admin = new User("ProtoAdmin", "admin");
        //MyUsers.insert(admin);
      //}
    //} else {
      //var admin = new User("ProtoAdmin", "admin");
      //MyUsers.insert(admin);
    //}
//
    //var dbUsers = MyUsers.find({_id: "db"});
    //if (dbUsers.count() > 0) {
      //if (dbUsers.count() > 1) {
        //MyUsers.remove({_id: "db"});
        //var db = new User("DashboardUser", "anonDBUser");
        //db._id = "db";
        //MyUsers.insert(db);
      //}
    //} else {
      //var db = new User("DashboardUser", "anonDBUser");
      //db._id = "db";
      //MyUsers.insert(db);
    //}
//
    //var synUsers = MyUsers.find({_id: "syn"});
    //var syn = new User("SynthesisUser", "anonSynUser");
    //if (synUsers.count() > 0) {
      //if (dbUsers.count() > 1) {
        //MyUsers.remove({_id: "syn"});
       // 
        //syn._id = "syn";
        //MyUsers.insert(syn);
      //}
    //} else {
      //var syn = new User("SynthesisUser", "anonSynUser");
      //syn._id = "syn";
      //MyUsers.insert(syn);
    //}
//
    ////var filter = Filters.findOne({name: "Syn Idea List Filter"});
    ////if(filter === undefined)
      ////FilterFactory.create("Syn Idea List Filter", syn, "ideas");
    ////else {
      ////Filters.remove({_id: filter._id});
      ////FilterFactory.create("Syn Idea List Filter", syn, "ideas");
    ////}
//
    //if(Clusters.findOne({_id: "-1"})===undefined){
      //Clusters.insert(root);
    //}
//
    //if(Notifications.findOne({_id: "directions"})===undefined){
      //Notifications.insert(directions);
    //}
//
    ////if(Notifications.findOne({_id: "priming"})===undefined){
      ////Notifications.insert(priming);
    ////}
//});
//
////Meteor.startup(function() {
  ////testGroupManager.testAll();
////});
////Meteor.startup(function() {
  ////testExperimentManager.testAll();
////});
//// Meteor.startup(function() {
////   testFilterFactory.testAll();
//// });
//
//Meteor.startup(function() {
  ///****************************************************************
  //* Keep IdeasToProcess and Ideas collections synchronized
  //****************************************************************/
  ////Clear out the IdeasToProcess collection before adding  function
  ////to synce them
  //IdeasToProcess.remove({},
    //function (err) {
      ////Callback to add sync after IdeasToProcess.remove finishes
      //Ideas.find().observe({
        //added: function(doc) {
            //IdeasToProcess.insert(doc);
        //},
      //});
  //});
//});
//
//
