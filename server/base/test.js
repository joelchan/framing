 testGroupManager = (function() {
   /*****************************************************************
   * Test group manager
   *****************************************************************/
   return {
     addRole: function() {

     },
     numOpenSlots: function() {

     },
     addUser: function() {

     },
     testAll: function() {
       //Create groupTemplate
       var template = new GroupTemplate();
       template._id = GroupTemplates.insert(template);
       var role1 = Roles.findOne({'title': "Ideator"});
       var role2 = Roles.findOne({'title': "Forest Synthesizer"});
       GroupManager.addRole(template, role1, 3);
       GroupManager.addRole(template, role2, 1);
       var group = new Group(template);
       Groups.insert(group);
       console.log(GroupManager.numOpenSlots(group));
       var user1 = new User("testUser1", "Test User");
       user1._id = Names.insert(user1);
       console.log(GroupManager.addUser(group, user1));
       console.log(GroupManager.numOpenSlots(group));
       console.log(group.isOpen);
       for (var i=0; i<4; i++) {
         var user = new User("testUser" + i, "Test User");
         user._id = Names.insert(user);
         console.log(GroupManager.addUser(group, user1));
         console.log(GroupManager.numOpenSlots(group));
         }
       console.log(group.isOpen);
     }
   };
 }());
var data = {}

Meteor.methods({
  createDemoData: function() {
    console.log("**************************************************");
    console.log("Creating demo data");
    console.log("**************************************************");
    //Create Prompt
    data['prompt'] = PromptManager.create(
      "What are some alternative uses for a bowling pin",
      GroupManager.defaultTemplate,
      "Bowling pin"
    );
    data['group'] = GroupManager.create(data['prompt'].template);
    data['users'] = [];
    var user = UserFactory.create("Billy");
    var role = RoleManager.defaults['Facilitator'];
    GroupManager.addUser(data['group'], user, 'Facilitator');
    data['users'].push(user) 
    var user = UserFactory.create("Joan");
    var role = RoleManager.defaults['Synthesizer'];
    GroupManager.addUser(data['group'], user, 'Synthesizer');
    data['users'].push(user) 
    var user = UserFactory.create("Yuri");
    var role = RoleManager.defaults['Synthesizer'];
    GroupManager.addUser(data['group'], user, role);
    data['users'].push(user) 
    var user = UserFactory.create("Carlos");
    var role = RoleManager.defaults['Ideator'];
    GroupManager.addUser(data['group'], user, role);
    data['users'].push(user) 
    var user = UserFactory.create("Jillian");
    var role = RoleManager.defaults['Ideator'];
    GroupManager.addUser(data['group'], user, role);
    data['users'].push(user) 
    var user = UserFactory.create("Jordan");
    var role = RoleManager.defaults['Ideator'];
    GroupManager.addUser(data['group'], user, role);
    data['users'].push(user) 
    var user = UserFactory.create("Jackson");
    var role = RoleManager.defaults['Ideator'];
    GroupManager.addUser(data['group'], user, role);
    data['users'].push(user) 




  },
  destroyDemoData: function() {
    console.log("**************************************************");
    console.log("Destroying demo data");
    console.log("**************************************************");
    console.log(data['prompt'])
    PromptManager.remove(Prompts.find());
    GroupManager.remove(Groups.find());
    IdeaFactory.remove(Ideas.find());
    ClusterFactory.remote(Clusters.find());
    
  },


});



 //testExpManager = (function() {
   ///*****************************************************************
   //* Test Experiment manager
   //*****************************************************************/
   //return {
     //testAll: function () {
       //var question = "Test Experiment prompt";
       //var exp = new Experiment();
       //exp.description = "Testing Experiment Management";
       //exp._id = Experiments.insert(exp);
       //var cond1 = new ExpCondition(1,
           //exp._id,
           //question,
           //"Test Experiment Condition 1",
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
           //"Test Experiment Condition 2",
           //30
           //);
       //GroupManager.addRole(cond2.groupTemplate,
           //Roles.findOne({'title': "Ideator"}), 1);
       //cond2._id = Conditions.insert(cond2);
       ////cond2.groupTemplate.addRole(
           ////Roles.findOne({'title': "Ideator"}), 1)
       //exp.conditions = [cond1, cond2];
       ////Each condition has 30 participants
       //exp.setNumGroups(30);
       //Experiments.update({_id: exp._id},
           //{$set: {conditions: exp.conditions}});
       //ExperimentManager.initGroupRefs(exp);
       //console.log(Experiments.find().fetch());
 
       /***** Testing getRandomCondition ******/
       //for (var i=0; i<5; i++) {
         //console.log("************** got condition: *******************");
         //console.log(ExperimentManager.getRandomCondition(exp));
       //}
 
       /***** Testing getExpGroup ******/
       //var cond = ExperimentManager.getRandomCondition(exp);
       //console.log("got assigned condition:" );
       //console.log(cond);
       //console.log("Group IDS:");
       //console.log(exp.groups);
       //console.log(ExperimentManager.getExpGroup(exp, cond));
       //console.log(exp.groups);
       //console.log(ExperimentManager.getExpGroup(exp, cond));
       //console.log(exp.groups);
   
       /***** Testing addExperimentParticipant ******/
       ////var user = new User("testUser", "Test User");
       ////user._id = Names.insert(user);
       ////console.log(ExperimentManager.addExperimentParticipant(exp, user));
       ////console.log(ExperimentManager.addExperimentParticipant(exp, user));
  // 
       ///***** Testing canParticipate ******/
       //var user = new User("testUser", "Test User");
       //user._id = Names.insert(user);
       //console.log("can participate?:");
       //console.log(ExperimentManager.canParticipate(exp, user.name));
       //var part = ExperimentManager.addExperimentParticipant(exp, user);
       //console.log(part);
       //part.hasFinished = true;
       //console.log(part);
       //Participants.update({_id: part._id}, {$set: {hasFinished: true}});
       //console.log("can participate?:");
       //console.log(ExperimentManager.canParticipate(exp, user.name));
     //}
   //};
 //}());
//
