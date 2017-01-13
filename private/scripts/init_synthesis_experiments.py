import numpy as np
from random import randint
import pandas as pd
import math, os, csv, json, nlp, sys
from scipy.spatial.distance import cosine
import itertools as it
from ideagens import ExpSynthSubset, list_to_dict
import db_params
import mongohq
from bson.objectid import ObjectId

def clean_text(s):
    lines = s.split()
    docEnd = find_doc_end(lines)
    # print len(lines)
    cleanLines = lines[:docEnd]
    # print len(cleanLines)
    new = " ".join(cleanLines)
    return new

def find_doc_end(docLines):
    docEndIndex = 0
    for i in xrange(len(docLines)):
        j = i+1
        if j < len(docLines):
            s1 = docLines[i]
            s2 = docLines[j]
            if "Which" in s1 and "barrier(s)" in s2:
                docEndIndex = i
    return docEndIndex

def sample_items(items, numWanted=1, probabilities=None):
    """
    Randomly sample an item from items without replacement.
    
    Keyword arguments:
    items -- a list of items from which to draw a sample
    sampled -- a set of items to keep track of what has already been sampled
    numWanted (optional) -- how many we want
    probabilities (optional) -- a list of sampling probabilities for each item
    """
    
    sampledItems = np.random.choice(items, size=numWanted, replace=False, p=probabilities)
    itemSet = set(items)
    itemSet.difference_update(sampledItems)
    return sampledItems, list(itemSet)

def get_sampling_probs(seed, itemNames, simData, idMappings, reverse=False):
    # get the probability weights
    # each remaining item has a sampling weight that is some function of
    # its affinity to the seed
    weights_raw = []
    for item in itemNames:
        indexSeed = idMappings[seed]
        indexItem = idMappings[item]
        if reverse:
            dist = cosine(simData[indexSeed], simData[indexItem])
            # print dist
            # weight = math.pow(dist,32)
            weights_raw.append(dist)
        else:
            sim = 1-cosine(simData[indexSeed], simData[indexItem])
            # print sim
            # weight = math.pow(sim,32)
            weights_raw.append(sim)
        # weights_raw.append(weight)
    weights_adjusted = [abs(np.min(weights_raw)) + w for w in weights_raw]
    # print sorted(weights_adjusted, reverse=True)
    weights = [math.pow(w,32) for w in weights_adjusted]
    # print sorted(weights, reverse=True)
    probabilities = [w/np.sum(weights) for w in weights]
    return probabilities

def get_pairwise_sims(theStuff, simData, idMappings):
    pairwiseSims = []
    combos = [x for x in it.combinations(theStuff,2)]
    for combo in combos:
        c1, c2 = combo
        if c1 != c2:
            index1 = idMappings[c1]
            index2 = idMappings[c2]
            sim = 1-cosine(simData[index1], simData[index2])
            pairwiseSims.append(sim)
    return pairwiseSims

def report_overlap(sets):
    item_counts = {}
    for subset, subsetData in sets.items():
        for item in subsetData['ideaIDs']:
            if item in item_counts:
                item_counts[item] += 1
            else:
                item_counts[item] = 1

    item_counts_num = []
    for item, count in item_counts.items():
        item_counts_num.append(count)
    print "\t\tDesired v is %.1f" %v
    print "\t\tEmpirically observed v is %.2f" %np.mean(item_counts_num)

def report_pairwise_sim(sets):
    pairwiseSim_means = []
    pairwiseSim_variances = []
    for subset, subsetData in sets.items():
        pairwiseSim_means.append(subsetData['pairwiseSims_mean'])
        pairwiseSim_variances.append(subsetData['pairwiseSims_sd'])

    print "\t\tMean mean pairwise similarity is %.2f with SD = %.2f" %(np.mean(pairwiseSim_means), np.std(pairwiseSim_means))
    print "\t\tMean variability in pairwise similarity is %.2f with SD = %.2f" %(np.mean(pairwiseSim_variances), np.std(pairwiseSim_variances))

def create_random_HITs(items, subsetNames, m, v, simData, idMappings):
    """
    Random sampling procedure from Strehl & Ghosh (2003) to randomly distribute n items across h subsets 
    with redundancy of v.
    
    Keyword arguments:
    items (list) -- items from which to draw a sample
    subsetNames (list) -- names of subsets we want to create HITs for
    m (int) -- desired number of items per HIT
    v (int) -- sampling redundancy parameter (expected number of HITs that contain each item)
    """

    subSets = {}
    
    ## simple phase: goal is to distribute the n items across the h subsets
    ## such that the union of all the h subsets contains all of the n items
    print "\t\tSimple deterministic phase..."

    # create a copy of the items which we will whittle away when we deterministically distribute
    # itemsCopy = items.keys()
    itemsCopy = items
    itemsCopy2 = items # for if we go overboard with the rounding up
    # print itemsCopy
    for subset in subsetNames:
        print "\tProcessing subset " + subset

        
        numWanted = int(math.ceil(m/v))
        # numWanted = int(m/v)

        if numWanted < len(itemsCopy):
            print "Remaining number of items to sample from: " + str(len(itemsCopy))
            print "Desired number of items to sample: " + str(numWanted)
            sample, itemsCopy = sample_items(itemsCopy, numWanted)
            seed = sample[0]
            subSets[subset] = {"ideaIDs": list(sample), "seed": seed}
        else:
            print "Remaining number of items to sample from: " + str(len(itemsCopy2))
            print "Desired number of items to sample: " + str(numWanted)
            sample, itemsCopy2 = sample_items(itemsCopy2, numWanted)
            seed = sample[0]
            subSets[subset] = {"ideaIDs": list(sample), "seed": seed}

    # print sets

    ## redundancy phase: goal is to fill up the remaining m-ceil(m/v) slots
    ## in each of the h subsets such that the expected number of subsets to which
    ## each of the n items belongs is approximately v
    print "\t\tRedundancy phase..."
    for subset, subsetData in subSets.items():
        # print "\tProcessing subset " + subset
        # this gives N-[M/V]
        remaining = [item for item in items if item not in subsetData['ideaIDs']]
        numWanted = int(m-len(subsetData['ideaIDs']))
        
        sample, remaining = sample_items(remaining, numWanted=numWanted)
        subSets[subset]['ideaIDs'] += list(sample)
        # subSets[subset]['items'] += [items[i] for i in sample]

        pairwiseSims = get_pairwise_sims(subSets[subset]['ideaIDs'], simData, idMappings)
        subSets[subset]['pairwiseSims'] = pairwiseSims
        subSets[subset]['pairwiseSims_mean'] = np.mean(pairwiseSims)
        subSets[subset]['pairwiseSims_sd'] = np.std(pairwiseSims)

    print "\t\tFinished!"

    report_overlap(subSets)

    report_pairwise_sim(subSets)
    
    return subSets

def create_clustered_HITs(items, subsetNames, m, v, simData, idMappings, reverse=False):
    """
    Random sampling procedure from Strehl & Ghosh (2003) to randomly distribute n items across h subsets 
    with redundancy of v.
    Modified to sample items that are close together in a latent semantic space.
    
    Keyword arguments:
    items (dict) -- items from which to draw a sample
    subsets (list) -- names of subsets we want to create HITs for
    m (int) -- desired number of items per HIT
    v (int) -- sampling redundancy parameter (expected number of HITs that contain each item)
    simData (matrix) -- semantic model we are using to determine affinity (for now it's the v matrix from LSA)
    reverse (boolean, optional) -- set to True if we want to weight by distance instead of affinity (default=False)
    """

    subSets = {}
    
    ## simple phase: goal is to distribute the n items across the h subsets
    ## such that the union of all the h subsets contains all of the n items
    print "\t\tSimple deterministic phase..."

    # create a copy of the items which we will whittle away when we deterministically distribute
    # itemsCopy = items.keys()
    itemsCopy = items
    itemsCopy2 = items
    # print itemsCopy
    for subset in subsetNames:
        print "\tProcessing subset " + subset
        thisSet = set()
        
        # first randomly sample a seed
        if len(itemsCopy) > 0:
            sample, itemsCopy = sample_items(itemsCopy)
            seed = sample[0]
            thisSet.add(seed)
        else:
            sample, itemsCopy2 = sample_items(itemsCopy2)
            seed = sample[0]
            thisSet.add(seed)
        
        # get the probability weights
        # each remaining item has a sampling weight that is some function of
        # its affinity to the seed
        # print sorted(probabilities, reverse=True)
        
        numWanted = int(math.ceil(m/v))-1
        if numWanted > 0:
            if numWanted < len(itemsCopy):
                print "Remaining number of items to sample from: " + str(len(itemsCopy))
                print "Desired number of items to sample: " + str(numWanted)
                probabilities = get_sampling_probs(seed, itemsCopy, simData, idMappings, reverse)
                # print probabilities
                sample, itemsCopy = sample_items(itemsCopy, numWanted, probabilities)
                thisSet.update(sample)
            else:
                print "Remaining number of items to sample from: " + str(len(itemsCopy2))
                print "Desired number of items to sample: " + str(numWanted)
                probabilities = get_sampling_probs(seed, itemsCopy2, simData, idMappings, reverse)
                # print probabilities
                sample, itemsCopy2 = sample_items(itemsCopy2, numWanted, probabilities)
                thisSet.update(sample)

            # sample, itemsCopy = sample_items(itemsCopy, numWanted=numWanted, probabilities=probabilities)
            # thisSet.update(sample)
        subSets[subset] = {"ideaIDs": list(thisSet), "seed": seed}

    # print sets

    ## redundancy phase: goal is to fill up the remaining m-ceil(m/v) slots
    ## in each of the h subsets such that the expected number of subsets to which
    ## each of the n items belongs is approximately v
    print "\t\tRedundancy phase..."
    for subset, subsetData in subSets.items():
        # print "\tProcessing subset " + subset
        # this gives N-[M/V]
        remaining = [item for item in items if item not in subsetData['ideaIDs']]
        numWanted = int(m-len(subsetData['ideaIDs']))
        probabilities = get_sampling_probs(subsetData['seed'], remaining, simData, idMappings, reverse)
        
        sample, remaining = sample_items(remaining, numWanted, probabilities)
        subSets[subset]['ideaIDs'] += sample

        # pairwiseSims = get_pairwise_sims(subSets[subset]['ideaIDs'], simData)
        pairwiseSims = get_pairwise_sims(subSets[subset]['ideaIDs'], simData, idMappings)
        subSets[subset]['pairwiseSims'] = pairwiseSims
        subSets[subset]['pairwiseSims_mean'] = np.mean(pairwiseSims)
        subSets[subset]['pairwiseSims_sd'] = np.std(pairwiseSims)

    print "\t\tFinished!"
    
    report_overlap(subSets)

    report_pairwise_sim(subSets)
    
    return subSets

def parse_cond_params(condName):
    """
    This is brittle for now, but we will expect the following format:
    <m>-<sem_weight>
    """
    if "-" in condName:
        params = condName.split("-")
        m = float(params[0])
        sem_weight = params[1]
    else:
        m = float(condName)
        sem_weight = ""
    return m, sem_weight

def insert_subsets_to_db(subSets, cond, exp):
    """
    Create and insert the subset documents

    """
    # grab the condition
    cond = db['exp-conditions'].find_one({'_id': cond['_id']})
    # print cond
    
    # create the docs
    subset_docs = [ExpSynthSubset(subsetData['ideaIDs'],
                                cond,
                                exp,
                                subsetName,
                                {'seed': subsetData['seed'],
                                 'pairwiseSims_mean': subsetData['pairwiseSims_mean'],
                                 'pairwiseSims_sd': subsetData['pairwiseSims_sd'],
                                 '_id': str(ObjectId())}
                                ) for subsetName, subsetData in subSets.items()]
    # for doc in subset_docs:
    #     print doc.__dict__
    
    # insert the subset documents
    subset_ids = db_util.insert('synthSubsets', subset_docs)

    # reference the subset ids in the condition
    db['exp-conditions'].update({'_id': cond['_id']},
                                {'$set': {'misc.subsetIDs': [str(i) for i in subset_ids]}})

    # set the number of participants wanted to h*r
    db['exp-conditions'].update({'_id': cond['_id']},
                                {'$set': {'partNum': int(h*r)}})    

if __name__ == '__main__':

    db_name = sys.argv[1]

    db = mongohq.get_db(db_params.ALL_DBs[db_name])
    db_util = mongohq.Data_Utility('data', db_params.ALL_DBs[db_name])
    experiments = [exp for exp in db.experiments.find({'isSynthesis': True, 'isProcessed': False})]
    print experiments
    # for exp in experiments:
    for exp in db.experiments.find({'isSynthesis': True, 'isProcessed': False}):
        
        ## Get Ideas
        prompt = db.prompts.find_one({'_id': exp['promptID']})
        print "Preprocessing ideas for experiment with question: " + prompt['question']
        ideas = [idea for idea in db.ideas.find({'promptID': prompt['_id']})]
        # ideas = ideas[:400]
        idea_ids = [idea['_id'] for idea in ideas]
        # print idea_ids
        print "%d ideas for this prompt" %len(ideas)
        # print "First 25 ideas: "
        # for idea in ideas[:25]:
        #     print idea['content']

        ## Estimate LSA model
        simData, idMappings = nlp.est_tfidf_lsi(ideas)

        ## Prep/set overall params for subset creation
        n = float(len(ideas)) 
        v = 6.0 # sampling redundancy param
        r = 1.0 # number of workers per subset (we set this to 1 for now)

        for cond in exp['conditions']:
            m, sem_weight = parse_cond_params(cond['description'])
            h = math.ceil((n*v)/m)*r # number of subsets
            print "m = %.1f" %m
            print "sem_weight = %s" %sem_weight
            print "h = %.1f" %h

            subsetNames = ["%s-%.0f-%d" %(sem_weight, m, w) for w in xrange(1,int(h)+1)]
            if sem_weight == "Random" or sem_weight == "":
                subSets = create_random_HITs(idea_ids, subsetNames, m, v, simData, idMappings)
                insert_subsets_to_db(subSets, cond, exp)
            elif sem_weight == "Homo":
                subSets = create_clustered_HITs(idea_ids, subsetNames, m, v, simData, idMappings)
                insert_subsets_to_db(subSets, cond, exp)
            else:
                subSets = create_random_HITs(idea_ids, subsetNames, m, v, simData, idMappings)
                # subSets = create_clustered_HITs(idea_ids, subsetNames, m, v, simData, idMappings, reverse=True)
                insert_subsets_to_db(subSets, cond, exp)

        # untag the experiment
        db.experiments.update({'_id': exp['_id']},
                              {'$set': {'isProcessed': True}})



# # get the items
# ideas_dir = "/Users/jchan/Dropbox/Research/PostDoc/IdeaGens/synthesis-study/openIDEO_ideas/"
# output_dir = "/Users/jchan/Dropbox/Research/PostDoc/IdeaGens/synthesis-study/openIDEO_subsets/"
# items = {}
# itemNames = []
# for f in os.listdir(ideas_dir):
#     if ".DS_store" not in f:
#         itemName = f.replace(".txt","")
#         textRaw = open(os.path.join(ideas_dir, f)).read()
#         textRaw = textRaw.replace("\n","")
#         # textRaw = textRaw.replace("\n\n","\n")
#         items[itemName] = itemName + ": " + clean_text(textRaw)
#         itemNames.append(itemName)

# # get the similarity data
# weightsfilename = "/Users/jchan/Dropbox/Research/Dissertation/OpenIDEO/Pipeline/Validation/FINAL_malletLDA/sorted_CF0_DF0_400_ASP_optim_composition-6.csv"
# simData = {}
# with open(weightsfilename, 'rU') as csvfile:
#     filereader = csv.reader(csvfile, delimiter=',', quotechar='|')
#     for row in filereader:
#         if 'doc' not in row[0]: #skip the header
#             docname = row[0].replace("tokenized_","").replace(".txt","")
#             simData[docname] = [float(i) for i in row[1:]]
# csvfile.close

# mSettings = [6.0, 36.0]
# ## set the parameters
# # total number of items

# for m in mSettings:

#     print "\nCreating HITs for m = %.1f" %m
#     n = float(len(items))

#     # number of items per subset
#     # m = 6.0

#     # sampling redundancy parameter (expected number of subsets that contain each item)
#     v = 6.0

#     # number of workers per subset (set to 1 for now)
#     r = 1.0

#     # number of total subsets
#     h = math.ceil((n*v)/m)*r

#     # create dummy subsets
#     subsetNames = ["subset-%d" %w for w in xrange(1,int(h)+1)]

#     ### with preclustering
#     print "\n\tCreating clustering HITs..."
#     clusteredHITs = create_clustered_HITs(items, subsetNames, m, v, simData)

#     output_dir_param = "%s/%i/" %(output_dir, int(m))
#     if not os.path.exists(output_dir_param):
#         os.mkdir(output_dir_param, 0774)

#     output_dir_clus = "%s/clustered/" %output_dir_param
#     if not os.path.exists(output_dir_clus):
#         os.mkdir(output_dir_clus, 0774)

#     for subset, subsetData in clusteredHITs.items():
#         fileName = os.path.join(output_dir_clus, "%s.txt" %subset)
#         f = open(fileName, 'w')
#         output = subset + "\n"
#         output += "*"*25
#         for item in sorted(subsetData['items'], key=len, reverse=True):
#             output += "\n%s\n%s" %(item, "-"*10)
#         f.write(output)
#         f.close()

#     outfile = open(os.path.join(output_dir_clus, "allSubsetData.json"),'w')
#     outfile.write(json.dumps(clusteredHITs, indent=2))
#     outfile.close()

#     ### without preclustering
#     print "\n\tCreating random HITs..."
#     randomHITs = create_random_HITs(items, subsetNames, m, v)

#     output_dir_rand = "%s/random/" %output_dir_param
#     if not os.path.exists(output_dir_rand):
#         os.mkdir(output_dir_rand, 0774)

#     for subset, subsetData in randomHITs.items():
#         fileName = os.path.join(output_dir_rand, "%s.txt" %subset)
#         f = open(fileName, 'w')
#         output = subset + "\n"
#         output += "*"*25
#         for item in sorted(subsetData['items'], key=len, reverse=True):
#             output += "\n%s\n%s" %(item, "-"*10)
#         f.write(output)
#         f.close()

#     outfile = open(os.path.join(output_dir_rand, "allSubsetData.json"),'w')
#     outfile.write(json.dumps(randomHITs, indent=2))
#     outfile.close()