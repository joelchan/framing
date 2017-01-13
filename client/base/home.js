

Accounts.ui.config({
     passwordSignupFields: 'USERNAME_ONLY'
});


Template.LandingPage.events({
  'click #tryIt' : function(e) {
    e.preventDefault();

    var rand=Math.floor(Math.random()*1000);

    var user = 'trial' + rand;

    var password  = rand + user;
    var user = { username : user, password : password, profile :{}};


    Meteor.call('signupTrial', user, function(error, id) {
        if (error) {
                // display the error to the user
                console.log(error);
            } else {

            	Meteor.loginWithPassword(user.username, user.password);

            	var userId = Meteor.userId();
				Meteor.setTimeout(function() {
							/* Logging out user before deleting it */
							console.log("Logging out user" + userId);
							
							Meteor.logout(function(e){
								if(e)
								{
									console.log("Error log" + userId);	
								}
								else
								{
									console.log("Removing user" + userId);
									Meteor.users.remove(userId);
								}
							});
					
				}, 10000000);
		    }
	  });
	},


'click #MturkLogin' : function(e) {

	//get user from html elements
    e.preventDefault();

    var user = $(e.target).find('[name=name]').val();

    password = user.reverse('');

    var user = { username : user, password : password, profile :{}};

    Meteor.call('signup', user, function(error, id) {
        if (error) {
                // display the error to the user
                console.log(error);
            } else {
                Meteor.loginWithPassword(user.username, user.password);
            }
        });

	},

'click #adminLogin' : function(e) {


  	var username = $(e.target).find('[name=name]').val();
    var email = $(e.target).find('[name=email]').val();
    var nick = $(e.target).find('[name=nick]').val();
    var password = $(e.target).find('[name=password]').val();


  	//get user from html elements
    e.preventDefault();

    var rand=Math.floor(Math.random()*1000);

    var user = 'trial' + rand;
    var user = { username : user, password : password , profile :{ nickname : nick}};

    Meteor.call('signup', user, function(error, id) {
        if (error) {
                // display the error to the user
                console.log(error);
            } else {
                Meteor.loginWithPassword(user.username, user.password);
            }
        });

	}
});


