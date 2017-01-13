// Configure logger for Tools
var logger = new Logger('Tools:Sort');
// Comment out to use global logging level
//Logger.setLevel('Tools:Sort', 'trace');
//Logger.setLevel('Tools:Sort', 'debug');
Logger.setLevel('Tools:Sort', 'info');
//Logger.setLevel('Tools:Sort', 'warn');


binByField = function(objs, field, op) {
  /******************************************************************
   * Sorts the objects into a list of lists using a given comparison
   * operator(equals if unspecified)
   * @Params
   *    objs - an array or cursor of objects to sort
   *    field - the field of each object to sort by
   *    op - a function to compare the field value to existing objects
   *        already indexed (currently ignored
   * @Return
   *    an object with a fields paramter which contains an array of 
   *    field names that the object has storing sorted objects
   *****************************************************************/
  logger.trace("Binning by field: " + field);
  var results = {fields: []};
  objs.forEach(function(obj) {
    logger.trace("Object is: " + JSON.stringify(obj));
    logger.trace("Object has value: " + 
        JSON.stringify(obj[field]));
    logger.trace("results fields is: " + 
        JSON.stringify(results.fields));
    if (isInList(obj[field], results.fields)) {
      logger.trace("Pushing result into list");
      results[obj[field]].push(obj);
    } else {
      logger.trace("Pushing result into list");
      results['fields'].push(obj[field]);
      results[obj[field]] = [obj];
    }
  });
  return results;
};

hasForEach = function(obj) {
  var result = (isInList('forEach', _.functions(obj)) ||
    (obj instanceof Array));
  return result;
};
