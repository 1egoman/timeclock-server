#!/bin/bash

# compile sass
node_modules/.bin/node-sass --output-style compressed public/css/style.scss public/css/style.css

# First, transpile all code from s2015 to es5. Then, pipe into browserify to
# resolve all those requires.
browserify public/js/react/app.js -o scripts/bundle.browserify.js -t [ \
  babelify --presets [ es2015 react ] \
]
uglifyjs scripts/bundle.browserify.js -o public/bundle.js
echo "Compiled js. See /public/bundle.js"
