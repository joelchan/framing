
// Configure logger for Tools
var logger = new Logger('Tools:Arrays');
// Comment out to use global logging level
//Logger.setLevel('Tools:Arrays', 'trace');
//Logger.setLevel('Tools:Arrays', 'debug');
Logger.setLevel('Tools:Arrays', 'info');
//Logger.setLevel('Tools:Arrays', 'warn');

shuffle = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

getRandomElement = function (array) {
    /****************************************************************
    * get a random element in a given array
    ****************************************************************/
	  var myRand = Math.floor(Math.random()*1024);
    //Divide range of 1024 evenly between number of condidions
    var interval = Math.floor(1024/array.length); 
    for (var i=0; i<array.length; i++) {
      if ((myRand >= interval * i) && (myRand < interval * (i + 1))) {
        return array[i];
      } 
    }
    //If exiting without a return, then myRand was in the small rounding
    // error margin at the top of the range
    return array[array.length - 1];
};

getValsFromField = function(objs, field) {
  /******************************************************************
   * Get the val from a specified field from a list of mongo objects
   * @params:
   *    objs - either an array of mongodb documents, or a cursor 
   *        to a list of mongodb documents
   *****************************************************************/
  vals = []
  objs.forEach(function(obj) {
    logger.debug(obj[field]);
    vals.push(obj[field]);
  });
  return vals;
};



getIndex = function(list, member) {
  for (var i=0; i<list.length; i++) {
    if (list[i] == member) {
      return i
    }
  }
}


removeMember = function(list, member) {
  var index = getIndex(list, member);

  list.splice(index, 1);
  return list;
};


isInList = function(member, list, field, compare) {
  /******************************************************************
   * Check if a given object is in the list
   * @params
   *    member - the object to compare
   *    list - the list that shoudl contain the object
   *    field - (optional) a subfield of the member and list objects
   *        on which to compare
   *    compare - (optional) comparison function to use
   *****************************************************************/
  logger.debug("Searching for " + 
      JSON.stringify(member) + " in list with contents: " + 
      JSON.stringify(list));
  var result = false;
  list.forEach(function(obj) {
    logger.trace("Checking for match with: " + JSON.stringify(obj));
    if (field) {
      if (typeof(obj[field]) === 'string' && 
          typeof(member[field]) === 'string') {
        logger.trace("comparing 2 strings");
        if (obj[field].localeCompare(member[field]) === 0) {
          result = true; 
        }
      } else {
        if (obj[field] == member[field]) {
          result = true;
        }
      }

    } else {
      if (obj == member) {
        result = true;
      }
    }
  });
  return result;
};