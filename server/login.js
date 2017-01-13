
Meteor.users.allow({remove:function() { return true }});

Meteor.methods({
  signupTrial: function(user) {

	  var userId = Accounts.createUser(user);
  
	  /* Trial user get auto deleted after timeout */
	  if(userId) {
		  return userId;
	  }
  },

  signup: function(user) {
  
    var userId = Accounts.createUser(user);
  
    /* Trial user get auto deleted after timeout */
    if(userId) {
      return userId;
    }
  }
});
  
Accounts.onCreateUser(function(options, user) {
  // Use provided profile in options, or create an empty profile object
  user.profile = options.profile || {};
  
  user.profile.createdOn =   moment().toISOString();
  user.profile.modifiedOn =   moment().toISOString();

  // Add additional fields

  return user;
});

