// Configure logger for Tools
var logger = new Logger('Server:Hcomp:Users');
// Comment out to use global logging level
Logger.setLevel('Server:Hcomp:Users', 'trace');
//Logger.setLevel('Server:Hcomp:Users', 'debug');
//Logger.setLevel('Server:Hcomp:Users', 'info');
//Logger.setLevel('Server:Hcomp:Users', 'warn');

//Meteor remote invocation
//Meteor.methods({
  //'UserManager_create': function(user, prompt, group, desc, 
              //type, priority, num, inspiration ) {
    //return TaskManager.create(user, prompt, group, desc,
      //type, priority, num, inspiration);
  //},
  //'UserManager_attachIdeas': function(task, ideas) {
    //TaskManager.attachIdeas(task, ideas);
  //},
  //'UserManager_remove': function(tasks) {
    //TaskManager.remove(tasks);
  //}
//});
//
//UserFactory  = (function() {
   //return {
     //testusers: [],
     //testName: "TestUser",
     //testType: "Test User",
     //create: function(name, type) {
       //if (!type) {
         //type = "Anonymous User";
       //}
       //var user = new User(name, type);
       //user._id = MyUsers.insert(user);
       //return user;
     //},
     //getAdmin: function() {
       //var admin = MyUsers.find({"type": "admin"});
       //if (admin.count() == 0) {
         //return this.create("ProtoAdmin", "admin");
       //} else {
         //return admin.fetch()[0];
       //}
     //},
     //getTestUser: function() {
       //var userName = this.testName;
       //return this.create(userName, this.testType);
     //},
     //getTestUsers: function(num) {
       //if (num === 1) {
         //return this.getTestUser();
       //}
       //users = [];
       //for (var i=0; i<num; i++) {
         //var userName = this.testName + i;
         //users.push(this.create(userName, this.testType));
       //}
       //return users;
     //},
     //remove: function(users) {
       //if (hasForEach(users)) {
        //ids = getIDs(users);
        //if (Meteor.isServer) {
          //MyUsers.remove({"_id": {$in: ids}}); 
        //} else {
          //ids.forEach(function(id) {
            //MyUsers.remove({"_id": id}); 
          //});
        //}
      //} else {
         ////users is just a single user object if not an array
         //MyUsers.remove({_id: users._id});  
       //}
     //}, 
   //};
 //}());
//
//HcompRoleManager = (function () {
  ////Change deafultRoles to object with list of roles + each role
  ////accessible by name
  //var defaultRoles = {};
  //var newRole = new Role("MturkIdeator");
  //newRole.workflow = ['MturkIdeation'];
  //defaultRoles[newRole.title] = newRole;
  //newRole = new Role("Ideator");
  //newRole.workflow = ['HcompIdeation', 'HcompSynthesis'];
  //defaultRoles[newRole.title] = newRole;
  //newRole = new Role("Facilitator");
  //newRole.workflow = ['BeginBrainstormPage', 'HcompDashboard', 'HcompResultsPage'];
  //defaultRoles[newRole.title] = newRole;
  //newRole = new Role("Chi-Ideator");
  //newRole.workflow = ['BeginBrainstormPage', 'Ideation', 'IdeationSurvey'];
  //defaultRoles[newRole.title] = newRole;
  //newRole = new Role("Synthesizer");
  //newRole.workflow = ['BeginBrainstormPage', 'Clustering', 'SynthesisSurvey'];
  //defaultRoles[newRole.title] = newRole;
  //newRole = new Role("Chi Facilitator");
  //newRole.workflow = ['BeginBrainstormPage', 'Dashboard', 'FacilitatorSurvey'];
  //defaultRoles[newRole.title] = newRole;
  //newRole = new Role("Unassigned");
  //newRole.workflow = ['PromptPage', 'GroupPage', 'RoleSelectPage'];
  //defaultRoles[newRole.title] = newRole;
  //newRole = new Role("Admin");
  //newRole.workflow = ['ExpAdminPage'];
  //defaultRoles[newRole.title] = newRole;
//
  //return {
    ///****************************************************************
     //* Object that allows for most group manipulations including 
     //*   assignment, creation, and modification
     //***************************************************************/
    ////Enum of all default roles
    //defaults: defaultRoles,
    //getTemplate: function(title, num) {
      ///**************************************************************
       //* Return a roleTemplate with using a role with a given title
       //* and the number specified
       //*************************************************************/
      //logger.trace("Creating template with role: " + title);
      //var role = this.defaults[title];
      //if (!role) {
        //logger.warn(
            //"Failed attempt to create roleTemplate with role title: " +
            //title);
      //}
      //if (num) {
        //role['num'] = num;
      //}
      //return role;
    //},
    //getNextFunc: function(role, current) {
      ///**************************************************************
       //* Get the next function/page that the role should transition
       //*************************************************************/
      //var workflowIndex = -1;
      //for (var i=0; i<role.workflow.length; i++) {
          //var workflowPage = role.workflow[i]; 
          //if (workflowPage == current) {
              ////console.log("current function is: " + this.workflow[i]);
              //var workflowIndex = i;
          //}
      //}
      //logger.debug("index of current in workflow " + workflowIndex);
      //logger.debug("role workflow is: " + JSON.stringify(role.workflow));
      ////if (workflowIndex === 0) {
        ////logger.trace("next function is: " + role.workflow[0]);
        ////return role.workflow[0];
      ////} else if (workflowIndex + 1 < role.workflow.length) {
      //if (workflowIndex + 1 < role.workflow.length) {
        //logger.trace("next function is: " + role.workflow[workflowIndex + 1]);
        //return role.workflow[workflowIndex+1];
      //} else {
        ////console.log("No next function found");
        //logger.warn("Attempted to go to next role function when " +
          //"none is defined");
        //return null;
      //}
    //},
  //};
//}());
//
//
//HcompGroupManager = (function () {
  ////Define a default group template
  //var templates = [];
  //var defaultTempl = new GroupTemplate();
  //defaultTempl.roles = [RoleManager.getTemplate("Ideator", -1),
    //RoleManager.getTemplate('Synthesizer', -1),
    //RoleManager.getTemplate('Facilitator', -1)
  //];
  //defaultTempl.size = -1;
  //templates.push(defaultTempl);
  //defaultTempl = new GroupTemplate();
  //defaultTempl.roles = [RoleManager.getTemplate("Crowd-Ideator", -1),
    //RoleManager.getTemplate('Facilitator', -1)
  //];
  //defaultTempl.size = -1;
  //templates.push(defaultTempl);
  //return {
    ///****************************************************************
     //* Object that allows for most group manipulations including 
     //*   assignment, creation, and modification
     //****************************************************************/
    //defaultTemplates: templates,
    //defaultTemplate: function() {
      //return this.defaultTemplates[0];
    //},
    //create: function(template) {
      ///**************************************************************
      //* Create a new group from a tempalte and perform an necessary
      //* initialization
      //**************************************************************/
      //if (!template) {
        //template = this.getTemplate();
      //}
      //var newGroup = new Group(template);
      //newGroup._id = Groups.insert(newGroup);
      //return newGroup;
    //},
    //createDefault: function() {
      //return this.create(this.defaultTemplate);
    //},
    //getTemplate: function(roleTemps) {
      ///**************************************************************
      //* Create a group template with the given role templates
      //* @Params
      //*   roleTemps - (Optional) Array of RoleTemplates that will 
      //*     define the group template
      //* @Return
      //*   a GroupTemplate Object
      //**************************************************************/
      //var result = new GroupTemplate();
      //if (roleTemps) {
        //if (hasForEach(roleTemps)) {
          //logger.trace("Adding list of roles to group template");
          //roleTemps.forEach(function(roleTemp) {
            //this.addRole(result, roleTemp.role, roleTemp.num);
          //});
        //} else {
          //logger.trace("Adding a single role to group template");
        //}
//
      //} else {
        //return this.defaultTemplate;
      //}
      ////result._id = GroupTemplates.insert(result);
      //return result;
    //},
    //copy: function(group) {
      ///**************************************************************
       //* Creates a duplicate group based on a given group's template
       //* and adds it to the database. Intended to abstract mechanics
       //* of copying/creation of a group. Duplicating groups should
       //* be a common function
       //**************************************************************/
       //return this.create(group.template);
    //},
    //addRole: function (grp, title, num) {
      ///******************************************************************
      //* Adds a role to the set of roles in a group template
      //*
      //* @return null
      //******************************************************************/
      //var newRole = RoleManager.getTemplate(title, num);
      //var isGroup = false;
      ////Check if group is a template
      //if (!grp.template) {
        //logger.trace("Adding role to a GroupTemplate");
        //var target = grp;
      //} else {
        //logger.trace("Adding role to template of a group");
        //isGroup = true; 
        //target = grp.template;
      //}
      //if (!isInList(newRole, target.roles, 'title')) {
        //target.roles.push(newRole);
        ////Update group size
        //if (target.size >= 0) {
          //if (num < 0) {
            //target.size = -1;
          //} else {
            //target.size += num;
          //}
        //}
        //if (isGroup) {
          //grp.assignments[newRole.title] = [];
          ////Update db fields
          //Groups.update({_id: grp._id}, 
              //{
                //$push: {'template.roles': newRole},
                //$set: {'template.size': target.size, 
                    //'assignments': []
                //}
              //}
          //);
        //}
      //} else {
        //logger.warn("GroupTemplate already contains given role," +
            //" no change made");
      //}
      //return newRole;
    //},
//
    //numOpenSlots: function(group) {
      ///****************************************************************
      //* Determine if the group can accept more members according to 
      //* the template definition 
      //****************************************************************/
      //if (group.template.size < 0) {
        //return -1;
      //} else {
        //var numSlots = 0;
        //var numAssigned = 0;
        ////Sum all the assignemnts for each role
        ////for (var i=0; i<group.assignments.length; i++) {
          ////numAssigned += group.assignments[i].roleAssignments.length;
        ////}
        //for (var role in group.assignments) {
          //if (group.assignments.hasOwnProperty(role)) {
            ////numAssigned += group.assignements[role].roleAssignments.length;
            //numAssigned += group.assignments[role].length;
          //}
        //}
        ////Sum all the potential slots for each role
        ////var roles = group.template.roles;
        ////for (var i=0; i<roles.length; i++) {
          ////numSlots += roles[i].num;
        ////}
        ////Return the difference
        //return group.template.size - numAssigned;
      //}
    //},
 // 
    //addUser: function(group, user, role) {
      ///**************************************************************
      //* Adds a user to the group assumes group has capacity unless
      //*   isOpen flag is set to false, also updates database entry
      //* @Params
      //*   group - the group the user will be inserted if there is space
      //*   user - user to be added to the group
      //*   role - (optional) the role the user will be assigned. 
      //*       If none is given, then a random role will be selected
      //* @Return
      //*   role - the role that the user was assigned or undefined if 
      //*       no assignment was successfully made
      //**************************************************************/
      //logger.debug("number of assigned to role, " + role + " " + 
          //group.assignments[role].length);
      //logger.debug("number of possible to role, " + role + " " + 
          //this.getSize(group, role));
      //if (group.isOpen && 
          //((this.getSize(group, role) > group.assignments[role].length) ||
           //(this.getSize(group) < 0))) {
        //if (!role) {
          ////Get role if not already given
          //role = this.getRandomRole(group);
        //} else {
          ////Get role based on role title given
          //role = RoleManager.defaults[role];
        //}
        //if (!isInList(user, group.users, '_id')) {
          //logger.debug("adding new user to group with id: " + user._id);
          //group.users.push(user);
        //} else {
          //logger.warn("Attempting to add already present user to group");
          ////Return the role already assigned to the user
          //return this.getRole(group, user); 
        //}
        ////logger.debug("list of userIDs: " +JSON.stringify(getIDs(group.users)));
        ////Add group to user
        //user.groupID = group._id;
        ////Add User to the list of users assigned to a specific fole
        //logger.debug(group.assignments);
        //group.assignments[role.title].push(user);
        ////group.assignments[role.roleID].roleAssignments.push(user);
        //// Mark closed if no more slots are open after assignment
        //if (this.numOpenSlots(group) == 0) {
          //group.isOpen = false;
        //}
        ////Update group in group collection
        //switch(role.title) {
         //case "Ideator":
          //Groups.update({_id: group._id},
              //{
                //$push: {users: user, 
                  //'assignments.Ideator': user
                //},
                //$set: {isOpen: group.isOpen}
              //}
          //);
          //break;
         //case "Synthesizer":
          //Groups.update({_id: group._id},
              //{
                //$push: {users: user, 
                  //'assignments.Synthesizer': user
                //},
                //$set: {isOpen: group.isOpen}
              //}
          //);
          //break;
         //case "Facilitator":
          //Groups.update({_id: group._id},
              //{
                //$push: {users: user, 
                  //'assignments.Facilitator': user
                //},
                //$set: {isOpen: group.isOpen}
              //}
          //);
          //break;
         //default:
          //Groups.update({_id: group._id},
              //{
                //$push: {users: user},
                //$set: {assignments: group.assignments,
                  //isOpen: group.isOpen
                //}
              //}
          //);
          //break;
        //}
        ////Update user in db
        //MyUsers.update({_id: user._id},
            //{$set: {'groupID': group._id}}
        //);
        //return role;
      //} else {
        //if (isInList(user, group.users, '_id')) {
          ////Return the role already assigned to the user
          //logger.trace("user already in full group");
          //return this.getRole(group, user); 
        //} else {
          //logger.trace("Group or role is full, could not assign user");
          //return null;
        //}
      //}
    //},
    //hasUser: function(group, user) {
      //var users = group.users;
      //logger.debug(user);
      //logger.debug(users);
      //if (isInList(user, users, '_id')) {
        //logger.trace("user is in group");
        //return true;
      //} else {
        //logger.trace("user is not in group");
        //return false;
      //}
    //},
    //getSize: function(group, title) {
      ///**************************************************************
       //* Get the size of the group, or the number of slots for a 
       //* given role with title
       //************************************************************/
      //if (title) {
        ////If a role title is given, find the size fo the role
        //logger.trace("Getting size of role in group: " + title);
        //logger.debug(group.template.roles);
        //var result = 0;
        //group.template.roles.forEach(function(role) {
          //if (role.title.trim() == title.trim()) {
            //logger.debug("size of role is: " + role.num);
            //result =  role.num;
          //}
        //});
        //return result;
      //}
      ////Get the size fo the full group
      //logger.trace("Getting size of group");
      //return group.template.size;
    //},
    //getUsersInRole: function(group, title) {
      ///**************************************************************
       //* Get a list of users that have been assigned to role with given
       //* title
       //*************************************************************/
      //if (group.assignments[title]) {
        //return group.assignments[title];
      //} else {
        //return null;
      //}
    //},
//
    //getRole: function(group, user) {
      ///**************************************************************
       //* Retieve the role assigned to a given user in the group.
       //* Null if user is not assigned
       //*************************************************************/
      //var roles = group.template.roles;
      //for (var i=0; i<roles.length; i++) {
        //var title = roles[i].title;
        //if (isInList(user, group.assignments[title], '_id')) {
          //return roles[i];
        //}
      //}
      //return null;
    //},
    //getRandomRole: function (group) {
      ///**************************************************************
      //* Returns from the group a random role that has open slots
      //**************************************************************/
      //var roleTemplates = group.template.roles;
      //var openRoles = []
      //for (var i=0; i<roleTemplates.length; i++) {
        //var numSlots = roleTemplates[i].num;
        //var numAssign = group.assignments[roleTemplates[i].roleID].length
        //var diff = numSlots - numAssign;
        //if (diff > 0) {
          //openRoles.push(roleTemplates[i]);
        //}
      //};
      //return getRandomElement(openRoles);
    //},
    //remove: function(groups) {
      //if (hasForEach(groups)) {
        //ids = getIDs(groups);
        //if (Meteor.isServer) {
          //logger.trace("Removing a set of groups using $in");
          //Groups.remove({"_id": {$in: ids}}); 
        //} else {
          //logger.trace("Removing a set of groups individually");
          //ids.forEach(function(id) {
            //Groups.remove({"_id": id}); 
          //});
        //}
      //} else {
         ////groups is just a single group object if not an array
         //logger.trace("Removing a single group by ID");
         //Groups.remove({_id: groups._id});  
      //}
    //}
  //}; 
//}());
//
