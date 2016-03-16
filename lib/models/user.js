"use strict";
const mongoose = require("mongoose"),
      Promise = require("promise");

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

  plan: String,
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

// get the plan stats behind the string specified in the user model
User.statics.getAllotments = function(user) {
  return {
    "micro": {
      private_repos: 5,
    }
  }[user.plan] || {
    // free plan
    private_repos: 0,
  }
}

// return the repos allotted to a user
User.statics.getRepos = function(user) {
  return new Promise((resolve) => resolve(user.repos));
}

module.exports = mongoose.model("User", User);
