import React from 'react';
import { connect } from 'react-redux';

export default ({
  timecard,
  repo,
  color,
}) => {
  return <div className="repo-summary">
    <div className="repo-summary-client-info">
      <h1>John Smith</h1>
      <small>
        <span className="repo-summary-balance">$50.00</span>
      </small>
    </div>
    <div className="repo-summary-committer-info" style={{backgroundColor: color}}>
      <img src="https://avatars3.githubusercontent.com/u/1704236?v=3&s=40" />
      <h2>Username</h2>
      <small>1:00pm - 10:00pm</small>
    </div>
    <div className="repo-summary-graph">
      <div className="repo-summary-no-graph">
        No graph
      </div>
    </div>
  </div>;
};
