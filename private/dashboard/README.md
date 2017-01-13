This folder contains 3 vizualizations. They are constructed using d3.js.

In order to run the vizualizations d3.js must be present. all the vizs read in data from the flare.csv file.
more columns of data can be added to the csv file if needed.
each row in the csv file is for a different "idea"
column headings are as follows:

+ idea_label - the label of the idea
+ parent_label - name of the parent of the current idea
+ size - the size of the node (this is used for certain vizs. this can be changed to different data that is necessary) anything that gets mapped to size at the moment must be a nonnegative integer
+ strength - the strength of the link between parent and child between 0-9.

The Vizs
========

The three vizualizations are:
0. chord diagram
1. circle packing
2. force diagram


chord diagram
-------------

the chord diagram is contained in the files:
* chord.js
* chord.css
* chord_diagram_2.html

chord.js holds the javascript that actually constructs the viz. the html and css are just there to format and contain the javascript. 

Example of a chord diagram: http://bl.ocks.org/mbostock/4062006


circle packing
--------------

the circle packing diagram is contained in the files:
* circle_packing.js
* circle_packing.css
* circle_packing_2.html

circle_packing.js contains the viz. the css file contains formatting for a hovering tooltip that shows up when a node is hovered over. html is just to contain viz.

Example of circle packing: http://bl.ocks.org/mbostock/7607535


force diagram
-------------

force diagram is contained in the files:
* force.js
* force_diagram_2.html

force.js contains the viz. html file is just a containing the viz.

example of force diagram: http://projects.flowingdata.com/tut/interactive_network_demo/

