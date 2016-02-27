import React from 'react';
import {connect} from 'react-redux';
import {selectRepo} from '../actions/repo';

export const RepoComponent = ({repo, index, selected, onRepoClick, children}) => {
  // the component render
  return <li className={`
    repo
    ${repo.is_private ? "repo-private" : "repo-public"}
    repo-owner-${repo.owner_type}
    ${repo.has_timecard ? "repo-timecard" : "repo-notimecard"}
    ${selected ? "repo-selected" : "repo-inactive"}
  `} onClick={onRepoClick}>
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
    selected: ownProps.index === store.active_repo,
    children: ownProps.children,
  };
}, (dispatch, ownProps) => {
  // props that are defined as functions
  return {
    onRepoClick() {
      dispatch(selectRepo(ownProps.index));
    },
  }
})(RepoComponent);

export default Repo;
