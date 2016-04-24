"use strict";
const repo = require("../repo"),
      card = require("../card"),
      _ = require("underscore"),
      User = require("../models/user");

// server/STATS_FOR
module.exports = function getStats(timecard, length) {
  return Promise.all([
    generateWorkActivityGraph(timecard, length),
  ]).then((data) => {
    return {workActivityGraph: data[0]};
  });
}

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





function parseTime(day, time) {
  return new Date(`${day} ${time || ""}`).getTime();
}

// convenience functions for generating graphs
function convertMillisecondsToHours(ms, round) {
  let factor = Math.pow(10, round || 1);
  return Math.round((ms / (60 * 60 * 1000)) * factor) / factor;
}
