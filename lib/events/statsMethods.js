"use strict";
const repo = require("../repo"),
      card = require("../card"),
      _ = require("underscore");

let COLORS = {
  primary: "#51c4c4",
  success: "#8ac450",
  info: "#8a51c4",
  warning: "#E2D54A",
  danger: "#c45151",
};

function generateWorkActivityGraph(timecard, backDays) {
  backDays = backDays || 30;
  if (card.assertIsCard(timecard)) {
    let now = new Date(), datasets = [{
      label: "Unpaid time",
      data: [],
    }, {
      label: "Paid time",
      data: [],
    }];

    // Step 1: parse times to be more easily parsable
    let times = timecard.card.map((day) => {
      let enabled = 0, disabled = 0;
      day.times.forEach((time) => {
        if (day.disabled) {
          disabled += card.getDurationFor(day, time);
        } else {
          enabled += card.getDurationFor(day, time);
        }
      });
      return {enabled, disabled, label: day.date, when: new Date(parseTime(day.date))};
    });

    function getTimesForDay(date) {
      return times.find((t) => {
        return t.when.getDate() === date.getDate();
      });
    }

    // Step 2: index the last `backDays` days into an array
    let labels = Array.from(Array(backDays), (i, index) => {
      return new Date(now.getYear(), now.getMonth(), now.getDate() - index);
    }).map((when) => { // Step 3: for the given day, get the time specified.
      let data = getTimesForDay(when),
          label = `${when.toLocaleString("en", {month:"long"})} ${when.getDate()}`;
      if (data) {
        return Object.assign({}, data, {label});
      } else {
        return {disabled: 0, enabled: 0, label};
      }
    }).map((data) => { // Step 4: make it into the format that is expected
      datasets[0].data.push(convertMillisecondsToHours(data.enabled, 3));
      datasets[1].data.push(convertMillisecondsToHours(data.disabled, 3));
      return data.label;
    });

    return {labels, datasets};
  } else {
    return null;
  }
}

// The time it takes for the client to pay a time after it has been ended.
function generateClientPaymentFreqBreakdown(timecard) {
  // given a value, map that to it's "heatmap" color
  function getColorFor(n) {
    if (n >= 800) {
      return COLORS["danger"];
    } else if (n >= 400) {
      return COLORS["warning"];
    } else if (n >= 200) {
      return COLORS["success"];
    } else {
      return COLORS["primary"];
    }
  }

  if (card.assertIsCard(timecard)) {
    let paymentDelays = [];
    timecard.card.forEach((day) => {
      day.times.forEach((time) => {
        if (day.disabled) {
          paymentDelays.push(
            convertMillisecondsToHours(
              parseTime(day.disabled) - parseTime(day.date, day.end)
            )
          );
        }
      });
    });

    // group by hundreds of hours
    return _.chain(paymentDelays)
            .compact()
            .groupBy((n) => Math.round(n / 100) * 100)
            .mapObject((v, k) => {
              let n = parseInt(k);
              if (!isNaN(n)) {
                return {
                  label: `${n} hours - ${n + 99} hours`,
                  value: v.length,
                  color: getColorFor(n),
                };
              } else {
                return { label: k, value: v.length };
              }
            })
            .values()
            .value();
  } else {
    return null;
  }
}

// The amount paid by the client at any one time
function generateClientPaymentAmountBreakdown(timecard) {
  // given a value, map that to color
  function getColorFor(n) {
    if (n >= 5000) {
      return COLORS["success"];
    } else if (n >= 1000) {
      return COLORS["warning"];
    } else if (n >= 450) {
      return COLORS["info"];
    } else {
      return COLORS["primary"];
    }
  }

  if (card.assertIsCard(timecard) && timecard.hourlyRate) {
    // Step 0: turn the timecard data into a flattened array containing when a
    // time was paid and how long a time was paid.
    let payTimes = timecard.card.map((day) => {
      return day.times.map((time) => {
        if (day.disabled) {
          return {
            time: parseTime(day.disabled),
            duration: card.getDurationFor(day, time),
          };
        } else {
          return null;
        }
      });
    });
    return _.chain(payTimes)
            .flatten()
            .compact()

            // Step 1: group like times that were paid at the same point in
            // history. Reduce all of these each to the total, so we'll have an
            // object with pay time mapped to paid amount.
            .groupBy((n) => n.time)
            .mapObject((v) => {
              if (v.length) {
                let totalDuration = v.reduce((acc, i) => acc + i.duration, 0);
                return convertMillisecondsToHours(totalDuration) * timecard.hourlyRate;
              } else {
                return null;
              }
            })
            .values()
            .compact()

            // Step 2: group by the time that has been paid for, so in the end
            // we'll have amount paid mapped to amount of times that dollar
            // amount has been paid.
            .groupBy((n) => n)
            .mapObject((v, k) => {
              return {
                label: `$${k}`,
                value: v.length,
                color: getColorFor(parseInt(k)) || "primary",
              };
            })

            // Step 3: Get rid of the keys as they aren't needed any longer
            .values()
            .flatten()
            .value();
  } else {
    return null;
  }
}

function calculatePaymentStats(timecard) {
  // How much was I paid last month?
  let lastMonth;
  if (timecard.hourlyRate) {
    let nowMonth = new Date().getMonth(), nowYear = new Date().getYear();
    lastMonth = timecard.card.reduce((acc, c) => {
      if (c.disabled) {
        let paidAt = parseTime(c.disabled);
        if (!isNaN(paidAt)) {
          let paidDate = new Date(paidAt);
          if (
            paidDate.getMonth() === (nowMonth - 1) &&
            paidDate.getYear() === nowYear
          ) {
            return acc + convertMillisecondsToHours(c.times.reduce((total, t) => {
              return total + card.getDurationFor(c, t);
            }, 0));
          } else {
            return acc;
          }
        } else {
          return acc;
        }
      } else {
        return acc;
      }
    }, 0) * timecard.hourlyRate;
  } else {
    lastMonth = null;
  }

  // How much time is between each payment?
  // Calculate the time between a consecutive payment. The last payment's value
  // is subtracted from the current payment's value to produce deltas that are
  // averaged, producing this metric.
  let totalPaidMonths = 0;
  let total = 0;
  timecard.card.reduce((last, c) => {
    let paidAt;
    if (!isNaN(paidAt = parseTime(c.disabled))) {
      totalPaidMonths += 1;
      total += (paidAt - last);
      return paidAt;
    } else {
      return last;
    }
  }, parseTime(timecard.card[0].date, timecard.card[0].times[0].end))
  let paymentFrequencyHours = convertMillisecondsToHours(total / totalPaidMonths);

  // What was the longest that a client took to pay me?
  // Take each time and calculate the time difference from when it was created to
  // when it was paid. The longest converted to hours is the value we're looking
  // for.
  let longestPaymentFrequencyHours = timecard.card.reduce((lastLength, day) => {
    let value = convertMillisecondsToHours(day.times.reduce((last, current) => {
      let currentTime = parseTime(day.disabled) - parseTime(day.date, current.end);
      if (last < currentTime) {
        return currentTime;
      } else {
        return last;
      }
    }, 0));

    // pick the biggest and use that
    if (lastLength < value) {
      return value;
    } else {
      return lastLength;
    }
  }, 0);

  return {lastMonth, paymentFrequencyHours, longestPaymentFrequencyHours};
}

module.exports = {
  generateWorkActivityGraph,
  generateClientPaymentFreqBreakdown,
  generateClientPaymentAmountBreakdown,
  calculatePaymentStats,
}



// convenience functions for generating graphs
function parseTime(day, time) {
  return new Date(`${day} ${time || ""}`).getTime();
}

function convertMillisecondsToHours(ms, round) {
  let factor = Math.pow(10, round || 1);
  return Math.round((ms / (60 * 60 * 1000)) * factor) / factor;
  }

