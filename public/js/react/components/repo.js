import React from 'react';
import {connect} from 'react-redux';
import {selectRepo, getBranches, getTimecard, getCommits} from '../actions/repo';
import { browserHistory } from 'react-router';
import { getRepoByIndex } from '../helpers/get_repo';

export const RepoComponent = ({repo, index, selected, onRepoClick, children}) => {
  // the component render
  return <li className={`
    repo
    ${repo.is_private ? "repo-private" : "repo-public"}
    repo-owner-${repo.owner_type}
    ${repo.has_timecard ? "repo-timecard" : "repo-notimecard"}
    ${selected ? "repo-selected" : "repo-inactive"}
  `} onClick={onRepoClick ? onRepoClick(repo) : f => f}>
    <h1>
      {/* Repo name */}
      {repo.user}/<span className="repo-name">{repo.repo}</span>

      {/* Private Repo badge */}
      <span
        className="repo-lock fa fa-lock"
        title="Private repo"
      ></span>
    </h1>
    <p>{repo.desc}</p>

    {children}
  </li>;
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
        dispatch(getBranches(repo)); // also, pull in the branch data for this new repo 
        dispatch(getCommits(repo)); // get commits for the repo
        dispatch(getTimecard(repo)); // lastly, pull in the timecard data too
        browserHistory.push(`/app/${repo.user}/${repo.repo}`); // change the router to reflect the change
      }
    },
  }
})(RepoComponent);

export default Repo;
