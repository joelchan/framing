// Generic Filters for dynamic UI filtering
//    -- currently only supports comparison filters
Filters = new Meteor.Collection("filters");
Sorters = new Meteor.Collection("sorters");

// Configure logger for Filters
var logger = new Logger('Models:Filter');
// Comment out to use global logging level
Logger.setLevel('Models:Filter', 'trace');
//Logger.setLevel('Models:Filter', 'debug');
// Logger.setLevel('Models:Filter', 'info');
//Logger.setLevel('Models:Filter', 'warn');

Filter = function (name, user, collection, field, val, op) {
  /******************************************************************
   * Filter definition with parameters for filtering across a given
   * collection> 
   *
   * @params
   *    name - String describing the filter, useful as a lookup ref
   *    user - id of user associated with a given filter
   *    collection - string matching the collection name string
   *    field - the field of the document to match
   *    val - the value of the document
   *    op - the query comparison operator. If none, then just 
   *        matching is performed 
   *****************************************************************/
  this.name = name;
  this.user = user._id;
  this.collection = collection;
  this.type = 'filter';
  this.field = field;
  this.val = val;
  if (op) {
    this.op = op
  } else {
    this.op = "eq";
  }
};


Sorter = function (name, user, collection, field, val, position) {
  /******************************************************************
   * Sorter definition with parameters for filtering across a given
   * collection> 
   *
   * @params
   *    name - String describing the filter, useful as a lookup ref
   *    user - user ID associated with a given filter
   *    collection - string matching the collection name string
   *    field - the field of the document to match
   *    val - could be ascending or desc
   *****************************************************************/
  this.name = name;
  this.userID = user._id;
  this.collection = collection;
  this.type = 'sorter';
  this.field = field;
  this.position = position;

  /* default behavior is ascending */
  if (val) {
    this.val = val;
  } else {
    this.val = 1;
  }
};


UniqueSorter = function (name, user, collection, field) {
  /******************************************************************
   * Sorter definition with parameters for filtering across a given
   * collection> 
   *
   * @params
   *    name - String describing the filter, useful as a lookup ref
   *    user - user associated with a given filter
   *    collection - string matching the collection name string
   *    field - the field of the document to match
   *    val - could be ascending or desc
   *****************************************************************/
  this.name = name;
  this.user = user;
  this.collection = collection;
  this.field = field;  

};



