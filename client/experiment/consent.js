//Template.TextPage.helper({
//});

Template.ConsentPage.events({
    'click button.nextPage': function () {
        //console.log("**** clicked continue ****");
        //login user
        //var userName = $('input#name').val().trim();
        //var myUser = new User(userName);
        //loginUser(myUser);
        var part = Session.get("currentParticipant")
        Consents.insert(new Consent(part));
        EventLogger.logConsent(part);

        //Go to next page
        Router.goToNextPage("MTurkConsentPage");
    }
});

Template.ConsentPage.helpers({
  consent: function() {
    return Template.MTurkConsentPage;
  }
});

Template.TextPage.rendered = function() {

};

Meteor.startup(function() {
  /******************************************************************
   * Define the MTurk Consent Page
   * ***************************************************************/
  var page = new TextPage("MTurk Consent1",
                      "Consent for Individual brainstorming");
  var sections = [new TextSection("Participant Consent",
    "<p>This design strategy study is part of a research study \
conducted by Christopher MacLellan, Steven Dow, Ken Koedinger, \
and Steven Dang at Carnegie Mellon University.</p> \
<p>The purpose of this study is to investigate the use of \
different ideation strategies on design outcomes.</p>"),
      new TextSection("Procedures",
        "<p>During this study, you will be asked complete a series of user interface design tasks. These tasks consist of coming up with ideas for various cell-phone applications and building low-fidelity prototypes to represent these ideas. If at any time you become frustrated or no longer want to participate, you may exit the session, and your compensation will be pro-rated according to your progress in the study.</p> <p>We plan to keep your identity private, and separate from the information we collect. Your name will be replaced by a code name in all publications and presentations that are released to the public.</p>"),
      new TextSection("Expected Duration and Location",
        "<p>Your participation will involve a single 1-hour session. This experiment will take place online.</p>"),
      new TextSection("Participant Requirements",
        "<p>Participants must be over 18 years old.</p>"),
      new TextSection("Risks",
        "<p>The risks and discomfort associated with participation in this study are no greater than those ordinarily encountered in daily life or during the performance of routine physical or psychological examinations or tests.</p>"),
      new TextSection("Rights",
        "<p>The risks and discomfort associated with participation in this study are no greater than those ordinarily encountered in daily life or during the performance of routine physical or psychological examinations or tests.</p>"),
      new TextSection("Benefits",
          "<p>You may receive benefits from participation in the study, such as learning more about design principles. Additionally, the knowledge gained in this study may help improve methods of design education.</p>"),
      new TextSection("Compensation & Costs",
          "<p>We are providing $10 gift cards as compensation. There is no additional cost to you for participating in this study.</p>"),
      new TextSection("Confidentiality",
          "<p>By participating in the study, you understand and agree that Carnegie Mellon may be required to disclose this consent form, data and other personally identifiable information as required by law, regulation, subpoena or court order.  Otherwise, your confidentiality will be maintained in the following manner:</p>  <p>To ensure that participants information is kept confidential, the researchers will assign each participant a unique code and will refer to any data collected during the study by that code. By participating, you understand and agree that the data and information gathered during this study may be used by Carnegie Mellon and published and/or disclosed by Carnegie Mellon to others outside of Carnegie Mellon.  However, your name, address, contact information and other direct personal identifiers in this consent form will not be mentioned in any such publication or dissemination of the research data and/or results by Carnegie Mellon.</p>"),
      new TextSection("Right to Ask Questions and Contact Information",
          "<p>If you have any questions about this study, please ask them now.  If you have questions later, desire additional information, or wish to withdraw participation please contact:</p> \
<address> \
Christopher MacLellan<br> \
Human Computer Interaction Institute<br>\
CAMPUS ADDRESS<br>\
Carnegie Mellon University<br>\
Pittsburgh, PA 15213<br>\
307-220-2425<br>\
cmaclell@cs.cmu.edu<br>\
</address>\
<p>If you have questions pertaining to your rights as a research participant; or to report objections to this study, please contact:</p>\
<address>\
IRB Chair<br>\
Regulatory Compliance Administration<br>\
Carnegie Mellon University<br>\
5000 Forbes Avenue<br>\
Warner Hall, 4th Floor<br>\
Pittsburgh, PA  15213<br>\
irb-review@andrew.cmu.edu<br>\
(412) 268-1901 or (412) 268 4727<br>\
</address>\
<h2>Voluntary Participation</h2>"),
      new TextSection("Voluntary Participation",
            "<p>Your participation in this research is voluntary.  You may discontinue participation at any time during the research activity.</p> <p>By clicking continue below you certify the following:</p>\
<ul>\
<li>You are 18 years of age or older.</li>\
<li>You have read and understand the information above.</li>\
<li>You want to participate in this research and continue with the\
group brainstorming study.</li>\
</ul>")];

  page.content = sections;
  //Add page to screens db

});
