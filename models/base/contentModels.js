//Setup data structures for suport content display
Screens = new Meteor.Collection("screens");
TextBlocks = new Meteor.Collection("textBlocks");

Screen = function(name, desc, url) {
    /******************************************************************
     *    * An encapsulation of a view for administration purposes 
     *       *****************************************************************/
     this.name = name;
     this.desc = desc;
     this.url = url;
}

TextPage = function(name, desc) {
    /******************************************************************
     *    * A simple text page with sections and text blocks
     *       *****************************************************************/
     this.name = name;
     this.desc = desc;
     this.content = [];
};

TextSection = function(heading, body) {
    /******************************************************************
     *    * A block of text with a heading and body, where the heading is
     *       * surrounded with h2 html tags, and the body is wrapped in
     *          * a div
     *             *****************************************************************/
     this.heading;
     this.body;
};
