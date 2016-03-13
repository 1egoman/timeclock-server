"use strict";
const mongoose = require("mongoose");

let User = new mongoose.Schema({
  github_id: Number,
  repos: Array,
  user: Object,
  username: String,
  provider: String,
  profile_url: String,
  avatar: String,
  email: String,
  name: String,

  settings: {
    long_work_period: {
      type: Number,
      default: 90, // 90 minutes
    },
  },

  badge_token: String,

  access_token: String,
  refresh_token: String,
});

// return only the "public" attributes of the user
User.statics.sanitize = function(user) {
  return {
    username: user.username,
    provider: user.provider,
    profile_url: user.profile_url,
    badge_token: user.badge_token,
    github_id: user.github_id,
    avatar: user.avatar,
    settings: user.settings,
  };
};

module.exports = mongoose.model("User", User);
