// Configure logger for server tests
var logger = new Logger('Test:Server:Brainstorm');
// Comment out to use global logging level
Logger.setLevel('Test:Server:Brainstorm', 'trace');
//Logger.setLevel('Test:Server:Brainstorm', 'debug');
//Logger.setLevel('Test:Server:Brainstorm', 'info');
//Logger.setLevel('Test:Server:Brainstorm', 'warn');


if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function() {
    describe("Server Brainstorm Management", function() {
      it("Brainstorm setup", function () {
        chai.assert.equal(10, 10);
      });
    });
  });
}

