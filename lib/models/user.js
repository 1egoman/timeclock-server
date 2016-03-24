"use strict";
const mongoose = require("mongoose"),
      Repo = require('./repo'),
      Promise = require("promise");

let User = new mongoose.Schema({
  github_id: Number,
  repos: [Repo.schema],
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
    plan: user.plan,
  };
};

// get the plan stats behind the string specified in the user model
// As we aren't enforcing the paid limits right now, return a ton of
// public repos.
User.statics.getAllotments = function(user) {
  return {
    "disco": {
      private_repos: 1,
    },
    "jive": {
      private_repos: 5,
    },
    "polka": {
      private_repos: 10,
    },
  }[user.plan] || {
    // free plan
    private_repos: 9999,
  }
}

// return the repos allotted to a user
User.statics.getRepos = function(user) {
  return new Promise((resolve) => resolve(user.repos));
}

User.statics.findRepo = function(user, search_user, search_repo) {
  return User.statics.getRepos(user).then((repos) => {
    return repos.find((repo) => {
      return repo.user === search_user && repo.repo === search_repo;
    });
  });
}

module.exports = mongoose.model("User", User);
