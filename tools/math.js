// Configure logger for Tools
var logger = new Logger('Tools:Math');
// Comment out to use global logging level
//Logger.setLevel('Tools:Math', 'trace');
//Logger.setLevel('Tools:Math', 'debug');
Logger.setLevel('Tools:Math', 'info');
//Logger.setLevel('Tools:Math', 'warn');


/**
 * Returns a random number between min and max
 */
function getRandomArbitary (min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min and max
 */
getRandomInt = function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Generates random alphanumeric string id
makeID = function(size) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < size; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};
