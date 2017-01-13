#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Author: Joel Chan joelchan.me

import nltk
import sys
import itertools as it
# import numpy as np
import networkx as nx
import mongohq
# from nltk.stem.snowball import SnowballStemmer
# from nltk.corpus import wordnet as wn
from gensim import corpora, models, similarities, matutils
# from operator import itemgetter
from py_correlation_clustering import solver

"""
Output should be:
A networkx graph G, composed of
    N (a list of nodes), and
    E (a list of edges)
"""

if __name__  == '__main__':
    passWord = sys.argv[1]
    THRESHOLD = 0.5


    # read data from mongoDB
    # Get Ideas
    db = mongohq.Data_Utility(mongohq.fac_exp)
    ideas = db.get_data('ideas')

    #### tokenize ####
    # get stopwords
    stopWords = nlp.get_stopwords()
    # get bag of words
    data, expandedText = nlp.bag_of_words(ideas, stopWords);

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
    sims = []
    for pair in pairs:
	    node1 = data[pair[0]]['id']
	    node2 = data[pair[1]]['id']
	    # print len(vMatrix[pair[0]]), len(vMatrix[pair[1]])
	    # print node1
	    # print node2
	    sim = cosine(pair[0],pair[1],vMatrix)
	    sims.append(sim)
	    # print sim
	    if sim > THRESHOLD:
		    edges.append((node1,node2))

    # testout = open("/Users/jchan/Desktop/edges.txt",'w')
    # for edge in edges:
    # 	contents = filter(lambda x: x.get('id') == edge[0],data)
    # 	contents +=  filter(lambda x: x.get('id') == edge[1],data)
    # 	testout.write("%s\n%s\n%s\n\n" %(contents[0]['content'],contents[1]['content'],"-"*25))
    # testout.close()

    # testout = open("/Users/jchan/Desktop/test.txt",'w')
    # for d in data:
    # 	testout.write("%s\n%s\n\n" %(d['content'],d['expandedBOW']))
    # testout.close()

    # outfile2 = open("/Users/jchan/Desktop/vMatrix.csv",'w')
    # testout2csv = csv.writer(outfile2)
    # for row in vMatrix:
    # 	testout2csv.writerow(row)
    # outfile2.close()

    # simout = open("/Users/jchan/Desktop/sims.txt",'w')
    # for sim in sims:
    # 	simout.write("%.4f\n" %sim)
    # simout.close()

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
    clusters.sort(key=len, reverse=True)
    print clusters
