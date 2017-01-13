#!/usr/bin/env python

import mongohq
import db_params
import file_manager
import sys, os

def get_amd_data(argv):
  '''
  Get raw Ideas and inspirations from brainstorms

  '''
  if len(argv) is 0:
    print "Getting args from compose ideagens db"
    print "Writing files to data directory"
    db = mongohq.Data_Utility()
  else:
    print "Using arguments to set data"
    db = mongohq.Data_Utility(argv[0], db_params.ALL_DBs[argv[1]])
  # Get Ideas 
  ideas = db.get_data("ideas", ['_id', 'content', 'promptID'])
  idea_dict = dict([(idea['_id'], {'content': idea['content']}) 
      for idea in ideas])
  
  # Get Prompts
  prompts = db.get_data("prompts", ['_id', 'question', 'title'])
  prompt_dict = dict(
          [
            (prompt['_id'], 
            {'question': prompt['question'], 'title': prompt['title']}) 
            for prompt in prompts
          ]
      )

  # Join prompt fields to each idea
  idea_join = db.join_data(ideas, prompt_dict, 'promptID', ['title', 'question'])
  
  # Get Inspirations
  inspirations = db.get_data("tasks", ['desc', 'promptID', 'ideaNodeID'])
  # Link Inspriations to prompts
  # print inspirations[1]
  inspirations = db.join_data(
      inspirations, prompt_dict, 'promptID', ['title', 'question'])
  # print inspirations[1]

  # Join Ideas to inspirations
  clusterIDs = [insp['ideaNodeID'] for insp in inspirations]
  clusters = db.get_data("clusters", 
      ['_id', 'ideaIDs'],
      {'_id': {'$in': clusterIDs}})
  # print clusters 
  cluster_dict = dict([(cluster['_id'], cluster['ideaIDs']) 
      for cluster in clusters])
  for insp in inspirations:
    insp['ideas'] = [ ]
    insp['ideaIDs'] = cluster_dict[insp['ideaNodeID']]
    for ideaID in cluster_dict[insp['ideaNodeID']]:
      insp['ideas'].append(idea_dict[ideaID]['content'])
 
  # Write ideas to file 
  idea_path = os.path.join(db.path, "ideas.csv")
  raw_ideas = [(idea['content'], idea['title'], idea['question'])
      for idea in ideas]
  file_manager.data_to_csv(raw_ideas, idea_path)

  # Write inspirations to file 
  insp_path = os.path.join(db.path, "inspirations.csv")
  raw_insps = []
  for insp in inspirations:
      raw = [insp['title'], insp['question'], insp['desc']]
      raw.extend(insp['ideas'])
      raw_insps.append(raw)
  file_manager.data_to_csv(raw_insps, insp_path)


if __name__ == '__main__':
  get_amd_data(sys.argv[1:])
  
