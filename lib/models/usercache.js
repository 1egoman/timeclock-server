"use strict";

module.exports = require("mongoose").model("UserCache", {
  username: String,
  id: String,
  avatar: String,
  url: String,
  type: String,
  provider: String,
});
