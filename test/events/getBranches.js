"use strict";
const assert = require("assert"),
      Promise = require("promise"),
      socketHelpers = require("../helpers/socket"),
      repo = require("../../lib/repo"),
      card = require("../../lib/card"),
      getBranches = require("../../lib/events/getBranches"),
      sinon = require("sinon"),
      User = require("../../lib/models/user");

describe("lib/events/deleteRepo.js", function() {
  describe("with a successful user model update", function() {
    beforeEach(() => {
      sinon.stub(repo, "getBranchesForRepo").resolves([
        {name: "master"},
        {name: "dev"},
        {name: "a-branch"},
      ]);
    });
    afterEach(() => {
      repo.getBranchesForRepo.restore();
    });

    it('should get branches successfully', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      });

      let response = getBranches({
        type: "server/GET_BRANCHES",
        user: "a-user",
        repo: "a-repo",
      }, skt).then((branches) => {
        assert.deepEqual(branches, ["master", "dev", "a-branch"]);
        done();
      }).catch(done);
    });
  });
  describe("with a failed update", function() {
    beforeEach(() => {
      sinon.stub(repo, "getBranchesForRepo").rejects("big bad error");
    });
    afterEach(() => {
      repo.getBranchesForRepo.restore();
    });

    it('should handle errors', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      });

      let response = getBranches({
        type: "server/GET_BRANCHES",
        user: "a-user",
        repo: "a-repo",
      }, skt).then((branches) => {
        done("Should have failed.");
      }).catch((err) => {
        assert.deepEqual(err.message, "big bad error");
        done();
      }).catch(done);
    });
  });
});
