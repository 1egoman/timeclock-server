"use strict";
const assert = require("assert"),
      Promise = require("promise"),
      socketHelpers = require("../helpers/socket"),
      repo = require("../../lib/repo"),
      card = require("../../lib/card"),
      deleteRepo = require("../../lib/events/deleteRepo"),
      sinon = require("sinon"),
      User = require("../../lib/models/user");

describe("lib/events/deleteRepo.js", function() {
  describe("with a successful user model update", function() {
    beforeEach(() => {
      sinon.stub(User, "update").callsArgWith(2, null);
    });
    afterEach(() => {
      User.update.restore();
    });

    it('should delete a repo with valid info', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      });

      let response = deleteRepo({
        type: "server/DELETE_REPO",
        user: "a-user",
        repo: "a-repo",
      }, skt).then(() => {
        assert.deepEqual(User.update.firstCall.args.slice(0, 2), [{_id: skt.request.user}, {
          $pull: {
            repos: {user: "a-user", repo: "a-repo"},
          },
        }]);
        done();
      }).catch(done);
    });
  });
  describe("with a failed update", function() {
    beforeEach(() => {
      sinon.stub(User, "update").callsArgWith(2, "big bad error");
    });
    afterEach(() => {
      User.update.restore();
    });

    it('should handle an error on delete', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      });

      let response = deleteRepo({
        type: "server/DELETE_REPO",
        user: "a-user",
        repo: "a-repo",
      }, skt).then((data) => {
        done("Should have failed.");
      }).catch((err) => {
        assert.equal(err.message, "big bad error");
        done();
      }).catch(done);
    });
  });
});
