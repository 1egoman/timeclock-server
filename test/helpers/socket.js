"use strict";
const EventEmitter = require("events").EventEmitter;

exports.createMockSocketWith = function createMockSocketWith(user) {
  let events = new EventEmitter();
  return Object.assign(events, {
    request: {
      user: Object.assign({}, {
        username: "username",
        badge_token: "badge-token",
        profile_url: "http://example.com/user/profile/here",
        provider: "github",
        access_token: "access-token-is-here",
        github_id: 12345,
        _id: "the-user-id-in-mongo",
        repos: [],
      }, user),
    }
  });
}
