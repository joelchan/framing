// Player data structs to store state

// Configure logger for Filters
var logger = new Logger('Models:Player');
// Comment out to use global logging level
Logger.setLevel('Models:Player', 'trace');
//Logger.setLevel('Models:Player', 'debug');
// Logger.setLevel('Models:Player', 'info');
//Logger.setLevel('Models:Player', 'warn');

Player = function (id, name, user, col, start, diff, last) {
  /******************************************************************
   * Constructor for struct to store replay state
   *
   * @params
   *    id - the id returned by Meteor.setInterval to be used to
   *        clear the timer
   *    name - the name of the filter managing the player
   *    user - the user associated with the filter/player
   *    col - the collection being filtered in the player
   *    start - the start time stamp of the player
   *    diff - the time constant between now and upper bound
   ***************************************************************/
   this.id = id;
   this.name = name;
   this.user = user;
   this.col = col;
   this.start = start;
   this.diff = diff;
   if (last == null) {
     this.lastTime = start;
   } else {
    this.lastTime = last;
   }

};

