"use strict";
const uuid = require("uuid");

module.exports = function(mixpanel) {
  function identifyUserBySession(req) {
    if (req.session && req.user) {
      mixpanel.alias(req.session.anon_id, req.user._id);
      return req.user;
    } else {
      return null;
    }
  }

  function genAnonId(req) {
    if (!req.session.anon_id) {
      req.session.anon_id = uuid.v4();
    }
    return req.user ? req.user._id : req.session.anon_id;
  }

  function trackPageView(req, res, next) {
    if (req.url.indexOf("/app") === 0) {
      mixpanel.track('hit', {
        distinct_id: identifyUserBySession(req),
        url: req.url,
        body: req.body,
        session: req.session,
        method: req.method,
        params: req.params,
        referrer: req.qs ? req.qs.ref || req.qs.referrer || null : null,
        distinct_id: genAnonId(req),
      });
    }
    next();
  }

  function trackNewConnection(socket) {
    mixpanel.track('socket.connection', {
      distinct_id: socket.request.user._id,
      user: socket.request.user,
    });
    mixpanel.people.set_once(socket.request.user._id, {
      $email: socket.request.user.email,
      $name: socket.request.user.name,
      $created: new Date(),
      user: JSON.stringify(socket.request.user),
    });
  }

  function trackUserLogin(req, res, next) {
    mixpanel.track("auth.login", {distinct_id: genAnonId(req)});
    next();
  }

  function trackOAuthCallback(user) {
    mixpanel.track("auth.callback", {
      distinct_id: user._id,
      provider: "github",
    });
  }

  return {
    identifyUserBySession,
    trackPageView,
    trackNewConnection,
    trackUserLogin,
    trackOAuthCallback,
  };
};
