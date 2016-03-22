import React from 'react';
import {connect} from 'react-redux';
import {OverlayTrigger, Popover} from 'react-bootstrap';

export function RepoCommitNode({
  commit: {
    message,
    committer,
    sha,
    when,
    length,
  },
}) {
  let tooltip = <Popover
    id={`${message} by ${committer.username}`}
  >
    <img className="repo-commit-node-avatar" src={committer.avatar} />
    <span className="repo-commit-node-content">
      <span className="repo-commit-node-message">{message}</span>
      <span className="repo-commit-node-author">by {committer.username}</span>
    </span>
  </Popover>
  return <OverlayTrigger trigger="click" rootClose placement="left" overlay={tooltip}>
    <span
      className="repo-commit-node-handle"
      style={{height: `${length}px`}}
    ></span>
  </OverlayTrigger>;
}

export function repoCommitsComponent({
  user,
  repoDetails,
}) {
  let commits;
  if (user && repoDetails && repoDetails.commits) {
    commits = repoDetails.commits.map((c, ct) => {
      return <RepoCommitNode key={ct} commit={c} />;
    });
  }
  return <div className="repo-commits">{commits}</div>;
}

export function mapStateToProps(store, props) {
  return {
    user: store.user,
    repoDetails: store.repo_details,
  };
};

const repoCommits = connect(mapStateToProps, (dispatch, props) => {
  return {};
})(repoCommitsComponent);

export default repoCommits;
