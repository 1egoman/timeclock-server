import React from 'react';
import {connect} from 'react-redux';
import {OverlayTrigger, Popover} from 'react-bootstrap';
import _ from 'underscore';

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
  let tooltip = <Popover
    id={`${message} by ${committer.username}`}
  >
    <img className="repo-commit-node-avatar" src={committer.avatar} />
    <span className="repo-commit-node-content">
      <span className="repo-commit-node-message">{message}</span>
      <span className="repo-commit-node-author">by {committer.username}</span>
    </span>
  </Popover>;
  return <OverlayTrigger trigger="click" rootClose placement="left" overlay={tooltip}>
    <span
      className={`
        repo-commit-node-handle
        repo-commit-node-type-${getRepoCommitNodeType(message) || 'none'}
        ${breakInside ? 'repo-commit-node-should-break' : ''}
      `.split('\n').join(' ')}
      style={{height: `${length}px`}}
    >
      {breakInside ? <span className="repo-commit-node-break"></span> : null}
    </span>
  </OverlayTrigger>;
}

// given a list of commits, reduce their length to be reletively small ratios of
// each other
function reduceLengthOfCommits(commits, maxBlockHeight=1000) {
  let maxLength = _.max(commits.map((i) => i.length));
  return commits.map((i) => {
    let length = i.length / maxLength * maxBlockHeight,
        breakInside = length > (maxBlockHeight / 6);
    return Object.assign(i, {
      length: breakInside ? null : length,
      breakInside,
    });
  });
}

export function repoCommitsComponent({
  user,
  repoDetails,
}) {
  let commits;
  if (user && repoDetails && repoDetails.commits) {

    // for each commit, calculate its length by subtracting the previous
    // commit's time from the current commit's time.
    commits = repoDetails.commits.reduce((acc, i, ct) => {
      let commitLength = 0;
      if (acc.length === 0) {
        commitLength = 100; // this will be a constant to never change
      } else {
        let last = _.last(acc);
        commitLength = new Date(last.when).getTime() - new Date(i.when).getTime();
      }

      // add our new commit that has a length
      acc.push(Object.assign({}, i, {
        length: commitLength, // will change, the ratio of this block to the rest of them
        timeLength: commitLength, // won't change, is an absolute length in time
      }));
      return acc;
    }, []);

    // minimize the lengths of each timeblock
    commits = reduceLengthOfCommits(commits);
    
    commits = commits.map((i, ct) => {
      return <RepoCommitNode key={ct} commit={i} />
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
