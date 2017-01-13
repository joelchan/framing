// Configure logger for Tools
var logger = new Logger('Models:Inspiration');
// Comment out to use global logging level
Logger.setLevel('Models:Inspiration', 'trace');
//Logger.setLevel('Models:Inspiration', 'debug');
//Logger.setLevel('Models:Inspiration', 'info');
//Logger.setLevel('Models:Inspiration', 'warn');
//

Inspirations = new Meteor.Collection("inspirations");

INSPIRATION_TYPES = {
  hh: 'human-human',
  mh: 'machine-human',
  mm: "machine-machine"
};

Inspiration = function(name) {
  this.name = name;
  this.clusterIDs = [];
  this.type = null;
};

