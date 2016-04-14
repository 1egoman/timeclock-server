import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

// get the most frequemt committer for a repo
export function getLastCommitter(timecard) {
  if (timecard && timecard.card && timecard.card.length) {
    let card = _.last(timecard.card), time;
    if (time = _.last(card.times)) {
      return time;
    } else {
      return "No committer";
    }
  } else {
    return "No committer";
  }
}

export default ({
  timecard,
  repo,
  color,
  light,
}) => {
  let lastCommitter = getLastCommitter(timecard);
  return <div className={`repo-summary ${light ? 'repo-summary-light' : ''}`}>
    <div className="repo-summary-client-info">
      <h1>John Smith</h1>
      <small>
        <span className="repo-summary-balance">$50.00</span>
      </small>
    </div>
    <div className="repo-summary-committer-info" style={{backgroundColor: color}}>
      <img src="https://avatars3.githubusercontent.com/u/1704236?v=3&s=40" />
      <h2>{lastCommitter.by || "No last committer"}</h2>
      <small>{lastCommitter.start} - {lastCommitter.end}</small>
    </div>
    <div className="repo-summary-graph">
      <div className="repo-summary-no-graph">
        No graph
      </div>
    </div>
  </div>;
};
