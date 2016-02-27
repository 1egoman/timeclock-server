"use strict";
import React from 'react';
import { render } from 'react-dom';
import { Provider, connect } from 'react-redux';
import {
  createStore,
  combineReducers,
} from 'redux';

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
import RepoImport from './components/repoImport';
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
  active_repo: 0,
  repo_import_dialog_open: false,
  repos: [
    {
      user: '1egoman',
      repo: 'clockmaker',
      desc: 'I am a repo descritpion',
      is_pending: false,
      is_private: false,
      has_timecard: true,
      owner_type: 'user',
    },
    {
      user: 'iamagroup',
      repo: 'reporedux',
      desc: 'I am a repo descritpion',
      is_pending: false,
      is_private: false,
      has_timecard: false,
      owner_type: 'group',
    },
    {
      user: 'iamagroup',
      repo: 'reporedux',
      desc: 'I am a repo descritpion',
      is_pending: false,
      is_private: true,
      has_timecard: false,
      owner_type: 'group',
    }
  ],
  discovered_repos: [
    {user: "username", repo: "iamaddable", desc: "A repo description"}
  ],
});
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
