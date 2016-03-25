"use strict";
const assert = require("assert"),
      Promise = require("promise"),
      socketHelpers = require("../helpers/socket"),
      repo = require("../../lib/repo"),
      card = require("../../lib/card"),
      getTimecard = require("../../lib/events/getTimecard"),
      sinon = require("sinon"),
      _ = require("underscore"),
      User = require("../../lib/models/user");

describe("lib/events/getTimecard.js", function() {
  describe("with valid empty timecard and users", function() {
    beforeEach(() => {
      sinon.stub(repo, "getFileFromRepo").resolves({card: [], foo: "bar"});
      sinon.stub(repo, "getUserMetaFor").resolves({username: "a-user", some: "metadata"});
    });
    afterEach(() => {
      repo.getFileFromRepo.restore();
      repo.getUserMetaFor.restore();
    });

    it('should get a timecard for a repo', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [{user: "a-user", repo: "a-repo"}],
      });

      let response = getTimecard({
        type: "server/GET_TIMECARD",
        user: "a-user",
        repo: "a-repo",
        branch: "master",
        page: 0,
      }, skt).then((data) => {
        assert.deepEqual(data, {
          type: "server/TIMECARD",
          user: "a-user",
          repo: "a-repo",
          branch: "master",
          users: [],
          timecard: {card: [], foo: "bar"},
          page: 0,
          canpaginateforward: false,
        });
        done();
      }).catch(done);
    });
    it('should get a timecard for a repo, using the default branch', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [{user: "a-user", repo: "a-repo", default_branch: "default-branch"}],
      });

      let response = getTimecard({
        type: "server/GET_TIMECARD",
        user: "a-user",
        repo: "a-repo",
        branch: null,
        page: 0,
      }, skt).then((data) => {
        assert.deepEqual(data, {
          type: "server/TIMECARD",
          user: "a-user",
          repo: "a-repo",
          branch: null,
          users: [],
          timecard: {card: [], foo: "bar"},
          page: 0,
          canpaginateforward: false,
        });
        done();
      }).catch(done);
    });
  });
  describe("with valid 10-entry timecard and users", function() {
    let timecard = _.range(0, 10).map((i) => {
      return {
        date: "Sun Jan 17 2016",
        disabled: false,
        times: [
          {start: "1:00:00", end: "2:00:00", by: "a-user"},
          {start: "3:00:00", end: "4:00:00", by: "a-user"},
        ],
      };
    });

    beforeEach(() => {
      sinon.stub(repo, "getFileFromRepo").resolves({card: timecard, foo: "bar"});
      sinon.stub(repo, "getUserMetaFor") .resolves({username: "a-user", some: "metadata"});
    });
    afterEach(() => {
      repo.getFileFromRepo.restore();
      repo.getUserMetaFor.restore();
    });

    it('should get a timecard for a repo, with users', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [{user: "a-user", repo: "a-repo"}],
      });

      let response = getTimecard({
        type: "server/GET_TIMECARD",
        user: "a-user",
        repo: "a-repo",
        branch: "master",
        page: 0,
      }, skt).then((data) => {
        assert.deepEqual(data, {
          type: "server/TIMECARD",
          user: "a-user",
          repo: "a-repo",
          branch: "master",
          users: [{
            some: "metadata",
            username: "a-user",
          }],
          timecard: {card: timecard, foo: "bar"},
          page: 0,
          canpaginateforward: false,
        });
        done();
      }).catch(done);
    });
  });
  describe("with valid 100-entry timecard and users", function() {
    let timecard = _.range(0, 100).map((i, ct) => {
      return {
        date: "Sun Jan 17 2016",
        disabled: false,
        times: [
          {start: "1:00:00", end: "2:00:00", by: "a-user"},
          {start: "3:00:00", end: "4:00:00", by: "a-user"},
        ],
        _test_item_number: ct,
      };
    });

    beforeEach(() => {
      sinon.stub(repo, "getFileFromRepo").resolves({card: timecard, foo: "bar"});
      sinon.stub(repo, "getUserMetaFor") .resolves({username: "a-user", some: "metadata"});
    });
    afterEach(() => {
      repo.getFileFromRepo.restore();
      repo.getUserMetaFor.restore();
    });

    it('should get a timecard for a repo, with pagination (pg 1)', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [{user: "a-user", repo: "a-repo"}],
      });

      let response = getTimecard({
        type: "server/GET_TIMECARD",
        user: "a-user",
        repo: "a-repo",
        branch: "master",
        page: 1,
      }, skt).then((data) => {
        assert.deepEqual(data, {
          type: "server/TIMECARD",
          user: "a-user",
          repo: "a-repo",
          branch: "master",
          users: [{
            some: "metadata",
            username: "a-user",
          }],
          timecard: {card: timecard.slice(20, 40), foo: "bar"},
          page: 1,
          canpaginateforward: true,
        });
        done();
      }).catch(done);
    });
    it('should get a timecard for a repo, with pagination (pg 2)', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [{user: "a-user", repo: "a-repo"}],
      });

      let response = getTimecard({
        type: "server/GET_TIMECARD",
        user: "a-user",
        repo: "a-repo",
        branch: "master",
        page: 2,
      }, skt).then((data) => {
        assert.deepEqual(data, {
          type: "server/TIMECARD",
          user: "a-user",
          repo: "a-repo",
          branch: "master",
          users: [{
            some: "metadata",
            username: "a-user",
          }],
          timecard: {card: timecard.slice(40, 60), foo: "bar"},
          page: 2,
          canpaginateforward: true,
        });
        done();
      }).catch(done);
    });
  });
  describe("with valid 10-entry timecard, but users fail", function() {
    let timecard = _.range(0, 10).map((i) => {
      return {
        date: "Sun Jan 17 2016",
        disabled: false,
        times: [
          {start: "1:00:00", end: "2:00:00", by: "a-user"},
          {start: "3:00:00", end: "4:00:00", by: "a-user"},
        ],
      };
    });

    beforeEach(() => {
      sinon.stub(repo, "getFileFromRepo").resolves({card: timecard, foo: "bar"});
      sinon.stub(repo, "getUserMetaFor").rejects("bad things going on");
    });
    afterEach(() => {
      repo.getFileFromRepo.restore();
      repo.getUserMetaFor.restore();
    });

    it('should get a timecard for a repo, with users', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [{user: "a-user", repo: "a-repo"}],
      });

      let response = getTimecard({
        type: "server/GET_TIMECARD",
        user: "a-user",
        repo: "a-repo",
        branch: "master",
        page: 0,
      }, skt).then((data) => {
        done("Should have failed.");
      }).catch((err) => {
        assert.equal(err.message, "Error: bad things going on");
        done();
      }).catch(done);
    });
  });
  describe("with bad timecard, repo doesn't exist", function() {
    beforeEach(() => {
      sinon.stub(repo, "getFileFromRepo").rejects("Not Found");
      sinon.stub(repo, "getUserMetaFor").resolves({username: "a-user", some: "metadata"});
    });
    afterEach(() => {
      repo.getFileFromRepo.restore();
      repo.getUserMetaFor.restore();
    });

    it('should not get a timecard for a repo that doesn\'t exist', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [{user: "a-user", repo: "a-repo"}],
      });

      let response = getTimecard({
        type: "server/GET_TIMECARD",
        user: "a-user",
        repo: "a-repo",
        branch: "master",
        page: 0,
      }, skt).then((data) => {
        done("Should have failed.");
      }).catch((err) => {
        assert.equal(err, "NO_TIMECARD_IN_REPO");
        done();
      }).catch(done);
    });
  });
  describe("with bad timecard, unexpected error", function() {
    let thrown_error = new Error("Big bad error");
    beforeEach(() => {
      sinon.stub(repo, "getFileFromRepo").rejects(thrown_error);
      sinon.stub(repo, "getUserMetaFor").resolves({username: "a-user", some: "metadata"});
    });
    afterEach(() => {
      repo.getFileFromRepo.restore();
      repo.getUserMetaFor.restore();
    });

    it('should handle the big bad error', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [{user: "a-user", repo: "a-repo"}],
      });

      let response = getTimecard({
        type: "server/GET_TIMECARD",
        user: "a-user",
        repo: "a-repo",
        branch: "master",
        page: 0,
      }, skt).then((data) => {
        done("Should have failed.");
      }).catch((err) => {
        assert.equal(err, thrown_error);
        done();
      }).catch(done);
    });
  });
  describe("with bad timecard, doesn't validate", function() {
    beforeEach(() => {
      sinon.stub(repo, "getFileFromRepo").resolves({bad: "timecard"});
      sinon.stub(repo, "getUserMetaFor").resolves({username: "a-user", some: "metadata"});
    });
    afterEach(() => {
      repo.getFileFromRepo.restore();
      repo.getUserMetaFor.restore();
    });

    it('should not have a validating timecard', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [{user: "a-user", repo: "a-repo"}],
      });

      let response = getTimecard({
        type: "server/GET_TIMECARD",
        user: "a-user",
        repo: "a-repo",
        branch: "master",
        page: 0,
      }, skt).then((data) => {
        done("Should have failed.");
      }).catch((err) => {
        assert.equal(err, "Timecard isn't a timecard.");
        done();
      }).catch(done);
    });
  });
});

