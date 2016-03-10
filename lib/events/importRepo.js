"use strict";
const repo = require("../repo"),
      card = require("../card"),
      _ = require("underscore"),
      User = require("../models/user"),
      TIMECARD_PAGE_LENGTH = 20; // the amount of times that are returned per request,

// server/IMPORT_REPO
module.exports = function(action, socket) {
  function addRepoToUserModel() {
    return new Promise((resolve, reject) => {
      User.update({_id: socket.request.user}, {$push: {repos: action.repo}}, (err) => {
        if (err) {
          throw new Error(err);
        } else {
          resolve(repo);
        }
      });
    });
  }

  // if we sent a branch to create the timecard within, then return that.
  // Otherwise, use the default branch.
  let current_branch = (function(passed) {
    if (typeof passed === "string") {
      return passed;
    } else {
      return action.repo.default_branch;
    }
  })(action.createtimecard);

  if (action.createtimecard) {
    return repo.createTimecardInRepo(action.repo.user, action.repo.repo, current_branch, card.baseTimecard(), socket.request.user)
    .then((data) => {
      // add the repo to the user model
      return addRepoToUserModel();
    });
  } else {
    return addRepoToUserModel(); // the timecard already exists
  }
}
