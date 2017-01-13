#!/usr/bin/env python

# Author: Steven Dang stevencdang.com

# Requires pymongo
# from sets import Set
# from pymongo import MongoClient
# from pymongo.errors import DuplicateKeyError
from os import path
# import sys
import file_manager
from db_params import *
from mongohq import Data_Utility
import logging
from ideagens import Node, Edge
from bson.objectid import ObjectId


DATA_PATH = path.abspath("data")

RAW_FILES = {
    'ideas': 'Mike_Terry_instance.csv',
    'tree': 'MikeTerry_trees.csv'
    }

PROMPTS = {'turk': "<p>Mechanical Turk currently lacks a dedicated mobile app for performing HITs on smartphones (iPhone, Androids, etc.) or tablets (e.g., the iPad).</p>      <p>Brainstorm 20 features for a mobile app to Mechanical Turk that would improve the worker's experience when performing HITs on mobile devices. Be as specific as possible in your responses.</p>",
  'iPod': "<p>Many people have old iPods or MP3 players that they no longer use. Please brainstorm 5 uses for old iPods/MP3 players. Assume that the devices' batteries no longer work, though they can be powered via external power sources. Also be aware that devices may <em>not</em> have displays. Be as specific as possible in your descriptions.</p>",
  'charity': "<p>The Electronic Frontier Foundation (EFF) is a nonprofit whose goal is to protect individual rights with respect to digital and online technologies. For example, the EFF has initiated a lawsuit against the US government to limit the degree to which the US surveils its citizens via secret NSA programs. If you are unfamiliar with the EFF and its goals, read about it on its website (<a href=\"https://www.eff.org\" target=\"_new\">https://www.eff.org</a>) or via other online sources (such as Wikipedia).</p>      <p>Brainstorm 20 <em>new</em> ways the EFF can raise funds and simultaneously increase awareness. Your ideas <em>must be different from their current methods</em>, which include donation pages, merchandise, web badges and banners, affiliate programs with Amazon and eBay, and donating things such as airmiles, cars, or stocks. See the full list of their current methods here: <a href=\"https://www.eff.org/helpout\" target=\"_new\">https://www.eff.org/helpout</a>. Be as specific as possible in your responses.</p>",
  'forgot_name': "<p>Imagine you are in a social setting and you have forgotten the name of somebody you know. Brainstorm 75 ways you could learn their name without directly asking them. Be as specific as possible in your descriptions.</p>"
}


class Idea:
    """
    Simple container for idea data from csv

    """
    def __init__(self, data):
        self.content = data['answer']
        self.prompt = data['question']
        self.promptID = data['question_code']
        self.nodeID = data['idea']
        self.nodeLabel = data['idea_label']
        self.nodeParentID = data['parent']

    def __str__(self):
        result = "TreeNode with: "
        attrs = self.__dict__
        for key in attrs.keys():
            result += str(key) + ": " + str(attrs[key]) + " "
        return result

class TreeNode:
    """
    Simple container for tree leaf with node metadata and edge data
    linking ideas

    """
    def __init__(self, data):
        self.id = data['idea']
        self.label = data['idea_label']
        self.parent = data['parent']
        self.promptID = data['question_code']

    def __str__(self):
        result = "TreeNode with: "
        attrs = self.__dict__
        for key in attrs.keys():
            result += str(key) + ": " + str(attrs[key]) + " "
        return result


def read_raw_data():
    """
    Read in the raw data from the mike terry csv files

    """
    global DATA_PATH, RAW_FILES
    # Read raw data in
    file_path = path.join(DATA_PATH, RAW_FILES['ideas'])
    ideas = file_manager.import_from_csv(file_path, Idea)
    file_path = path.join(DATA_PATH, RAW_FILES['tree'])
    nodes = file_manager.import_from_csv(file_path, TreeNode)
    return ideas, nodes


def insert_to_db(db, promptID, graphID, raw_ideas, idea_nodes, filt=None):
    """
    Insert raw ideas and idea nodes into a given db with associated
    prompt and graph IDs as well as the edge data in the graph

    """
    print "inserting from prompt with id: " + str(promptID)
    print "inserting from graph with id: " + str(graphID)
    # Parse data into ideagens structs
    instances = {}
    leafs = {}
    for i in raw_ideas:
        # Filter for only ideas in relevant prompt
        # Hard-coded for now
        instance = Node(graphID, promptID, 'forest_idea',
                                {'_id': str(ObjectId()),
                                'parentID': i.nodeID,
                                'content': i.content,
                                'is_clustered': True})
        instances[instance._id] = instance
        # Create idea nodes as they are encountered
        if i.nodeID not in leafs:
            leafs[i.nodeID] = Node(graphID, promptID, 'forest_leaf',
                    {'_id': i.nodeID, 'label': i.nodeLabel,
                        'idea_node_ids': [instance._id,],
                        'child_leaf_ids': []})
        else:
            leafs[i.nodeID].idea_node_ids.append(instance._id)



    # Insert Idea instances into graph and add _id fields from result
    # print "number of instances to insert: " + str(len(instances))
    # print "# of instances: " + str(len(instances))
    # print "# of instance IDs: " + str(len(instanceIDs))
    # instance_dict = {}
    # for ID, i in zip(instanceIDs, instances):
        # # i._id = ID
        # instance_dict[ID] = i

    # Create edges connecting idea nodes in the forest
    # branches = [Edge(promptID, node.parent, node.id,
                     # {'_id': str(ObjectId()),
                      # 'type': 'parent_child'})
                # for node in idea_nodes
                # if node.parent in leafs]

    # Add child leaf refs to root node for all nodes with root parent
    # root_child_ids = [node.id for node in idea_nodes \
                      # if node.parent == "-1" and node.id in leafs
    root_child_ids = []
    num_ans = 0
    # Create complete graph
    for node in idea_nodes:
        if node.id not in leafs:
            leafs[node.id] = Node(
                graphID, promptID, 'forest_leaf',
                {'_id': node.id, 'label': node.label,
                 'idea_node_ids': [],
                 'child_leaf_ids': []})
            num_ans += 1;
        if node.parent in leafs:
            if node.id not in leafs[node.parent].child_leaf_ids:
                leafs[node.parent].child_leaf_ids.append(node.id)
        else:
            if node.parent == "-1":
                root_child_ids.append(node.id)
            else:
                # Create artificial node
                leafs[node.parent] = Node(
                        graphID, promptID, 'forest_leaf',
                        {'_id': node.id, 'label': node.label,
                        'idea_node_ids': [],
                        'child_leaf_ids': [node.id, ]})
                num_ans += 1;

    # for node in idea_nodes:
        # if node.id in leafs:
            # if node.parent == "-1":
                # root_child_ids.append(node.id)
            # else:
                # if node.parent in leafs:
                    # leafs[node.parent].child_leaf_ids.append(node.id)
                # else:
                    # # Create artificial node
                    # leafs[node.parent] = Node(graphID, promptID, 'forest_leaf',
                        # {'_id': node.parent, 'label': node.label,
                         # 'idea_node_ids': [],
                         # 'child_leaf_ids': [node.id, ]})


    root = db.get_data("nodes", None, {'type': 'root',
                                        'promptID': promptID})[0]
    db.update("nodes",{'_id': root['_id']},
              {'$push': { 'child_leaf_ids': {'$each': root_child_ids}}})

    # print "# of leafs except root: " + str(len(branches))
    # print "root _id: " + str(root['_id'])
    # branches.extend([Edge(promptID, root['_id'], node.id,
                          # {'_id': str(ObjectId()),
                           # 'type': 'parent_child'})
                # for node in idea_nodes
                # if node.parent == "-1" and node.id in leafs])
    # print "# of leafs with root: " + str(len(branches))
    # # Create edges connecting idea instances to nodes
    # clusters = [Edge(promptID, idea.parentID, idea._id,
                     # {'_id': str(ObjectId()),
                      # 'type': 'same_idea'})
                # for idea in instances]

    # Insert all nodes into the db
    print "# of ideas: " + str(len(instances.values()))
    print "# of nodes: " + str(len(leafs.values()))
    print "# of artificial nodes: " + str(num_ans)
    instanceIDs = db.insert("nodes", instances.values())
    leafIDs = db.insert("nodes", leafs.values())


if __name__ == '__main__':
  print "importing Mike Terry's data forest data"
  db = Data_Utility('data/preforest', ALL_DBs['ideagensscd'])
  db.clear_db()
  db.restore_db()
  prompts = db.get_data('prompts', None,
                        {'forestGraphID': {'$exists': 'True'}})
  for prompt in prompts:
      print "Preprocessing prompt with question: " + prompt['question']
      graphID = prompt['forestGraphID']
      promptID = prompt['_id']
      ideas, nodes = read_raw_data()
      mt_prompt = 'forgot_name'
      p_ideas = [i for i in ideas if i.promptID == my_prompt]
      p_nodes = [n for n in nodes if n.promptID == my_prompt]

      insert_to_db(db, promptID, graphID, p_ideas, p_nodes)
