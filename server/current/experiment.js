// Configure logger for Filters
var logger = new Logger('Server:Base:Experiment');
// Comment out to use global logging level
Logger.setLevel('Server:Base:Experiment', 'trace');
//Logger.setLevel('Server:Base:Experiment', 'debug');
// Logger.setLevel('Server:Base:Experiment', 'info');
//Logger.setLevel('Server:Base:Experiment', 'warn');

Meteor.methods({
    addParticipant2: function(expID, userID, frameID) {
        logger.trace("Calling addParticipant on server");
        var exp = Experiments.findOne({_id: expID});
        logger.trace("Found experiment: " + JSON.stringify(exp));
        var user = MyUsers.findOne({_id: userID});
        logger.trace("Found user: " + JSON.stringify(user));
        return ExperimentManager.addExperimentParticipant(exp._id, user, frameID);
    },

    canParticipate2: function(expID, userName) {
        logger.trace("Calling canParticipate2 on server");
        //var exp = Experiments.findOne({_id: expID});
        //logger.trace("Found experiment: " + JSON.stringify(exp));
        return ExperimentManager.canParticipate(expID, userName);
    },
});
