// Configure logger for server tests
var logger = new Logger('Test:Server:Model');
// Comment out to use global logging level
//Logger.setLevel('Test:Server:Model', 'trace');
//Logger.setLevel('Test:Server:Model', 'debug');
Logger.setLevel('Test:Server:Model', 'info');
//Logger.setLevel('Test:Server:Model', 'warn');


if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function() {
    //describe("Server Testing Data Factories", function() {
      //describe("User Factory", function () {
        //it("create & remove", function() {
          //logger.trace("Testing creation and removal of new users");
          //user = UserFactory.create("TestUser", "Test User");
          //logger.debug("Created user: ");
          //logger.debug(user);
          //var userMatches = MyUsers.find({_id: user._id});
          //logger.debug("Found " + userMatches.count() + " matching users");
          //chai.assert.equal(userMatches.count(), 1);
          //chai.assert.deepEqual(userMatches.fetch()[0], user);
          //UserFactory.remove(user);
          //userMatches = MyUsers.find({_id: user._id});
          //logger.debug("Found " + userMatches.count() + 
              //" matching users after remove");
          //chai.assert.equal(userMatches.count(), 0);
        //});
        //it("Create and remove Test Users", function() {
          //logger.trace("Testing creation and removal of Test users");
          //var numUsers = 5;
          //// Proxy code until I find where testUsers are being generated
          //var matchUsers = MyUsers.find({type: UserFactory.testType});
          //logger.debug("Found " + matchUsers.count() + " test users");
          //var numMatch = matchUsers.count();
          //var result = numMatch + numUsers;
          //// end proxy
          //var users = UserFactory.getTestUsers(numUsers);
          //logger.debug("Created " + users.length + " test users");
          //chai.assert.equal(users.length, 5);
          ////Ensure the test users were inserted
          //var matchUsers = MyUsers.find({type: UserFactory.testType});
          //logger.debug("Found " + matchUsers.count() + " test users");
          //chai.assert.equal(matchUsers.count(), result);
          //UserFactory.remove(users);
        //});
      //});
      //describe("Idea Factory", function () {
        //var users;
        //var prompt;
        //var numUsers = 2;
        //beforeEach(function() {
          //logger.trace("Setting up for IdeaFactory Test");
          //logger.trace("Creating test users: ");
          //users = UserFactory.getTestUsers(numUsers);
          //logger.trace("Creating test prompt: ");
          //prompt = new Prompt("Test Prompt");
          //prompt._id = Prompts.insert(prompt);
        //});
        //afterEach(function() {
          //logger.trace("Cleaning up after IdeaFactory Test");
          //logger.trace("Removing test users: ");
          //UserFactory.remove(users);
          //logger.trace("Remove test prompt: ");
          //Prompts.remove({_id: prompt._id});
        //});
        //it("create & remove", function() {
          //logger.trace("Testing creation and removal of new idea");
          //var idea = IdeaFactory.create("Test Idea", users[0], prompt);
          //logger.debug(idea);
          //// Testing Idea insertion into db
          //var ideaMatches = Ideas.find({_id: idea._id});
          //logger.debug("Found " + ideaMatches.count() + " matching ideas");
          //chai.assert.equal(ideaMatches.count(), 1);
          //chai.assert.deepEqual(ideaMatches.fetch()[0], idea);
          ////Cleanup idea
          //logger.trace("Testing Idea removal");
          //IdeaFactory.remove(idea);
          //ideaMatches = Ideas.find({_id: idea._id});
          //logger.debug("Found " + ideaMatches.count() + 
              //" matching idea after remove");
          //chai.assert.equal(ideaMatches.count(), 0);
        //});
        //it("create dummy ideas", function() {
          //logger.trace("Testing creation of dummy ideas");
          ////For one user
          //var numIdeas = 3;
          //var ideas = IdeaFactory.createDummy(
              //users[0], prompt, numIdeas);
          //logger.debug("Created " + ideas.length + " dummy ideas");
          //chai.assert.equal(ideas.length, numIdeas);
          ////Ensure ideas were pushed to db
          //var matchIdeas = Ideas.find({userID: users[0]._id});
          //logger.debug("Found " + matchIdeas.count() + " dummy ideas in db");
          //chai.assert.equal(matchIdeas.count(), ideas.length);
          ////Cleanup ideas
          //IdeaFactory.remove(ideas);
        //});
      //});
      //describe("Cluster Factory", function () {
        //var numUsers = 2;
        //var numIdeas = 2;
        //var users;
        //var prompt;
        //var ideas;
        //beforeEach(function() {
          //logger.trace("Setting up for ClusterFactory Test");
          //logger.trace("Creating test users: ");
          //users = UserFactory.getTestUsers(numUsers);
          //logger.trace("Creating test prompt: ");
          //prompt = new Prompt("Test Prompt");
          //prompt._id = Prompts.insert(prompt);
          //logger.trace("Creating test Ideas: ");
          //ideas = [];
          //for (var i=0; i<numUsers; i++) {
            //logger.trace("Creating ideas for user: " + users[i].name);
            //var newIdeas = IdeaFactory.createDummy(users[i], prompt, numIdeas);
            //ideas = ideas.concat(newIdeas)
          //}
        //});
        //afterEach(function() {
          //logger.trace("Cleaning up after ClusterFactory Test");
          //logger.trace("Removing test users: ");
          //UserFactory.remove(users);
          //logger.trace("Remove test prompt: ");
          //Prompts.remove({_id: prompt._id});
          //logger.trace("Remove test ideas: ");
          //IdeaFactory.remove(ideas);
        //});
        //it("Simple Cluster create & remove", function() {
          //logger.trace("Testing creation and removal of new cluster");
          //var cluster = ClusterFactory.create(ideas);
          ////logger.debug(cluster);
          //// Testing Cluster insertion into db
          //var clusterMatches = Clusters.find({_id: cluster._id});
          //logger.debug("Found " + clusterMatches.count() + " matching clusters");
          //chai.assert.equal(clusterMatches.count(), 1);
          //chai.assert.deepEqual(clusterMatches.fetch()[0], cluster);
          ////Cleanup cluster
          //logger.trace("Testing Cluster removal");
          //ClusterFactory.remove(cluster);
          //clusterMatches = Clusters.find({_id: cluster._id});
          //logger.debug("Found " + clusterMatches.count() + 
              //" matching cluster after remove");
          //chai.assert.equal(clusterMatches.count(), 0);
        //});
        //it("Idea insertion into clusters with updates to db", function() {
          //logger.trace("Testing db updates with cluster idea insertion");
          //var cluster = ClusterFactory.create(ideas);
          //logger.trace("created cluster with " + cluster.ideaIDs.length + " ideas");
          //ideas.forEach(function(idea) {
            ////Look at clusterIDs and see if it contains cluster._id
            //logger.trace("Matching cluster in idea.clusterIDs");
            //chai.assert.ok(isInList(cluster._id, idea.clusterIDs));
            ////Look if idea is in cluster.ideaIDs
            //logger.trace("Matching idea in cluster.ideaIDs");
            //chai.assert.ok(isInList(idea._id, cluster.ideaIDs, '_id'));
          //});
          //logger.trace("ideas and clusters given match ID lists");
          //var dbIdeas = Ideas.find({_id: {$in: getIDs(ideas)}});
          //dbIdeas.forEach(function(idea) {
            ////Look at clusterIDs and see if it contains cluster._id
            //logger.trace("matching IDs for cluster with id: " + cluster._id);
            //logger.debug(idea.clusterIDs);
            //chai.assert.ok(isInList(cluster._id, idea.clusterIDs));
            ////Look if idea is in cluster.ideaIDs
            //logger.trace("matching IDs for idea with id: " + idea._id);
            //logger.debug("Cluster ideaIDs: " + 
                //JSON.stringify(cluster.ideaIDs));
            //chai.assert.ok(isInList(idea._id, cluster.ideaIDs, '_id'));
          //});
          //logger.trace("ideas from db and cluster given match ID lists");
          //var dbCluster = Clusters.findOne({_id: cluster._id});
          //ideas.forEach(function(idea) {
            ////Look at clusterIDs and see if it contains cluster._id
            //chai.assert.ok(isInList(dbCluster._id, idea.clusterIDs));
            ////Look if idea is in cluster.ideaIDs
            //chai.assert.ok(isInList(idea._id, dbCluster.ideaIDs, '_id'));
          //});
          //logger.trace("ideas given and cluster from db match ID lists");
          //var dbIdeas = Ideas.find({_id: {$in: getIDs(ideas)}});
          //dbIdeas.forEach(function(idea) {
            ////Look at clusterIDs and see if it contains cluster._id
            //chai.assert.ok(isInList(dbCluster._id, idea.clusterIDs));
            ////Look if idea is in cluster.ideaIDs
            //chai.assert.ok(isInList(idea._id, dbCluster.ideaIDs, '_id'));
          //});
          //logger.trace("ideas and cluster from db match ID lists");
          //ClusterFactory.remove(cluster);
        //});
        //it("Idea removal from clusters with updates to db", function() {
          //logger.trace("Testing db updates with cluster idea removal");
          //var cluster = ClusterFactory.create(ideas);
          //var idea = ideas[0];
          //var numIdeas = cluster.ideaIDs.length;
          //var numClusters = idea.clusterIDs.length;
          //ClusterFactory.removeIdeaFromCluster(idea, cluster);
          ////Check if original objects are modified
          //chai.assert.equal(cluster.ideaIDs.length, numIdeas - 1);
          //chai.assert.equal(idea.clusterIDs.length, numClusters - 1);
          ////Check if db documents are updated
          //var dbCluster = Clusters.findOne({_id: cluster._id});
          //var dbIdea = Ideas.findOne({_id: idea._id});
          //chai.assert.equal(dbCluster.ideaIDs.length, numIdeas - 1);
          //chai.assert.equal(dbIdea.clusterIDs.length, numClusters - 1);
          ////Cleanup clusters
          //ClusterFactory.remove(cluster);
        //});
        //it("create dummy clusters", function() {
          //logger.trace("Testing creation of dummy clusters");
          ////For one user
          //var numClusters = 3;
          //var clusters = ClusterFactory.createDummy(ideas, numClusters);
          //logger.debug("Created " + clusters.length + " dummy clusters");
          //chai.assert.equal(clusters.length, numClusters);
          ////Ensure clusters were pushed to db
          //ids = getIDs(clusters);
          //var matchClusters = Clusters.find({_id: {$in: ids}});
          //logger.debug("Found " + matchClusters.count() + " dummy clusters in db");
          //chai.assert.equal(matchClusters.count(), clusters.length);
          ////Cleanup clusters
          //ClusterFactory.remove(clusters);
        //});
      //});
    //});
  });
}
