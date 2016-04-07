import React from 'react';
import {connect} from 'react-redux';
import _ from 'underscore';
import {
  getTimeDelta,
  getAvatarFor,
} from '../helpers/timecard';

// render all of the time regions within the timecard as a table
function renderTimecardTable(timecard, timecard_users, user, scale) {
  return timecard.card.map((day, dct) => {
    return day.times.map((time, tct) => {
      let delta = getTimeDelta(time.start, time.end, day, null, user.settings.long_work_period);
      return <tr
        key={`${dct}-${tct}`}
        className={day.disabled ? "disabled" : "enabled"}
      >
        <td
          className="avatar-col"
        >
          <span
            data-toggle="tooltip"
            data-placement="right"
            title={time.by}
          >
          {
            getAvatarFor(timecard_users, time.by).avatar_img ||
              <span className="fa fa-user avatar-col" ></span>
          }
          </span>
        </td>
        <td>{day.date}</td>
        <td>{time.start}</td>
        <td>{typeof time.end !== "undefined" ? time.end : "(no end)"}</td>
        <td>{delta.markup}</td>
      </tr>;
    })
  });
}

export function repoTimesListComponent({
  user,
  timecard,
  timecard_users,
  scale,
}) {
  /* list of all times in the timecard */
  return <div className="repo-details-report-table">
    <table className="table">
      <thead>
        <tr>
          <th></th>
          <th>Date</th>
          <th>From</th>
          <th>To</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        {renderTimecardTable(timecard, timecard_users, user, scale)}
      </tbody>
    </table>
  </div>;
}

export function mapStateToProps(store, props) {
  return {
    user: store.user,
    timecard: store.repo_details.timecard,
    timecard_users: store.repo_details.users,
    scale: props.scale,
  };
};

const repoTimesList = connect(mapStateToProps, (dispatch, props) => {
  return {};
})(repoTimesListComponent);

export default repoTimesList;
