// Configure logger for Tools
var logger = new Logger('Tools:MeteorHelpers');
// Comment out to use global logging level
//Logger.setLevel('Tools:MeteorHelpers', 'trace');
//Logger.setLevel('Tools:MeteorHelpers', 'debug');
Logger.setLevel('Tools:MeteorHelpers', 'info');
//Logger.setLevel('Tools:MeteorHelpers', 'warn');

//from http://stackoverflow.com/questions/10984030/get-meteor-collection-by-name
//Returns meteor collection based on string name. Only works in client(?)
getCollection = function (name) {
  //console.log(Meteor.connection._mongo_livedata_collections["ideas"]);
  if (Meteor.isServer) {
    return MyCollections[name];
  } else {
    return Meteor.connection._mongo_livedata_collections[name];
  }
  // for (var globalObject in global) {
  //     if (global[globalObject] instanceof Meteor.Collection) {
  //         if (globalObject === string) {
  //             return (global[globalObject]);
  //             break;
  //         };        
  //     }
  // }
  // return undefined; // if none of the collections match
};


getIDs = function(objs) {
  /******************************************************************
   * Get the _id's of a list of mongo objects
   * @params:
   *    objs - either an array of mongodb documents, or a cursor 
   *        to a list of mongodb documents
   *****************************************************************/
  ids = []
  objs.forEach(function(obj) {
    ids.push(obj._id);
  });
  return ids;
};

getUserSelection = function(userRadioValue) {
  /******************************************************************
   * Get the user _id's to send facilitator action to
   * @params:
   *    userRadioValue - value from user selection radio button
   *****************************************************************/
   var recipients = []
   if(userRadioValue === "allUsers") {
    selectedRecipients = MyUsers.find({type: "Ideator"}).fetch();
    selectedRecipients.forEach(function(r) {
      recipients.push(r._id);
    });
    return recipients;
   } else {
    return [userRadioValue];
   }
}

