import React from 'react';
import Repo from './repo';
import {connect} from 'react-redux';
import {requestAllUserRepos} from '../actions/repo';

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

  return <ul className="repos repos-list">
    <div className="repos-controls">
      <h4 className="repos-label">Repositories</h4>
      {import_button}
    </div>
    {repos.map((repo, ct) => {
      return <Repo
        repo={repo}
        key={ct}
        index={ct}
        selected={active_repo === ct}
      />;
    })}
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
        dispatch(requestAllUserRepos());
      };
    },
  };
})(RepoListComponent);

export default RepoList;
