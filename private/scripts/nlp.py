#!/usr/bin/env python

# Author: Steven Dang stevencdang.com

import nltk
from nltk.corpus import wordnet as wn
import numpy as np
from file_manager import read_data
from gensim import corpora, models, similarities, matutils


def cosine(doc1, doc2, doc_topic_weights):
    weights1 = doc_topic_weights[doc1]
    weights2 = doc_topic_weights[doc2]
    dotProduct = np.dot(weights1, weights2)
    mag1 = np.sqrt(sum([np.square(weight) for weight in weights1]))
    mag2 = np.sqrt(sum([np.square(weight) for weight in weights2]))
    if mag1 and mag2:
        return dotProduct / (mag1 * mag2)
    else:
        return 0.0


def get_wordnet_pos(treebank_tag):
    """
    helper method to convert treebank tags
    into wordnet pos tags for query expansion
    """
    if treebank_tag.startswith('J'):
        return wn.ADJ
    elif treebank_tag.startswith('V'):
        return wn.VERB
    elif treebank_tag.startswith('N'):
        return wn.NOUN
    elif treebank_tag.startswith('R'):
        return wn.ADV
    else:
        return ''


def expand_text(pos_tokens):
    """
    interface with wordnet to recursively add
    all synonyms and hypernyms for each token in input list of token-posTag tuples
    return expanded list of tokens that includes synonyms and hypernyms
    """

    # first expand with synonyms
    synonyms = set()
    for item in pos_tokens:
        synsets = wn.synsets(item[0], get_wordnet_pos(item[1]))
        for synset in synsets:
            synonyms.add(synset)

    # start making the list of tokens to be output
    # initialize with lemmas of the synonyms
    bowTokens = set([t[0] for t in pos_tokens])
    for synonym in synonyms:
        for lemma in synonym.lemmas():
            bowTokens.add(lemma.name())

    # now recursively add hypernyms
    nextStack = set(synonyms)  # initialize stack
    while(len(nextStack)):

        currentStack = set(nextStack)
        nextStack.clear()

        # get all hypernyms, put in nextStack
        for s in currentStack:
            for hypernym in s.hypernyms():
                nextStack.add(hypernym)

        # add lemmas from the current level of hypernyms to the master bag of tokens
        for hypernym in nextStack:
            for lemma in hypernym.lemmas():
                bowTokens.add(lemma.name())

    return sorted(list(bowTokens))


def get_stopwords():
    """
    Returns a list of stop words. Currently uses a list of words in
    a text file

    """
    return read_data("englishstopwords-jc.txt")


def bag_of_words(ideas, stopwords):
    """
    Initial processing of ideas for Mike Terri's Ideaforest algorithm

    """
    expandedText = []
    data = []
    for idea in ideas:
        # read the text
        text = idea['content'].encode('utf-8', 'ignore')

        # split into sentences (PunktSentenceTokenizer)
        sentences = nltk.sent_tokenize(text)

        # tokenize and pos tag words (TreeBank)
        pos_tokens = []
        for sentence in sentences:
            tokens = [token.lower() for token in nltk.word_tokenize(sentence)]  # tokenize
            pos_tokens += nltk.pos_tag(tokens)  # pos tag

        # remove stopwords
        pos_tokens = [t for t in pos_tokens if t[0] not in stopwords]

        # remove "words" with no letters in them!
        pos_tokens = [t for t in pos_tokens if any(c.isalpha() for c in t[0])]

        # query expansion
        expandedTokens = expand_text(pos_tokens)

        # add the enriched bag of words as value to current d
        expandedText.append(expandedTokens)
        data.append(idea)

    return data, expandedText

def est_tfidf_lsi(items):
    #### tokenize ####
    # get stopwords
    stopWords = get_stopwords()
    # get bag of words
    data, expandedText = bag_of_words(items, stopWords)

    # prepare dictionary
    dictionary = corpora.Dictionary(expandedText)

    # convert tokenized documents to a corpus of vectors
    corpus = [dictionary.doc2bow(text) for text in expandedText]

    # convert raw vectors to tfidf vectors
    tfidf = models.TfidfModel(corpus) #initialize model
    corpus_tfidf = tfidf[corpus] #apply tfidf model to whole corpus
    # make lsa space
    if len(data) > 100:
        dim = 100 # default is 100 dimensions
    else:
        dim = len(data)
    lsi = models.LsiModel(corpus_tfidf, id2word=dictionary, num_topics=dim) #create the space

    # output the matrix V so we can use it to get pairwise cosines
    # https://github.com/piskvorky/gensim/wiki/Recipes-&-FAQ#q3-how-do-you-calculate-the-matrix-v-in-lsi-space
    vMatrix = matutils.corpus2dense(lsi[corpus_tfidf],len(lsi.projection.s)).T / lsi.projection.s

    # convert data to dict for easier processing
    # map each item to its position in the vMatrix so we can access it
    data_dict = {}
    for i in xrange(len(data)):
        data_dict[data[i]['_id']] = i

    return vMatrix, data_dict
