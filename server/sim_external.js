var logger = new Logger('Server:SimExternal');
// Comment out to use global logging level
Logger.setLevel('Server:SimExternal', 'trace');
//Logger.setLevel('Server:SimExternal', 'debug');
// Logger.setLevel('Server:SimExternal', 'info');
//Logger.setLevel('Server:SimExternal', 'warn');

SimExternal = {};

SimExternal.pathSampler = function(kTest, ideas, alignType) {
    var url = "http://sim-api.herokuapp.com/LSArank"
    // var url = "http://127.0.0.1:5000/LSArank"
    logger.trace("kTest:" + JSON.stringify(kTest));
    logger.trace("alignType:" + alignType);
    logger.trace("ideas:" + JSON.stringify(ideas));
    var response = Meteor.http.post(
        url,
        {data: {ideas: ideas,
                alignType: alignType,
                kTest: kTest
                }
        }
    );
    return response.data;
}

Meteor.methods({
    pathSampler: function(kTest, ideas, alignType) {
        return SimExternal.pathSampler(kTest, ideas, alignType);
    }
});