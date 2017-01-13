#!/usr/bin/env python

# Author: Steven Dang stevencdang.com

########## MongoHQ databases ##############
# Need to modify this so that the user and password are stored separately
ideagenstest = {'url': "kahana.mongohq.com",
                'port': 10056,
                'dbName': 'IdeaGensTest',
                'user': 'sandbox',
                'pswd': 'protolab1'
                }
# user and paswd are incorrect (do not want to commit secure info
ideagensscd = {'url': "ds045031.mongolab.com",
            'port': 45031,
            'dbName': 'ideagensscd',
            'user': 'heroku',
            'pswd': 'j4!g#RV$nAr5&FBq$BK$',
            }

ideagens = {'url': "kahana.mongohq.com",
            'port': 10075,
            'dbName': 'IdeaGens',
            'user': 'experimenter',
            'pswd': '1#dJ3VYSf8Sn5iE9'
            }

chi1 = {'url': "kahana.mongohq.com",
        'port': 10010,
        'dbName': 'CHI1',
        'user': 'proto1',
        'pswd': 'lTwI9iiTm7'
        }

fac_exp = {'url': "ds043981.mongolab.com",
        'port': 43981,
        'dbName': 'joelcprotolab',
        'user': 'joelc',
        'pswd': 'lnC00K=beta{5}'
        }

humandatabank = {'url': "ds041327.mongolab.com",
               'port': 41327,
               'dbName': 'human_data_bank',
               'user': 'heroku',
               'pswd': 'j4!g#RV$nAr5&FBq$BK$',
               }

synth_exp = {'url': "ds033097.mongolab.com",
        'port': 33097,
        'dbName': 'joelc-ideagens2',
        'user': 'joelc',
        'pswd': 'lnC00K=beta{5}'
        }

kalign = {'url': "ds055535.mlab.com",
          'port': 55535,
          'dbName': 'kalign',
          'user': 'joelc',
          'pswd': 'lnC00K=beta{5}'
        }

# Info for connecting to a local instance of meteor's mongo.
# Meteor must be running to connect
local_meteor = {'url': "localhost",
                'port': 3001,
                'dbName': 'meteor',
                'user': '',
                'pswd': '',
}

ALL_DBs = {'ideagens': ideagens,
             'ideagenstest': ideagenstest,
             'chi1': chi1,
             'fac_exp': fac_exp,
             'local': local_meteor,
             'ideagensscd': ideagensscd,
             'synth_exp': synth_exp,
             'kalign': kalign,
             'local_meteor': local_meteor,
          }

