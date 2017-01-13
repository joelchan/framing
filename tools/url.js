// Configure logger for Tools
var logger = new Logger('Tools:url');
// Comment out to use global logging level
// Logger.setLevel('Tools:url', 'trace');
// Logger.setLevel('Tools:url', 'debug');
Logger.setLevel('Tools:url', 'info');
// Logger.setLevel('Tools:url', 'warn');

if (Meteor.isServer) {
  Meteor.methods({
    getTinyUrl: function(longUrl, col, id, field) {
      /*****************************************************************
      * takes a long url and retrieves a shortened url from tinyurl
      * and inserts that url into the specific object in the given
      * collection
      *
      * @params:
      *    longurl - the long url to shorten
      *    col - the name of the collection containing the object to modify
      *    id - the _id of the object to modify
      *    field(optional) - the name of the field to insert the shortened url,
      *        this will be "shortUrl" by default
      ****************************************************************/
      var result = HTTP.get("http://tinyurl.com/api-create.php", 
          {params: {url: longUrl}},
          function (error, result) {
              if (!error) {
                logger.info("Got shortended url: " + result.content);
                var collection = MyCollections[col];
                if (!field) {
                  field = "shortUrl";
                }
                var update = {};
                update[field] = result.content;
                collection.update({_id: id}, {$set: update});
                logger.debug("Set url for object with id: " + id + 
                    " from collection: " + col);
              } else {
                logger.warn("Failed to retrieve shortened url for url " +
                    longUrl + " for object in collection: " + col +
                    " with id: " + id
                );
                logger.warn(error)
              }
          }
      );
    },
  });

}
  
testTinyUrl = function(url) {
  /* Test function to call from client */
  var i = Ideas.find().fetch()[2];
  Meteor.call("getTinyUrl", url, 'ideas', i._id, 'shortUrl');
};
