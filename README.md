# CrowdIdeation
=============
Explores group/crowd Ideation


# Dependencies
=============
Node.js
Meteor 0.8
moment
fontawesome4
pince



# Install directions
=====================
1. Install Node.js
2. Install npm (node package manager)
3. Install Meteor curl https://install.meteor.com | /bin/sh
4. Clone git repo
5. Run app as below

# Run Directions
===================
To run locally, just enter the root git directory and execute using
run shell script.  

```
> cd CrowdIdeation
> ./run.sh
```
Alternatively you may also have success using the simple meteor command
```
> cd CrowdIdeation
> meteor 
```

# Heroku directions
===================
To setup this project within your own heroku account, you'll need
an external db such as those supplied by compose.io and have setup
a db along with a user for that db.

1. Install the heroku toolbelt (https://toolbelt.heroku.com)
2. Setup the heroku app with environment variables
```
> heroku login 
> heroku create <app-name> --stack cedar --buildpack https://github.com/djhi/heroku-buildpack-meteorite 
> heroku create <app-name> --stack cedar --buildpack https://github.com/AdmitHub/meteor-buildpack-horse.git#mongohq
> heroku config:set --app <app-name> MONGO_URL=mongodb://<mongo-user:<pswd@<url_to_mongodb>:<mongodb_port>/<remainder_of_url>
> heroku config:set --app <app_name> ROOT_URL=http://<app_name>.herokuapp.com
```
3. From within the CrowdIdeation project, add the git repo provided by heroku for your app
```
> git remote add heroku git@heroku.com:<app_name>.git
> git push heroku master
```
4. Start the app
```
> heroku logs --app <app_name>
```


