"use strict";
const repo = require("../repo"),
      card = require("../card"),
      _ = require("underscore"),
      User = require("../models/user");

// server/GET_BRANCHES
module.exports = function getBranches(action, socket) {
  return repo.getBranchesForRepo(
    {user: socket.request.user},
    action.user,
    action.repo
  ).then((branches) => {
    return branches.map((b) => b.name);
  });
}
