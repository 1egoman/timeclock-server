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
    if (branches.length) {
      return branches.map((b) => b.name);
    } else {
      return null;
    }
  }).catch((e) => {
    throw new Error(`Error fetching branches: ${e.toString()}`);
  });
}
