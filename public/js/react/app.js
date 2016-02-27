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
} from './reducers/repo';

import RepoList from './components/repoList';

const waltzApp = combineReducers({
  active_repo: activeRepo,
  repos,
  repo_import_dialog_open: repoImportDialogOpen,
});

// "Store"
// What holds the state
let store = createStore(waltzApp, {
  active_repo: null,
  repo_import_dialog_open: false,
  repos: [
    {
      user: 'username',
      repo: 'reponame',
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
});
let unsubscribe = store.subscribe(() =>
  console.log("STORE UPDATE", store.getState())
)

render(<Provider store={store}>
  <RepoList />
</Provider>, document.getElementById("root"));
