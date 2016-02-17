"use strict";

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require("express-session");

const routes = require('./routes/index');
const users = require('./routes/user');
const repo = require('./routes/repository');

const app = express();

const passport = require("passport");
const GithubStrategy = require("passport-github2");

const mongoose = require("mongoose");
mongoose.connect("mongodb://clock:clock@ds011278.mongolab.com:11278/clock-server");
const User = require("./lib/models/user");

const env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ----------------------------------------------------------------------------
// middleware
// ------------------------------------------------------------------------------
// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());


// ----------------------------------------------------------------------------
// passport auth routes
// ------------------------------------------------------------------------------
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// github strategy
passport.use(new GithubStrategy({
    clientID: "4cee013f4f8ff83a2930",
    clientSecret: "a46f06736c59fcaedf9ff846bbbcccf3bca3e0e1",
    callbackURL: "http://127.0.0.1:8000/auth/github/callback"
}, function(access_token, refresh_token, profile, done) {
  let user = {
    github_id: profile.id,
    access_token: access_token,
    refresh_token: refresh_token,
  };

  User.findOne({github_id: profile.id}, (err, existing_user) => {
    if (err) {
      return done(err);
    } else if (existing_user) {
      return done(null, existing_user);
    } else {
      (new User(user)).save((err, new_user) => {
        return done(err, new_user);
      });
    }
  });
}));

app.get('/auth/github', passport.authenticate('github', {
  scope: [ 'user', 'repo']
}));

app.get('/auth/github/callback', passport.authenticate(
  'github', { failureRedirect: '/login' }
), (req, res) => res.redirect('/'));


app.use('/users', users);
repo(app);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace

// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: err,
//       title: 'error'
//     });
//   });
// }

// production error handler
// no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   res.render('error', {
//     message: err.message,
//     error: {},
//     title: 'error'
//   });
// });


module.exports = app;
