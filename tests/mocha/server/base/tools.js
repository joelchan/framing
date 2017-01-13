// Configure logger for server tests
var logger = new Logger('Test:Server:Tools');
// Comment out to use global logging level
//Logger.setLevel('Test:Server:Tools', 'trace');
//Logger.setLevel('Test:Server:Tools', 'debug');
Logger.setLevel('Test:Server:Tools', 'info');
//Logger.setLevel('Test:Server:Tools', 'warn');

if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function() {
    describe("Global Generic Functions", function() {
      describe("Array/Cursor Operations", function () {
        it("getIDs", function() {
          logger.trace("Testing getIDs");
          var IDs = [2,4,6,8,10];
          logger.debug("Expected IDs: " + JSON.stringify(IDs));
          var data = [];
          IDs.forEach(function(id) {
            var obj = {_id: id};
            data.push(obj);
          });
          //Ensure the mock data was instantiated right
          chai.assert.equal(data.length, IDs.length);
          var result = getIDs(data);
          logger.debug("Returned IDs: " + JSON.stringify(result));
          chai.assert.sameMembers(result, IDs);
   
        });
        it("BinByField", function() {
          logger.trace("Testing binByField method");
          //Setup test object array
          var data = [{field1: '1', field2: 'a' },
              {field1: '3', field2: 'a' },
              {field1: '5', field2: 'b' },
              {field1: '7', field2: 'b' }
          ];
          //Setup expected result
          var expected = {fields: ['a', 'b'],
            'a': [{field1: '1', field2: 'a' },
              {field1: '3', field2: 'a' }],
            'b': [{field1: '5', field2: 'b' },
              {field1: '7', field2: 'b' }]
          };
          var result = binByField(data, 'field2');
          logger.debug("Result of binning: " + 
              JSON.stringify(result));
          chai.assert.deepEqual(expected, result);
        });
      });
    });
  });
}
