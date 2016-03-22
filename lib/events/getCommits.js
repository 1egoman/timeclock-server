"use strict";
const repo = require("../repo"),
      card = require("../card"),
      _ = require("underscore"),
      User = require("../models/user");

// server/GET_COMMITS
module.exports = function getCommits(action, socket) {
  return new Promise((resolve, reject) => {
    return repo.getCommitsForRepo({user: socket.request.user}, action.user, action.repo, action.ref).then((commits) => {
      resolve(commits.map((c) => {
        return {
          committer: {
            username: c.committer.login,
            avatar: c.committer.avatar_url,
            url: c.committer.html_url,
            type: c.committer.type.toLowerCase(),
          },
          message: c.commit.message,
          sha: c.sha,
          when: c.commit.committer.date,
        };
      }));
    });
  });
}
