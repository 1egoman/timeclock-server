"use strict";
const repo = require("../lib/repo"),
      ejs = require("ejs"),
      isAuthenticated = require("../lib/is_authenticated"),
      getAuthenticatedUser = require("./badge").getAuthenticatedUser,
      path = require("path"),
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

function doError(req, res, code, msg) {
  return (err) => {
    if (code === 404) {
      res.render("404", {
        title: "Error",
        user: req.params.username,
        repo: req.params.repo,
        user: req.user,
        msg,
      });
    } else if (msg.show_errors){
      console.error("SHOWN", err);
      res.status(code).render("error", {
        title: "Error",
        msg: err,
        user: req.user,
      });
    } else {
      console.error(err);
      res.status(code).render("error", {
        title: "Error",
        user: req.user,
        msg,
      });
    }
  };
}

/* GET home page. */
function index(req, res) {
  res.render('index', {
    title: 'Waltz | Time Tracking and Metrics for Freelance Developers',
    user: req.user,
    ab: req.session.ab,
  });
}

function pricing(req, res) {
  res.render('pricing', {
    title: 'Waltz Pricing',
    user: req.user,
  });
}
function presskit(req, res) {
  res.render('presskit', {
    title: 'Waltz Press Kit',
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
    ).then((timecard) => {
      if (card.assertIsCard(timecard)) {
        // make the report
        card.getReportTemplate(timecard.reportFormat).then((template) => {
          // add the waltz badge on the top
          let ejs_data = card.getTimecardRenderDetails(timecard);
          let timesheet = ejs.render(template, ejs_data);
          ejs.renderFile(path.join(__dirname, '..', 'views', 'timesheet.ejs'), {
            contents: timesheet,
            invoice_data: ejs_data,
            no_nav: true,
            no_footer: true,
            ENV_DEVELOPMENT: (process.env.NODE_ENV || "development") === "development",
            user: req.user,
            tokened_user: user,
          }, function(err, full_timesheet) {
            if (err) {
              throw new Error(err);
            } else {
              res.send(full_timesheet);
            }
          });
        }).catch(doError(req, res, 400, {show_errors: true}));
      } else {
        res.status(400).send({
          error: "Timecard is malformed.",
        });
      }
    });
  }).catch(doError(req, res, 404, "We couldn't get the timecard associated with this repository and branch."));
}

module.exports = {
  getRepo,
  doError,
  doReport,
  index,
  pricing,
  presskit,
}
