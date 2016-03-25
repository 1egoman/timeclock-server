"use strict";
const assert = require("assert"),
      Promise = require("promise"),
      socketHelpers = require("../helpers/socket"),
      mocking = require("../helpers/mocking"),
      repo = require("../../lib/repo"),
      card = require("../../lib/card"),
      resetToken = require("../../lib/events/resetToken"),
      sinon = require("sinon"),
      uuid = require("uuid"),
      User = require("../../lib/models/user");

describe("lib/events/resetToken.js", function() {
  describe("with a successful user model update", function() {
    let user_model = {
      repos: [],
      badge_token: "old-badge-token",
      save: (done) => done(null) // a stub save method in the user model
    };

    beforeEach(() => {
      sinon.stub(User, "findOne").callsArgWith(1, null, user_model);
      sinon.stub(uuid, "v4", () => "uuid-v4-here");
    });
    afterEach(() => {
      User.findOne.restore();
      uuid.v4.restore();
    });

    it('should delete a repo with valid info', function(done) {
      let skt = socketHelpers.createMockSocketWith(user_model);

      let response = resetToken({
        type: "server/RESET_TOKEN",
        old_token: "old-uuid-token",
        username: "a-user",
      }, skt).then((data) => {
        assert.equal(data.badge_token, "uuid-v4-here");
        assert.equal(data.user.badge_token, "uuid-v4-here");
        done();
      }).catch(done);
    });
  });
  describe("with a non-existing user", function() {
    let user_model = {
      repos: [],
      badge_token: "old-badge-token",
      save: (done) => done(null) // a stub save method in the user model
    };

    beforeEach(() => {
      sinon.stub(User, "findOne").callsArgWith(1, null, null);
      sinon.stub(uuid, "v4", () => "uuid-v4-here");
    });
    afterEach(() => {
      User.findOne.restore();
      uuid.v4.restore();
    });

    it('should error on a bad token', function(done) {
      let skt = socketHelpers.createMockSocketWith(user_model);

      let response = resetToken({
        type: "server/RESET_TOKEN",
        old_token: "old-uuid-token",
        username: "i-do-not-exist",
      }, skt).then((data) => {
        done("Should have failed.");
      }).catch((err) => {
        assert.equal(err.message, "No user was found with that badge token.");
        done();
      }).catch(done);
    });
  });
  describe("with a bad user model update (findOne)", function() {
    let user_model = {
      repos: [],
      badge_token: "old-badge-token",
      save: (done) => done(null) // a stub save method in the user model
    };

    beforeEach(() => {
      sinon.stub(User, "findOne").callsArgWith(1, "big bad error");
      sinon.stub(uuid, "v4", () => "uuid-v4-here");
    });
    afterEach(() => {
      User.findOne.restore();
      uuid.v4.restore();
    });

    it('should handle error', function(done) {
      let skt = socketHelpers.createMockSocketWith(user_model);

      let response = resetToken({
        type: "server/RESET_TOKEN",
        old_token: "old-uuid-token",
        username: "a-user",
      }, skt).then((data) => {
        done("Should have failed.");
      }).catch((err) => {
        assert.equal(err.message, "big bad error");
        done();
      }).catch(done);
    });
  });
  describe("with a bad user model update (save)", function() {
    let user_model = {
      repos: [],
      badge_token: "old-badge-token",
      save: (done) => done("big bad error") // a stub save method in the user model
    };

    beforeEach(() => {
      sinon.stub(User, "findOne").callsArgWith(1, null, user_model);
      sinon.stub(uuid, "v4", () => "uuid-v4-here");
    });
    afterEach(() => {
      User.findOne.restore();
      uuid.v4.restore();
    });

    it('should handle error', function(done) {
      let skt = socketHelpers.createMockSocketWith(user_model);

      let response = resetToken({
        type: "server/RESET_TOKEN",
        old_token: "old-uuid-token",
        username: "a-user",
      }, skt).then((data) => {
        done("Should have failed.");
      }).catch((err) => {
        assert.equal(err.message, "big bad error");
        done();
      }).catch(done);
    });
  });
});

