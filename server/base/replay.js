/********************************************************************
* Code to stream a data set into the ideas database according to
* timestamp
********************************************************************/
/*
Meteor.startup(function() {
  //Ensure empty replay collection on reboot
  ReplayIdeas.remove();
  var allIdeas = Ideas.find();
  if (Ideas.find().count() > 1) { 
    console.log("total idea count: " + allIdeas.count());
    var sortedIdeas = allIdeas.fetch().sort(compareEvents); 
    var sortedEvents = []
    var starttime = 1402604254000;
    for (var i=0; i<10; i++) {
        sortedEvents.push(new Event(sortedIdeas[i], starttime, "Idea Submission")); 
        console.log(sortedEvents[i].dtime);
    }
    replayAsUser(new User("Steven"), sortedEvents);
  }
});
*/

function compareEvents(a, b) {
    /****************************************************************
    * Compares 2 objects with a time field
    ****************************************************************/
    if (a.time > b.time) {
      return 1;
    } else if (a.time < b.time) {
      return -1;
    } else {
      return 0;
    }
};

function diffTime(a, b) {
  /******************************************************************
  * Determine the time difference in milliseconds between 2 events
  * where a is assumed to be the first event
  ******************************************************************/
  return b.obj.time - a.obj.time;
};

function replayIdea(ideas, index) {
    console.log(index);
  delete ideas[index].obj['_id'];
  ReplayIdeas.insert(ideas[index].obj);
  console.log("Idea inserted: " + idea.content);
}

function replayAsUser(user, events) {
  console.log("replay ideas before replay: " + ReplayIdeas.find().count());
  var clock = new Date();
    var starttime = clock.getTime();
  for (var i=0; i<events.length; i++) {
      var newIdea = events[i].obj;
      //replayIdea(newIdea);
      var dt = new Date().getTime() - starttime;
      //console.log("dt of event: " + events[i].dtime);
      //console.log("dt of current from starttime: " + dt);
      console.log("next Timeout: " + (events[i].dtime - dt));
      //Meteor.setTimeout(function() {
          ////replayIdea(events, i);
          //console.log("i=" + i);
      //}, events[i].dtime - dt) ;
      Meteor.setTimeout(function() {
          //replayIdea(events, i);
          console.log("i=" + newIdea.content);
      }, 1000 + 1000*i, newIdea);
      //Meteor.setTimeout(replayIdea, 1000 + 1000*i, newIdea) ;
  }
  console.log("replay ideas after replay: " + ReplayIdeas.find().count());

}


//Event = function (obj, starttime, desc) {
    ////Start of time frame of all events
    //this.starttime = starttime;
    ////The object encapsulating the event
    //this.obj = obj;
    ////Time event takes place from start time
    //this.dtime = obj.time - this.starttime;
    ////Plain text description of the event type
    //this.description = desc;
//}
