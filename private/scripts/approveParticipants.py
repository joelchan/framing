import mongohq
import mturk
import pymongo, json
from pymongo.errors import DuplicateKeyError
import pandas as pd
from os import mkdir, listdir, path
from datetime import datetime
import dateutil.parser
from ideagens import Db_Manager


priming_exp = {'desc': "rare vs common individual brainstorming",
                "hit_id": '3ZURAPD288NJZ4HUTVEJXT1RKF51F5'
              }

m = mturk.MechanicalTurk()


def get_balance():
  # Confirms Mturk connection is valid
  r = m.request("GetAccountBalance")
  if r.valid:
    print r.get_response_element("AvailableBalance")
  else:
    print "Error getting available balance"

  
def get_hits(hit_id):
  # Get all submitted assignments for the hit
  r = m.request("GetAssignmentsForHIT",
      {"HITId": hit_id}
      )

  if r.valid:
      print r.get_response_element("assignment")
  else:
      print "failed to get assignments for HIT: " + hit_id


if __name__ == '__main__':
  db_params = mongohq.ideagenstest 
  db = Db_Manager(db_params)
  get_balance()


