import React from 'react';
import Repo from './repo';
import {connect} from 'react-redux';
import {openRepoImportDialog} from '../actions/repo';
import RepoImport from './repoImport';

export const RepoDetailsComponent = ({
  repo,
  repo_import_dialog_open,
}) => {
  if (repo_import_dialog_open) {
    return <div className="repo-details repo-details-import">
      import new repo
    </div>;
  } else {
    return <div className="repo-details">
      {/* Repo name and readme badge*/}
      <h1>
        {repo.user}/<span className="repo-name">{repo.repo}</span>
        <img className="repo-details-badge" src={`/${repo.user}/${repo.repo}.svg`} />
      </h1>

      {/* embedded invoice */}
      <div className="repo-details-embed-container">
        <iframe className="repo-details-embed" src={`/embed/${repo.user}/${repo.repo}`} />
      </div>
    </div>;
  }
};

const RepoDetails = connect((store, ownProps) => {
  return {
    repo: store.repos[store.active_repo],
    repo_import_dialog_open: store.repo_import_dialog_open,
  };
}, (dispatch, ownProps) => {
  return {};
})(RepoDetailsComponent);

export default RepoDetails;
