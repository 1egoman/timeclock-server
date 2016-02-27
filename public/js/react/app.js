"use strict";
import React from 'react';
import { render } from 'react-dom';
import { Provider, connect } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';

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
} from './reducers/repo';

// "Components"
import RepoList from './components/repoList';
import RepoDetails from './components/repoDetails';

const waltzApp = combineReducers({
  repo_import_dialog_open: repoImportDialogOpen,
  active_repo: activeRepo,
  repos,
  discovered_repos: discoveredRepos,
});

// "Store"
// What holds the state
let store = createStore(waltzApp, {
  active_repo: null,
  repo_import_dialog_open: false,
  repos: [],
  discovered_repos: [
    {user: "username", repo: "iamaddable", desc: "A repo description"}
  ],
}, applyMiddleware(socketIoMiddleware));
let unsubscribe = store.subscribe(() =>
  console.log("STORE UPDATE", store.getState())
)

render(<Provider store={store}>
  <div>
    <div className="col-md-4">
      <RepoList />
    </div>
    <div className="col-md-8">
      <RepoDetails />
    </div>
  </div>
</Provider>, document.getElementById("root"));
