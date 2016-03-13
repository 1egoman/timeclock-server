"use strict";
module.exports = function(mixpanel) {
  function identifyUserBySession(req) {
    if (req.session && req.session.passport) {
      return req.session.passport.user;
    } else {
      return null;
    }
  }

  function trackPageView(req, res, next) {
    mixpanel.track('hit', {
      distinct_id: identifyUserBySession(req),
      url: req.url,
      body: req.body,
      session: req.session,
      method: req.method,
      params: req.params,
      referrer: req.qs ? req.qs.ref || req.qs.referrer || null : null,
    });
    next();
  }

  function trackNewConnection(socket) {
    mixpanel.track('socket.connection', {
      distinct_id: socket.request.user._id,
    });
    mixpanel.people.set_once(socket.request.user._id, {
      $email: socket.request.user.email,
      $name: socket.request.user.name,
      $created: new Date(),
      user: socket.request.user,
    });
  }

  return {
    identifyUserBySession,
    trackPageView,
    trackNewConnection,
  };
};
