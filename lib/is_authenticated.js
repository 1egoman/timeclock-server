"use strict";

// is a user authenticated?
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/"); // back home
  }
}
module.exports = isLoggedIn;
