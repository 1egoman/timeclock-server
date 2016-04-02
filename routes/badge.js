"use strict";
const request = require('request'),
      card = require('../lib/card'),
      repo = require('../lib/repo'),
      Promise = require('promise'),
      User = require("../lib/models/user"),

      BADGE_WARNING_AMT = process.env.WALTZ_BADGE_WARNING_AMT || (60 * 60 * 10), // 10 hours by default
      BADGE_DANGER_AMT = process.env.WALTZ_BADGE_DANGER_AMT || (60 * 60 * 24); // 24 hours by default

// given a logged in user or token, return the equivilent user.
function getAuthenticatedUser(req) {
  return new Promise((resolve, reject) => {
    if (req.user) {
      resolve(req.user);
    } else if (req.query.token) {
      User.findOne({badge_token: req.query.token}, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    } else {
      resolve(null); // nobody logged in
    }
  });
}

// get a badge for this repo
function fetchBadge(req, res) {
  getAuthenticatedUser(req)
  .then((user) => {
    return repo.getFileFromRepo(
      req.params.username,
      req.params.repo,
      null,
      req.query.ref || "master",
      user
    );
  })
  .then((timecard) => {
    let total = card.totalDuration(timecard),
        min = Math.abs(Math.floor(total / 60) % 60),
        hour = Math.abs(Math.floor(total / 3600)),
        color = (function(total) {
          if (total < BADGE_WARNING_AMT) {
            return "blue"; // we're ok
          } else if (total < BADGE_DANGER_AMT) {
            return "yellow"; // the client owes some money
          } else {
            return "red"; // the client is severely behind
          }
        })(total);
    request(`https://img.shields.io/badge/unpaid-${hour}h ${min}m-${color}.svg`).pipe(res);
  }).catch((err) => {
    res.send({
      error: err,
    });
  });
}

module.exports = {
  fetchBadge: fetchBadge,
  getAuthenticatedUser: getAuthenticatedUser,
};
