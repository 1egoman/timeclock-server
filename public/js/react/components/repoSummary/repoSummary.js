import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import Loading from '../loading';
import {
  formatTime,
  getAvatarFor,
} from '../../helpers/timecard';
import {
  totalUnpaidDuration,
} from '../../helpers/stats';

// get the most frequemt committer for a repo
export function getLastCommitter(timecard) {
  if (timecard && timecard.card && timecard.card.length) {
    let card = _.first(timecard.card), time;
    if (time = _.first(card.times)) {
      return time;
    } else {
      return "No committer";
    }
  } else {
    return "No committer";
  }
}

function calculateUnpaidBalanceHourly(timecard) {
  return (totalUnpaidDuration(timecard) / 3600 * timecard.hourlyRate).toFixed(2);
}

export function clientInfo({repo, timecard}) {
  let outstanding;

  // calculate the amount of money due from the client
  if (timecard && timecard.hourlyRate) {
    // an hourly rate - the amount the client owes.
    outstanding = <small>
      <span className="repo-summary-balance">{calculateUnpaidBalanceHourly(timecard)}</span>
    </small>;
  } else if (timecard && timecard.totalRate) {
    // a fixed rate - show that fixed rate
    outstanding = <small>
      <span className="repo-summary-balance">{timecard.totalRate}</span>
    </small>;
  } else {
    // no outstanding price, so don't show it.
    outstanding = null;
  }

  if (repo) {
    return <div className="repo-summary-client-info">
      <h1>{repo.client_name || "Client"}</h1>
      {outstanding}
    </div>;
  } else {
    return null;
  }
}

export function lastWorker({timecard, color, users}) {
  if (timecard) {
    let lastCommitter = getLastCommitter(timecard);
    return <div className="repo-summary-committer-info" style={{backgroundColor: color}}>
      {/* contributor avatar */}
      {
        getAvatarFor(users, lastCommitter.by).avatar_img ||
        <div className="avatar-spacer"></div>
      }
      <h2>{lastCommitter.by || "Last Contributed"}</h2>

      {/* if there are commits, then show the last one. Otherwise, forget about it. */}
      {lastCommitter ? <small>
        <span className="start-time">
          {formatTime(lastCommitter.start, undefined, "%I:%M %P")}
        </span>
        {formatTime(lastCommitter.end, undefined, "%I:%M %P")}
      </small> : null}
    </div>;
  } else {
    return <div className="repo-summary-committer-info" style={{backgroundColor: color}}>
      <h2>Loading last committer</h2>
    </div>;
  }
}

export const repoSummaryComponent = ({
  timecard,
  repo,
  color,
  light,

  users,
}) => {
  if (repo) {
    return <div className={`repo-summary ${light ? 'repo-summary-light' : ''}`}>
      {clientInfo({repo, timecard})}
      {lastWorker({timecard, color, users})}
      <div className="repo-summary-graph">
        <div className="repo-summary-no-graph">
          No graph
        </div>
      </div>
    </div>;
  } else {
    // no data
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
    users: state.repo_details && state.repo_details.users || [],
  });
}, (dispatch, props) => {
  return {};
})(repoSummaryComponent);
export default repoSummary;
