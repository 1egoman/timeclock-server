#!/bin/bash
git push heroku master
heroku run "npm i -g node-sass browserify uglifyjs && bash ./scripts/build.sh" # compile assets
heroku restart
echo "deployed!"
