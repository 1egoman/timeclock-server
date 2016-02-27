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

const badges = require('./routes/badge');
const repo = require('./routes/repository');

const authStrategy = require("./lib/auth/strategy");
const authSerializer = require("./lib/auth/serialization");

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
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: session_secret,
  store: mongoStore,
}));
app.use(passport.initialize());
app.use(passport.session());

authSerializer(passport); // attaches passport.serializeUser and passport.deserializeUser
passport.use(authStrategy);

// serve react / redux frontend
app.use('/bundle', babelify('public/js/react', {}, {
  sourceMap: true,
  presets: ['react', 'es2015'],
}))

// ----------------------------------------------------------------------------
// passport auth routes
// ------------------------------------------------------------------------------

app.get('/auth/github', passport.authenticate('github', {
  scope: [ 'user', 'repo']
}));

app.get('/auth/github/callback', passport.authenticate(
  'github', { failureRedirect: '/login' }
), (req, res) => res.redirect('/'));

app.get('/auth/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// ----------------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------------------
app.get('/', repo.index);
app.get('/:username/:repo.svg', badges.fetchBadge);
app.get('/embed/:username/:repo/:ref?', repo.getRepo, repo.doReport);
app.get('/:username/:repo/:ref?', repo.getRepo, repo.renderReportTemplate);

// catch 404 and forward to error handler
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
});
io.use(socketMiddleware);

io.on('connection', function (socket) {
  console.log("Connected to new client.", socket.request.user);

  // first, initialize the state so we're all on the same page
  socket.emit("action", {
    type: "server/INIT",
    repos: socket.request.user.repos,
    active_repo: null,
  });

  socket.on('action', (action) => {

    // discover all repos
    if (action.type === 'server/DISCOVER_REPOS') {
      console.log("Discover repos!");
      socket.emit("action", {
        type: "server/REPOS_DISCOVERED",
        repos: [{
          user: "iambeing",
          repo: "discovered",
          is_pending: false,
          is_private: false,
          has_timecard: true,
          owner_type: "user",
        }]
      });
    } else if (action.type === 'server/IMPORT_REPO') {
      console.log("Import a repo!");
      socket.emit("action", {
        type: "server/PUT_REPO",
        repo: action.repo,
      });
      socket.emit("action", {
        type: "server/REPO_IMPORT",
        repo: action.repo,
      });
    }
  });
});
module.exports = boundApp;
