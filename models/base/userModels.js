// Configure logger for Tools
var logger = new Logger('Models:User');
// Comment out to use global logging level
Logger.setLevel('Models:User', 'trace');
//Logger.setLevel('Models:User', 'debug');
// Logger.setLevel('Models:User', 'info');
//Logger.setLevel('Models:User', 'warn');

// All system users
MyUsers = new Meteor.Collection("myUsers");
UserTypes = new Meteor.Collection("userTypes");
// All roles
Roles = new Meteor.Collection("roles");
// Logs all formed groups
Groups = new Meteor.Collection("groups");
GroupTemplates = new Meteor.Collection("groupTemplates");

//Class that encapsulates prompt and workflow/role + url to each and url to the set
User = function(name, type){
	this.name = name;
  //Currently only "admin" is significant
  this.type = type;
};

Group = function(template) {
    this.template = template;
    //Users assigned to the group
    this.users = [];
    // set of objects where roleID is the field name and
    //    each object stored there has a roleTitle, and array
    //    of users assigned to that role
    //this.assignments = []
    this.assignments = {}
    // flag for whether the group is accepting new members
    this.isOpen = true;
    if (template) {
      logger.trace("Has template");
      for (var i=0; i<this.template.roles.length; i++) {
        //Use roleID as the key toe the object containing assignments
        var role = this.template.roles[i];
        this.assignments[role.title] = [];
        //The title of the role associated with these assignments
        //newRoleAssign['roleTitle'] = this.template.roles[i].title;
        //this.assignments[roleID]['roleTitle'] = this.template.roles[i].title;
        //This is the array of users that are assigned to this role
        //newRoleAssign['roleAssignments'] = [];
        //this.assignments[roleID]['roleAssignments'] = [];
        //Add groupAssignment to group
        //this.assignments.push(newRoleAssign);
      } 
    } else {
      logger.trace("no template");
    }
}
GroupTemplate = function () {
  /******************************************************************
  * Defines a template for membership of each group in a brainstorm
  *
  * @return {object} GroupTemplate object 
  ******************************************************************/
 
  // list of Roles with role.num defined as the number of that role in
  // the group
  this.roles = [];
  // The number of members in the group where -1 is unlimited
  this.size = 0;

};


Role = function (title) {
  /********************************************************************
  * defines a function or sequence of functions performed by an
  * individual
  *
  * @return {object} GroupTemplate object 
  ********************************************************************/

  this.title = title;
  this.workflow = [];
  // this.num used by GroupTemplates
  // this.misc used by individual page logic to load page specific
  // variables in form [{name: "name", val: "value"}, ...] 

};

