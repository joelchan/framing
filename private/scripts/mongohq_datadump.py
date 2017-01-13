#!/usr/bin/env python

# Author: Steven Dang stevencdang.com
import json
from pymongo.errors import DuplicateKeyError
import mongohq
import pandas as pd
from os import mkdir, listdir, path
import dateutil.parser
from file_manager import write_json_to_file

# collections to ignore
default_collections = [
    'system.indexes',
    'system.users',
]


def dump_db(dir_name='data', db_params=mongohq.ideagenstest):
    # set up the connnection
    db = mongohq.get_db(db_params)
    allCollections =  [col for col in db.collection_names() if col not in default_collections]
    print "list of collections: "
    for col in allCollections:
        print "collection name: " + col
        docs = db[col].find()
        data = [doc for doc in docs]
        write_json_to_file(data, dir_name, col)


def decode_json_file(file_path):
    json_file = open(file_path, 'r')
    decode_data = json.load(json_file)
    if len(decode_data) > 0:
        # Handle isodate
        if 'time' in decode_data[0]:
            print "data has time field"
            try:
                datetime_data = dateutil.parser.parse(decode_data[0]['time'])
            except:
                print "Couldn't convert to datetime"
                pass
            else:
                print "converted to datetime object"
                for doc in decode_data:
                    doc['time'] = dateutil.parser.parse(doc['time'])
    return decode_data


def restore_db(dir_name='data', db_params=mongohq.ideagenstest):
    files = listdir(dir_name)
    col_names = [file.split('.json')[0] for file in files]
    db = mongohq.get_db(db_params)
    existing_cols = db.collection_names()
    for file_name in files:
        file_path = path.join(dir_name, file_name)
        col = file_name.split('.json')[0]
        print "writing to data to collection " + col + \
            " in db: " + db_params['dbName']
        if col != 'users':
            data = decode_json_file(file_path)
            if col not in existing_cols:
                print "creating collection: " + col
                db.create_collection(col)
            else:
                print "inserting into existing collection"
            try:
                if data:
                    db[col].insert(data, continue_on_error=True)
            except DuplicateKeyError:
                print "Attempted insert of document with duplicate key"
            else:
                print "success"
        else:
            print "not writing users to db"

def clear_db(db_params=mongohq.ideagenstest):
    db = mongohq.get_db(db_params)
    cols = db.collection_names()
    clear_cols = [col for col in cols if col not in default_collections]
    for col in clear_cols:
        # Remove all docs from collection
        db[col].remove()


def get_data_output(dir_path='data', db_params=mongohq.ideagenstest):
   if not path.exists(dir_path):
       mkdir(dir_path, 0774)

   db = mongohq.get_db(db_params)
   # just grab the ideas and clusters
   clusters = {}
   for cluster in db.clusters.find():
       clusters[cluster[u'_id']] = cluster[u'name']

   ideas = []
   for idea in db.ideas.find():
       rowDict = {}
       rowDict["idea"] = idea[u'content']
       if len(idea[u'clusterIDs']) > 0:
           clusterID = idea[u'clusterIDs'][0]
           rowDict["theme"] = clusters[clusterID]
       else:
           rowDict["theme"] = "-"
           rowDict["starred"] = idea[u'isGamechanger']
       if idea[u'isGamechanger']:
          rowDict["starred"] = idea[u'isGamechanger']
       else:
          rowDict["starred"] = "-"
       rowDict["userID"] = idea[u'userID']
       rowDict["promptID"] = idea[u'promptID']
       ideas.append(rowDict)

   ideasDF = pd.DataFrame(ideas)
   file_path = path.join(dir_path, "ideas.csv")
   ideasDF.to_csv(file_path)

   users = {}
   for user in db.myUsers.find():
       users[user[u'_id']] = user[u'name']
   # usersDF = pd.DataFrame.from_dict(users)
   usersOutFile = open(path.join(dir_path, "users.csv"),'w')
   for userID, userName in users.items():
    usersOutFile.write(userID + "," + userName + "\n")
   usersOutFile.close()

   # file_path = path.join(dir_path, "users.csv")
   # usersDF.to_csv(file_path)
   ideasByPrompt = []
   for prompt in db.prompts.find():
     # rowDict = {}
     thisPromptID = prompt[u'_id']
     promptQuestion = prompt[u'question']
     for idea in db.ideas.find({u'promptID':thisPromptID}):
        rowDict = {}
        rowDict['promptID'] = thisPromptID
        rowDict['promptQuestion'] = promptQuestion
        rowDict['ideaID'] = idea[u'_id']
        rowDict['idea'] = idea[u'content']
        rowDict['likes'] = len(idea[u'votes'])
        rowDict['userID'] = idea[u'userID']
        rowDict['userName'] = idea[u'userName']
        rowDict['submissionTime'] = idea[u'time']
        if len(idea[u'clusterIDs']) > 0:
            clusterID = idea[u'clusterIDs'][0]
            rowDict["theme"] = clusters[clusterID]
        ideasByPrompt.append(rowDict)
   ideasByPromptDF = pd.DataFrame(ideasByPrompt)
   file_path = path.join(dir_path,"ideasByPrompt.csv")
   ideasByPromptDF.to_csv(file_path)

   notifications = []
   for notification in db.notifications.find():
       rowDict = {}
       if u'message' in notification:
           rowDict["message"] = notification[u'message']
       elif u'examples' in notification:
           examples = [ex[u'content'] for ex in notification[u'examples']]
           examplesMessage = "Sent Examples: %s" %(', '.join(examples))
           examplesMessage[:-2]
           rowDict["message"] = examplesMessage
       elif u'theme' in notification:
           themeID = notification[u'theme']
           rowDict["message"] = "Sent theme: %s" %clusters[themeID]
       elif u'prompt' in notification:
           rowDict["message"] = "Sent message: %s" %notification[u'prompt']
       else:
           break
       # get author info
       # get time?
       notifications.append(rowDict)

   notificationsDF = pd.DataFrame(notifications)
   # Create file path
   file_path = path.join(dir_path, "notifications.csv")
   notificationsDF.to_csv(file_path)

   participants = []
   for participant in db.participants.find():
    print participant
    rowDict = {}
    rowDict['participantID'] = participant[u'_id']
    rowDict['userName'] = participant[u'userName']
    expID = participant[u'experimentID']
    exp = db.experiments.find_one({u'_id':expID})
    print exp
    rowDict['experimentID'] = expID
    rowDict['experimentName'] = exp[u'description']
    rowDict['promptID'] = exp[u'promptID']
    cond = db['exp-conditions'].find_one({u'_id':participant[u'conditionID']})
    print cond
    rowDict['condition'] = cond[u'description']
    participants.append(rowDict)
   
   participantsDF = pd.DataFrame(participants)
   file_path = path.join(dir_path, "participants.csv")
   participantsDF.to_csv(file_path)

if __name__ == '__main__':

   # clear_db(mongohq.fac_exp)
   restore_db('data/mf_2015-4-24', mongohq.local_meteor)
   # clear_db(mongohq.ideagens)
   # restore_db('data/hcompTest', mongohq.ideagens)
   # dump_db('data/facTutorial', mongohq.local_meteor)
   # get_data_output('data/owen', mongohq.fac_exp)

