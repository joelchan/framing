#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Author: Joel Chan joelchan.me

import itertools as it
# import numpy as np
import networkx as nx
import mongohq
import db_params
import nlp
# from nltk.stem.snowball import SnowballStemmer
# from nltk.corpus import wordnet as wn
from gensim import corpora, models, similarities, matutils
# from operator import itemgetter
from py_correlation_clustering import solver
from ideagens import Node, Edge, list_to_dict
from bson.objectid import ObjectId
import dataforest

"""
Output should be:
A networkx graph G, composed of
    N (a list of nodes), and
    E (a list of edges)
"""


if __name__ == '__main__':
    # passWord = sys.argv[1]
    THRESHOLD = 0.5


    # read data from mongoDB
    # Get Ideas
    db = mongohq.Data_Utility('data', db_params.local_meteor)
    prompts = db.get_data('prompts', None,
                          {'forestGraphID': {'$exists': 'True'}})
    for prompt in prompts:
        print "Preprocessing prompt with question: " + prompt['question']
        graphID = prompt['forestGraphID']
        promptID = prompt['_id']
        # forest_ideas, forest_nodes = dataforest.read_raw_data()
        # mt_prompt = 'forgot_name'
        # p_ideas = [i for i in forest_ideas if i.promptID == mt_prompt]
        # p_nodes = [n for n in forest_nodes if n.promptID == mt_prompt]
        # print "all instances from file: " + str(len(forest_ideas))
        # print "all nodes from file: " + str(len(forest_nodes))
        # print "raw instances from file: " + str(len(p_ideas))
        # print "raw nodes from file: " + str(len(p_nodes))
        # dataforest.insert_to_db(db, promptID, graphID, p_ideas, p_nodes)
        ideas = db.get_data('ideas', None, {'promptID': prompt['_id']})
        # fetch all ideas given the db cursor
        ideas = [idea for idea in ideas]
        print "number of ideas to analyse: " + str(len(ideas))
        idea_dict = dict([(idea['_id'], idea) for idea in ideas])

        # Create a node for every idea in the data forest graph
        idea_nodes = [Node(graphID, promptID, 'forest_idea',
                        {'_id': str(ObjectId()),
                        'ideaID': idea['_id'],
                        'content': idea['content'],
                        'is_clustered': False})
                    for idea in ideas]
        result = db.insert('nodes', idea_nodes);
        # for id, node in zip(result, idea_nodes):
            # setattr(node, '_id', id)


        idea_node_dict = dict([(getattr(node,'ideaID'), node) for node in idea_nodes])
        node_dict = dict([(getattr(node,'_id'), node) for node in idea_nodes])

        #### tokenize ####
        # get stopwords
        stopWords = nlp.get_stopwords()
        # get bag of words
        data, expandedText = nlp.bag_of_words([n.__dict__ for n in idea_nodes], stopWords);

        # prepare dictionary
        dictionary = corpora.Dictionary(expandedText)

        # convert tokenized documents to a corpus of vectors
        corpus = [dictionary.doc2bow(text) for text in expandedText]

        # convert raw vectors to tfidf vectors
        tfidf = models.TfidfModel(corpus) #initialize model
        corpus_tfidf = tfidf[corpus] #apply tfidf model to whole corpus
        # make lsa space
        if len(data) > 300:
	        dim = 300 # default is 300 dimensions
        else:
	        dim = len(data) # default to 300
        lsi = models.LsiModel(corpus_tfidf, id2word=dictionary, num_topics=dim) #create the space

        # output the matrix V so we can use it to get pairwise cosines
        # https://github.com/piskvorky/gensim/wiki/Recipes-&-FAQ#q3-how-do-you-calculate-the-matrix-v-in-lsi-space
        vMatrix = matutils.corpus2dense(lsi[corpus_tfidf],len(lsi.projection.s)).T / lsi.projection.s

        # generate pairs
        indices = [i for i in xrange(len(data))]
        pairs = [p for p in it.combinations(indices,2)]
        edges = []
        sim_edges = []
        sims = []
        for pair in pairs:
            node1 = data[pair[0]]['_id']
            node2 = data[pair[1]]['_id']
            # print len(vMatrix[pair[0]]), len(vMatrix[pair[1]])
            # print node1
            # print node2
            sim = nlp.cosine(pair[0],pair[1],vMatrix)
            sim_edges.append(Edge(promptID, node1, node2,
                                  {'_id': str(ObjectId()),
                                   'type': 'similarity',
                                   'cos': sim}))
            sims.append(sim)
            # print sim
            if sim > THRESHOLD:
                edges.append((node1,node2))

        # Insert similarity weights into graph as special edges
        test_edges = db.get_data("edges", None, {})
        print "number of edges before insert: " + str(test_edges.count())
        # result = db.insert('edges', sim_edges);
        test_edges = db.get_data("edges", None, {})
        print "number of edges after insert: " + str(test_edges.count())
        # for id, edge in zip(result, sim_edges):
            # setattr(edge, '_id', id)

        ################################
        # turn into networkx graph
        ################################
        G = nx.Graph()

        #nodes = [d['id'] for d in data]
        G.add_edges_from(edges)
        print "nodes: %d" % G.number_of_nodes()
        print "edges: %d" % G.number_of_edges()

        solve = solver(G)
        clusters = solver.run(solve)

        # Create cluster parent nodes
        cluster_nodes = [Node(graphID, promptID, 'forest_precluster',
                              {'_id': str(ObjectId()),
                               'num_ideas': len(cluster),
                               'idea_node_ids': [id for id in cluster],
                               'child_leaf_ids': []})
                         for cluster in clusters]
        print cluster_nodes[1].idea_node_ids
        test_nodes = db.get_data("nodes", None, {})
        print "number of nodes before insert: " + str(test_nodes.count())
        print "number of nodes to insert: " + str(len(cluster_nodes))
        result = db.insert('nodes', cluster_nodes)
        test_nodes = db.get_data("nodes", None, {})
        print "number of nodes after insert: " + str(test_nodes.count())
        print "number of clusters originall returned: " + str(len(clusters))
        # for id, node in zip(result, cluster_nodes):
            # setattr(node, '_id', id)
        # Create edges for each cluster
        # c_edges = []
        # for node in cluster_nodes:
            # nodeID = getattr(node, '_id')
            # c_edges.extend([Edge(promptID, nodeID, childID,
                                 # {'_id': str(ObjectId()),
                                  # 'type': 'parent_child'})
                # for childID in node.idea_node_ids])
        # test_edges = db.get_data("edges", None, {})
        # print "number of edges before insert: " + str(test_edges.count())
        # db.insert('edges', c_edges)
        # test_edges = db.get_data("edges", None, {})
        # print "number of edges after insert: " + str(test_edges.count())


        # Update prompt as processed
        db.update('graphs', {'_id': graphID}, {'$set': {'is_processed': True}})
