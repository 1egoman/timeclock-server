"use strict";
const request = require("request"),
      GitHubApi = require("github"),
      github = new GitHubApi({ version: "3.0.0" }),
      base64 = require("base-64"),
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
    }
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
        resolve(data);
      }
    });
  });
}
