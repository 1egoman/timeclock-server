"use strict";

module.exports = require("mongoose").model("User", {
  github_id: Number,
  repos: [String],
  user: Object,
  username: String,
  provider: String,
  profile_url: String,

  badge_token: String,

  access_token: String,
  refresh_token: String,
});
