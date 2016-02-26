"use strict";
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
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
} from './reducers/repo'

const waltzApp = combineReducers({
  active_repo: activeRepo,
  repos,
});

// "Store"
// What holds the state
let store = createStore(waltzApp, {
  active_repo: null,
  repos: [
    {
      user: 'username',
      repo: 'reponame',
      is_pending: false,
      is_private: false,
      has_timecard: false,
      owner_type: 'user',
    },
    {
      user: 'iamagroup',
      repo: 'reporedux',
      is_pending: false,
      is_private: false,
      has_timecard: false,
      owner_type: 'group',
    },
    {
      user: 'iamagroup',
      repo: 'reporedux',
      is_pending: false,
      is_private: true,
      has_timecard: false,
      owner_type: 'group',
    }
  ],
});
let unsubscribe = store.subscribe(() =>
  console.log(store.getState())
)
store.dispatch(selectRepo(1))

// React stuff
const Repos = ({repos}) => {
  return <ul className="repos repos-list">
    {repos.map((repo, ct) => {
      return <Repo repo={repo} key={ct} />;
    })}
  </ul>;
}

const Repo = ({repo}) => {
  return <li className={`
    repo
    ${repo.is_private ? "repo-private" : "repo-public"}
    repo-owner-${repo.owner_type}
    ${repo.has_timecard ? "repo-timecard" : "repo-notimecard"}
  `}>
    <h1>{repo.user}/{repo.repo}</h1>
    <p></p>
  </li>;
};

render(<Repos repos={store.getState().repos}/>, document.getElementById("root"));
