import {strptime} from "micro-strptime";
import strftime from "strftime";
import React from 'react';

const MS_PER_DAY = 24 * 60 * 60 * 1000,
      MS_PER_MINUTE = 60 * 1000,
      SECONDS_PER_MINUTE = 60,
      DEFAULT_LONG_DURATION = 60 * 1.5; // 1.5 hours in minutes

export function formatTime(raw, parse_format="%H:%M:%S", to_format) {
  let time = strptime(raw, parse_format);
  if (!to_format) {
    return time;
  } else {
    return strftime(to_format, time);
  }
}

// get the difference in time from the start to the end
export function getTimeDelta(start, end, parse_format="%H:%M:%S", tooLongDuration=DEFAULT_LONG_DURATION) {
  let result = formatTime(end, parse_format).getTime() - formatTime(start, parse_format).getTime();
  let duration = (new Date(result).getTime()) % MS_PER_DAY / MS_PER_MINUTE;

  // have we been working for too long?
  let tooLong;
  if (duration > tooLongDuration) {
    tooLong = <span
      className="warning"
      data-toggle="tooltip"
      data-placement="left"
      title={`This work period was longer than ${tooLongDuration} minutes.`}
    >
      <span className="fa fa-warning"></span>
    </span>;
  }

  return {
    duration: duration,
    tooLong: duration > tooLongDuration,
      markup: <span className="time-delta">
      <strong>{Math.floor(duration)} min</strong>, {Math.ceil((duration % 1) * SECONDS_PER_MINUTE)} sec
      {tooLong}
    </span>,
  };
}
