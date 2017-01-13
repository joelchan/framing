// Configure logger for Replays
var logger = new Logger('Managers:Replay');
// Comment out to use global logging level
Logger.setLevel('Managers:Replay', 'trace');
// Logger.setLevel('Managers:Replay', 'debug');
// Logger.setLevel('Managers:Replay', 'info');
// Logger.setLevel('Managers:Replay', 'warn');

ReplayManager = (function () {
  return {
    init: function(name, user, col, start) {
      /**************************************************************
       * Initialize the filters for a player
       * @Params
       *    name - An identifier used but the filtering component
       *    user - the user that is using the query
       *    col - the colleciton that will be queried
       *    start - the start time stamp in milliseconds 
       * @Return
       *    None
       *************************************************************/
      FilterManager.create(name, user, col, 'time', 
          start - 1, 'gt'); 
      FilterManager.create(name, user, col, 'time', 
          start, 'lte'); 
      var player = new Player(null, name, user, col, start, null, null);
      Session.set("player", player);
    },
    play: function() {
      /**************************************************************
       * Test function that will act like a replay mechanism by
       * adjusting a time parameter
       * @Params
       *    name - An identifier used but the filtering component
       *    user - the user that is using the query
       *    col - the colleciton that will be queried
       *    start - the start time stamp in milliseconds 
       * @Return
       *    None
       *************************************************************/
      var player = Session.get('player');
      var curTime = new Date().getTime();
      var diff = curTime - player.start;
      var id = Meteor.setInterval(this.playNextSecond, 1000);
      player.diff = diff;
      player.id = id;
      Session.set('player', player);
    },
    playNextSecond: function() {
      /*************************************************************
       * Function for use with an interval to increment a filter 
       * forward one second
       ************************************************************/
      logger.debug("Playing next second");
      var player = Session.get('player');
      var nextTime = player.lastTime + 1000;
      FilterManager.remove(player.name, 
          player.user, 
          player.col, 
          'time', 
          player.lastTime);
      FilterManager.create(player.name, 
          player.user, 
          player.col, 
          'time', 
          nextTime,
          'lte');
      player.lastTime = nextTime;
      Session.set("player", player);

    },
  };
}());
