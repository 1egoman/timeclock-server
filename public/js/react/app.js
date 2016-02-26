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
      desc: 'I am a repo descritpion',
      is_pending: false,
      is_private: false,
      has_timecard: false,
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
  console.log(store.getState())
)

// React stuff
const Repos = ({repos, active_repo}) => {
  return <ul className="repos repos-list">
    {repos.map((repo, ct) => {
      return <Repo
        repo={repo}
        key={ct}
        index={ct}
        selected={active_repo === ct}
      />;
    })}
  </ul>;
}
const RepoComponent = ({repo, index, selected}) => {
  // the component render
  return <li className={`
    repo
    ${repo.is_private ? "repo-private" : "repo-public"}
    repo-owner-${repo.owner_type}
    ${repo.has_timecard ? "repo-timecard" : "repo-notimecard"}
    ${selected ? "repo-selected" : "repo-inactive"}
  `}
  onClick={store.dispatch.bind(store, selectRepo(index))}
  >
    <h1>
      <span className="repo-lock fa fa-lock"></span>
      {repo.user}/<span className="repo-name">{repo.repo}</span>
    </h1>
    <p>{repo.desc}</p>
  </li>;
};

const Repo = connect((store, ownProps) => {
  // given the store and the props passed to the component, return a new set of
  // props
  return {
    repo: store.repos[ownProps.index],
    index: ownProps.index,
    selected: ownProps.index === store.active_repo,
  };
}, (dispatch, ownProps) => {
  // props that are defined as functions
  return {
    onClick() {
      dispatch(selectRepo(ownProps.index));
    },
  }
})(RepoComponent);

render(<Provider store={store}>
  <Repos
    repos={store.getState().repos}
    active_repo={store.getState().active_repo}
  />
</Provider>, document.getElementById("root"));
