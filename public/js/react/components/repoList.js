import React from 'react';
import Repo from './repo';
import {connect} from 'react-redux';
import {openRepoImportDialog} from '../actions/repo';

export const RepoListComponent = ({
  repos,
  active_repo,
  importNewRepo,
}) => {
  return <ul className="repos repos-list">
    <div className="repos-controls">
      <button
        className="btn btn-sm btn-primary pull-right"
        onClick={importNewRepo}
      >Import a new repository</button>
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
  };
}, (dispatch, ownProps) => {
  return {
    importNewRepo() {
      dispatch(openRepoImportDialog(true));
    },
  };
})(RepoListComponent);

export default RepoList;
