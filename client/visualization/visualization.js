 // // Configure logger for server tests
 var logger = new Logger('Client:Visualization');
 // // Comment out to use global logging level
 Logger.setLevel('Client:Visualization', 'trace');
 // //Logger.setLevel('Client:Clustering', 'debug');
 // //Logger.setLevel('Client:Clustering', 'info');
 // //Logger.setLevel('Client:Clustering', 'warn');

/*******************************************************************
 * ***************  VisualizationPage Template **********************
 * ****************************************************************/
// Name for filters applied to idea list of unclustered ideas
var allIdeasFilterName = "Ideas Filter"; 
var allClustersFilterName = "All Clusters"

var incomingIdeaData = [];

/********************************************************************
* Attaches sortable to idea and cluster lists, new cluster area.
********************************************************************/
Template.Visualization.rendered = function(){

  //Create isInCluster filter
  // FilterManager.create(allIdeasFilterName,
  //     Session.get("currentUser"),
  //     "ideas",
  //     "clusterIDs",
  //     []
  // );
  
  // start with a fresh set of filters
  FilterManager.reset(allIdeasFilterName,
    Session.get("currentUser"),
    "ideas");
  
  FilterManager.create(allIdeasFilterName, 
    Session.get("currentUser"), 
    "ideas", 
    "prompt._id", 
    Session.get("currentPrompt")._id);
  // FilterManager.create("total ideas overall", 
  //   Session.get("currentUser"), 
  //   "ideas", 
  //   "prompt._id", 
  //   Session.get("currentPrompt")._id);
  FilterManager.create(allClustersFilterName, 
    Session.get("currentUser"), 
    "clusters", 
    "promptID", 
    Session.get("currentPrompt")._id);
  FilterManager.create(allClustersFilterName, 
    Session.get("currentUser"), 
    "clusters", 
    "isTrash", 
    false);
  Session.set("currentIdeators", []);
  Session.set("currentSynthesizers", []);
  Session.set("searchQuery","");

  //Setup filters for users and filter update listener
  // updateFilters();
  // //Update filters when current group changes
  // Groups.find({_id: Session.get("currentGroup")._id}).observe({
  //   changed: function(newDoc, oldDoc) {
  //     //Setup filters for users and filter update listener
  //     updateFilters();
  //   } 
  // });
};
/********************************************************************
* VisualizationPage template Helpers
********************************************************************/
Template.Visualization.helpers({
  promptQuestion : function() {
    var prompt =  Session.get("currentPrompt");
    return prompt.title;
  },
  numIdeasOverall : function() {
    // return 
    var sessionPromptID = Session.get("currentPrompt")
    return Ideas.find({promptID: sessionPromptID._id}).fetch().length;
  },
  Clusters : function() {
    // return Clusters.find();
    // return getFilteredClusters(allClustersFilterName);
    var sessionPromptID = Session.get("currentPrompt")
    return Clusters.find({promptID: sessionPromptID._id}).fetch();
  },
  ifShowAll : function() {
    if (this.showAllIdeas == true) {
      return true;
    }
    else {
      return false
    }
  },
})

Template.ForceDiagram.rendered = function()
{

	incomingIdeaData =  
	[
		{    "id":1,    "idea":"sleep schedule",    "categories":["Health and Wellbeing"],    "quality":0  },
		{    "id":2,    "idea":"health-centered app",    "categories":["Health and Wellbeing"],    "quality":2  },
		{    "id":3,    "idea":"something to track strength over time",    "categories":["Health and Wellbeing"],    "quality":4  },
		{    "id":4,    "idea":"workout routines for EMTs",    "categories":["Health and Wellbeing"],    "quality":5  },
		{    "id":5,    "idea":"game to test finger dexterity",    "categories":["Skillbuilding"],    "quality":5  },
		{    "id":6,    "idea":"well-being monitor",    "categories":["Health and Wellbeing"],    "quality":4  },
		{    "id":7,    "idea":"an app to share funny stories about the things they see",    "categories":["Emotional support"],    "quality":6  },
		{    "id":8,    "idea":"critical incident support guide",    "categories":["Health and Wellbeing"],    "quality":6  },
		{    "id":9,    "idea":"EMT task checklist",    "categories":["Workflow Improvement"],    "quality":5  },
		{    "id":10,    "idea":"group journalling app",    "categories":["Emotional support"],    "quality":6  },
		{    "id":11,    "idea":"messenger app for work ",    "categories":["Workflow Improvement"],    "quality":3  },
		{    "id":12,    "idea":"health resource app",    "categories":["Emotional support"],    "quality":4  },
		{    "id":13,    "idea":"Quick access to first aid instructions",    "categories":["Workflow Improvement"],    "quality":6  },
		{    "id":14,    "idea":"app to tell family/friends when they'll get off work",    "categories":["Family/friends support"],    "quality":5  },
		{    "id":15,    "idea":"game where person drives around a map as quickly as possible",    "categories":["Gamification"],    "quality":6  },
		{    "id":16,    "idea":"app to log best practices for specific situations for other EMTs",    "categories":["Skillbuilding"],    "quality":6  },
		{    "id":17,    "idea":"app that tracks career skillbuilding",    "categories":["Skillbuilding"],    "quality":5  },
		{    "id":18,    "idea":"EMT social network",    "categories":["Emotional support"],    "quality":60  },
		{    "id":19,    "idea":"upload health information using mobile data",    "categories":["Workflow Improvement"],    "quality":6  },
		{    "id":20,    "idea":"Family activity planner",    "categories":["Family/friends support"],    "quality":2  },
		{    "id":21,    "idea":"using cameras to recognize injuries",    "categories":["Workflow Improvement"],    "quality":6  },
		{    "id":22,    "idea":"app for building strength at the gym (can be a game)",    "categories":["Health and Wellbeing"],    "quality":4  },
		{    "id":23,    "idea":"use fingerprint technology to identify individual",    "categories":["Workflow Improvement"],    "quality":2  },
		{    "id":24,    "idea":"app to track driving record",    "categories":["Logging and Performance"],    "quality":4  },
		{    "id":25,    "idea":"Job skill assessment",    "categories":["Skillbuilding"],    "quality":2  },
		{    "id":26,    "idea":"using vibrations/sound to identify proximity to patient",    "categories":["Workflow Improvement"],    "quality":6  },
		{    "id":27,    "idea":"Cheerleader/coach app for emotional support at end of day",    "categories":["Emotional support"],    "quality":5  },
		{    "id":28,    "idea":"app for quick tutorials about career-advancing skills (e.g., how to use excel)",    "categories":["Skillbuilding"],    "quality":4  },
		{    "id":29,    "idea":"Communication systems game",    "categories":["Communication", "Gamification"],    "quality":2  },
		{    "id":30,    "idea":"Medical codes/procedures game",    "categories":["Gamification"],    "quality":20  },
		{    "id":31,    "idea":"\"Work mode\" for the phone",    "categories":["Workflow Improvement"],    "quality":50  },
		{    "id":32,   "idea":"upload patient data using voice recording to cross reference what they said at time of accident versus post accident",    "categories":["Workflow Improvement"],    "quality":6  },
		{    "id":33,    "idea":"use app to visualize health status of patient - connected to devices that measure it such as heart rate monitor,blood pressure etc",   "categories":["Workflow Improvement"],   "quality":7  },
		{    "id":34,    "idea":"Aggregate communications log",   "categories":["Communication", "Logging and Performance"],    "quality":4  },
		{    "id":35,    "idea":"Patient info/status",    "categories":["Logging and Performance"],    "quality":10  },
		{    "id":36,    "idea":"Password protected files",    "categories":["Data/Job tasks"],   "quality":1  },  
		{    "id":37,    "idea":"walkie talkie app",    "categories":["Communication", "hospital, dispatch, cops"],    "quality":2  },
		{    "id":38,    "idea":"Frequent injuries based on area",   "categories":["Workflow Improvement"],    "quality":7  },
		{    "id":39,    "idea":"App that records things done well - offers a reward system for successes - based on roland's need to reassurance while on the job that he is meeting expectations",    "categories":["Logging and Performance"],    "quality":6  },
		{    "id":40,    "idea":"Newsfeed of all EMTs",    "categories":["Community/ Support"],    "quality":6  },
		{    "id":41,    "idea":"gamification of good performance - inspires them to do certain procedure properly",    "categories":["Logging and Performance", "Gamification"],    "quality":5  },
		{    "id":42,    "idea":"Shift/driver/assignment",   "categories":["Logging and Performance"],    "quality":7  },
		{    "id":43,    "idea":"post-critical incident assessment",    "categories":["Communication", "hospital, dispatch, cops"],    "quality":6  },
		{    "id":44,    "idea":"Unrelated stress relief game (angry birds) that passively builds skills",    "categories":["Apps for after work hours", "Skillbuilding"],    "quality":5  },
		{    "id":45,    "idea":"\"Rookie\" app - Learn the basics",    "categories":["Gamification"],    "quality":2  },
		{    "id":46,    "idea":"app that shows the most dangerous areas of the city based on EMT-generated logs (e.g., intersection of X and Y is known to be bad)",    "categories":["Data/Job tasks"],   "quality":7  },
		{    "id":47,    "idea":"Dictated status logging for events and comms",    "categories":["Communication","Logging and Performance"],    "quality":5  },
		{    "id":48,    "idea":"app that sends notifications to EMT's family in the case that somehting happens to the EMT",    "categories":["Family/friends support"],    "quality":5  },
		{    "id":49,    "idea":"driving game where person learns how to get around traffic/streets better",    "categories":["Gamification"],    "quality":6  },
		{    "id":50,    "idea":"app that chronicles positive on the job stories",    "categories":["Emotional support"],    "quality":5  },
		{    "id":51,    "idea":"app that sends bits of inspiration (quotes, pictures, etc) for EMTs when they're burnt out/tired",    "categories":["Emotional support"],    "quality":7  },
		{    "id":52,    "idea":"Send pics to other parties (hospital or cops)",    "categories":["Communication", "hospital, dispatch, cops"],    "quality":5  }
	];


	//generateIdeaData();	

	// incomingIdeaData = parseGraph("bb5MupdMxKKk6qgkN");

	CreateForceDiagram(GetForceData(incomingIdeaData));
}

function GetForceData(ideaData)
{
	// Get Category Affinity Matrix
	var categoryAffinity = getCategoryAffinity(ideaData);

	// Get Term Affinity Matrix
	var termAffinity = getTermAffinity(ideaData);

	// Get Combined Affinity Matrix
	var combinedAffinity = getCombinedAffinity(categoryAffinity, termAffinity)

	//var forceData = createForceData(categoryAffinity, ideaData);
	//var forceData = createForceData(termAffinity, ideaData);
	var forceData = createForceData(combinedAffinity, ideaData);

	return forceData;
}

/********************************************************************
* Visualization - Create Graph Data Logic
********************************************************************/


function generateIdeaData()
{
	createGraph();
	
}

function createGraph()
{
	var promptID = 0;
	var groupID = 0;
	var userID = 0;
	Meteor.call('graphCreate', promptID, groupID, userID, function (error, result) 	
	{
		var graphId = result;
		//var graph = Graphs.findOne({'_id': graphId});
		populateGraph(graphId);
	});
}

function populateGraph(graphId)
{
	var metadata = {};
	metadata['name'] = "Action"
	Meteor.call('graphCreateThemeNode', graphId, metadata, function (error, result) 	
	{
		var themeNodeId = result._id;
		createAndLinkChild(graphId, themeNodeId);
	});

}

function createAndLinkChild(graphId, themeNodeId)
{
	var idea = Ideas.findOne();
	var ideaId = idea._id;
	var metaData = {'themeId': themeNodeId};
	Meteor.call('graphCreateIdeaNode', graphId, ideaId, metaData, function (error, result) 	
	{
		var ideaNodeID = result._id;
		var ideaNode = Nodes.findOne({'graphID': graphId,'_id': ideaNodeID});
		var themeNodeId = ideaNode.themeId;
		Meteor.call('graphLinkChild', themeNodeId, ideaNodeID, {});
	});
}


/********************************************************************
* Visualization - Parse Graph Logic
********************************************************************/


function parseGraph(graphId)
{
	var ideaData = [];
	// Get Graph
	var graph = Graphs.findOne({'_id': graphId});
	// Get Idea Nodes
	var ideaNodes = getIdeaNodes(graph);
	for(var i = 0; i < ideaNodes.length; i++)
	{ 
		var ideaNode = ideaNodes[i];
		var ideaNodeID = ideaNode._id;
		var ideaNodeContent = ideaNode.content;
		var ideaNodeVote = ideaNode.vote;
		if(ideaNodeVote == false)
		{
			ideaNodeVote = 1;
		}
		var ideaNodeThemes = getIdeaNodeThemes(ideaNodeID, graphId);
		var ideaDataItem = createIdeaDataItem(ideaNodeID, ideaNodeContent, ideaNodeThemes, ideaNodeVote);
		
		ideaData.push(ideaDataItem);
	}	

	return ideaData;
}

function getIdeaNodes(graph)
{
	var ideaNodes = [];
	for(var i = 0; i < graph.nodeIDs.length; i++)
	{
		var nodeId = graph.nodeIDs[i];
		var node = Nodes.findOne({'graphID': graph._id,'_id': nodeId});
		
		if(node.type == 'idea')
		{
			ideaNodes.push(node);
		}

	}

	//Nodes.find({'graphID': graphId,'type': 'idea'});
	
	return ideaNodes;
}

function getIdeaNodeThemes(ideaNodeID, graphId)
{
	var ideaNodeThemes = [];
	// Get parent-child edges with this node as a child
	var parentChildEdges = Edges.find({'type': 'parent_child', 'childID': ideaNodeID}).fetch();
	// Get parent nodes (themes)
	for(var i = 0; i < parentChildEdges.length; i++)
	{
		var themeId = parentChildEdges[i].parentID;
		var themeNode = Nodes.findOne({'graphID': graphId,'_id': themeId});

		// Used for category membership, we could also use the id to allow duplicate names for different themes
		var themeName = themeNode.name;
		ideaNodeThemes.push(themeName);
	}
	return ideaNodeThemes;
}

function createIdeaDataItem(id, idea, categories, quality)
{
	var ideaDataItem = {'id': id, 'idea': idea, 'categories': categories, 'quality': quality};
	return ideaDataItem;
}


////////////////////////////////////////////////////////////////////////////
//  this.nodeIDs = [];
//  this.edgeIDs = [];
// Meteor.call('graphCreate', prompt, group, user);
// Meteor.call('graphCreateNode', graph, metadata);
// graphCreateThemeNode: function(graphID, metadata)
// graphCreateIdeaNode: function(graphID, ideaID, metadata)
// graphCreateEdge: function(type, sourceID, targetID, metadata)
// graphCreateNode: function(graphID, type, metadata)
//  graphCreate: function(promptID, groupID, userID)
//   graphLinkChild: function(parentID, childID, metadata)

/********************************************************************
* Visualization - Helper Function Logic
********************************************************************/
function getMetaData(ideaData)
{
	//Find all categories and ideaKeys present in data
	var ideaKeys = [];
	var categories = [];
	for(var i = 0; i < ideaData.length; i++)
	{
		var ideaKey = ideaData[i].id;
		ideaKeys[ideaKeys.length] = ideaKey;
		var ideaCategories = ideaData[i].categories;
		for(var j = 0; j < ideaCategories.length; j++)
		{
			var category = ideaCategories[j];
			if(categories.indexOf(category) == -1)
			{
				categories[categories.length] = category;
			}
		}
		

	}
	categories.sort();
	var metaData = {"ideaKeys": ideaKeys, "categories": categories};
	
	return metaData;
}


/********************************************************************
* Visualization - Term Affinity (tf-idf weighting) Logic
********************************************************************/

function getTermAffinity(ideaData)
{
	//Find all ideaKeys present in data
	var metaData = getMetaData(ideaData)
	var ideaKeys = metaData.ideaKeys;

	// Corpus = Collection of all documents
	// Document = One unit of textual data (for example, webpages, ideas, or blog posts)
	// Term = One word from a document that is not a stop word
	var corpus = {"terms":[], "documents": []};
	corpus = populateCorpus(corpus, ideaData)

	//Create raw empty matrix
	var rawEmptyMatrix = createEmptyMatrix(ideaKeys.length, corpus.terms.length);


	// Create Term Weight Matrix
	var termWeightMatrix = createTermMatrix(ideaKeys, corpus.terms, rawEmptyMatrix);

	// Populate Term Weight Matrix
	termWeightMatrix = populateTermMatrix(corpus, termWeightMatrix);
	
	//Normalize Term Weight Matrix
	var normalizedTermWeightMatrix = normalizeMatrix(termWeightMatrix, termWeightMatrix.terms.length);

	//Create pair-wise afinity matrix for Term weights
	var rawAffinityMatrix = populatePairwiseAffinityMatrix(termWeightMatrix, normalizedTermWeightMatrix);

	var termAffinityMatrix = createTermAffinityMatrix(ideaKeys, rawAffinityMatrix);
	return termAffinityMatrix;
}

function createTermMatrix(ideaKeys, terms, rawEmptyMatrix)
{
	// Create Term Weight Matrix
	var termWeightMatrix = 
	{
		"type": "Term_Weighting",
		"ideaKeys": ideaKeys,
		"terms": terms,
		"matrix": rawEmptyMatrix
	}
	return termWeightMatrix;
}

function populateTermMatrix(corpus, termWeightMatrix)
{
	var corpusInverseDocumentFrequencies = getCorpusInverseDocumentFrequencies(corpus);
	
	var documentTermFrequencies = getDocumentTermFrequencies(corpus);

	var tfIdfWeighting = getTermFrequencyInverseDocumentFrequencies(corpusInverseDocumentFrequencies, documentTermFrequencies);
	
	// Populate Term Weight Matrix
	for(var i = 0; i < termWeightMatrix.ideaKeys.length; i++)
	{
		var ideaKey = termWeightMatrix.ideaKeys[i];
		var tfIdfDocument = getTfIdfDocument(ideaKey, tfIdfWeighting);
		for(var j = 0; j < termWeightMatrix.terms.length; j++)
		{
			var term = termWeightMatrix.terms[j].term;
			var termWeight = getTermWeight(term, tfIdfDocument);
			termWeightMatrix.matrix[i][j] = termWeight;
		}
	}
	return termWeightMatrix;
}

function createTermAffinityMatrix(ideaKeys, rawAffinityMatrix)
{
	// Create Term Affinity Matrix
	var termAffinityMatrix = 
	{
		"type": "Term_Similarity",
		"ideaKeys": ideaKeys,
		"matrix": rawAffinityMatrix
	}
	return termAffinityMatrix;
}



/********************************************************************
* Visualization - Term Affinity (tf-idf weighting) Logic
********************************************************************/
function getTermWeight(term, tfIdfDocument)
{
	for(var i = 0; i < tfIdfDocument.terms.length; i++)
	{
		var tfIdfTerm = tfIdfDocument.terms[i];
		if(tfIdfTerm.term == term)
		{
			return tfIdfTerm.tfIdf;
		}
		else
		{
			continue;
		}
	}
	return 0.0;
}

function getTfIdfDocument(ideaKey, tfIdfWeighting)
{
	for(var i = 0; i < tfIdfWeighting.length; i++)
	{
		var tfIdfDocument = tfIdfWeighting[i];
		if(tfIdfDocument.id == ideaKey)
		{
			return tfIdfDocument;
		}
		else
		{
			continue;
		}
	}
}

function getDocumentTerms(ideaText)
{
	var terms = [];
	var words = ideaText.split(" ");
	for (var j = 0; j < words.length; j++) 
	{
		// Get Word
		var word = words[j]
			.trim()
			.toLowerCase()
			.replace(/[^\w\s]|_/g, "")
        		.replace(/\s{2,}/g," ");
		
		var containsWord = Boolean(false);
		
		// Increase term count for terms in list of document terms
		for (var k = 0; k < terms.length; k++) 
		{
			if (terms[k].term == word) 
			{
				terms[k].count = terms[k].count + 1;
				containsWord = Boolean(true);
			}
		}

		// Add words that are not in terms or in stopwords to document
		if(containsWord == false && stopWords.words.indexOf(word) == -1) 
		{
			var term = {'term': word, 'count': 1};
			terms.push(term);
		}
	}	
	return terms;
}

function getCorpusTerms(corpus)
{
	for(var i = 0; i < corpus.documents.length; i++)
	{
		var document = corpus.documents[i];
		for(var j = 0; j < document.terms.length; j++)
		{
			var term = document.terms[j].term;
			
			var containsTerm = Boolean(false);
		
			// Increase term count for terms in list of corpus terms
			for (var k = 0; k < corpus.terms.length; k++) 
			{
				if (corpus.terms[k].term == term) 
				{
					corpus.terms[k].count = corpus.terms[k].count + 1;
					containsTerm = Boolean(true);
				}
			}

			// Add words that are not in terms or in stopwords to document
			if(containsTerm == false) 
			{
				var corpusTerm = {'term': term, 'count': 1};
				corpus.terms.push(corpusTerm);
			}
		}
	}
	return corpus;
}

function populateCorpus(corpus, ideaData)
{
	for (var i = 0; i < ideaData.length; i++) 
	{
		var ideaText = ideaData[i].idea;
		var document = {"id": ideaData[i].id, "terms": []};
		document.terms = getDocumentTerms(ideaText);
		corpus.documents.push(document);
	}
	corpus = getCorpusTerms(corpus);
	return corpus;
}

function getCorpusInverseDocumentFrequencies(corpus)
{
	var idfTerms = [];
	for(var i = 0; i < corpus.terms.length; i++)
	{
		
		var numberOfDocuments = corpus.documents.length;
		// Document frequency = Number of documents that contain the term
		var documentFrequency = corpus.terms[i].count;
		// Inverse Document Frequency = Number of Documents / Document Frequency
		var inverseDocumentFrequency = numberOfDocuments / documentFrequency;
		// Dampened Inverse Document Frequency = Log 10(Inverse Document Frequency)
		var dampenedInverseDocumentFrequency = Math.log10(inverseDocumentFrequency);
		var idfTerm = {'term': corpus.terms[i].term, 'idf': dampenedInverseDocumentFrequency};

		idfTerms.push(idfTerm);
	}
	return idfTerms;
}

function getDocumentTermFrequencies(corpus)
{
	var tfDocuments = [];
	for(var i = 0; i < corpus.documents.length; i++)
	{
		var document = corpus.documents[i];
		var tfDocument = {"id": document.id, "terms": []};
		for(var j = 0; j < document.terms.length; j++)
		{
			var term = document.terms[j];
			// Term frequency = Number of times the term appears in this document
			var termFrequency = term.count;
			// Scaled Term Frequency = 1 + Log 10(Term Frequency)
			var scaledTermFrequency = 1 + Math.log10(termFrequency);
			var tfTerm ={'term': term.term, 'tf': scaledTermFrequency};
			tfDocument.terms.push(tfTerm);
		}
		tfDocuments.push(tfDocument)
		
	}
	return tfDocuments;
}

function getTermFrequencyInverseDocumentFrequencies(idfTerms, tfDocuments)
{
	var tfIdfDocuments = [];

	for(var i = 0; i < tfDocuments.length; i++)
	{
		var tfDocument = tfDocuments[i];
		var tfIdfDocument = {"id": tfDocument.id, "terms": []};
		for(var j = 0; j < tfDocument.terms.length; j++)
		{
			var tfTerm = tfDocument.terms[j];
			// Scaled Term Frequency = 1 + Log 10(Term Frequency)
			var scaledTermFrequency = tfTerm.tf;
			// Dampened Inverse Document Frequency = Log 10(Inverse Document Frequency)
			var dampenedInverseDocumentFrequency = getInverseDocumentFrequency(tfTerm.term, idfTerms)
			// Term Frequency - Inverse Document Frequency = (Term Frequency * Inverse Document Frequency)
			var termFrequencyInverseDocumentFrequency = (scaledTermFrequency * dampenedInverseDocumentFrequency);
			var tfIdfTerm ={'term': tfTerm.term, 'tfIdf': termFrequencyInverseDocumentFrequency};
			tfIdfDocument.terms.push(tfIdfTerm);
		}
		tfIdfDocuments.push(tfIdfDocument)
	}

	return tfIdfDocuments;
}

function getInverseDocumentFrequency(term, idfTerms)
{
	var inverseDocumentFrequency = 0;
	for(var i = 0; i < idfTerms.length; i++)
	{
		var idfTerm = idfTerms[i].term;
		var idfWeight = idfTerms[i].idf;
		if(term == idfTerm)
		{
			inverseDocumentFrequency = idfWeight;
			break;
		}
	}
	return inverseDocumentFrequency;
}


/********************************************************************
* Visualization - Category Affinity (category membership) Logic
********************************************************************/

function getCategoryAffinity(ideaData)
{
	//Find all categories and ideaKeys present in data
	var metaData = getMetaData(ideaData)
	var ideaKeys = metaData.ideaKeys;
	var categories = metaData.categories;

	//Create raw empty matrix
	var rawEmptyMatrix = createEmptyMatrix(ideaKeys.length, categories.length);

	// Create Category Weight Matrix
	var categoryWeightMatrix = createCategoryMatrix(ideaKeys, categories, rawEmptyMatrix);

	// Populate Category Weight Matrix
	categoryWeightMatrix = populateCategoryMatrix(ideaData, categoryWeightMatrix);
	
	//Normalize Category Weight Matrix
	var normalizedCategoryWeightMatrix = normalizeMatrix(categoryWeightMatrix, categoryWeightMatrix.categories.length);

	//Create pair-wise afinity matrix for category membership
	var rawAffinityMatrix = populatePairwiseAffinityMatrix(categoryWeightMatrix, normalizedCategoryWeightMatrix);

	var categoryAffinityMatrix = createCategoryAffinityMatrix(ideaKeys, rawAffinityMatrix);
	return categoryAffinityMatrix;
}

function createCategoryMatrix(ideaKeys, categories, rawEmptyMatrix)
{
	// Create Category Weight Matrix
	var categoryWeightMatrix = 
	{
		"type": "Category_Weighting",
		"ideaKeys": ideaKeys,
		"categories": categories,
		"matrix": rawEmptyMatrix
	}
	return categoryWeightMatrix;
}

function createCategoryAffinityMatrix(ideaKeys, rawAffinityMatrix)
{
	// Create Category Affinity Matrix
	var categoryAffinityMatrix = 
	{
		"type": "Category_Similarity",
		"ideaKeys": ideaKeys,
		"matrix": rawAffinityMatrix
	}
	return categoryAffinityMatrix;
}

function populateCategoryMatrix(ideaData, categoryWeightMatrix)
{
	// Populate Category Weight Matrix
	for(var i = 0; i < ideaData.length; i++)
	{
		var ideaCategories = ideaData[i].categories;
		for(var j = 0; j < ideaCategories.length; j++)
		{
			var category = ideaCategories[j];
			var categoryIndex = categoryWeightMatrix.categories.indexOf(category);
			categoryWeightMatrix.matrix[i][categoryIndex] = 1;
		}
	}
	return categoryWeightMatrix;

}

/********************************************************************
* Visualization - Combine Term and Category Affinity Matrices Logic
********************************************************************/
function getCombinedAffinity(categoryAffinity, termAffinity)
{
	var combinedAffinity = createCombinedAffinityMatrix(categoryAffinity);
	for(var i = 0; i < combinedAffinity.ideaKeys.length; i++)
	{
		for(var j = 0; j < combinedAffinity.ideaKeys.length; j++)
		{
			var categoryDampeningFactor = getAverageSimilarity(termAffinity.matrix);
			var dampenedCategoryWeight = categoryDampeningFactor * categoryAffinity.matrix[i][j];
			combinedAffinity.matrix[i][j] = dampenedCategoryWeight + termAffinity.matrix[i][j];
		}
	}
	//var normalizedCombinedAffinity = normalizeMatrix(combinedAffinity, combinedAffinity.ideaKeys.length);
	//combinedAffinity.matrix = normalizedCombinedAffinity
	return combinedAffinity;
}

function createCombinedAffinityMatrix(affinityMatrix)
{
	// Create Combined Affinity Matrix
	var rawAffinityMatrix = createEmptyMatrix(affinityMatrix.ideaKeys.length, affinityMatrix.ideaKeys.length);
	var combinedAffinityMatrix = 
	{
		"type": "Combined_Similarity",
		"ideaKeys": affinityMatrix.ideaKeys,
		"matrix": rawAffinityMatrix
	}
	return combinedAffinityMatrix;
}

function getAverageSimilarity(matrix)
{
	// We are dropping 0s and 1s to get the average similarity
	var totalValue = 0;
	var totalCount = 0;
	for(var i = 0; i < matrix.length; i++)
	{
		for(var j = 0; j < matrix[i].length; j++)
		{
			var value = matrix[i][j];
			if(value > 0 && value < 1)
			{
				totalCount += 1;
				totalValue += value;
			}
		}
	}
	var averageSimilarity = totalValue / totalCount;
	return averageSimilarity;
}


/********************************************************************
* Visualization - General Matrix Logic
********************************************************************/

function createEmptyMatrix(rowCount, columnCount)
{
	//Create raw empty matrix
	var rawEmptyMatrix = new Array(rowCount);
	for(var i = 0; i < rowCount; i++)
	{
		rawEmptyMatrix[i] = new Array(columnCount);
		for(var j = 0; j < columnCount; j++)
		{
			rawEmptyMatrix[i][j] = 0;
		}
	}
	return rawEmptyMatrix;
}

function normalizeMatrix(weightMatrix, columnCount)
{
	//Normalize Weight Matrix
	var ideaCount = weightMatrix.ideaKeys.length;
	var normalizedweightMatrix = createEmptyMatrix(ideaCount, columnCount);

	for(var i = 0; i < ideaCount; i++)
	{
		//Get Normalization Factor (Square Root of Sum of Squares)
		var normalizationFactor = 0;
		var sumOfSquares = 0; 
		for(var j = 0; j < columnCount; j++)
		{
			var rawWeight = weightMatrix.matrix[i][j];
			sumOfSquares += (rawWeight * rawWeight);
		}
		normalizationFactor = Math.sqrt(sumOfSquares);

		//Normalize Weight Matrix
		for(var j = 0; j < columnCount; j++)
		{
			var rawWeight = weightMatrix.matrix[i][j];
			var normalizedWeight = rawWeight/normalizationFactor;
			normalizedweightMatrix[i][j] = normalizedWeight;
		}
	}
	return normalizedweightMatrix;
}

function populatePairwiseAffinityMatrix(weightMatrix, normalizedWeightMatrix)
{
	var ideaCount = weightMatrix.ideaKeys.length;
	//Create pair-wise afinity matrix
	var pairwiseAffinityMatrix = createEmptyMatrix(ideaCount, ideaCount);

	//Populate pair-wise afinity matrix
	for(var i = 0; i < ideaCount; i++)
	{
		var currentIdeaId = weightMatrix.ideaKeys[i];
		var currentIdeaVector = normalizedWeightMatrix[i];
		for(var j = 0; j < ideaCount; j++)
		{
			var targetIdeaId = weightMatrix.ideaKeys[j];
			var targetIdeaVector = normalizedWeightMatrix[j];
			if(currentIdeaId == targetIdeaId)
			{
				pairwiseAffinityMatrix[i][j] = 1;
				continue;
			}
			
			var cosineSimilarity = 0;
			//Get cosine similarity (Normalized Dot Product)
			for(var k = 0; k < currentIdeaVector.length; k++)
			{
				cosineSimilarity += currentIdeaVector[k] * targetIdeaVector[k];
			}
			pairwiseAffinityMatrix[i][j] = cosineSimilarity;
		
		}
	}
	return pairwiseAffinityMatrix;
}

/********************************************************************
* Visualization - Force Data (category and term affinity) Logic
********************************************************************/

function createGraphNode(sourceLabel, sourceId, nodeSize)
{
	var graphNode = 
	{    
		"source_idea_label": sourceLabel,    
		"source_idea_id": sourceId,   
		"size": nodeSize  
	};
	return graphNode;
}

function createGraphEdge(sourceId, targetId, linkStrength)
{
	var graphEdge = 
	{      
		"source_idea_id": sourceId,    
		"target_idea_id": targetId,       
		"strength": linkStrength  
	};
	return graphEdge;
}

function createForceData(affinityMatrix, ideaData)
{
	var totalLinkStrengh = 0;
	var totalLinkCount = 0;
	var forceData = {"nodes": [], "edges": []};
	for(var i = 0; i < ideaData.length; i++)
	{
		var sourceLabel = ideaData[i].idea;
		var sourceId = ideaData[i].id;
		var nodeSize = ideaData[i].quality;

		var graphNode = createGraphNode(sourceLabel, sourceId, nodeSize);
		forceData.nodes.push(graphNode);

		var affinityVector = affinityMatrix.matrix[i];
		for(var j = 0; j < affinityVector.length; j++)
		{
			var targetId = affinityMatrix.ideaKeys[j];
			var linkStrength = affinityVector[j];
			if(linkStrength > 0 && targetId != sourceId)
			{
				totalLinkCount += 1;
				totalLinkStrengh += linkStrength;
				var graphEdge = createGraphEdge(sourceId, targetId, linkStrength);
				forceData.edges.push(graphEdge);
			}
		}
	}
	var linkAverageStrength = totalLinkStrengh / totalLinkCount;
	
	forceData = trimForceData(forceData, linkAverageStrength);
	
	return forceData;
}

function trimForceData(forceData, cutOffValue)
{
	for(var i = 0; i < forceData.edges.length; i++)
	{
		var edge = forceData.edges[i];
		if(edge.strength < cutOffValue)
		{
			forceData.edges.splice(i, 1);
		}
	}
	return forceData;
}


/********************************************************************
* Visualization - Force Directed Graph Logic
********************************************************************/

function CreateForceDiagram(forceData)
{
	// global intensity of attraction
	var charge = -200;
	// link distance factor used to determine line length;
	var distanceFactor = 40;
	var maxDistance = 250;

	//size of the svg
	var width = 800;
	var height = 600;

	//in order to use the force layout for d3, the dataset has to be an object with two elements, nodes and edges, with each element being an array of objects.
		
	//ordinal scale in order to color the nodes
	var colors = d3.scale.category20();

	//makes the svg element
	var svg = d3.select("#forceDiagram")
		.attr("width", width)
		.attr("height", height)
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	//variables for maps and arrays for the nodes and edges of the diagram
	var indexByName = d3.map(),
		nameByIndex = d3.map(),
		nodes = [],
		edges = [],
		sizeMax = 0,
		sizeMin = 0,
		strengthMax = 0,
		strengthMin = 0,
		n = 0;

	//find min and max of the sizes in order to scale them to needed size
	forceData.nodes.forEach(function(d) 
	{
		if(parseInt(d.size) > sizeMax) sizeMax = parseInt(d.size);
		if(parseInt(d.size) < sizeMin) sizeMin = parseInt(d.size);
	});

	//scales the sizes to between 10px and 30px
	var size_scale = d3.scale.linear()
		.domain([sizeMin, sizeMax])
		.range([1, 50]);

	//find min and max of the sizes in order to scale them to needed size
	forceData.edges.forEach(function(d) 
	{
		if(parseFloat(d.strength) > strengthMax) strengthMax = parseFloat(d.strength);
		if(parseFloat(d.strength) < strengthMin) strengthMin = parseFloat(d.strength);
	});

	//scales the sizes to between 10px and 30px
	var strength_scale = d3.scale.linear()
		.domain([strengthMin, strengthMax])
		.range([1, 25]);

	//goes through all of the data and makes sure that it is mapped in the maps
	//also puts the source_idea_label and size into the nodes array
	forceData.nodes.forEach(function(d) 
	{
		if (!indexByName.has(d.source_idea_id)) 
		{
			nameByIndex.set(n, d.source_idea_id);
			nodes.push({name: d.source_idea_id, size: size_scale(parseInt(d.size)), text: d.source_idea_label});
			indexByName.set(d.source_idea_id, n);
			n++;
        	}
	});

	//loops through the data array and looks up all the edges and puts them into the edges array
	for(var x = 0; x < forceData.edges.length; x++) 
	{
		var sourceNode = parseInt(indexByName.get(forceData.edges[x].source_idea_id));
	    	var targetNode = parseInt(indexByName.get(forceData.edges[x].target_idea_id));
	    	var linkStrength = parseInt(strength_scale(forceData.edges[x].strength)); 

	    	edges.push({source: sourceNode, target: targetNode, strength: linkStrength});
	}

	//creates the dataset object that contains the arrays of nodes and edges
	var dataset = { nodes: nodes, edges: edges}; 

	//this sets up the force layout - it needs where the nodes and links are and the size of the space, as well as optional parameters like how long you want the distance between them to be and how much you want the nodes to repel each other
	var force = d3.layout.force()
		.nodes(dataset.nodes)
		.links(dataset.edges)
		.size([width, height])
		//.linkDistance(function(d) 
		//{
		//	return maxDistance - (Math.round(Math.sqrt(d.strength)) * distanceFactor);
		//})
		.charge(charge)
		.start();

	//making the svg lines that connect the nodes
	var edges = svg.selectAll(".link")
		.data(dataset.edges)
		.enter()
		.append("line")
		.attr("class", "link")
		.style("stroke", "grey")
		.style("opacity", function(d) 
		{
			return d.strength/10;
		})
    		.style("stroke-width", function(d) 
		{
			return   (1/10)*(Math.round(Math.sqrt(d.strength)));
		});

   	var colors = d3.scale.linear()
					.domain([0,10,100])
					.range(["#edf8b1","#7fcdbb","#2c7fb8"]);

	//making the svg text that are the nodes
	//choosing colors from the ordinal scale for the text
	var nodes = svg.selectAll(".node")
		.data(dataset.nodes)
		.enter()
		.append("circle")
		.attr("class", "node")
		.attr("r", function(d) 
		{ 
			return Math.sqrt(d.size) * 2; 
		})
		.style("fill", function(d, i) 
		{
			return colors(d.size);
		})
		.call(force.drag);//this line is necessary in order for the user to be able to move the nodes (drag them)

	nodes.append("title")
		.text(function(d) { return d.text; });

	nodes.append("text")
		.attr("class","label")
		.text(function(d) { 
			return d.text;})
		.attr("fill", "black")
		.attr("font-size", "20px");

	nodes.on("mouseover", function() {d3.select(this).style("stroke","orange").style("stroke-width",1);});
	nodes.on("mouseout", function() {d3.select(this).style("stroke","none");});
	

	//this tells the visualization what to do when time passes
	//it updates where the nodes and edges should be
	force.on("tick", function() 
	{
		edges.attr("x1", function(d) 
		{ 
			return d.source.x; 
		})
     		.attr("y1", function(d) 
		{ 
     			return d.source.y; 
		})
     		.attr("x2", function(d) 
		{ 
     			return d.target.x; 
     		})
     		.attr("y2", function(d) 
		{ 
     			return d.target.y; 
     		});

		nodes.attr("cx", function(d) 
		{
			return d.x; 
		})
		.attr("cy", function(d) 
		{ 
			return d.y; 
		});
	});
}

