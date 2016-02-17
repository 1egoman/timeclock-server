"use strict";
const request = require("request"),
      GitHubApi = require("github"),
      github = new GitHubApi({ version: "3.0.0" }),
      Promise = require("promise");

exports.getFileFromRepo = function getFileFromRepo(username, repo, filename, branch) {
  branch = branch || "master";
  filename = filename || ".timecard.json";
  // console.log(`https://raw.githubusercontent.com/${username}/${repo}/${branch}/${filename}`, username, repo, filename)
  return new Promise((resolve, reject) => {
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
