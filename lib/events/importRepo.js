"use strict";
const repo = require("../repo"),
      card = require("../card"),
      _ = require("underscore"),
      User = require("../models/user"),
      TIMECARD_PAGE_LENGTH = 20; // the amount of times that are returned per request,

// server/IMPORT_REPO
module.exports = function(action, socket) {
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
