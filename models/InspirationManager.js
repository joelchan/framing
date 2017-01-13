// Configure logger for Filters
var logger = new Logger('Model:Inspirations');
// Comment out to use global logging level
 Logger.setLevel('Model:Inspirations', 'trace');
//Logger.setLevel('Model:Inspirations', 'debug');
//Logger.setLevel('Model:Inspirations', 'info');
//Logger.setLevel('Model:Inspirations', 'warn');

InspirationManager = (function() {
  return {
    create: function (num) {
      // Set initial value of num to 5
      num = typeof num !== 'undefined' ? num : 5;
      var allClusters = Clusters.find().fetch();
      var clusters = allClusters.slice(0, num);
      var clusterIDs = getIDs(clusters);
      var insp = new Inspiration();
      insp.type = INSPIRATION_TYPES.hh;
      insp.clusterIDs = clusterIDs;
      insp['_id'] = Inspirations.insert(insp);
      return insp;
    },
    get: function(name) {
      return Inspirations.FindOne({name: name});
    },
    remove: function(insp) {
      if (hasForEach(insp)) {
        ids = getIDs(insp);
        //for (var i=0; i<insp.length; i++) {
          //ids.push(insp._id);
        //} 
        if (Meteor.isServer) {
          Inspirations.remove({_id: {$in: ids}});
        } else {
          ids.forEach(function(id) {
            Inspirations.remove({_id: id});
          });
        }
      } else {
        if (insp) 
          Inspirations.remove({_id: insp._id});
      }
    }

  };

}());

