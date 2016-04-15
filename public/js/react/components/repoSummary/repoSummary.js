import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import Loading from '../loading';
import {
  formatTime,
  getAvatarFor,
} from '../../helpers/timecard';

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

export const repoSummaryComponent = ({
  timecard,
  repo,
  color,
  light,

  users,
}) => {
  if (timecard) {
    let lastCommitter = getLastCommitter(timecard);
    return <div className={`repo-summary ${light ? 'repo-summary-light' : ''}`}>
      <div className="repo-summary-client-info">
        <h1>John Smith</h1>
        <small>
          <span className="repo-summary-balance">$50.00</span>
        </small>
      </div>
      <div className="repo-summary-committer-info" style={{backgroundColor: color}}>
        {getAvatarFor(users, lastCommitter.by).avatar_img}
        <h2>{lastCommitter.by || "No last committer"}</h2>
        <small>
          <span className="start-time">
            {formatTime(lastCommitter.start, undefined, "%I:%M %P")}
          </span>
          {formatTime(lastCommitter.end, undefined, "%I:%M %P")}
        </small>
      </div>
      <div className="repo-summary-graph">
        <div className="repo-summary-no-graph">
          No graph
        </div>
      </div>
    </div>;
  } else {
    return <div className={`repo-summary ${light ? 'repo-summary-light' : ''}`}>
      <div className="repo-summary-client-info">
        <h1>Loading client...</h1>
      </div>
      <div className="repo-summary-committer-info" style={{backgroundColor: color}}>
        <h2>Loading contributor...</h2>
      </div>
      <div className="repo-summary-graph">
        <div className="repo-summary-no-graph">
          No graph
        </div>
      </div>
    </div>;
  }
};

const repoSummary = connect((state, props) => {
  return Object.assign({}, props, {
    users: state.repo_details && state.repo_details.users,
  });
}, (dispatch, props) => {
  return {};
})(repoSummaryComponent);
export default repoSummary;
