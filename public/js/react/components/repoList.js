import React from 'react';
import Repo from './repo';
import {connect} from 'react-redux';
import {requestAllUserRepos} from '../actions/repo';
import { getRepoByIndex, getActiveRepoIndex } from '../helpers/get_repo';

export const RepoListComponent = ({
  repos,
  active_repo,
  is_importing_repo,
  importNewRepo,
}) => {
  // import a new repo
  let import_button;
  if (!is_importing_repo) {
    import_button = <button
      className="btn btn-sm btn-primary pull-right"
      onClick={importNewRepo(true)}
    >Import a new repository</button>
  }

  // the items themselves
  let items;
  if (repos.length) {
    items = repos.map((repo, ct) => {
      return <Repo
      repo={repo}
      key={ct}
      index={ct}
      selected={active_repo && active_repo[0] === repo.user && active_repo[1] === repo.repo}
      />;
    });
  } else {
    items = <div className="repos-empty">
      <h2>No Repositories</h2>
      <p>Why not <span className="click" onClick={importNewRepo(true)}>import a new one?</span></p>
    </div>;
  }

  return <ul className={`repos repos-list ${is_importing_repo ? "repos-disabled" : "repos-enabled"}`}>
    <div className="repos-controls">
      <h4 className="repos-label">Repositories</h4>
      {import_button}
    </div>
    {items}
  </ul>;
};

const RepoList = connect((store, ownProps) => {
  return {
    repos: store.repos,
    active_repo: store.active_repo,
    is_importing_repo: store.repo_import_dialog_open,
  };
}, (dispatch, ownProps) => {
  return {
    importNewRepo(state) {
      return () => {
        dispatch(requestAllUserRepos(0));
      };
    },
  };
})(RepoListComponent);

export default RepoList;
