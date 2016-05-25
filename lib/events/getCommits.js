"use strict";
const repo = require("../repo"),
      card = require("../card"),
      _ = require("underscore"),
      User = require("../models/user");

// server/GET_COMMITS
module.exports = function getCommits(action, socket) {
  return repo.getCommitsForRepo({user: socket.request.user}, action.user, action.repo, action.ref).then((commits) => {
    return commits.map((c) => {
      return {
        committer: (function() {
          if (c.committer) {
            return {
              username: c.committer.login,
              avatar: c.committer.avatar_url,
              url: c.committer.html_url,
              type: c.committer.type.toLowerCase(),
            };
          } else {
            return {
              username: c.commit.committer.name,
              type: "bot",
            };
          }
        })(),
        message: c.commit.message,
        sha: c.sha,
        when: c.commit.committer.date,
      };
    });
  });
}
