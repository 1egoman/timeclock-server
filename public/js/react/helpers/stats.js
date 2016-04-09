import _ from "underscore";
import strftime from "strftime";
import moment from "moment";

// All functions that return time return in milliseconds.

// calculate the average length of a work period given a timecard.
// ie, a user that worked from 1am - 10am, then 1- 10pm would have an average
// work period length of 9 hours. In a similar fashion, working from 1am - 9am
// (8 hours in length) then 1pm - 11am (10 hours in length) would also have an
// average work period length of 9 hours.
export function calculateAverageWorkPeriodLength(timecard) {
  if (assertIsCard(timecard)) {
    let workPeriodCt = 0;
    let timeWorkedInProject = timecard.card.reduce((acc, day) => {
      return acc + day.times.reduce((acc, time) => {
        let duration = getDurationFor(day, time);
        if (duration === 0) {
          return acc; // return unchanged if the time has no end doesn't have length
        } else {
          workPeriodCt += 1;
          return acc + duration;
        }
      }, 0);
    }, 0);

    // if we have times we worked for, than report them
    if (workPeriodCt > 0) {
      return timeWorkedInProject / workPeriodCt;
    } else {
      return 0;
    }
  } else {
    return null;
  }
}

// calculate the average time between consecutive commits
export function calculateAverageCommitTime(commits) {
  if (commits && Array.isArray(commits) && commits.length > 1) {
    let totalTime = null,
        countedCommits = 0;

    commits.map((c) => {
      return new Date(c.when);
    }).reduce((lastCommitTime, c) => {
      if (
        lastCommitTime instanceof Date && !isNaN(lastCommitTime.getTime()) &&
        c instanceof Date && !isNaN(c.getTime())
      ) {
        countedCommits++;
        totalTime += Math.abs(getTimeBetween(lastCommitTime, c));
      }
      return c;
    });

    // if we've counted commits, do the math. Otherwise, there isn't really
    // data...
    if (countedCommits > 0) {
      return totalTime / countedCommits;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

// the average amount of commits per work period. Not a strict measure of
// productivity, but can show roughly the frequency of commits per day.
// units: "average" commits per "average" work period
export function calculateAverageCommitsPerWorkPeriod(timecard, commits) {
  let workPeriodLength = calculateAverageWorkPeriodLength(timecard),
      commitLength = calculateAverageCommitTime(commits);

  if (commitLength && workPeriodLength) {
    return workPeriodLength / commitLength;
  } else {
    return null;
  }
}







// utility functions

// returns true if the passes timecard follows the spec
function assertIsCard(timecard) {
  if (typeof timecard === "object" && timecard.card) {
    if (timecard.card.length) {
      return timecard.card.every((date) => {
        return typeof date.date === "string" && date.times && date.times.every((time) => {
          if (time.end) {
            return typeof time.start === "string" && typeof time.end === "string";
          } else {
            return typeof time.start === "string";
          }
        });
      });
    } else {
      return true;
    }
  } else {
    return false;
  }
}

function totalDuration(data) {
  return data.card.reduce((acc, day) => {
    return acc + day.times.reduce((acc, time) => {
      if (!day.disabled) {
        return acc + getDurationFor(day, time);
      } else {
        return acc;
      }
    }, 0);
  }, 0) / 1000 || 0;
}

// the time representations to use internally
const TIME_REPR = "%H:%M:%S", DAY_REPR = "%a %b %d %Y";
function getDurationFor(day, time, use_now_as_end=false) {
  if (time.start && time.end) {
    return (new Date(`${day.date} ${time.end}`).getTime()) - (new Date(`${day.date} ${time.start}`).getTime())
  } else if (use_now_as_end) {
    // if a currently running zone is going, then use the current time as the
    // end point.
    return getDurationFor(day, {
      start: time.start,
      end: strftime(TIME_REPR),
    });
  } else {
    return 0;
  }
}

function getTimeBetween(start, end) {
  if (start instanceof Date && end instanceof Date) {
    return end.getTime() - start.getTime();
  } else {
    return end - start;
  }
}
