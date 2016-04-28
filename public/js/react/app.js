"use strict";
import React from 'react';
import { render } from 'react-dom';
import { Provider, connect } from 'react-redux';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import {reducer as formReducer} from 'redux-form';
import {
  repoView,
  listView,
  importView,
  settingsView,
  notFoundRoute,
} from './router';
import InstallClientHelp from './components/installClientHelp';
import ErrorModal from './components/errorModal';

// enable bootstrap popovers and tooltips
$(document).ready(function() {
  $('body').tooltip({ selector: '[data-toggle="tooltip"]' });
  $('body').popover({ selector: '[data-toggle="popover"]' });

  $("body").on("click", ".repo-details-report-link-box", function() {
    $(this).select();
  });
});

// init socket.io. On connection, send the current path so we can init the view
// with the expected data.
import io from 'socket.io-client';
import createSocketIoMiddleware from 'redux-socket.io';
const socket = io();
socket.on("connect", function() {
  socket.emit("ready", {path: location.pathname});
});

// socket.io middleware to proxy redux events prefixed with 'server/' back to
// the serverside
let socketIoMiddleware = createSocketIoMiddleware(socket, (type) => {
  return (
    type.indexOf("server/") === 0 || // events prefixed with "server/"
    type === "@@router/LOCATION_CHANGE" // let the backend know on route changes
  );
});

socket.on("error", (message) => {
  if (message === "User not authorized.") {
    location.href = "/login"; // login if not authorized
  };
});

// "Reducers"
// Take the previous state and an action, and return a new state.
import {
  repos,
  activeRepo,
  repoImportDialogOpen,
  discoveredRepos,
  discoveredReposPage,
  discoveredRepoNewTimecard,
  repoDetails,
  newTimecardData,
  helpInstallingClient,
} from './reducers/repo';
import { user } from './reducers/user';
import { error } from './reducers/error';

const waltzApp = combineReducers({
  repo_import_dialog_open: repoImportDialogOpen,
  active_repo: activeRepo,
  repos,
  user,

  discovered_repos: discoveredRepos,
  discovered_repos_page: discoveredReposPage,
  discovered_repo_new_timecard: discoveredRepoNewTimecard,

  repo_details: repoDetails,
  routing: routerReducer,
  new_timecard_staging: newTimecardData,
  client_help_dialog: helpInstallingClient,
  error,
  form: formReducer,
});

// "Store"
// What holds the state
let waltzCreateStore = compose(
  applyMiddleware(socketIoMiddleware),
  window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore);
let store = waltzCreateStore(waltzApp, {
  active_repo: null,
  repo_import_dialog_open: false,
  repos: [],
  discovered_repos: [],
  discovered_repo_new_timecard: false,
  repo_details: {
    branch: null,
    branches: null,
    timecard: null,
    _comesfrom: [null, null], // the source of the timecard by default is nowhere.
  },
});
if (window.devToolsExtension) { window.store = store; }


// router redux history syncer
const history = syncHistoryWithStore(browserHistory, store);
render(<Provider store={store}>
  <div>

    {/* a few always-persistant modals */}
    <ErrorModal />
    <InstallClientHelp />

    <Router history={history}>
      <Route path="/app/" component={listView} />
      <Route path="/app/import" component={importView} />
      <Route path="/app/:user/:repo" component={repoView()} />
      <Route path="/app/:user/:repo/metrics" component={repoView("commits")} />
      <Route path="/app/:user/:repo/times" component={repoView("times")} />
      <Route path="/app/:user/:repo/settings" component={repoView("settings")} />

      <Route path="/app/settings" component={settingsView} />
      <Route path="*" component={notFoundRoute} />
    </Router>
  </div>
</Provider>, document.getElementById("root"));
