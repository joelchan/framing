Template.FinalizePage.rendered = function() {
  window.scrollTo(0,0);
};

Template.FinalizePage.helpers({
    code: function() {
        var part = Session.get("currentParticipant");
        // var verifyCode = Random.hexString(20).toLowerCase();
        // Participants.update({_id: part._id},
        //     {$set: {verifyCode: verifyCode}})
        return part.verifyCode;    
    }
});