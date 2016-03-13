#!/bin/bash
if [ $NODE_ENV == production ]; then
  npm install -g node-sass browserify uglifyjs
  bash ./scripts/build.sh # compile assets
  echo "Assets compiled ad /public/css/style.css and /public/bundle.js"
fi
