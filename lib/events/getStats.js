"use strict";
  const repo = require("../repo"),
      card = require("../card"),
      _ = require("underscore"),
      User = require("../models/user"),
      stats = require("./statsMethods");

let COLORS = {
  primary: "#51c4c4",
  success: "#8ac450",
  info: "#8a51c4",
  warning: "#E2D54A",
  danger: "#c45151",
};

// server/STATS_FOR
module.exports = function getStats(timecard, length) {
  return Promise.all([
    stats.generateWorkActivityGraph(timecard, length),
    stats.generateClientPaymentFreqBreakdown(timecard),
    stats.generateClientPaymentAmountBreakdown(timecard),
  ]).then((data) => {
    // payment stats require the frequency breakdown
    // also, if stats are really big, we can elect to hide them because they may
    // be more confusing
    return Promise.all([
      ...data,
      stats.calculatePaymentStats(timecard, data[1]),
    ]);
  }).then((data) => {
    return {
      workActivityGraph: data[0],
      payFrequencyBreakdownCircle: data[1],
      payAmountBreakdownCircle: data[2],
      payment: data[3],
    };
  });
}

