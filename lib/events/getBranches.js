"use strict";
const repo = require("../repo"),
      card = require("../card"),
      _ = require("underscore"),
      User = require("../models/user");

// server/GET_BRANCHES
module.exports = function getBranches(action, socket) {
  return new Promise((resolve, reject) => {
    repo.getBranchesForRepo({user: socket.request.user}, action.user, action.repo).then((branches) => {
      resolve(branches.map((b) => b.name));
    }, (err) => {
      throw new Error(err);
    });
  });
}
