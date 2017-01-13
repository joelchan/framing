
var logger = new Logger('Client:Exp:MturkLogin');
// Comment out to use global logging level
Logger.setLevel('Client:Exp:MturkLogin', 'trace');
//Logger.setLevel('Client:Exp:MturkLogin', 'debug');
// Logger.setLevel('Client:Exp:MturkLogin', 'info');
//Logger.setLevel('Client:Exp:MturkLogin', 'warn');

Template.MturkLoginPage.rendered = function() {
  // Ensure scroll to top of window
  window.scrollTo(0,0);
}

/********************************************************************
 * Login Page event listeners 
 * *****************************************************************/
Template.MturkLoginPage.events({
    'click button.nextPage': function () {
        //console.log("clicked continue");
        //login user
        var prompt = Session.get("currentPrompt");
        if ($("input#name").val() == "") {
          alert("Please enter your Mturk ID");
        } else {
          var userName = $('input#name').val().trim();
          logger.info("Logging in user with name: " + userName);
          var user = LoginManager.loginUser(userName);
          EventLogger.logUserLogin();
          UserFactory.setMturkCode(user);
          if ($("input#nickname").val() !== "") {
            logger.info("Adding alias to user");
            var alias = $('input#nickname').val().trim();
            LoginManager.setAlias(alias, user);
          }
          if (!Session.get("currentExp")) {
            var group;
            Router.setNextPageParam('userID', user._id);
            Router.goToNextPage();
            if (prompt.groupIDs.length == 0) {
              group = GroupManager.create(prompt.template);
              PromptManager.addGroups(prompt, [group]);
            } else {
              group = Groups.findOne({_id: prompt.groupIDs[0]});
            }
            var role;
            if (!GroupManager.hasUser(group, user)) {
              role = RoleManager.defaults['HcompIdeator'];
              GroupManager.addUser(group, user, role.title);
            } else {
              role = GroupManager.getRole(group, user);
            }
            Session.set("currentRole", role);
            Session.set("currentGroup", group);
            Router.go(Session.get("nextPage"), 
                  {promptID: Session.get("currentPrompt")._id, 
                    userID: Session.get("currentUser")._id
                  });  
          } else {
            var exp = Session.get("currentExp");
            logger.trace("current experiment is: ", exp);
            var part = Participants.findOne({userID: user._id, expID: exp._id});
            if (part) {
              logger.trace("already a participant");
              if (!part.hasFinished) {
              //   if (part.hasStarted) {
              //     logger.trace("Participant has started but not yet finished");
              //     var condName = Conditions.findOne({_id: part.conditionID}).description;
              //     var routeName = "MturkIdeation" + condName;
              //     logger.debug("Sending to " + routeName);
              //     Router.go(routeName, {promptID: exp.promptID, partID: part._id});  
              //   } else {
              //     logger.trace("Participant has been assigned but not yet completed tutorial");
              //     var condName = Conditions.findOne({_id: part.conditionID}).description;
              //     var routeName = "Tutorial" + condName;
              //     logger.debug("Sending to " + routeName);
              //     Router.go(routeName, {promptID: exp.promptID, partID: part._id});  
              //   }
                var cond = Conditions.findOne({_id: part.conditionID});
                logger.trace("condition: " + JSON.stringify(cond));
                var progress = Progresses.findOne({userID: part.userID, workflowID: cond.misc.workflowID});
                logger.trace("condition: " + JSON.stringify(cond));
                WorkflowManager.setNextPage(part.userID, 
                                            cond.misc.workflowID,
                                            progress.index-1);
                Router.goToNextPage();
              } else {
                logger.trace("Participant has finished experiment; rejecting participant");
                Router.go('NoParticipation');
              }
          } else {
            logger.trace("not a participant yet");
            Router.setNextPageParam("userID", user._id);
            Router.goToNextPage();
          }
        }
      }

    /********************* Disable experiment logic ************/
    },
    'keyup input#name': function (evt) {
      if(evt.keyCode==13) {
        //console.log("enter released, clicking continue");
        $('#nextPage').click();
      }
    },
});

Template.HcompLoginPage.rendered = function() {
  // Ensure scroll to top of window
  window.scrollTo(0,0);
}

Template.MturkLoginPage.helpers({

  isExp : function () {
    var exp = Session.get("currentExp");
    if (exp) {
      return true;
    } else {
      return false;
    }
  },

});

/********************************************************************
 * Login Page event listeners 
 * *****************************************************************/
Template.HcompLoginPage.events({
    'click button.nextPage': function () {
        //console.log("clicked continue");
        //login user
        var userName = $('input#name').val().trim();
        logger.info("Logging in user with name: " + userName);
        var user = LoginManager.loginUser(userName);
        var role = RoleManager.defaults['HcompFacilitator'];
        Session.set("currentRole", role);
        Router.go("CrowdPromptPage",
          {userID: user._id});

    /********************* Disable experiment logic ************/
    },
    'keyup input#name': function (evt) {
      if(evt.keyCode==13) {
        //console.log("enter released, clicking continue");
        $('#nextPage').click();
      }
    },
});
