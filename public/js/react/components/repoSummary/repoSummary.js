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
  generateChartTimeDataForEachWorkDay,
} from '../../helpers/stats';
import {Line as LineChart} from 'react-chartjs';

// get the most frequemt committer for a repo
export function getLastCommitter(timecard) {
  if (timecard && timecard.card && timecard.card.length) {
    let card = _.first(timecard.card), time;
    if (time = _.first(card.times)) {
      return time;
    } else {
      return null;
    }
  } else {
    return null;
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
    return <div className="repo-summary-client-info"></div>;
  }
}

export function lastWorker({timecard, color, users}) {
  if (timecard) {
    let lastCommitter = getLastCommitter(timecard);
    if (lastCommitter) {
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
          {lastCommitter.start}
          </span>
          {lastCommitter.end}
        </small> : null}
      </div>;
    } else {
      // no last committer specified
      return <div className="repo-summary-committer-info" style={{backgroundColor: color}}>
        <div className="avatar-spacer"></div>
        <h2>Last Contributed</h2>
      </div>;
    }
  } else {
    return <div className="repo-summary-committer-info" style={{backgroundColor: color}}>
      <h2>Loading last committer</h2>
    </div>;
  }
}

export function activityGraph({timecard, color}) {
  let chartData = generateChartTimeDataForEachWorkDay(
    timecard,
    6, // for the last 6 work periods
    color || "#AAA" // the line fill color
  );
  if (chartData) {
    return <div className="repo-summary-graph">
      <LineChart
        data={chartData}
        options={{
          // hide axes and labels
          scaleShowHorizontalLines: false,
          scaleShowVerticalLines: false,
          scaleShowLabels: false,

          // hide the specific points on each value
          pointDot: false,
          pointHitDetectionRadius: 0,

          // scale the graph correctly across resizes
          responsive: true,
          bezierCurveTension: 0.2,
          scaleFontSize: -2,
          tooltipTemplate: () => "",
        }}
      />
    </div>;
  } else {
    return <div className="repo-summary-graph">
      <div className="repo-summary-no-graph">
        No graph
      </div>
    </div>;
  }
}

export const repoSummaryComponent = ({
  timecard,
  repo,
  primaryColor,
  secondaryColor,
  light,

  users,
}) => {
  if (repo) {
    return <div className={`repo-summary ${light ? 'repo-summary-light' : ''}`}>
      {clientInfo({repo, timecard})}
      {lastWorker({timecard, users, color: primaryColor})}
      {activityGraph({timecard, color: secondaryColor})}
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

export function mapStateToProps(state, props) {
  return Object.assign({}, props, {
    users: state.repo_details && state.repo_details.users || [],
  });
}

const repoSummary = connect(mapStateToProps, (dispatch, props) => {
  return {};
})(repoSummaryComponent);
export default repoSummary;
