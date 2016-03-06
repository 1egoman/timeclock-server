"use strict";
const repo = require("../repo"),
      card = require("../card"),
      uuid = require("uuid"),
      _ = require("underscore"),
      User = require("../models/user");

// server/RESET_TOKEN
module.exports = function resetToken(action, socket) {
  return new Promise((resolve, reject) => {
    User.findOne({
      username: action.username,
      badge_token: action.old_token,
    }).exec((err, user) => {
      if (err) {
        throw new Error(err);
      } else if (user) {
        user.badge_token = uuid.v4(); // generate new badge token
        user.save((err) => {
          if (err) {
            throw new Error(err);
          } else {
            resolve({
              user: User.sanitize(user),
              badge_token: user.badge_token,
            });
          }
        })
      } else {
        throw new Error("No user was found with that badge token.");
      }
    });
  });
}
