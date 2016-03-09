"use strict";

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require("express-session");
const babelify = require("express-babelify-middleware");
const socketIo = require("socket.io");
const passportSocketIo = require("passport.socketio");
const http = require("http");
const session_secret = "keyboard kat";

// routes
const badges = require('./routes/badge');
const repo = require('./routes/repository');
const onSocketAction = require('./routes/socket');

// auth serializer and stratigies
const authStrategy = require("./lib/auth/strategy");
const authSerializer = require("./lib/auth/serialization");

// models
const User = require("./lib/models/user");

// monsooe, passport, and the app
const app = express();
const passport = require("passport");
const mongoose = require("mongoose");
mongoose.connect("mongodb://clock:clock@ds011278.mongolab.com:11278/clock-server");

// set up the mongodb session store
const MongoStore = require('connect-mongo')(session),
      mongoStore = new MongoStore({mongooseConnection: mongoose.connection});

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
app.use(session({
  secret: session_secret,
  store: mongoStore,
}));
app.use(passport.initialize());
app.use(passport.session());

authSerializer(passport); // attaches passport.serializeUser and passport.deserializeUser
passport.use(authStrategy);

// ----------------------------------------------------------------------------
// the "content routes"
// ------------------------------------------------------------------------------
if (process.env.NODE_ENV === "production") {
  console.log("We're in production!");

  // and app requests resolve to the home page
  app.get(/^\/app\/.*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app', 'index.bundle.html'));
  });
} else {
  // serve react / redux frontend compiled on the fly in dev
  app.use('/bundle', babelify('public/js/react', {}, {
    sourceMap: true,
    presets: ['react', 'es2015'],
  }));

  // serve anything that is a url for the app to the root of the app
  app.get(/^\/app\/.+/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app', 'index.html'));
  });
}

// other than the above, serve static assets.
app.use(express.static(path.join(__dirname, 'public')));


// ----------------------------------------------------------------------------
// passport auth routes
// ------------------------------------------------------------------------------

app.get('/login', (req, res) => res.redirect('/auth/github'));

app.get('/auth/github', passport.authenticate('github', {
  scope: [ 'user', 'repo']
}));

app.get('/auth/github/callback', passport.authenticate(
  'github', { failureRedirect: '/login' }
), (req, res) => res.redirect('/app'));

app.get('/auth/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// ----------------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------------------
app.get('/', repo.index);
app.get('/features', repo.features);
app.get('/:username/:repo.svg', badges.fetchBadge);
app.get('/embed/:username/:repo/:ref?', repo.getRepo, repo.doReport);
app.get('/:username/:repo', repo.getRepo, (req, res) => {
  res.redirect(`/app/${req.params.username}/${req.params.repo}`);
});

/// error handlers

// development error handler
// will print stacktrace

// production error handler
// no stacktraces leaked to user
if (process.env.NODE_ENV === "production") {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
      title: 'error'
    });
  });
} else {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      title: 'error'
    });
  });
}

// ----------------------------------------------------------------------------
// socket.io stuff
// ------------------------------------------------------------------------------
const boundApp = http.createServer(app),
      io = socketIo.listen(boundApp);

let socketMiddleware = passportSocketIo.authorize({
  cookieParser: cookieParser,
  key:         'connect.sid',
  secret:      session_secret,
  store:       mongoStore,
  fail: (data, message, error, accept) => {
    if (data.user && data.user.logged_in === false) {
      // user needs to login
      accept(new Error("User not authorized."));
    } else {
      console.error("Passport connection failed:", message);
      accept(new Error("Unexpected error."));
    }
  },
});
io.use(socketMiddleware);

io.on('connection', function(socket) {
  console.log("Connected to new client.", socket.request.user);

  // first, initialize the state so we're all on the same page
  socket.emit("action", {
    type: "server/INIT",
    repos: socket.request.user.repos,
    active_repo: null,
    user: User.sanitize(socket.request.user),
  });

  socket.on('action', onSocketAction(socket));
});
module.exports = boundApp;
