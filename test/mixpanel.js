"use strict";
const assert = require("assert"),
      uuid = require("uuid"),
      sinon = require("sinon"),
      mixpanelHelpers = require("../lib/mixpanel");

describe("lib/mixpanel.js", function() {
  describe("identifyUserBySession", function() {
    it("should identify a user when given a authed user", function() {
      let mx = sinon.spy();
      assert.deepEqual(mixpanelHelpers(mx).identifyUserBySession({
        user: {foo: "bar"},
        session: {user: {foo: "bar"}},
      }), {
        foo: "bar"
      });
      assert.equal(mx.callCount, 0);
    });
    it("should alias an anon_id when anonymous", function() {
      let mx = {alias: sinon.spy()};
      assert.deepEqual(mixpanelHelpers(mx).identifyUserBySession({
        user: {foo: "bar", _id: "user-id-here"},
        session: {anon_id: "anon-id-here"},
      }), {
        foo: "bar",
        _id: "user-id-here",
      });
      assert(mx.alias.calledOnce);
      assert(mx.alias.calledWith("user-id-here", "anon-id-here"));
    });
    it("should delete a session anon id after alias", function() {
      let mx = {alias: sinon.spy()}, session = {anon_id: "anon-id-here"};
      assert.deepEqual(mixpanelHelpers(mx).identifyUserBySession({
        user: {foo: "bar", _id: "user-id-here"},
        session,
      }), {
        foo: "bar",
        _id: "user-id-here",
      });
      assert(mx.alias.calledOnce);
      assert(mx.alias.calledWith("user-id-here", "anon-id-here"));
      assert.deepEqual(session, {});
    });
    it("should when passed nothin return nothing", function() {
      let mx = {alias: sinon.spy()};
      assert.deepEqual(mixpanelHelpers(mx).identifyUserBySession({}), null);
      assert.equal(mx.alias.callCount, 0);
    });
  });
  describe("getAnonId", function() {
    it("should use a user id when given a authed user", function() {
      let mx = sinon.spy();
      assert.deepEqual(mixpanelHelpers(mx).genAnonId({
        user: {foo: "bar", _id: "user-id-here"},
        session: {user: {foo: "bar"}},
      }), "user-id-here");
      assert.equal(mx.callCount, 0);
    });
    it("should generate an anon id oitherwise", function() {
      let mx = sinon.spy();
      sinon.stub(uuid, "v4", () => "gen-anon-id");
      assert.deepEqual(mixpanelHelpers(mx).genAnonId({
        session: {},
      }), "gen-anon-id");
      assert.equal(mx.callCount, 0);
      assert(uuid.v4.calledOnce);
      assert(uuid.v4.calledWith());
      uuid.v4.restore();
    });
  })
});
