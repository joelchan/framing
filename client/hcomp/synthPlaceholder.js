var logger = new Logger('Client:SynthPlaceholder');
// Comment out to use global logging level
Logger.setLevel('Client:SynthPlaceholder', 'trace');
// Logger.setLevel('Client:SynthPlaceholder', 'debug');
// Logger.setLevel('Client:SynthPlaceholder', 'info');
// Logger.setLevel('Client:SynthPlaceholder', 'warn');

Template.SynthesisPlaceholder.rendered = function(){
    var subset = SynthSubsets.findOne({_id: Session.get("currentParticipant").misc.subsetID});
    FilterManager.reset("synthesisIdeasFilter", Session.get("currentUser"), "ideas");
    subset.ideaIDs.forEach(function(ideaID){
        FilterManager.create("synthesisIdeasFilter", Session.get("currentUser"),
        "ideas", "_id", ideaID);
    });
    
}

Template.SynthesisPlaceholder.helpers({
    condition: function() {
        var part = Session.get("currentParticipant");
        var cond = Conditions.findOne({_id: part.conditionID});
        return cond.description;
        // return "TestCondition";
    },
    experiment: function() {
        var part = Session.get("currentParticipant");
        var exp = Experiments.findOne({_id: part.experimentID});
        return exp.description;
        // return "TestExperiment";
    },
    subset: function() {
        var part = Session.get("currentParticipant");
        var subset = SynthSubsets.findOne({_id: part.misc.subsetID})
        return subset.description;
        // return "TestSubset";
    },
    ideas: function() {
        return FilterManager.performQuery("synthesisIdeasFilter", Session.get("currentUser"), "ideas")
        // return "Nothing";
    }

});