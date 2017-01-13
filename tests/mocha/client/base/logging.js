// Configure logger for server tests
var logger = new Logger('Test:Client:Logging');
// Comment out to use global logging level
//Logger.setLevel('Test:Client:Logging', 'trace');
//Logger.setLevel('Test:Client:Logging', 'debug');
Logger.setLevel('Test:Client:Logging', 'info');
//Logger.setLevel('Test:Client:Logging', 'warn');

/********************************************************************
 * Client behavior tests
 *******************************************************************/
if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function() {
    describe("EventTypeManager", function() {
      var desc = "Test Event";
      var fields = ['field1', 'field2', 'field3', 'field4'];
      it("Create eventType with db insertion", function() {
        logger.trace("Testing EventType creation with db insertion");
        var event = EventTypeManager.create(desc);
        //Check if desc field id defined as expected
        chai.assert.equal(event['desc'], desc);
        chai.assert.isUndefined(event['fields']);
        var query = EventTypes.findOne({_id: event._id});
        //Check if event is found in db
        chai.assert.isDefined(query);
        //Cleanup EventType manually
        EventTypes.remove({_id: event._id});
        event = EventTypeManager.create(desc, fields);
        //Check if desc field id defined as expected
        chai.assert.equal(event['desc'], desc);
        chai.assert.isDefined(event['fields']);
        chai.assert.sameMembers(event['fields'], fields);
        var query = EventTypes.findOne({_id: event._id});
        //Check if event is found in db
        chai.assert.isDefined(query);
        //Cleanup EventType manually
        EventTypes.remove({_id: event._id});
      });
      it("Get existing eventType", function() {
        chai.assert.ok(true);
      });
      it("Get non-existing eventType", function() {
        chai.assert.ok(true);
      });
      it("Remove eventTypes with db removal", function() {
        logger.trace("Testing EventType removal db insertion");
        var events = [];
        for (var i=0; i<5; i++) {
          events.push(EventTypeManager.create(desc));
        }
        var query = EventTypes.find({_id: {$in: getIDs(events)}});
        //Check if all events are found in db
        chai.assert.equal(query.count(), 5);
        EventTypeManager.remove(events);
        var query = EventTypes.find({_id: {$in: getIDs(events)}});
        //Check if all events are found in db
        chai.assert.equal(query.count(), 0);
      });
    });
   
    describe("Regular Event Logger", function() {
      var user;
      var type;
      var desc = "Test Event";
      beforeEach(function() {
        //Simulate a session where a user is logged in
        user = UserFactory.getTestUser();
        Session.set("currentUser", user);
      });
      afterEach(function() {
        //Cleanup test user
        UserFactory.remove(user);
      });
      it("Create simple event with no data", function() {
        logger.trace("Testing simple event logging with no data");
        //Setup Test Event type
        type = new EventType(desc);
        type._id = EventTypes.insert(type);
        logger.debug("Setup test type: " + JSON.stringify(type));
        var event = EventLogger.log(type);
        logger.debug("created event: " + JSON.stringify(event));
        chai.assert.equal(event.description, type.desc);
        //Check for db insertion
        var query = Events.find({_id: event._id});
        chai.assert.equal(query.count(), 1);
        chai.assert.deepEqual(query.fetch()[0], event);
        //Cleanup test type
        EventTypes.remove({_id: type._id});
        //Cleanup event
        Events.remove({_id: event._id});
      });
      it("Simple create event with data specified by type", function() {
        logger.trace("Testing event logging with data given");
        //Setup Test Event type
        var fields = ['field1', 'field2', 'field3'];
        type = new EventType(desc, fields);
        type._id = EventTypes.insert(type);
        logger.debug("Setup test type: " + JSON.stringify(type));
        var data = {'field1': 'data1', 
            'field2': 'data2',
            'field3': 'data3'
        };
        var event = EventLogger.log(type, data);
        logger.debug("created event: " + JSON.stringify(event));
        //Check all fields are equa
        chai.assert.equal(event.description, type.desc);
        fields.forEach(function(field) {
          chai.assert.isDefined(event[field], 
              field + "has been defined");
          chai.assert.equal(event[field], data[field]);
        });
        //Check for db insertion
        var query = Events.find({_id: event._id});
        chai.assert.equal(query.count(), 1);
        chai.assert.deepEqual(query.fetch()[0], event);
        //Cleanup test type
        EventTypes.remove({_id: type._id});
        //Cleanup event
        Events.remove({_id: event._id});
      });
      it("create event with extra data", function() {
        logger.trace("Testing event logging with extra data");
        //Setup Test Event type
        var fields = ['field1', 'field2', 'field3'];
        type = new EventType(desc, fields);
        type._id = EventTypes.insert(type);
        logger.debug("Setup test type: " + JSON.stringify(type));
        var data = {'field1': 'data1', 
            'field2': 'data2',
            'field3': 'data3',
            'field4': 'data4'
        };
        var event = EventLogger.log(type, data);
        logger.debug("created event: " + JSON.stringify(event));
        //Check all fields are equal
        chai.assert.equal(event.description, type.desc);
        fields.forEach(function(field) {
          chai.assert.isDefined(event[field], 
              field + "has been defined");
          chai.assert.equal(event[field], data[field]);
        });
        //Check field4 is undefined
        chai.assert.isUndefined(event['field4']);
        //Check for db insertion
        var query = Events.find({_id: event._id});
        chai.assert.equal(query.count(), 1);
        chai.assert.deepEqual(query.fetch()[0], event);
        //Cleanup test type
        EventTypes.remove({_id: type._id});
        //Cleanup event
        Events.remove({_id: event._id});
      });
      it("create event with insufficient data", function() {
        logger.trace("Testing event logging with insufficient data");
        //Setup Test Event type
        var fields = ['field1', 'field2', 'field3'];
        type = EventTypeManager.create(desc, fields);
        logger.debug("Setup test type: " + JSON.stringify(type));
        var data = {'field1': 'data1', 
            'field2': 'data2',
        };
        var event = EventLogger.log(type, data);
        logger.debug("created event: " + JSON.stringify(event));
        //Check all fields are equal
        chai.assert.equal(event.description, type.desc);
        fields.forEach(function(field) {
          if (field !== "field3") {
            chai.assert.isDefined(event[field], 
                field + "has been defined");
            chai.assert.equal(event[field], data[field]);
          }
        });
        //Check field3 is undefined
        chai.assert.isUndefined(event['field3']);
        //Check for db insertion
        var query = Events.find({_id: event._id});
        chai.assert.equal(query.count(), 1);
        chai.assert.deepEqual(query.fetch()[0], event);
        //Cleanup test type
        EventTypeManager.remove(type);
        //Cleanup event
        Events.remove({_id: event._id});
      });
    });
   
    describe("Experiment Event Logger", function() {
        it("Test1", function() {
          chai.assert.equal(10, 10);
        });
    });
  });
}

