// Configure logger for server tests
var logger = new Logger('Test:Client');
// Comment out to use global logging level
Logger.setLevel('Test:Client', 'debug');

/********************************************************************
 * Client behavior tests
 *******************************************************************/
if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function() {
    describe("High level client behavior tests", function() {
        it("Test1", function() {
          chai.assert.equal(10, 10);
        });
    });
  });
}

//describe("Filtering with FilterManager", function() {
  //describe("Filter Retrieval", function () {
    //var desc = "Test Filter";
    //var collection = "ideas"; //Arbitrary
    //var numUsers = 5;
    //var users;
    //var ideas;
    //var clusters;
    //var time = {}
    //var prompt;
    //beforeEach(function() {
      //logger.trace("Setting up for Filter Retrieval test");
      //users = UserFactory.getTestUsers(numUsers);
      ////Create filters for numUsers-1 users over collection for query
      ////by user[0]
      //for (var i=1; i<numUsers; i++) {
        //FilterManager.create(
            //desc, users[0], collection, 'userID', users[i]._id);
      //}
      ////Create Ideas for dummy cluster
      //prompt = new Prompt("Test Prompt");
      //prompt._id = Prompts.insert(prompt);
      //ideas = [];
      //for (var i=1; i<numUsers; i++) {
        //var newIdeas = IdeaFactory.createDummy(users[i], prompt, 2);
        //ideas = ideas.concat(newIdeas);
      //}
      ////Create Test Clusters
      //clusters = ClusterFactory.createDummy(ideas, 5);
      ////Create filters for clusters over collection for query by
      ////user[0]
      //for (var i=0; i<clusters.length; i++) {
        //FilterManager.create(
            //desc, users[0], collection, 'clusterIDs', clusters[i]._id);
      //}
      ////Create filters for time
      //var now = new Date();
      //var past = new Date(now.getTime() - 5*60*1000);
      //time = {begin: past, end: now};
      //FilterManager.create(
          //desc, users[0], collection, 'time', past, 'gt' );
      //FilterManager.create(
          //desc, users[0], collection, 'time', now, 'lt' );
    //});
    //afterEach(function() {
      //logger.trace("Cleaning up after Filter Retrieval test");
      //FilterManager.reset(
          //desc, users[0], collection);
      //Prompts.remove({_id: prompt._id});
      //ClusterFactory.remove(clusters);
      //IdeaFactory.remove(ideas);
      //UserFactory.remove(users);
    //});
    //it("Simple Retrieving raw filter list", function() {
      //logger.trace("Testing Raw Filter List retrieval");
      //var query = Filters.find({
          //name: desc, 
          //user: users[0], 
          //collection: collection
      //});
      //logger.debug("Found " + query.count() + " filters with query");
      ////Check query has expected count
      //chai.assert.equal(query.count(), numUsers - 1 + clusters.length + 2);
      //var filters = FilterManager.getFilterList(
          //desc, users[0], collection);
      //logger.debug("Found " + filters.count() + 
          //" filters with getFilterList");
      ////Check query and raw list result are equal length
      //chai.assert.equal(filters.count(), query.count());
      ////Check for filter matches
      //var foundMatch = false;
      //filters.forEach(function(filt) {
        //logger.debug("Looking at filter on field: " + filt.field);
        //chai.assert.ok(isInList(filt, query, '_id'));
      //});
    //});
    //it("Retrieving mapped filter objects lists", function() {
      //logger.trace("Testing Mapped Filter List retrieval");
      //var sessVar = 'testFilts';
      //var mappedFilters = FilterManager.createMappedFilterList(
          //desc, users[0], collection, sessVar);
      ////Check for equal users
      //users.slice(1).forEach(function(user) {
        //logger.debug(mappedFilters['users']);
        //chai.assert.ok(isInList(user, mappedFilters['users'], '_id'));  
      //});
      ////Check for equal clusters
      //clusters.forEach(function(cluster) {
        //logger.debug(mappedFilters['clusters']);
        //chai.assert.ok(isInList(cluster, mappedFilters['clusters'], '_id'));  
      //});
      ////Check for equal time
      //chai.assert.deepEqual(mappedFilters['time']['begin'], time['begin']);
      //chai.assert.deepEqual(mappedFilters['time']['end'], time['end']);
      ////Check for no misc filters
      //chai.assert.isUndefined(mappedFilters['misc'], 
          //"Found misc filters where none should be found");
      ////Need to check for misc filters if there are misc filters
    //});
    //it("Retrieving mapped filter objects callback", function() {
      ////Untested session variable functionality needs to be tested on the client
//
    //});
  //});
//});
