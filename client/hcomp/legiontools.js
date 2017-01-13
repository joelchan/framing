
// Configure logger for Tools
var logger = new Logger('Client:Hcomp:LegionTools');
// Comment out to use global logging level
// Logger.setLevel('Client:Hcomp:LegionTools', 'trace');
//Logger.setLevel('Client:Hcomp:LegionTools', 'debug');
Logger.setLevel('Client:Hcomp:LegionTools', 'info');
//Logger.setLevel('Client:Hcomp:LegionTools', 'warn');

Template.LegionFinalPage.rendered = function() {
  //hide exit early
  $("#exitStudy").remove();
  if ($('.btn-login').hasClass("hidden")) {
    $('.btn-login').toggleClass("hidden"); 
  }
  // selector used by jquery to identify your form
  var form_selector = "#mturk-form";
  console.log(form_selector);
/**
 *  
 *  gup(name) :: retrieves URL parameters if provided
 *
 *  Prepares the page for MTurk on load.
 *  1. looks for a form element with id="mturk_form", and sets its METHOD / ACTION
 *    1a. All that the task page needs to do is submit the form element when ready
 *  2. disables form elements if HIT hasn't been accepted
 *
 **/


  // function for getting URL parameters
  var gup = function gup(name) {
    console.log("calling gup");
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    console.log(name);
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(document.referrer);
    console.log(window.location.href);
    console.log(document.referrer);
    console.log(results);
    if(results == null) {
      console.log("not results in window location href");
      return "";
    }
    else {
      console.log("not results in window location href");
      console.log(unescape(results[1]));
      return unescape(results[1]);
    }
  };
  // is assigntmentId is a URL parameter
  console.log("form selector length" + parseInt($(form_selector).length));
  if((aid = gup("assignmentId"))!="" && $(form_selector).length>0) {
    console.log("entered main conditional");
    console.log(aid);

    // If the HIT hasn't been accepted yet, disabled the form fields.
    if(aid == "ASSIGNMENT_ID_NOT_AVAILABLE") {
      console.log("assnID not available");
	    $('input,textarea,select').attr("DISABLED", "disabled");
    }

    // Add a new hidden input element with name="assignmentId" that
    // with assignmentId as its value.
    var aid_input = $("<input type='hidden' name='assignmentId' value='" + aid + "'>").appendTo($(form_selector));
    var workerId_input = $("<input type='hidden' name='workerId' value='" + gup("workerId") + "'>").appendTo($(form_selector));
    var hitId_input = $("<input type='hidden' name='hitId' value='" + gup("hitId") + "'>").appendTo($(form_selector));

    // Make sure the submit form's method is POST
    $(form_selector).attr('method', 'POST');

    // Set the Action of the form to the provided "turkSubmitTo" field
    if((submit_url=gup("turkSubmitTo"))!="") {
      $(form_selector).attr('action', submit_url + '/mturk/externalSubmit');
    }
  }
   
};