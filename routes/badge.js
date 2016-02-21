"use strict";
const request = require('request'),
      card = require('../lib/card'),
      repo = require('../lib/repo');

// get a badge for this repo
module.exports = function(app) {
  app.get('/:username/:repo.svg', function(req, res) {
    repo.getFileFromRepo(
      req.params.username,
      req.params.repo,
      null,
      req.query.ref || "master",
      req.user
    ).then((timecard) => {
      let total = card.totalDuration(timecard),
          min = Math.floor(total / 60) % 60,
          hour = Math.floor(total / 3600);
      request(`https://img.shields.io/badge/clock-${hour}h ${min}m-blue.svg`).pipe(res);
    }).catch((err) => {
      res.send({
        error: err,
      });
    });
  });

  return app;
};
