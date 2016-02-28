"use strict";
import React from 'react';
import { render } from 'react-dom';
import { Provider, connect } from 'react-redux';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';

// enable bootstrap popovers and tooltips
$(document).ready(function() {
  $('body').tooltip({ selector: '[data-toggle="tooltip"]' });
  $('body').popover({ selector: '[data-toggle="popover"]' });

  $("body").on("click", ".repo-details-report-link-box", function() {
    $(this).select();
  });
});

// socket.io middleware to proxy redux events prefixed with 'server/' back to
// the serverside
import io from 'socket.io-client';
import createSocketIoMiddleware from 'redux-socket.io';
const socket = io();
let socketIoMiddleware = createSocketIoMiddleware(socket, "server/");

// "Action constructors"
// Given data, construct an action to be fed into the store
import {
  importFromGithubRepo,
  selectRepo,
} from './actions/repo';

// "Reducers"
// Take the previous state and an action, and return a new state.
import {
  repos,
  activeRepo,
  repoImportDialogOpen,
  discoveredRepos,
  repoDetails,
} from './reducers/repo';

// "Components"
import RepoList from './components/repoList';
import RepoDetails from './components/repoDetails';
import Nav from './components/nav';

const waltzApp = combineReducers({
  repo_import_dialog_open: repoImportDialogOpen,
  active_repo: activeRepo,
  repos,
  discovered_repos: discoveredRepos,
  repo_details: repoDetails,
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
});

render(<Provider store={store}>
  <div>
    <Nav />
    <div className="col-md-4 col-lg-3">
      <RepoList />
    </div>
    <div className="col-md-8 col-lg-9">
      <RepoDetails />
    </div>
  </div>
</Provider>, document.getElementById("root"));
