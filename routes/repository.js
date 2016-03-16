"use strict";
const repo = require("../lib/repo"),
      ejs = require("ejs"),
      isAuthenticated = require("../lib/is_authenticated"),
      getAuthenticatedUser = require("./badge").getAuthenticatedUser,
      card = require("../lib/card");

// get the repo that is being specified.
function getRepo(req, res, next) {
  if (req.params.username && req.params.repo) {
    repo.getRepoDetails(req, req.params.username, req.params.repo).then((data) => {
      req.parent_repo = data;
      next();
    }).catch((err) => {
      req.parent_repo = {error: true, data: err};
      next();
    });
  } else {
    next();
  }
}

function doError(req, res, code) {
  return (err) => {
    if (code === 404) {
      res.render("404", {
        title: "Error",
        user: req.params.username,
        repo: req.params.repo,
      });
    } else {
      console.error(err);
      res.status(code).render("error", {
        title: "Error",
        msg: err,
        user: req.user,
      });
    }
  };
}

/* GET home page. */
function index(req, res) {
  res.render('index', {
    title: 'Waltz',
    user: req.user,
  });
}

function features(req, res) {
  res.render('features', {
    title: 'Waltz Features',
    user: req.user,
  });
}
function pricing(req, res) {
  res.render('pricing', {
    title: 'Waltz Pricing',
    user: req.user,
  });
}

// get a repo
function doReport(req, res) {
  let ref = req.params.ref || req.parent_repo.default_branch || "master";
  getAuthenticatedUser(req).then((user) => {
    return repo.getFileFromRepo(
      req.params.username,
      req.params.repo,
      null,
      ref,
      user
    );
  }).then((timecard) => {
    if (card.assertIsCard(timecard)) {
      // make the report
      card.getReportTemplate(timecard.reportFormat || "default").then((template) => {
        let ejs_data = card.getTimecardRenderDetails(timecard),
            report = ejs.render(template, ejs_data);
        res.send(report);
      }).catch(doError(req, res, 400));
    } else {
      res.status(400).send({
        error: "Timecard is malformed.",
      });
    }
  }).catch(doError(req, res, 404));
}

module.exports = {
  getRepo: getRepo,
  doError: doError,
  index,
  features,
  pricing,
  doReport: doReport,
}
