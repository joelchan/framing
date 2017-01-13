// Configure logger for Tools
var logger = new Logger('Tools:String');
// Comment out to use global logging level
//Logger.setLevel('Tools:String', 'trace');
//Logger.setLevel('Tools:String', 'debug');
Logger.setLevel('Tools:String', 'info');
//Logger.setLevel('Tools:String', 'warn');

// Initialize Tools object if it doesn't exist
Tools = (function(tls) {
  tls['String'] = {
    parseString: function(target, delim) {
      /***********************************************************************
       * function to parse a string by the given delimiter and trim white space
       * before and after the parsed output
       **********************************************************************/
      var parsed = target.split(delim);
      var output = [];
      parsed.forEach(function(elm) {
        output.push(elm.trim());
      });
      return output;
    },
    removeCR: function(target) {
      logger.trace("Cleaning up carraige return from end of string");
      var index = target.lastIndexOf("\n");
      if (index <0) {
        return target;
      } else {
        return target.slice(0, index);
      }
    },

    trimFromString: function(target, substring) {
      logger.debug("triming " + substring + " from target: " + target);
      var split = target.split(substring);
      var result = "";
      split.forEach(function(str) {
        result += str;
        logger.debug("after trim got: " + result);
      });
      return result;
    },
   
  };
  return tls;
}({}));

trimFromString = function(target, substring) {
  logger.debug("triming " + substring + " from target: " + target);
  var split = target.split(substring);
  var result = "";
  split.forEach(function(str) {
    result += str;
    logger.debug("after trim got: " + result);
  });
  return result;
};

removeCR = function(target) {
  logger.trace("Cleaning up carraige return from end of string");
  var index = target.lastIndexOf("\n");
  if (index <0) {
    return target;
  } else {
    return target.slice(0, index);
  }
};

