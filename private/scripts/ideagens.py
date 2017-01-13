#!/usr/bin/env python

# Author: Steven Dang stevencdang.com

import mongohq
from sets import Set
import logging
import datetime
from bson.objectid import ObjectId

logging.basicConfig(format='%(levelname)s:%(message)s',
                    level=logging.DEBUG)


def list_to_dict(docs):
    """
    Convert a list of mongo documents with an _id field to a dictionary
    indexed by the _id field

    """
    return Dict([(doc['_id'], doc) for doc in docs])

def get_ids(docs):
    """
    Grab _id field from set of docs and return a list

    """
    return [doc['_id'] for doc in docs]

class IdeagensObject(object):
    """
    Convenience class for Ideagens mongo objects

    """
    def __init__(self, data=None):
        if data is not None:
            for key in data.keys():
                # print "Setting attribute: " + str(key) + " with " + str(data[key])
                setattr(self, key, data[key])
        
        #set an _id param if it was not already given
        if not hasattr(self, "_id"):
            self._id = str(ObjectId());
      
    def __str__(self):
        result = self.__class__.__name__ + " with: "
        attrs = self.__dict__
        for key in attrs.keys():
            result += str(key) + ": " + str(attrs[key]) + " "
        return result

    def __getitem__(self, key):
        return self.__dict__[key]

    def __setitem__(self, key, item):
        self.__dict__[key] = item

class Edge(IdeagensObject):
    """
    Graph Edge as defined by Ideagens

    """
    def __init__(self, promptID, sourceID, targetID, data=None):
        super(Edge, self).__init__(data)
        self.promptID = promptID
        self.sourceID = sourceID
        self.targetID = targetID


class Node(IdeagensObject):
    """
    Graph Node as defined by Ideagens

    """
    def __init__(self, graphID, promptID, data_type, data=None):
        super(Node, self).__init__(data)
        self.graphID = graphID
        self.promptID = promptID
        self.type = data_type


class Idea(IdeagensObject):
    """
    Idea as defined by Ideagens
    Add a field "previousID" to tie it to the ideas to its previous db

    """
    def __init__(self, content, previousID, user, prompt, data=None):
        super(Idea, self).__init__(data)
        self.time = datetime.datetime.now()
        self.content = content
        self.previousID = previousID
        self.userID = user['_id']
        self.userName = user['name']
        self.promptID = prompt['_id']
        self.isGamechanger = False
        self.readIDs = []
        self.votes = [];
        self.inCluster = False
        self.clusterIDs = []
        self.zoomSpace = []


class Cluster(IdeagensObject):
    """
    Cluster as defined by Ideagens

    """
    def __init__(self, name, user, prompt, ideas=[], data=None):
        super(Cluster, self).__init__(data)
        self.time = datetime.datetime.now()
        self.userID = user['_id']
        self.userName = user['name']
        self.promptID = prompt['_id']
        self.name = name
        self.children = []
        self.isCollapsed = False
        self.isTrash = False
        self.votes = []
        self.ideaIDs = [i['_id'] for i in ideas]


class User(IdeagensObject):
    """
    User as defined by Ideagens

    """
    def __init__(self, name, role='user', data=None):
        super(User, self).__init__(data)
        self.name = name
        self.type = role


class Prompt(IdeagensObject):
    """
    Prompt as defined by Ideagens

    """
    def __init__(self, question, user, title, data=None):
        super(Prompt, self).__init__(data)
        self.question = question
        self.title = title
        self.time = datetime.datetime.now()
        self.userIDs = [user['_id'],]
        self.groupIDs = [] # might need groups?
        self.template = None
        self.length = -1


class Inspiration(IdeagensObject):
    """
    Inspiration as defined by Ideagens

    """
    def __init__(self, name, clusterIDs=[], typename=None, data=None):
        super(Inspiration, self).__init__(data)
        self.name = name
        self.clusterIDs = clusterIDs
        self.type = typename


class ExpSynthSubset(IdeagensObject):
    """
    ExpSynthSubset as defined by Ideagens

    """
    def __init__(self, ideaIDs, cond, exp, description, data=None):
        super(ExpSynthSubset, self).__init__(data)
        self.users = []
        self.ideaIDs = ideaIDs
        self.condID = cond['_id']
        self.condName = cond['description']
        self.expID = exp['_id']
        self.description = description


class Db_Manager:
    """
    A class for performing typical data processing operations on
    the ideagens database

    """
    def __init__(self, db_params=mongohq.ideagens):
        """
        Constructor to instantiate references to Ideagens instance
        and its corresponding database

        """
        self.db_params = db_params
        self.db = mongohq.get_db(db_params)

    def set_db(self, db_params=mongohq.ideagenstest):
        """
        Set the db where ideagens data sits

        """
        self.db = mongohq.get_db(db_params)

    def get_prompts(self):
        logging.debug("Get all prompts")
        return self.db['prompts'].find()

    def get_users_in_prompt(self, prompt):
        logging.debug("Get users in prompt")
        ids = prompt['groupIDs']
        groupIDs = Set(ids)
        logging.debug("Found " + str(len(groupIDs)) + " groups with this prompt")
        # Getting all users for the prompt ignoring duplicates across groups
        user_ids = Set([])
        users = []
        for groupID in groupIDs:
            group = self.db['groups'].find({'_id': groupID})[0]
            for user in group['users']:
                if (user['_id'] not in user_ids):
                    user_ids.add(user['_id'])
                    users.append(user)

        logging.info("got " + str(len(users)) + " users in this prompt")
        return users

    def get_ideas_for_user(self, user, prompt):
        logging.debug("Get ideas for user in prompt")
        return self.db['ideas'].find({'userID': user['_id'],
                                     'promptID': prompt['_id']
                                     })

    def get_login_times(self, users):
        logging.debug("Getting login times for users")
        events = []
        for user in users:
            login_events = self.db['events'].find({
                'userID': user['_id'],
                'description': "User logged into experiment"
            })
            logging.debug("looking at user " + user['name'])
            logging.debug(login_events.count())
            events.extend(login_events)
        return events


if __name__ == '__main__':
    # clear_db(mongohq.ideagenstest)
    # dump_db('data/chi1', mongohq.chi1)
    # restore_db('data/chi3_raw', mongohq.ideagenstest)
    db = Db_Manager(mongohq.ideagens)
