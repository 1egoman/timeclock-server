"use strict";
const repo = require("../repo"),
      card = require("../card"),
      _ = require("underscore"),
      User = require("../models/user"),
      TIMECARD_PAGE_LENGTH = 20; // the amount of times that are returned per request,

// get a count of all private repos that have currently been added.
function countPrivateRepos(user) {
  return User.getRepos(user).then((repos) => {
    return repos.filter((repo) => repo.is_private).length;
  });
}

// server/IMPORT_REPO
module.exports = function(action, socket) {
  return new Promise((resolve, reject) => {
    // do the actual repo add (the db query)
    // also, update the local user model so the change is propogated on
    // server/INIT called later
    function addRepoToUserModel() {
      socket.request.user.repos.push(action.repo);
      socket.request.user.save((err) => {
        if (err) {
          throw new Error(err);
        } else {
          resolve(repo);
        }
      });
    }

    // import a new repository from github (after checking that we can)
    function importRepo(action, socket) {
      // if we sent a branch to create the timecard within, then return that.
      // Otherwise, use the default branch.
      let current_branch = (function(passed) {
        if (typeof passed === "string") {
          return passed;
        } else {
          return action.repo.default_branch;
        }
      })(action.createtimecard);

      // the timecard to add the the repository
      let timecard = Object.assign(card.baseTimecard(), action.timecard);
      if (action.createtimecard) {
        return repo.createTimecardInRepo(
          action.repo.user,
          action.repo.repo,
          current_branch,
          timecard,
          socket.request.user
        ).then((data) => {
          // add the repo to the user model
          return addRepoToUserModel();
        });
      } else {
        return addRepoToUserModel(); // the timecard already exists
      }
    }

    // ensure we can add a repo (ie, if it's private and we don't have any more alloted, then we cannot)
    if (action.repo.is_private) {
      let allotments = User.getAllotments(socket.request.user);
      return countPrivateRepos(socket.request.user).then((private_count) => {
        if (private_count < allotments.private_repos) {
          return importRepo(action, socket);
        } else {
          return reject("You don't have enough alloted private repos to create another. Please upgrade your plan.");
        }
      });
    } else {
      // repo is open source - we <3 open source, so these are free.
      action.repo.is_private = false; // ensure the state is constant
      importRepo(action, socket);
    }
  });
}
