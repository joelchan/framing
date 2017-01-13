// Configure logger for server tests
var logger = new Logger('Test:Server:Users');
// Comment out to use global logging level
//Logger.setLevel('Test:Server:Users', 'trace');
//Logger.setLevel('Test:Server:Users', 'debug');
Logger.setLevel('Test:Server:Users', 'info');
//Logger.setLevel('Test:Server:Users', 'warn');


if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function() {
    describe("Server Group Management", function() {
      describe("Group & Role Template management", function () {
        //beforeEach(function() {
    // 
        //});
        //afterEach(function() {
    // 
        //});
        it("Role Template creation & role lookup", function() {
          logger.debug("Testing create role template");
          //Test getting a template
          var roleTempl = RoleManager.getTemplate("Ideator", 3);
          chai.assert.isDefined(roleTempl, 
            "Did not get result from getTemplate");
          chai.assert.equal(roleTempl.title, "Ideator",
            "RoleTemplate's role title not expected");
          chai.assert.equal(roleTempl.num, 3,
            "RoleTemplate not expected size");
          roleTempl = RoleManager.getTemplate("Facilitator", -1);
          chai.assert.isDefined(roleTempl, 
            "Did not get result from getTemplate");
          chai.assert.equal(roleTempl.title, "Facilitator",
            "RoleTemplate's role title not expected");
          chai.assert.equal(roleTempl.num, -1,
            "RoleTemplate not expected size");
        });
        it("Group Template creation and adding roles", function() {
          logger.debug("Testing create group template");
          var templ = GroupManager.getTemplate();
          //Check for fields
          chai.assert.isDefined(templ.roles, 
            "RoleTemplates not defined in groupTemplate");
          chai.assert.ok(templ.roles instanceof Array,
            "RoleTemplates not an array in groupTemplate");
          chai.assert.equal(templ.size, 0,
            "GroupTemplate not expected size");
          //Add nonduplicate roles to template
          logger.trace("Testing adding roles to group templates");
          var role = GroupManager.addRole(templ, "Ideator", 3);
          chai.assert.equal(role, RoleManager.defaults['Ideator'],
            "Role returned not matching expected");
          chai.assert.equal(templ.size, 3, 
            "Template size not updated");
          chai.assert.equal(templ.roles.length, 1,
            "Template role list length not expected");
          var role = GroupManager.addRole(templ, "Synthesizer", 2);
          chai.assert.equal(role, RoleManager.defaults['Synthesizer'],
            "Role returned not matching expected");
          chai.assert.equal(templ.size, 5, 
            "Template size not updated");
          chai.assert.equal(templ.roles.length, 2,
            "Template role list length not expected");
          logger.trace("Testing adding duplicate role");
          var role = GroupManager.addRole(templ, "Ideator", 3);
          chai.assert.equal(role, RoleManager.defaults['Ideator'],
            "Role returned not matching expected");
          chai.assert.equal(templ.size, 5, 
            "Template size not updated");
          chai.assert.equal(templ.roles.length, 2,
            "Template role list length not expected");
        });
      });
      describe("Group Creation", function () {
        it("Simple group with no roles create and remove", function() {
          logger.debug("Testing create and remove group with no roles");
          var groups = [];
          for (var i=0; i<5; i++) {
            groups.push(GroupManager.create());
            chai.assert.isDefined(groups[i], "No group was created");
            chai.assert.isDefined(groups[i]._id, "No group db ID found");
            var dbGroup = Groups.findOne({_id: groups[i]._id});
            //logger.debug(dbGroup);
            //logger.debug(groups[i]);
            chai.assert.deepEqual(groups[i], dbGroup); 
          }
          var ids = getIDs(groups);
          for (var i=groups.length-1; i>groups.length-3; i--) {
            //Testing remove of single groups
            GroupManager.remove(groups[i]);
            chai.assert.equal(Groups.find({_id: {$in: ids}}).count(),
              i, "Group was not removed from db");
          }
          //Testing remove of a list of groups
          GroupManager.remove(groups);
          chai.assert.equal(Groups.find({_id: {$in: ids}}).count(), 0,
            "Group was not removed from db");
        });
        it("Default group create and remove", function() {
          logger.debug("Testing create of group with default template");
          var group = GroupManager.createDefault();
          chai.assert.isDefined(group, 
            "no group was returned on createDefault");
          chai.assert.equal(group.template.size, -1,
            "Group size was not as expected");
          chai.assert.ok(isInList(RoleManager.defaults['Ideator'],
              group.template.roles, 'title'), 
            "Ideator not found in default group");
          chai.assert.ok(isInList(RoleManager.defaults['Synthesizer'],
              group.template.roles, 'title'), 
            "Synthesizer not found in default group");
          chai.assert.ok(isInList(RoleManager.defaults['Facilitator'],
              group.template.roles, 'title'), 
            "Facilitator not found in default group");
          //Cleanup db
          GroupManager.remove(group);
   
        });
        it("Add Roles to empty group", function() {
          logger.debug("Testing adding roles to group");
          var group = GroupManager.create();
          var role = GroupManager.addRole(group, "Ideator", 3);
          chai.assert.equal(group.template.size, 3,
            "group template size was not updated when adding role to group");
          chai.assert.ok(isInList(role, group.template.roles, 'title'),
            "Did not find role in group template roles");
          var dbGroup = Groups.findOne({_id: group._id});
          chai.assert.equal(dbGroup.template.size, 3,
            "group template size was not updated in db when adding role to group");
          chai.assert.ok(isInList(role, dbGroup.template.roles, 'title'),
            "Did not find role in group DB entry template roles");
          //Adding a second role
          role = GroupManager.addRole(group, "Facilitator", 1);
          chai.assert.equal(group.template.size, 4,
            "group template size was not updated when adding role to group");
          chai.assert.ok(isInList(role, group.template.roles, 'title'),
            "Did not find role in group template roles");
          //Add unlimited size role
          role = GroupManager.addRole(group, "Synthesizer", -1);
          chai.assert.equal(group.template.size, -1,
            "group template size was not updated when adding role to group");
          chai.assert.ok(isInList(role, group.template.roles, 'title'),
            "Did not find role in group template roles");
          //Cleanup db
          GroupManager.remove(group);
        });
      });
      describe("Group Assignment", function () {
        it("Add users to group with unlimited size roles", function() {
          logger.debug("Testing adding users to unlimited group");
          var group = GroupManager.createDefault();
          var users = UserFactory.getTestUsers(20);
          for (var i=0; i<users.length; i++) {
            logger.debug("adding user with id: " + users[i]._id);
            GroupManager.addUser(group, users[i], "Ideator");
            logger.debug("group has userIDs: " + JSON.stringify(getIDs(group.users)));
            chai.assert.ok(isInList(users[i], group.users, '_id'),
              "User was not found in group");
            chai.assert.ok(isInList(users[i], group.assignments["Ideator"], 
                '_id'), "User was not found in group role assignment");
          }
          //Cleanup Db
          GroupManager.remove(group);
          UserFactory.remove(users);
        });
        //it("Add users to group with limited size roles", function() {
          //logger.debug("Testing adding users to limited group");
          //var group = GroupManager.create();
          //var sizes = [5,2,1];
          //var roles = ["Ideator", "Synthesizer", "Facilitator"];
          //var role = GroupManager.addRole(group, roles[0], sizes[0]);
          //role = GroupManager.addRole(group, roles[1], sizes[1]);
          //role = GroupManager.addRole(group, roles[2], sizes[2]);
          //var groupSize = 0;
          //for (var i=0; i<sizes.length; i++) {
            //groupSize += sizes[i];
          //}
          //var users = UserFactory.getTestUsers(groupSize + 3);
          //var index = 0;
          //for (var i=0; i<sizes.length; i++) {
            //for (var j=0; j<=sizes[i]; j++) {
              //var user = users[index];
              //role = GroupManager.addUser(group, user, roles[i]);
              //if (j == sizes[i]) {
                //logger.trace("Checking if user was not assigned to group");
                //chai.assert.isNull(role);
              //} else {
                //logger.debug("j=" + j);
                //chai.assert.equal(role.title, roles[i]);
              //}
              //if (role) {
                //index++;
              //} else {
                //logger.info("attempted to add user to role over capacity");
              //}
            //}
          //}
          ////Cleanup Db
          //GroupManager.remove(group);
          //UserFactory.remove(users);
        //});
      });
    });
  });
}
