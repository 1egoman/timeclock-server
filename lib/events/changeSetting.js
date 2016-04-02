"use strict";
const repo = require("../repo"),
      card = require("../card"),
      uuid = require("uuid"),
      _ = require("underscore"),
      User = require("../models/user");

// server/CHANGE_SETTING
module.exports = function changeSetting(action, socket) {
  return new Promise((resolve, reject) => {
    let new_settings = Object.assign(socket.request.user.settings, action.changes);
    User.update({_id: socket.request.user._id}, {settings: new_settings}, (err) => {
      if (err) {
        reject(new Error(err));
      } else {
        resolve(new_settings);
      }
    });
  });
}
