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

module.exports = mongoose.model("Repo", Repo);
