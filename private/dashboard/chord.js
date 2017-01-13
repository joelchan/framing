/* javascript file for creating the chord viz */

//sets the values of the width + height of the svg, and the inner and outer radii of the chord diagram
//these can be changed to whatever is needed for the viz
var width = 960,
    height = 600,
    innerRadius = Math.min(width, height) * .31,
    outerRadius = innerRadius * 1.1;

//sets the variable chord to the layout 
var chord = d3.layout.chord()
    .padding(.05)
    .sortSubgroups(d3.descending); //can be changed to .sortSubgroups and .sortChords

//creates a predefined color ordinal scale - to choose colors of the chords
var fill = d3.scale.category20();

//creates the svg to contain the viz with the defined width and height
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"); //puts in center of svg

//this is where the data from the csv file gets parsed and a 2d square matrix is formed.
d3.text("flare.csv", function(error, unparsedData) {

  //parses the data into an array of javascript objects.
  data = d3.csv.parse(unparsedData);

//creates d3.map - which is like a hashtable for d3. to be able to look up indicies and names of the ideas
//creates an empty matrix
  var indexByName = d3.map(),
      nameByIndex = d3.map(),
      matrix = [],
      n = 0;

//goes through all the elements in data and gives it an index in the map if it does not already have one
  data.forEach(function(d) {
    if (!indexByName.has(d.idea_label)) {
      nameByIndex.set(n, d.idea_label);
      indexByName.set(d.idea_label, n++);
    }
  });

  //loops through the empty matrix and initializes it as a square 2d matrix filled with 0's.
  for(var x = 0; x < n; x++) {
    var temp = [];
    for(var y = 0; y < n; y++) {
      temp.push(0);
    }
    matrix.push(temp);
  }

  //goes through the length of the data array and finds the indices of the source and target and puts it into the matrix
  for(var k = 0; k < data.length; k++) {
    var source = parseInt(indexByName.get(data[k].idea_label));
    var target = parseInt(indexByName.get(data[k].parent_label));
    matrix[source][target] = parseInt(data[k].strength);
  }

  //sets the matrix of the chord to the newly filled matrix.
  chord.matrix(matrix);

  //attaches the chord group edges to the svg.
  svg.append("g").selectAll("path")
      .data(chord.groups)
      .enter().append("path")
      .style("fill", function(d) { return fill(d.index); })
      .style("stroke", function(d) { return fill(d.index); })
      .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
      .on("mouseover", fade(.1)) //everything else fades away when you mose over a chord
      .on("mouseout", fade(1)); 

  //appends the tick marks to the chord groups
  var ticks = svg.append("g").selectAll("g")
      .data(chord.groups)
      .enter().append("g").selectAll("g")
      .data(groupTicks)
      .enter().append("g")
      .attr("transform", function(d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
            + "translate(" + outerRadius + ",0)";
      });

  //the physical lines of the tick marks
  ticks.append("line")
      .attr("x1", 1)
      .attr("y1", 0)
      .attr("x2", 5)
      .attr("y2", 0)
      .style("stroke", "#000");

  //this appends the text of the labels to the tick marks
  ticks.append("text")
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
      .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .text(function(d) { return d.label; });

//this appends the connections between the groups to each other
  svg.append("g")
      .attr("class", "chord")
      .selectAll("path")
      .data(chord.chords)
      .enter().append("path")
      .attr("d", d3.svg.chord().radius(innerRadius))
      .style("fill", function(d) { return fill(d.target.index); })
      .style("opacity", 1);

});
/* necessary helper functions */

// Returns an array of tick angles and labels, given a group.
function groupTicks(d) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, 1000).map(function(v, i) {
    return {
      angle: v * k + d.startAngle,
      label: data[d.index].idea_label
    };
  });
}

// Returns an event handler for fading a given chord group.
function fade(opacity) {
  return function(g, i) {
    svg.selectAll(".chord path")
        .filter(function(d) { return d.source.index != i && d.target.index != i; })
      .transition()
        .style("opacity", opacity);
  };
}