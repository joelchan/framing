#!/usr/bin/env python

# Author: Steven Dang stevencdang.com

# Requires pymongo
from os import path
import file_manager
from db_params import *
from mongohq import Data_Utility
import logging
from ideagens import User, Prompt, Cluster, Inspiration
import pandas as pd

logging.basicConfig(format='%(levelname)s:%(message)s',
                    level=logging.DEBUG)

logger = logging.getLogger("importInsp")

DATA_PATH = path.abspath("data")

RAW_FILES = {
    'exp_data': 'youth_voting_frames.csv',
    }

def make_unicode(input):
    if type(input) != unicode:
        input =  input.decode('utf-8')
        return input
    else:
        return input


class CsvCluster:
    def __init__(self, data):
      print data['cluster']
      print make_unicode(data['cluster'])
      self.content = unicode(data['cluster'], 'utf-8')
      self.promptName = data['problem']
      self.method = data['method']
      self.source = data['source']

def read_raw_data():
    """
    Read in the raw data from the mike terry csv files

    """
    global DATA_PATH, RAW_FILES
    # Read raw data in
    file_path = path.join(DATA_PATH, RAW_FILES['exp_data'])
    all_clusters = file_manager.import_from_csv(file_path, CsvCluster)
    return all_clusters


def setup_support_data():
    global DATA_PATH

    username = "experimenter"
    user = User(username)
    data = read_raw_data()
    # Setup prompts
    prompt_titles = set([c.promptName for c in data])
    prompts = {}
    for p in prompt_titles:
        prompts[p] = Prompt(p, user, p)

    # Create clusters and inspirations
    methods = set([c.method for c in data])
    sources = {}
    all_clusters = []
    inspirations = []
    for p in prompt_titles:
        prompt = prompts[p]
        print(prompt.title)
        p_data = [c for c in data if c.promptName == p]
        print("number of clusters for this prompt: ", len(p_data))
        for m in methods:
            print("method: " + m)
            rows = [c for c in p_data if c.method == m]
            print("number of clusters for this method: ", len(rows))
            sources[m] = set([c.source for c in rows])
            print(sources)
            for s in sources[m]:
                name = p + '-' + m + '-' + s
                i = Inspiration(name, [], m)
                print("source: " + s)
                clusters = []
                for c in rows:
                    if c.source == s:
                        cluster = Cluster(c.content, user, prompts[c.promptName])
                        cluster['assignedUsers'] = []
                        cluster['inspirationID'] = i['_id']
                        cluster['extID'] = c.extID
                        clusters.append(cluster)
                print("number of clusters for this source: ", len(clusters))
                ids = [c._id for c in clusters]
                print("number of clusters for this source: ", len(ids))
                all_clusters.extend(clusters)
                i['clusterIDs'] = ids
                inspirations.append(i)

    pd.DataFrame([{'id': c._id, 'name': c.name, 'inspirationID': c.inspirationID} for c in clusters]).to_csv(path.join(DATA_PATH, "cluster_ids.csv"))

    inspirationData = pd.DataFrame([{'id': insp['_id'],
                        'name': insp['name'],
                        'prompt': insp['name'].split("-")[0],
                        'method': insp['name'].split("-")[1],
                        'source': insp['name'].split("-")[2],} for insp in inspirations])
    inspirationData = inspirationData[['id', 'name', 'method', 'source', 'prompt']]
    inspirationData.sort(columns=['method', 'source', 'prompt'], ascending=[1,1,1], inplace=True)
    inspirationData.to_csv(path.join(DATA_PATH, "inspiration_ids.csv"))

    print("Number of prompts: ", len(prompts))
    print("Number of clusters: ", len(all_clusters))
    print("Number of inspirationss: ", len(inspirations))
    print inspirationData

    return user, prompts.values(), all_clusters, inspirations


def import_data():
    global DATA_PATH, RAW_FILES

    print("Importing all cluster labels into inspirations")
    u, p, c, i = setup_support_data()
    print p

    # Push data to db
    db = Data_Utility('data/inspirations', ALL_DBs['local_meteor'])
    db.insert('prompts', p)
    print("inserted prompts")
    db.insert('myUsers', [u])
    print("inserted user")
    db.insert('clusters', c)
    print("inserted clusters")
    db.insert('inspirations', i)
    print("inserted inspirations")


if __name__ == "__main__":
    import_data();
