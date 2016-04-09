import React from 'react';
import {connect} from 'react-redux';
import {OverlayTrigger, Popover} from 'react-bootstrap';
import _ from 'underscore';
import {getTimeScaleFactor, calculateLengthForCommits} from '../helpers/timecard';
import {
  calculateAverageCommitTime,
} from "../helpers/stats";

function getRepoCommitNodeType(message) {
  if (message.indexOf("Created timecard for Waltz:") !== -1) {
    return "waltzinit";
  } else if (message.indexOf("Merge") !== -1) {
    return "merge";
  } else {
    return false;
  }
}

export function RepoCommitNode({
  commit: {
    message,
    committer,
    sha,
    when,
    length,
    breakInside,
  },
}) {
  let tooltip = <Popover id={`${message} by ${committer.username}`}>
    <img className="repo-commit-node-avatar" src={committer.avatar} />
    <span className="repo-commit-node-content">
      <span className="repo-commit-node-message">{message}</span>
      <span className="repo-commit-node-author">by {committer.username}</span>
    </span>
  </Popover>;

  // set styles for this commit
  let styles = {};
  if (!breakInside) {
    styles.width = length;
  }

  return <OverlayTrigger trigger="click" rootClose placement="left" overlay={tooltip}>
    <span
      className={`
        repo-commit-node-handle
        repo-commit-node-type-${getRepoCommitNodeType(message) || 'none'}
        ${breakInside ? 'repo-commit-node-should-break' : ''}
      `.split('\n').join(' ')}
      style={styles}
    >
      {breakInside ? <span className="repo-commit-node-break"></span> : null}
    </span>
  </OverlayTrigger>;
}

// given a list of commits, reduce their length to be reletively small ratios of
// each other
function reduceLengthOfCommits(commits, timecard, maxBlockHeight=1000) {
  let scale = getTimeScaleFactor(commits, timecard, maxBlockHeight);
  return commits.map((i) => {
    let length = i.length / scale,
        breakInside = length > (maxBlockHeight / 6);
    return Object.assign({}, i, {
      length,
      breakInside,
    });
  });
}

export function repoCommitsComponent({
  user,
  repoDetails,
  disabled,
}) {
  let commits;

  // graph all commits
  if (user && repoDetails && repoDetails.commits) {
    let scale = calculateLengthForCommits(repoDetails.commits),
        commits = reduceLengthOfCommits(scale, repoDetails.timecard).map((i, ct) => {
          return <RepoCommitNode key={ct} commit={i} />
        });

    let averageCommitLength = calculateAverageCommitTime(repoDetails.commits);
    if (
      repoDetails.timecard &&
      repoDetails.timecard.card &&
      repoDetails.timecard.card.length > 0
    ) {
      console.log("We've got times!");
    }

    // render the component
    return <div className="repo-commits-container">
      <div
        className={`repo-commits ${disabled ? "repo-commits-disabled" : ''}`}
      >{commits}</div>
      {averageCommitLength}
    </div>;
  } else {
    return <div className="repo-commits-container">
      No Commits.
    </div>;
  }
}

export function mapStateToProps(store, props) {
  return {
    user: store.user,
    repoDetails: store.repo_details,
    disabled: props.disabled,
  };
};

const repoCommits = connect(mapStateToProps, (dispatch, props) => {
  return {};
})(repoCommitsComponent);

export default repoCommits;
