import React from 'react';
import {connect} from 'react-redux';
import {importFromGithubRepo} from '../actions/repo';
import {RepoComponent} from './repo';

export const RepoImportComponent = ({repos, pickRepo}) => {
  return <div className="repo-import">
  <h1>Import repo</h1>
    {repos.map((repo, ct) => {
      return <RepoComponent
        repo={repo}
        key={ct}
        onRepoClick={pickRepo(repo)}
      />;
    })}
  </div>;
}

const RepoImport = connect((store, ownProps) => {
  return {
    repos: store.discovered_repos,
  };
}, (dispatch, ownProps) => {
  return {
    pickRepo({user, repo}) {
      return () => {
        // let the backend know we've added a new repo
        dispatch(importFromGithubRepo(user, repo));
      };
    },
  }
})(RepoImportComponent);

export default RepoImport;
