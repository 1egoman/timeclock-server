"use strict";
const repo = require("../lib/repo"),
      ejs = require("ejs"),
      isAuthenticated = require("../lib/is_authenticated"),
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

function doError(res, code) {
  return (err) => {
    res.status(code).send(err);
  };
}

module.exports = function(app) {

    /* GET home page. */
    app.get('/', function(req, res) {
      if (req.user) {
        repo.getUserRepos(req).then((repos) => {
          res.render('index', {
            title: 'Clock',
            user: req.user,
            repos: repos,
          });
        }).catch(doError);
      } else {
        res.render('index', {
          title: 'Clock',
          user: req.user,
        });
      }
    });


  app.get('/:username/:repo/:ref?', isAuthenticated, getRepo, function(req, res) {
    let ref = req.params.ref || req.parent_repo.default_branch || "master";
    repo.getFileFromRepo(
      req.params.username,
      req.params.repo,
      null,
      ref
    ).then((timecard) => {
      if (card.assertIsCard(timecard)) {

        // make the report
        card.getReportTemplate(timecard.reportFormat || "default").then((template) => {
            let ejs_data = card.getTimecardRenderDetails(timecard);
            let report = ejs.render(template, ejs_data);
            res.render("report", {
              title: `Invoice for ${req.params.username}/${req.params.repo}`,
              repo: req.parent_repo.error ? {
                full_name: `${req.params.username}/${req.params.repo}`,
              } : req.parent_repo,
              current_ref: ref,
              report: report.replace("<script>", "&lt;script&gt;").replace("</script>", "&lt;/script&gt;"), 
            });
        }).catch(doError(res, 400));

      } else {
        res.status(400).send("Timecard is malformed.");
      }
    }).catch(doError(res, 400));
  });
};
