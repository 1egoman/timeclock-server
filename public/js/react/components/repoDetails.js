import React from 'react';
import Repo from './repo';
import {connect} from 'react-redux';
import {openRepoImportDialog} from '../actions/repo';

export const RepoDetailsComponent = ({
  repo,
}) => {
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
};

const RepoDetails = connect((store, ownProps) => {
  return {
    repo: store.repos[store.active_repo],
  };
}, (dispatch, ownProps) => {
  return {};
})(RepoDetailsComponent);

export default RepoDetails;
