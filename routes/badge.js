"use strict";
const request = require('request'),
      card = require('../lib/card'),
      repo = require('../lib/repo'),
      Promise = require('promise'),
      User = require("../lib/models/user");

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
module.exports = function(app) {
  app.get('/:username/:repo.svg', function(req, res) {
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
          min = Math.floor(total / 60) % 60,
          hour = Math.floor(total / 3600);
      request(`https://img.shields.io/badge/unpaid-${hour}h ${min}m-blue.svg`).pipe(res);
    }).catch((err) => {
      res.send({
        error: err,
      });
    });
  });

  return app;
};
