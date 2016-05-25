"use strict";

module.exports = require("mongoose").model("UserCache", {
  username: String,
  username_lower: String,
  id: String,
  avatar: String,
  url: String,
  type: String,
  provider: String,
});
