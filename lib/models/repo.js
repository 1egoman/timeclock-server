"use strict";
const mongoose = require("mongoose"),
      Promise = require("promise");

let Repo = new mongoose.Schema({
  user: String,
  repo: String,
  desc: String,
  is_pending: Boolean,
  is_private: Boolean,
  has_timecard: Boolean,
  owner_type: {
    type: String,
    enum: ["user", "organisation"],
  },
  default_branch: String,
  provider: {
    type: String,
    enum: ["github"],
  },
});

// generate a share url for a repo
// specify a user model, a repo model, and an optional tracking ref
Repo.statics.shareUrl = function shareUrl(user, repo, ref) {
  ref = ref || '';
  if (repo.is_private) {
    return `http://waltzapp.co/embed/${repo.user}/${repo.repo}?token=${user.badge_token}&ref=${ref}`
  } else {
    return `http://waltzapp.co/embed/${repo.user}/${repo.repo}?ref=${ref}`
  }
}

module.exports = mongoose.model("Repo", Repo);
