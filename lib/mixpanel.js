"use strict";
const uuid = require("uuid"),
      _ = require("underscore");

module.exports = function(mixpanel) {
  function identifyUserBySession(req) {
    if (req.session && req.user) {
      // if there is an anonymous id, alias it
      if (req.session.anon_id) {
        mixpanel.alias(req.user._id, req.session.anon_id);
        delete req.session.anon_id;
      }
      return req.user._id;
    } else {
      return null;
    }
  }

  function genAnonId(req) {
    if (req.user) {
      return req.user._id;
    } else if (!req.session.anon_id) {
      req.session.anon_id = uuid.v4();
    }
    return req.session.anon_id;
  }

  function indexABTesting(req) {
    console.log(req.session.ab)
    if (req.session.ab) {
      return req.session.ab;
    } else {
      let ab = {};
      ab.bgColor = _.sample(["primary", "info"]);
      // ab.btnGoTextTop = _.sample(["Sign in with Github", "Sign up for free", "Get started right now"]);
      // ab.btnGoTextBottom = _.sample(["Sign up", "Sign up for free", "Create a new project"]);
      ab.ctaButtonColor = "none"; //_.sample(["green", "none"]);

      req.session.ab = ab;
      return ab;
    }
  }

  function trackPageView(req, res, next) {
    let abTesting = indexABTesting(req);
    mixpanel.track('hit', {
      distinct_id: identifyUserBySession(req),
      url: req.url,
      body: req.body,
      session: req.session,
      method: req.method,
      params: req.params,
      headers: req.headers,
      referrer: req.query ? req.query.ref || req.query.referrer || null : null,
      distinct_id: genAnonId(req),
      abTestingBgColor: abTesting.bgColor,
      abTestingCtaButtonColor: abTesting.ctaButtonColor,
    });
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
    mixpanel.track("auth.login", {distinct_id: identifyUserBySession(req)});
    next();
  }

  function trackOAuthCallback(user) {
    mixpanel.track("auth.signup", {
      distinct_id: user._id,
      provider: "github",
    });
  }

  function track(socket, name, data) {
    mixpanel.track(name, Object.assign({}, data, {
      distinct_id: socket.request.user._id,
    }));
  }

  return {
    identifyUserBySession,
    genAnonId,
    trackPageView,
    trackNewConnection,
    trackUserLogin,
    trackOAuthCallback,
    track,
  };
};
