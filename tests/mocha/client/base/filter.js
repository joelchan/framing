// Configure logger for server tests
var logger = new Logger('Test:Client:Filter');
// Comment out to use global logging level
//Logger.setLevel('Test:Client:Filter', 'trace');
//Logger.setLevel('Test:Client:Filter', 'debug');
Logger.setLevel('Test:Client:Filter', 'info');
//Logger.setLevel('Test:Client:Filter', 'warn');
//
if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function() {
    describe("Filtering with FilterManager", function() {
      describe("Filter Creation", function () {
        it("Object creation with collection insertion and removal", function() {
          logger.trace("Testing Filter creation");
          var collection = "ideas";
          var users = UserFactory.getTestUsers(2);
          var result = FilterManager.create(
              "Test Filter", users[0], collection, 'userID', users[1]._id);
          logger.debug("Filter create Result is " + result);
          chai.assert.ok(result, "Created new Filter");
          result = FilterManager.create(
              "Test Filter", users[0], collection, 'userID', users[1]._id, 'gt');
          logger.debug("Second Filter create Result is " + result);
          chai.assert.notOk(result, "Didn't create new Filter");
          // Cleanup created filters and users
          var count = Filters.find({
              name: "Test Filter", 
              user: users[0], 
              collection:collection
              }).count();
          logger.debug("Found " + count + " filters created for this test");
          chai.assert.equal(count, 1);
          FilterManager.remove(
              "Test Filter", users[0], collection, 'userID', users[1]._id);
          var count = Filters.find({
              name: "Test Filter", 
              user: users[0], 
              collection:collection
              }).count();
          logger.debug("Found " + count + " filters after remove");
          chai.assert.equal(count, 0);
          UserFactory.remove(users);
        });
        it("Filter reset", function() {
          logger.trace("Testing Filter Reset");
          var collection = "ideas"; //Arbitrary
          var numUsers = 5;
          var users = UserFactory.getTestUsers(numUsers);
          //Create filters for numUsers-1 users over collection for user by
          //user[0]
          for (var i=0; i<numUsers-1; i++) {
            FilterManager.create(
                "Test Filter", users[0], collection, 'userID', users[i]._id);
          }
          var count = Filters.find({
              name: "Test Filter", 
              user: users[0], 
              collection: collection
          }).count();
          logger.debug("Created " + count + " filters");
          chai.assert.equal(count, numUsers - 1);
          FilterManager.reset(
              "Test Filter", users[0], collection);
          //logger.debug("Filter reset result is " + result);
          //chai.assert.ok(result, "Successfully called reset filters");
          //Check filters are actually removed from Filters collection
          Filters.find
          var count = Filters.find({
              name: "Test Filter", 
              user: users[0], 
              collection: collection
          }).count();
          logger.debug("Found " + count + " matching filters after reset");
          chai.assert.equal(count, 0);
          // Cleanup generated users
          UserFactory.remove(users);
        });
      });
   
      describe("Filter Retrieval", function () {
        var desc = "Test Filter";
        var collection = "ideas"; //Arbitrary
        var numUsers = 5;
        var users;
        var ideas;
        var clusters;
        var time = {}
        var prompt;
        beforeEach(function() {
          logger.trace("Setting up for Filter Retrieval test");
          users = UserFactory.getTestUsers(numUsers);
          //Create filters for numUsers-1 users over collection for query
          //by user[0]
          for (var i=1; i<numUsers; i++) {
            FilterManager.create(
                desc, users[0], collection, 'userID', users[i]._id);
          }
          //Create Ideas for dummy cluster
          prompt = PromptManager.create("Test Prompt", users[0]);
          ideas = [];
          for (var i=1; i<numUsers; i++) {
            var newIdeas = IdeaFactory.createDummy(users[i], prompt, 2);
            ideas = ideas.concat(newIdeas);
          }
          //Create Test Clusters
          clusters = ClusterFactory.createDummy(ideas, 5, users[0], prompt);
          //Create filters for clusters over collection for query by
          //user[0]
          for (var i=0; i<clusters.length; i++) {
            FilterManager.create(
                desc, users[0], collection, 'clusterIDs', clusters[i]._id);
          }
          //Create filters for time
          var now = new Date();
          var past = new Date(now.getTime() - 5*60*1000);
          time = {begin: past, end: now};
          FilterManager.create(
              desc, users[0], collection, 'time', past, 'gt' );
          FilterManager.create(
              desc, users[0], collection, 'time', now, 'lt' );
        });
        afterEach(function() {
          logger.trace("Cleaning up after Filter Retrieval test");
          FilterManager.reset(
              desc, users[0], collection);
          Prompts.remove({_id: prompt._id});
          ClusterFactory.remove(clusters);
          IdeaFactory.remove(ideas);
          UserFactory.remove(users);
        });
        it("Simple Retrieving raw filter list", function() {
          logger.trace("Testing Raw Filter List retrieval");
          var query = Filters.find({
              name: desc, 
              user: users[0], 
              collection: collection
          });
          logger.debug("Found " + query.count() + " filters with query");
          //Check query has expected count
          chai.assert.equal(query.count(), numUsers - 1 + clusters.length + 2);
          var filters = FilterManager.getFilterList(
              desc, users[0], collection);
          logger.debug("Found " + filters.count() + 
              " filters with getFilterList");
          //Check query and raw list result are equal length
          chai.assert.notEqual(query.count(), 0);
          chai.assert.equal(filters.count(), query.count());
          //Check for filter matches
          var foundMatch = false;
          filters.forEach(function(filt) {
            logger.debug("Looking at filter on field: " + filt.field);
            chai.assert.ok(isInList(filt, query, '_id'));
          });
        });
        it("Retrieving mapped filter objects lists", function() {
          logger.trace("Testing Mapped Filter List retrieval");
          var sessVar = 'testFilts';
          var mappedFilters = FilterManager.createMappedFilterList(
              desc, users[0], collection, sessVar);
          //Check for equal users
          users.slice(1).forEach(function(user) {
            //logger.debug(mappedFilters['users']);
            chai.assert.ok(isInList(user, mappedFilters['users'], '_id'));  
          });
          //Check for equal clusters
          clusters.forEach(function(cluster) {
            //logger.debug(mappedFilters['clusters']);
            chai.assert.ok(isInList(cluster, mappedFilters['clusters'], '_id'));  
          });
          //Check for equal time
          chai.assert.deepEqual(mappedFilters['time']['begin'], time['begin']);
          chai.assert.deepEqual(mappedFilters['time']['end'], time['end']);
          //Check for no misc filters
          //chai.assert.isUndefined(mappedFilters['misc'], 
              //"Found misc filters where none should be found");
          //Need to check for misc filters if there are misc filters
        });
      });
      describe("Query with Filters", function () {
        describe("Filter Query Setup", function() {
          var desc = "Test Filter";
          var collection = "ideas"; //Arbitrary
          var numUsers = 5;
          var users;
          var ideas;
          var clusters;
          var time = {};
          var prompt;
          beforeEach(function() {
            logger.trace("Setting up for Filter Query Setup test");
            users = UserFactory.getTestUsers(numUsers);
            //Create filters for numUsers-1 users over collection for query
            //by user[0]
            for (var i=1; i<numUsers; i++) {
              FilterManager.create(
                  desc, users[0], collection, 'userID', users[i]._id);
            }
            //Create Ideas for dummy cluster
            prompt = PromptManager.create("Test Prompt", users[0]);
            ideas = [];
            for (var i=1; i<numUsers; i++) {
              var newIdeas = IdeaFactory.createDummy(users[i], prompt, 2);
              ideas = ideas.concat(newIdeas);
            }
            //Create Test Clusters
            clusters = ClusterFactory.createDummy(ideas, 5, users[0], prompt);
            //Create filters for clusters over collection for query by
            //user[0]
            for (var i=0; i<clusters.length; i++) {
              FilterManager.create(
                  desc, users[0], collection, 'clusterIDs', clusters[i]._id);
            }
            //Create filters for time
            var now = new Date();
            var past = new Date(now.getTime() - 5*60*1000);
            time = {begin: past, end: now};
            FilterManager.create(
                desc, users[0], collection, 'time', past, 'gt' );
            FilterManager.create(
                desc, users[0], collection, 'time', now, 'lt' );
          });
          afterEach(function() {
            logger.trace("Cleaning up after Filter Query Setup test");
            FilterManager.reset(
                desc, users[0], collection);
            Prompts.remove({_id: prompt._id});
            ClusterFactory.remove(clusters);
            IdeaFactory.remove(ideas);
            UserFactory.remove(users);
          });
     
          it("Sorting filters", function() {
            logger.trace("Testing sorting of list of filters by field");
            //Get list of filters
            var filters = FilterManager.getFilterList(
              desc, users[0], collection);
            logger.debug("Found " + filters.count() + " filters to sort");
            //Ensure non-zero filter count
            chai.assert.notEqual(filters.count(), 0);
            var fields = ['userID', 'clusterIDs', 'time'];
            var sorted = binByField(filters, 'field');
            logger.debug("Sorted Filters has fields: " + 
                JSON.stringify(sorted.fields));
            //Check that all expected fields were sorted
            chai.assert.sameMembers(sorted['fields'], fields);
            //Check that all users were found
            var vals = getValsFromField(sorted['userID'], 'val');
            logger.debug("User filters userIDs: " + JSON.stringify(vals));
            users.slice(1).forEach(function(user) {
              chai.assert.ok(isInList(user._id, vals), "User match not found");
            });
            //Check that all clusters were found
            var vals = getValsFromField(sorted['clusterIDs'], 'val');
            logger.debug("Cluster filters clusterIDs: " + JSON.stringify(vals));
            clusters.forEach(function(obj) {
              chai.assert.ok(isInList(obj._id, vals), "Cluster match not found");
            });
            //Check that time filters were found
            var vals = getValsFromField(sorted['time'], 'val');
            vals = vals.map(function(val) {
              return new Date(val);
            });
            logger.debug("Time filters: " + JSON.stringify(vals));
            logger.debug("Time begin: " + JSON.stringify(time['begin'])
                + JSON.stringify(vals[0]));
            logger.debug("Time end: " + time['end'] + " " 
                + vals[1]);
            logger.debug("Time begin match: " + dates.compare(time['begin'], vals[0]));
            logger.debug("Time begin match: " + dates.compare(time['end'], vals[1]));
            chai.assert.equal(dates.compare(time['begin'], vals[0]), 0, "time match not found");
            chai.assert.equal(dates.compare(time['end'], vals[1]), 0, "time match not found");
          });
          it("Sorting Query fields by filters", function() {
            logger.trace("Sorting each query field by operation");
            //Get list of filters
            var filters = FilterManager.getFilterList(
              desc, users[0], collection);
            logger.debug("Found " + filters.count() + " filters to sort");
            //Get parsed result 
            var sorted = FilterManager.parseFilterOps(filters);
            sorted['fields'].forEach(function(field) {
              var parsed = sorted[field];
              logger.debug("Parsed filters operations for field + " + 
                field + ": " + JSON.stringify(parsed['fields']));
              //Check that only expected fields are found
              if (field == "userID") {
                chai.assert.sameMembers(parsed['fields'], ['eq']);
                //Check that number of user filters is as expected
                chai.assert.equal(parsed['eq'].length, numUsers - 1, 
                  "Unmatched number of 'eq' user filters");
              } else if (field == "clusterIDs") {
                chai.assert.sameMembers(parsed['fields'], ['eq']);
                //Check that number of cluster filters is as expected
                chai.assert.equal(parsed['eq'].length, clusters.length, 
                  "Unmatched number of 'eq' cluster filters");
              } else if (field == "time") {
                chai.assert.sameMembers(parsed['fields'], ['gt', 'lt']);
                //Check that number of time filters is as expected
                chai.assert.equal(parsed['gt'].length, 1,
                  "Unmatched number of 'gt' time filters");
                chai.assert.equal(parsed['lt'].length, 1,
                  "Unmatched number of 'lt' time filters");
              }
              //Iterate over each operation
              parsed['fields'].forEach(function(pfield) {
                logger.debug("Field: " + field + " Operation: " + pfield + 
                  "filters: " + JSON.stringify(parsed[pfield]));
              });
            });
          });
          it("Forming Query SubString for each operation on 1 field", function() {
            logger.trace("Testing Query string formation for 1 field and 1 op");
            var qOp = 'eq';
            var qField = 'userID';
            //Testing only with eq op over userID
            var filters = Filters.find({name: desc, 
                user: users[0], 
                collection: collection,
                field: qField,
                op: qOp
            });
            var sorted = FilterManager.parseFilterOps(filters);
            var sortedFilts = sorted[qField][qOp];
            logger.debug("sorted filters over " + qField + " with op: " + qOp + 
              " filters: " + JSON.stringify(sortedFilts));
            var query = FilterManager.getOpQuery(qOp, sortedFilts);
            logger.debug("got query: " + JSON.stringify(query));
            var result = {'$in': getIDs(users.slice(1))};
            chai.assert.deepEqual(query, result, "Return subquery did not match");
          });
          it("Forming Query SubString for 1 field with multiple ops", function() {
            logger.trace("Testing Query string formation for 1 field and 2 ops");
            var qField = 'time';
            //Testing over time
            var filters = Filters.find({name: desc, 
                user: users[0], 
                collection: collection,
                field: qField
            });
            var sorted = FilterManager.parseFilterOps(filters);
            var parsedFilts = sorted[qField];
            logger.debug("Parsed filters over " + qField +
              " filters: " + JSON.stringify(parsedFilts));
            var query = FilterManager.getSingleFieldQuery(qField, parsedFilts);
            logger.debug("got query: " + JSON.stringify(query));
            var expected = {'$and': [{'time': {'$gt': time['begin']}}, 
              {'time': {'$lt': time['end']}}]};
            chai.assert.deepEqual(query, expected, 
              "Returned subquery did not match");
          });
          it("Forming Query String", function() {
            logger.trace("Testing full query string formation");
            var filters = FilterManager.getFilterList(
              desc, users[0], collection);
            var sorted = FilterManager.parseFilterOps(filters);
            var query = FilterManager.getQuery(sorted);
            var expected = {'$or': [
              {'userID': {'$in': getIDs(users.slice(1))}},
              {'clusterIDs': {'$in': getIDs(clusters)}},
              {'$and': [{'time': {'$gt': time['begin']}}, 
                {'time': {'$lt': time['end']}}]}
            ]};
            logger.debug("Expecting query params: " + 
              JSON.stringify(expected));
            logger.debug("Got query params: " + 
              JSON.stringify(query));
            chai.assert.deepEqual(query, expected, 
              "Returned query params did not match");
            //chai.assert.ok(false);
          });
        });
        describe("Performing Queries", function() {
          var numUsers = 5;
          var numClusters = 5;
          var sizeClusters = 3;
          var users;
          var ideas;
          var midIdeaIndex;
          var clusters;
          var time = {};
          var prompt;
          beforeEach(function() {
            logger.trace("Setting up for Filter Query test");
            time['begin'] = new Date().getTime();
            users = UserFactory.getTestUsers(numUsers);
            //Create Ideas for dummy cluster
            prompt = PromptManager.create("Test Prompt", users[0]);
            ideas = [];
            for (var i=1; i<numUsers; i++) {
              var newIdeas = IdeaFactory.createDummy(users[i], prompt, 5);
              ideas = ideas.concat(newIdeas);
            }
            //Setup time to filter between ideas creation
            time['middle'] = new Date().getTime();
            midIdeaIndex = ideas.length;
            for (var i=1; i<numUsers; i++) {
              var newIdeas = IdeaFactory.createDummy(users[i], prompt, 5);
              ideas = ideas.concat(newIdeas);
            }
            //Create Test Clusters
            clusters = [];
            for (var i=0; i<numClusters; i++) {
              var index = getRandomInt(0, ideas.length - sizeClusters - 1);
              var subIdeas = ideas.slice(index, index + sizeClusters);
              clusters.push(ClusterFactory.create(ideas, users[0], prompt));
            }
            time['end'] = new Date().getTime();
          });
          afterEach(function() {
            logger.trace("Cleaning up after Filter Query test");
            Prompts.remove({_id: prompt._id});
            ClusterFactory.remove(clusters);
            IdeaFactory.remove(ideas);
            UserFactory.remove(users);
          });
          it("Query ideas with no filters", function() {
            logger.trace("Testing query with no filters over ideas");
            var desc = "Test Filter";
            var collection = "ideas"; 
            var user = users[0];
            //Get total ideas
            var totalIdeas = Ideas.find();
            var queryIdeas = FilterManager.performQuery(
              desc, user, collection);
            logger.debug("Total idea count: " + totalIdeas.count());
            logger.debug("Total query idea count: " + queryIdeas.count());
            chai.assert.equal(queryIdeas.count(), totalIdeas.count(),
              "No Filter count did not match expected");
          });
          it("Filter users over ideas", function() {
            logger.trace("Testing query of user filters over ideas");
            var desc = "Test Filter";
            var collection = "ideas"; 
            var user = users[0];
            //Create filters for numUsers-1 users over collection for query
            //by user[0]
            for (var i=1; i<numUsers; i++) {
              FilterManager.create(
                  desc, user, collection, 'userID', users[i]._id);
            }
            for (var i=1; i<numUsers-1; i++) {
              //Get total ideas matching users
              var totalIdeas = Ideas.find({'userID': {'$in': getIDs(users.slice(i))}});
              var queryIdeas = FilterManager.performQuery(
                desc, user, collection);
              chai.assert.equal(queryIdeas.count(), totalIdeas.count(),
                "Filter Query didn't match expected length");
              //queryIdeas.forEach(function(idea) {
                //logger.debug(idea._id);
              //});
              //Check all ideas are present
              totalIdeas.forEach(function(idea) {
                logger.debug("Checking idea with ID: " + idea._id + 
                  " is in queryIdeas result");
                chai.assert.ok(isInList(idea, queryIdeas, '_id'));
              });
              //Remove i-th user filter and repeat
              FilterManager.remove(desc, user, collection, 'userID', users[i]._id);
            }
           
            //Cleanup Created filters
            FilterManager.reset(desc, user, collection);
          });
          it("Filter clusters over ideas", function() {
            logger.trace("Testing query of cluster filters over ideas");
            var desc = "Test Filter";
            var collection = "ideas"; 
            var user = users[0];
            //Create filters for clusters over collection for query by
            //user[0]
            for (var i=0; i<clusters.length; i++) {
              FilterManager.create(
                  desc, user, collection, 'clusterIDs', clusters[i]._id);
            }
            for (var i=0; i<clusters.length-1; i++) {
              //Get total ideas matching clusters
              var totalIdeas = Ideas.find({'clusterIDs': 
                {'$in': getIDs(clusters.slice(i))}});
              var queryIdeas = FilterManager.performQuery(
                desc, user, collection);
              chai.assert.equal(queryIdeas.count(), totalIdeas.count(),
                "Filter Query didn't match expected length");
              //queryIdeas.forEach(function(idea) {
                //logger.debug(idea._id);
              //});
              //Check all ideas are present
              totalIdeas.forEach(function(idea) {
                logger.debug("Checking idea with ID: " + idea._id + 
                  " is in queryIdeas result");
                chai.assert.ok(isInList(idea, queryIdeas, '_id'));
              });
              //Remove i-th cluster filter and repeat
              FilterManager.remove(
                  desc, user, collection, 'clusterIDs', clusters[i]._id);
            }
           
            //Cleanup Created filters
            FilterManager.reset(desc, user, collection);
          });
          it("Filter time over ideas", function() {
            logger.trace("Testing query of time filters over ideas");
            var desc = "Test Filter";
            var collection = "ideas"; 
            var user = users[0];
            //Create filters for time
            FilterManager.create(
                desc, user, collection, 'time', time['begin'], 'gt' );
            //Get all ideas
            FilterManager.create(
                desc, user, collection, 'time', time['end'], 'lt' );
            var totalIdeas = Ideas.find({'$and': 
              [{'time': {'$gt': time['begin']}}, 
                {'time': {'$lt': time['end']}}]});
            var queryIdeas = FilterManager.performQuery(
              desc, user, collection);
            chai.assert.equal(queryIdeas.count(), totalIdeas.count(),
              "Filter Query didn't match expected length");
            //Check all ideas are present
            totalIdeas.forEach(function(idea) {
              logger.debug("Checking idea with ID: " + idea._id + 
                " is in queryIdeas result");
              chai.assert.ok(isInList(idea, queryIdeas, '_id'));
            });
            FilterManager.remove(
                desc, user, collection, 'time', time['end'], 'lt' );
            FilterManager.create(
                desc, user, collection, 'time', time['middle'], 'lt' );
            var totalIdeas = Ideas.find({'$and': 
              [{'time': {'$gt': time['begin']}}, {'time': {'$lt': time['middle']}}]});
            var queryIdeas = FilterManager.performQuery(
              desc, user, collection);
            chai.assert.equal(queryIdeas.count(), totalIdeas.count(),
              "Filter Query didn't match expected length");
            //Check all ideas are present
            totalIdeas.forEach(function(idea) {
              logger.debug("Checking idea with ID: " + idea._id + 
                " is in queryIdeas result");
              chai.assert.ok(isInList(idea, queryIdeas, '_id'));
            });
            FilterManager.remove(
                desc, user, collection, 'time', time['begin'], 'gt' );
            var totalIdeas = Ideas.find({'time': {'$lt': time['middle']}});
            var queryIdeas = FilterManager.performQuery(
              desc, user, collection);
            chai.assert.equal(queryIdeas.count(), totalIdeas.count(),
              "Filter Query didn't match expected length");
            //Cleanup Created filters
            FilterManager.reset(desc, user, collection);
          });
          it("Filter all fields over ideas", function() {
            logger.trace("Testing query of all filters over ideas");
            var desc = "Test Filter";
            var collection = "ideas"; 
            var user = users[0];
            //Create filters for numUsers-3 users over collection for query
            //by user[0]
            for (var i=1; i<numUsers-2; i++) {
              FilterManager.create(
                  desc, user, collection, 'userID', users[i]._id);
            }
            //Create filters for clusters over collection for query by
            //user[0]
            for (var i=0; i<clusters.length-3; i++) {
              FilterManager.create(
                  desc, user, collection, 'clusterIDs', clusters[i]._id);
            }
            //Create filters for time
            FilterManager.create(
                desc, user, collection, 'time', time['begin'], 'gt' );
            FilterManager.create(
                desc, user, collection, 'time', time['middle'], 'lt' );
            var totalIdeas = Ideas.find({'$or': 
              [{'userID': {'$in': getIDs(users.slice(1,numUsers-2))}}, 
                {'clusterIDs': {'$in': getIDs(clusters.slice(0,clusters.length-3))}},
                {'$and': [{'time': {'$gt': time['begin']}}, 
                  {'time': {'$lt': time['middle']}}]}
              ]
            });
            var queryIdeas = FilterManager.performQuery(
              desc, user, collection);
            //Check expected counts match
            chai.assert.equal(queryIdeas.count(), totalIdeas.count(),
              "Filter Query didn't match expected length");
            //Check all ideas are present
            totalIdeas.forEach(function(idea) {
              logger.debug("Checking idea with ID: " + idea._id + 
                " is in queryIdeas result");
              chai.assert.ok(isInList(idea, queryIdeas, '_id'));
            });
            //Cleanup Created filters
            FilterManager.reset(desc, user, collection);
          });
        });
        describe("Performing Queries on Events", function() {
          var desc = "Test Filter";
          var collection = "events"; 
          var numUsers = 5;
          var users;
          var time = {};
          var eventTypes;
          var eventTypeName = "Test Event";
          var numTypes = 3;
          var events;
          beforeEach(function() {
            logger.trace("Setting up for Events Filter Query test");
            time['begin'] = new Date().getTime();
            users = UserFactory.getTestUsers(numUsers);
            //Create test eventTypes
            eventTypes = [];
            for (var i=0; i<numTypes; i++) {
              eventTypes.push(EventTypeManager.create(eventTypeName + i));
            }
            //Log Events for each user of each type
            events = [];
            for (var i=0; i<numUsers; i++) {
              Session.set("currentUser", users[i]);
              for (var j=0; j<eventTypes.length; j++) {
                events.push(EventLogger.log(eventTypes[j]));
              }
            }
            //Setup time to filter between ideas creation
            time['middle'] = new Date().getTime();
            //Log Events for each user of each type
            for (var i=0; i<numUsers; i++) {
              Session.set("currentUser", users[i]);
              for (var j=0; j<eventTypes.length; j++) {
                events.push(EventLogger.log(eventTypes[j]));
              }
            }
            time['end'] = new Date().getTime();
          });
          afterEach(function() {
            logger.trace("Cleaning up after Event Filter Query test");
            EventLogger.remove(events);
            EventTypeManager.remove(eventTypes);
            UserFactory.remove(users);
          });
          it("Query events with no filters", function() {
            logger.trace("Testing query with no filters over events");
            var user = users[0];
            ////Get total ideas
            var totalEvents = Events.find();
            var queryEvents = FilterManager.performQuery(
              desc, user, collection);
            logger.debug("Total event count: " + totalEvents.count());
            logger.debug("Total query event count: " + queryEvents.count());
            chai.assert.equal(queryEvents.count(), totalEvents.count(),
              "No Filter count did not match expected");
          });
          it("Query events with user filters", function() {
            logger.trace("Testing query with user filters over events");
            var user = users[0];
            //Create user Filters
            for (var i=0; i<numUsers; i++) {
              FilterManager.create(
                  desc, user, collection, 'userID', users[i]._id);
            }
            for (var i=0; i<numUsers-1; i++) {
              //Get total ideas matching users
              var totalEvents = Events.find({'userID': 
                {'$in': getIDs(users.slice(i))}});
              var queryEvents = FilterManager.performQuery(
                desc, user, collection);
              logger.debug("Total event count: " + totalEvents.count());
              logger.debug("Total query event count: " + queryEvents.count());
              chai.assert.equal(queryEvents.count(), totalEvents.count(),
                "Filter Query didn't match expected length");
              FilterManager.remove(
                desc, user, collection, 'userID', users[i]._id);
            }
            //Cleanup Created filters
            FilterManager.reset(desc, user, collection);
          });
          it("Query events with time filters", function() {
            logger.trace("Testing query with time filters over events");
            var user = users[0];
            //Create filters for time
            FilterManager.create(
                desc, user, collection, 'time', time['begin'], 'gt' );
            //Get all events
            FilterManager.create(
                desc, user, collection, 'time', time['end'], 'lt' );
            var totalEvents = Events.find({'$and': 
              [{'time': {'$gt': time['begin']}}, 
                {'time': {'$lt': time['end']}}]});
            var queryEvents = FilterManager.performQuery(
              desc, user, collection);
            chai.assert.equal(queryEvents.count(), totalEvents.count(),
              "Filter Query didn't match expected length");
            //Check all events are present
            totalEvents.forEach(function(event) {
              logger.debug("Checking event with ID: " + event._id + 
                " is in queryEvents result");
              chai.assert.ok(isInList(event, queryEvents, '_id'));
            });
            FilterManager.remove(
                desc, user, collection, 'time', time['end'], 'lt' );
            FilterManager.create(
                desc, user, collection, 'time', time['middle'], 'lt' );
            var totalEvents = Events.find({'$and': 
              [{'time': {'$gt': time['begin']}}, {'time': {'$lt': time['middle']}}]});
            var queryEvents = FilterManager.performQuery(
              desc, user, collection);
            chai.assert.equal(queryEvents.count(), totalEvents.count(),
              "Filter Query didn't match expected length");
            //Check all events are present
            totalEvents.forEach(function(event) {
              logger.debug("Checking event with ID: " + event._id + 
                " is in queryEvents result");
              chai.assert.ok(isInList(event, queryEvents, '_id'));
            });
            FilterManager.remove(
                desc, user, collection, 'time', time['begin'], 'gt' );
            var totalEvents = Events.find({'time': {'$lt': time['middle']}});
            var queryEvents = FilterManager.performQuery(
              desc, user, collection);
            chai.assert.equal(queryEvents.count(), totalEvents.count(),
              "Filter Query didn't match expected length");
            //var user = users[0];
            ////Create user Filters
            //for (var i=0; i<numUsers; i++) {
              //FilterManager.create(
                  //desc, user, collection, 'userID', users[i]._id);
            //}
            //for (var i=0; i<numUsers-1; i++) {
              ////Get total ideas matching users
              //var totalEvents = Events.find({'userID': 
                //{'$in': getIDs(users.slice(i))}});
              //var queryEvents = FilterManager.performQuery(
                //desc, user, collection);
              //chai.assert.equal(queryEvents.count(), totalEvents.count(),
                //"Filter Query didn't match expected length");
            //}
            //Cleanup Created filters
            FilterManager.reset(desc, user, collection);
          });
          it("Query events with eventType filters", function() {
            logger.trace("Testing query with eventType filters over events");
            var user = users[0];
            //Create eventType Filters
            for (var i=0; i<eventTypes.length; i++) {
              FilterManager.create(
                  desc, user, collection, 'type._id', eventTypes[i]._id);
            }
            for (var i=0; i<eventTypes.length-1; i++) {
              //Get total ideas matching users
              var totalEvents = Events.find({'type._id': 
                {'$in': getIDs(eventTypes.slice(i))}});
              var queryEvents = FilterManager.performQuery(
                desc, user, collection);
              logger.debug("Total event count: " + totalEvents.count());
              logger.debug("Total query event count: " + queryEvents.count());
              chai.assert.equal(queryEvents.count(), totalEvents.count(),
                "Filter Query didn't match expected length");
              FilterManager.remove(
                desc, user, collection, 'type._id', eventTypes[i]._id);
            }
            //Cleanup Created filters
            FilterManager.reset(desc, user, collection);
          });
          it("Filter all fields over events", function() {
            logger.trace("Testing query of all filters over events");
            var desc = "Test Filter";
            var collection = "events"; 
            var user = users[0];
            //Create filters for numUsers-3 users over collection for query
            //by user[0]
            for (var i=1; i<numUsers-2; i++) {
              FilterManager.create(
                  desc, user, collection, 'userID', users[i]._id);
            }
            //Create filters for clusters over collection for query by
            //user[0]
            for (var i=0; i<eventTypes.length-1; i++) {
              FilterManager.create(
                  desc, user, collection, 'type._id', eventTypes[i]._id);
            }
            //Create filters for time
            FilterManager.create(
                desc, user, collection, 'time', time['begin'], 'gt' );
            FilterManager.create(
                desc, user, collection, 'time', time['middle'], 'lt' );
            var totalEvents = Events.find({'$or': 
              [{'userID': {'$in': getIDs(users.slice(1,numUsers-2))}}, 
                {'type._id': {'$in': getIDs(eventTypes.slice(0,eventTypes.length-1))}},
                {'$and': [{'time': {'$gt': time['begin']}}, 
                  {'time': {'$lt': time['middle']}}]}
              ]
            });
            var queryEvents = FilterManager.performQuery(
              desc, user, collection);
            //Check expected counts match
            chai.assert.equal(queryEvents.count(), totalEvents.count(),
              "Filter Query didn't match expected length");
            //Check all events are present
            totalEvents.forEach(function(event) {
              logger.debug("Checking event with ID: " + event._id + 
                " is in queryEvents result");
              chai.assert.ok(isInList(event, queryEvents, '_id'));
            });
            //Cleanup Created filters
            FilterManager.reset(desc, user, collection);
          });
        });
      });
    });
  });
}
  
