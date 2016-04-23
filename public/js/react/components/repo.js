import React from 'react';
import {connect} from 'react-redux';
import {
  selectRepo,
  getBranches,
  getTimecard,
  getCommits,
  changeBranch,
  initializeRepo,
} from '../actions/repo';
import { browserHistory } from 'react-router';
import { getRepoByIndex } from '../helpers/get_repo';
import RepoSummary from './repoSummary/repoSummary';

export const RepoComponent = ({repo, index, selected, onRepoClick, children}) => {
  // the component render
  if (repo) {
    return <div className={`
      repo
      ${repo.is_private ? "repo-private" : "repo-public"}
      repo-owner-${repo.owner_type}
      ${repo.has_timecard ? "repo-timecard" : "repo-notimecard"}
    `}>
      <span className="repo-text-container" onClick={onRepoClick ? onRepoClick(repo) : f => f}>
        {/* Repo name */}
        <h1>
          {repo.user}/<span className="repo-name">{repo.repo}</span>

          {/* Private Repo badge */}
          <span
            className="repo-lock fa fa-lock"
            title="Private repo"
          ></span>
        </h1>
        <p>{repo.desc}</p>
      </span>

      {/* quick summary - client name and color */}
      {repo.has_timecard ?
        <div className="repo-quick-summary-container" style={{backgroundColor: repo.primary_color}}>
          {repo.client_name}
        </div>
      : null}

      {children}
    </div>;
  } else {
    return null;
  }
};

const Repo = connect((store, ownProps) => {
  return {
    repo: store.repos[ownProps.index],
    index: ownProps.index,
    selected: ownProps.selected,
    children: ownProps.children,
  };
}, (dispatch, ownProps) => {
  // props that are defined as functions
  return {
    onRepoClick(repo) {
      return () => {
        dispatch(selectRepo(repo)); // select a new repo
        // dispatch(initializeRepo(repo.user, repo.repo)); // do a full special reinit
        // dispatch(changeBranch(repo.default_branch || "master")); 
        // dispatch(getBranches(repo)); // also, pull in the branch data for this new repo 
        // dispatch(getCommits(repo)); // get commits for the repo and branch
        // dispatch(getTimecard(repo)); // lastly, pull in the timecard data too
        browserHistory.push(`/app/${repo.user}/${repo.repo}`); // change the router to reflect the change
      }
    },
  }
})(RepoComponent);

export default Repo;
