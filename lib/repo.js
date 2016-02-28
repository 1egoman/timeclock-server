"use strict";
const request = require("request"),
      GitHubApi = require("github"),
      github = new GitHubApi({ version: "3.0.0" }),
      base64 = require("base-64"),
      async = require("async"),
      _ = require("underscore"),
      Promise = require("promise");

exports.getFileFromRepo = function getFileFromRepo(username, repo, filename, branch, user) {
  branch = branch || "master";
  filename = filename || ".timecard.json";
  // console.log(`https://raw.githubusercontent.com/${username}/${repo}/${branch}/${filename}?token=${user && user.access_token}`, username, repo, filename)
  return new Promise((resolve, reject) => {
    if (user) {
      github.authenticate({
        type: "oauth",
        token: user.access_token
      });
      github.repos.getContent({
        user: username,
        repo: repo,
        path: filename,
        ref: branch,
      }, (err, data) => {
        if (err) {
          reject(err);
        } else if (data.message) {
          reject("Not found");
        } else {
          let file = base64.decode(data.content);
          try {
            let json = JSON.parse(file);
            resolve(json);
          } catch (e) {
            resolve(file);
          }
        }
      });
    } else {
      // for unauthed requests we'll use the "raw" github url.
      request({
        method: "get",
        url: `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${filename}`,
        headers: {
          "Cache-Control": "no-cache"
        }
      }, (err, resp, body) => {
        if (err) {
          reject(err);
        } else if (body === "Not Found") {
          reject("Not found")
        } else {
          try {
            let json = JSON.parse(body);
            resolve(json);
          } catch (e) {
            resolve(body);
          }
        }
      });
    }
  });
}

// get the metadata for a repo that github stores (name, desc, owner, etc...)
exports.getRepoDetails = function getRepoDetails(req, username, repo) {
  return new Promise((resolve, reject) => {
    github.authenticate({
      type: "oauth",
      token: req.user.access_token
    });
    github.repos.get({
      user: username,
      repo: repo,
    }, (err, data) => {
      if (err) {
        reject(err)
      } else if (data.message === "Not Found") {
        reject("Not Found");
      } else {
        resolve(data);
      }
    });
  });
}

// get all of a user's repos
exports.getUserRepos = function getRepoDetails(req, username, repo) {
  return new Promise((resolve, reject) => {
    github.authenticate({
      type: "oauth",
      token: req.user.access_token
    });
    github.repos.getAll({
      visibility: "all",
      affiliation: "owner,collaborator",
      sort: "updated",
    }, (err, data) => {
      if (err) {
        reject(err)
      } else if (data.message === "Not Found") {
        reject("Not Found");
      } else {
        async.map(data, (repo, done) => {
          // fetch a `.timecard.json` file from the repo, if possible. If there's
          // an error, then we don't have a timecard.
          exports.getFileFromRepo(repo.owner.login, repo.name, null, repo.default_branch, req.user).then((data) => {
            done(null, data);
          }).catch((err) => {
            done(null, {});
          });
        }, (err, has_timecard) => {
          if (err) {
            reject(err);
          } else {
            // merge the timecard into each item
            resolve(data.map((item, ct) => {
              return _.extend(item, {timecard: has_timecard[ct]});
            }));
          }
        });
      }
    });
  });
}

exports.getBranchesForRepo = function getBranchesForRepo(req, user, repo) {
  return new Promise((resolve, reject) => {
    github.authenticate({
      type: "oauth",
      token: req.user.access_token
    });
    github.repos.getBranches({
      user: user,
      repo: repo,
    }, (err, data) => {
      if (err) {
        reject(err)
      } else if (data.message === "Not Found") {
        reject("Not Found");
      } else {
        resolve(data);
      }
    });
  });
}
