import React from 'react';
import {connect} from 'react-redux';
import _ from 'underscore';
import {
  getTimeDelta,
  getAvatarFor,
  generateTimeMarkup,
} from '../../helpers/timecard';
import {expandCollapseTimecardSection} from '../../actions/repo';

// render all of the time regions within the timecard as a table
function renderTimecardTable(
  timecard,
  timecard_users,
  user,
  scale,
  sections_visible=[],
  expandCollapseSection
) {
  function isSectionVisible(dct) {
    return isDayRecent(dct) || sections_visible.indexOf(dct) !== -1;
  }

  // show recent days uncollapsed
  function isDayRecent(dct) {
    return dct <= 3;
  }

  return timecard.card.map((day, dct) => {
    let totalDuration = 0;
    let times = day.times.map((time, tct) => {
      let delta = getTimeDelta(time.start, time.end, day, null, user.settings.long_work_period);
      totalDuration += delta.duration;
      return <tr
        key={`${dct}-${tct}`}
        className={isSectionVisible(dct) ? "enabled" : "hidden"}
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
    });

    // the header for that specific day
    // all days but the current one
    if (isDayRecent(dct)) {
      return times;
    } else {
      return [
        // the day header
        <tr className="repo-details-report-table-day" key={dct}>
          <td className="avatar-col" onClick={expandCollapseSection.bind(this, dct, !isSectionVisible(dct))}>
            {isSectionVisible(dct) ? "-" : "+"}
          </td>
          <td>{day.date}</td>
          <td></td>
          <td></td>
          <td>{generateTimeMarkup(totalDuration)}</td>
        </tr>,
        times
      ];
    }
  });
}

export function repoTimesListComponent({
  user,
  timecard,
  timecard_users,
  scale,
  sections_visible,

  expandCollapseSection,
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
        {renderTimecardTable(timecard, timecard_users, user, scale, sections_visible, expandCollapseSection)}
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
    sections_visible: store.repo_details.sections_visible,
  };
};

const repoTimesList = connect(mapStateToProps, (dispatch, props) => {
  return {
    expandCollapseSection(id, state) {
      dispatch(expandCollapseTimecardSection(id, state));
    },
  };
})(repoTimesListComponent);

export default repoTimesList;
