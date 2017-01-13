//size of the svg
var w = 1000;
var h = 650;

//in order to use the force layout for d3, the dataset has to be an object with two elements, nodes and edges, with each element being an array of objects.
		
//ordinal scale in order to color the nodes
var colors = d3.scale.category20();

//makes the svg element
var svg = d3.select("body")
	.append("svg")
	.attr("width", w)
	.attr("height", h);

//reads in the data csv in order to make the force diagram
d3.text('flare.csv', function(error, unparsed_data) {
	//parses the data into needed form
	var data = d3.csv.parse(unparsed_data);

	//variables for maps and arrays for the nodes and edges of the diagram
	var indexByName = d3.map(),
		nameByIndex = d3.map(),
		nodes = [],
		edges = [],
		max = 0,
		min = 0,
		n = 0;

	//find min and max of the sizes in order to scale them to needed size
	data.forEach(function(d) {
		if(parseInt(d.size) > max) max = parseInt(d.size);
		if(parseInt(d.size) < min) min = parseInt(d.size);
	});

	//scales the sizes to between 10px and 30px
	var size_scale = d3.scale.linear()
		.domain([min, max])
		.range([10, 30]);

	//goes through all of the data and makes sure that it is mapped in the maps
	//also puts the idea_label and size into the nodes array
	data.forEach(function(d) {
		if (!indexByName.has(d.idea_label)) {
            nameByIndex.set(n, d.idea_label);
            nodes.push({name: d.idea_label, size: size_scale(parseInt(d.size))});
            indexByName.set(d.idea_label, n);
            n++;
        }
	});

	//loops through the data array and looks up all the edges and puts them into the edges array
	for(var x = 0; x < data.length; x++) {
		var source = parseInt(indexByName.get(data[x].idea_label));
    	var target = parseInt(indexByName.get(data[x].parent_label));
    	var strength = parseInt(data[x].strength); 
    	edges.push({source: source, target: target, strength: strength});
	}

	//creates the dataset object that contains the arrays of nodes and edges
	var dataset = { nodes: nodes, edges: edges}; 

	//this sets up the force layout - it needs where the nodes and links are and the size of the space, as well as optional parameters like how long you want the distance between them to be and how much you want the nodes to repel each other
	var force = d3.layout.force()
		.nodes(dataset.nodes)
		.links(dataset.edges)
		.size([w, h])
		.linkDistance(function(d) {
			return d.strength * 50;
		})
		.charge(-300)
		.start();

	//making the svg lines that connect the nodes
	var edges = svg.selectAll("line")
		.data(dataset.edges)
		.enter()
		.append("line")
		.style("stroke", "white")
    	.style("stroke-width", function(d) { return Math.sqrt(d.strength); });

	//making the svg text that are the nodes
	//choosing colors from the ordinal scale for the text
	var nodes = svg.selectAll("text")
		.data(dataset.nodes)
		.enter()
		.append("text")
		.attr("size", 20)
		.style("fill", function(d, i) {
			return colors(i);
		})
		.style("font-size", function(d) {
			return d.size;
		})
		.style("font-family", "sans-serif")
		.text(function(d) {
			return d.name;
		})
		.call(force.drag); //this line is necessary in order for the user to be able to move the nodes (drag them)

	//this tells the visualization what to do when time passes
	//it updates where the nodes and edges should be
	force.on("tick", function() {
		edges.attr("x1", function(d) { 
				return d.source.x; 
			})
     		.attr("y1", function(d) { 
     			return d.source.y; 
  			})
     		.attr("x2", function(d) { 
     			return d.target.x; 
     		})
     		.attr("y2", function(d) { 
     			return d.target.y; 
     		});
		
		nodes.attr("x", function(d) { 
				return d.x; 
			})
     		.attr("y", function(d) { 
     			return d.y; 
     	});
	});
});