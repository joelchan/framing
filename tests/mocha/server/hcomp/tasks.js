// Configure logger for server tests
var logger = new Logger('Test:Server:Users');
// Comment out to use global logging level
//Logger.setLevel('Test:Server:Users', 'trace');
//Logger.setLevel('Test:Server:Users', 'debug');
Logger.setLevel('Test:Server:Users', 'info');
//Logger.setLevel('Test:Server:Users', 'warn');


if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function() {
    describe("Server Task Management", function() {
      describe("Task Create/Destroy", function () {
        var numUsers = 1;
        var user;
        var ideas;
        var prompt;
        var group;
        var desc = "Test Task";
        var priority = 5;
        beforeEach(function() {
          logger.trace("Setting up for Task Creation Test");
          user = UserFactory.getTestUsers(numUsers);
          //Create Prompt & Group for test context
          prompt = PromptManager.create("Test Prompt");
          group = GroupManager.create();
          var role =  'Facilitator';
          GroupManager.addUser(group, user, role);
          PromptManager.addGroups(prompt, group)
          ideas = IdeaFactory.createDummy(user, prompt, 2);
        });
        afterEach(function() {
          logger.trace("Cleaning up after Task Creation test");
          PromptManager.remove(prompt);
          GroupManager.remove(group)
          IdeaFactory.remove(ideas);
          UserFactory.remove(user);
        });
        it("Create/destroy a simple Task", function() {
          var type = TaskManager.types[0];
          //var type = "timed";
          chai.assert.equal(type, "timed");
          var task = TaskManager.create(user, prompt, group, desc,
            type, 5, 1);
          chai.assert.equal(task.authorID, user._id);
          chai.assert.equal(task.promptID, prompt._id);
          chai.assert.equal(task.groupID, group._id);
          chai.assert.equal(task.desc, desc);
          chai.assert.equal(task.type, type);
          chai.assert.equal(task.num, 1);
          chai.assert.equal(task.priority, priority);
          var query = Tasks.find({_id: task._id});
          chai.assert.equal(query.count(), 1);
          TaskManager.remove(task);
          var query = Tasks.find({_id: task._id});
          chai.assert.equal(query.count(), 0);
        });
        it("Create a task with attached idea", function() {
          var type = TaskManager.types[2];
          chai.assert.equal(type, "open");
          var task = TaskManager.create(user, prompt, group, desc,
            type, 5, 1);
          TaskManager.attachIdeas(task, ideas);
          for (var i=0; i<ideas.length; i++) {
            chai.assert.isTrue(isInList(ideas[i], task.attachments));
          }
          TaskManager.remove(task);
        });
      });
    });
  });
}
