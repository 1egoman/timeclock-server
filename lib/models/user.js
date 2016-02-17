"use strict";

module.exports = require("mongoose").model("User", {
  github_id: Number,
  repos: [String],
  user: Object,

  access_token: String,
  refresh_token: String,
});
