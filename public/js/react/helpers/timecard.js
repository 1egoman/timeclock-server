import {strptime} from "micro-strptime";
import strftime from "strftime";
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import _ from 'underscore';

const MS_PER_DAY = 24 * 60 * 60 * 1000,
      MS_PER_MINUTE = 60 * 1000,
      SECONDS_PER_MINUTE = 60,
      DEFAULT_LONG_DURATION = 60 * 1.5; // 1.5 hours in minutes

export function formatTime(raw, parse_format="%H:%M:%S", to_format) {
  if (typeof raw === "string") {
    let time = strptime(raw, parse_format);
    if (!to_format) {
      return time;
    } else {
      return strftime(to_format, time);
    }
  } else {
    return null;
  }
}

// given a duration in minutes, generate minute / second jsx for rendering.
export function generateTimeMarkup(duration) {
  return <span>
    <strong>{Math.floor(duration)} min</strong>, {Math.ceil((duration % 1) * SECONDS_PER_MINUTE)} sec
  </span>;
}

// get the difference in time from the start to the end
export function getTimeDelta(start, end, day, parse_format, tooLongDuration=DEFAULT_LONG_DURATION) {
  parse_format = parse_format || "%H:%M:%S";

  // is the time complete?
  if (typeof end === "string") {
    let result = formatTime(end, parse_format).getTime() - formatTime(start, parse_format).getTime();
    let duration = (new Date(result).getTime()) % MS_PER_DAY / MS_PER_MINUTE;

    // have we been working for too long?
    let tooLong;
    if (duration > tooLongDuration) {
      tooLong = <OverlayTrigger placement="left" overlay={
        <Tooltip id="long-work">
          This work period was longer than {tooLongDuration} minutes.
        </Tooltip>
      }>
        <i className="fa fa-warning warning" />
      </OverlayTrigger>;
    }

    // has the time been paid for?
    let isPaid;
    if (day.disabled) {
      isPaid = <OverlayTrigger placement="left" overlay={
        <Tooltip id="already-paid">This time has been paid.</Tooltip>
      }>
        <i className="fa fa-money success" />
      </OverlayTrigger>
    }

    return {
      duration: duration,
      tooLong: duration > tooLongDuration,
      markup: <span className="time-delta">
        {generateTimeMarkup(duration)}
        <span className="repo-details-report-table-indicators">
          {tooLong}
          {isPaid}
        </span>
      </span>,
    };
  } else {
    return {
      duration: null,
      tooLong: false,
      markup: <span className="time-delta time-delta-incomplete">
        No Duration
      </span>,
    }
  }
}

// get the avatar, given a pool or users and the user's username within that pool
export function getAvatarFor(user_pool, username) {
  let user = user_pool.find((potential) => potential.username === username);
  if (user) {
    return {
      user: user,
      avatar_img: <img className="avatar-img" src={user.avatar} />,
    }
  } else {
    return {
      avatar_img: null,
      user: null,
      error: "No user found.",
    };
  }
}

// get the scalefactor for the repo details page, given a list of all commits.
// maxBlockHeight it the maximum height given to a single block.
// Use like: myTime / getTimeScaleFactor(commits, 1000)
export function getTimeScaleFactor(commits, timecard, maxBlockHeight) {
  if (Array.isArray(commits)) {
    return _.max(commits.map((i) => i.length)) / maxBlockHeight;
  } else {
    return null;
  }
}

// for each commit, calculate its length by subtracting the previous
// commit's time from the current commit's time.
export function calculateLengthForCommits(commits) {
  return commits.reduce((acc, i, ct) => {
    let commitLength = 0;
    if (acc.length === 0) { // is this the first commit?
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
}
