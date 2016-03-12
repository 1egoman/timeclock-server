"use strict";
const repo = require("../repo"),
      card = require("../card"),
      _ = require("underscore"),
      User = require("../models/user");

// server/DELETE_REPO
module.exports = function deleteRepo(action, socket) {
  return new Promise((resolve, reject) => {
    User.update({_id: socket.request.user}, {$pull: {repos: {user: action.user, repo: action.repo}}}, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
