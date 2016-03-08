#!/bin/bash
git push heroku master
heroku run "bash ./scripts/build.sh" # compile assets
heroku restart
echo "deployed!"
