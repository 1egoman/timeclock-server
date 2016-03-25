"use strict";
const assert = require("assert"),
      Promise = require("promise"),
      socketHelpers = require("../helpers/socket"),
      repo = require("../../lib/repo"),
      card = require("../../lib/card"),
      importRepo = require("../../lib/events/importRepo"),
      sinon = require("sinon"),
      User = require("../../lib/models/user");

describe("lib/events/importRepo.js", function() {
  beforeEach(() => {
    sinon.stub(User, "update").callsArgWith(2, null);
    sinon.stub(repo, "createTimecardInRepo").resolves(true);
  });
  afterEach(() => {
    User.update.restore();
    repo.createTimecardInRepo.restore();
  });

  it('should import a repo with valid info', function() {
    let skt = socketHelpers.createMockSocketWith({
      repos: [],
    });

    let response = importRepo({
      type: "server/IMPORT_REPO",
      repo: {user: "a-user", repo: "a-repo", foo: "bar", is_private: false},
    }, skt);

    assert.deepEqual(User.update.firstCall.args.slice(0, 2), [{_id: skt.request.user}, {
      $push: {
        repos: {user: "a-user", repo: "a-repo", foo: "bar", is_private: false},
      },
    }]);
  });
  it('should import a repo with valid info, defaulting on is_private', function() {
    let skt = socketHelpers.createMockSocketWith({
      repos: [],
    });

    let response = importRepo({
      type: "server/IMPORT_REPO",
      repo: {user: "a-user", repo: "a-repo", foo: "bar"},
    }, skt);

    assert.deepEqual(User.update.firstCall.args.slice(0, 2), [{_id: skt.request.user}, {
      $push: {
        repos: {user: "a-user", repo: "a-repo", foo: "bar", is_private: false},
      },
    }]);
  });
  it('should import a repo with valid info, and create a timecard', function(done) {
    let skt = socketHelpers.createMockSocketWith({
      repos: [],
    });

    let response = importRepo({
      type: "server/IMPORT_REPO",
      repo: {user: "a-user", repo: "a-repo", foo: "bar", is_private: false},
      createtimecard: "master",
    }, skt).then(() => {

      // create a timecard in the right way
      assert.deepEqual(repo.createTimecardInRepo.firstCall.args, [
        "a-user",
        "a-repo",
        "master",
        card.baseTimecard(),
        skt.request.user,
      ]);

      // added the repo
      assert.deepEqual(User.update.firstCall.args.slice(0, 2), [{_id: skt.request.user}, {
        $push: {
          repos: {user: "a-user", repo: "a-repo", foo: "bar", is_private: false},
        },
      }]);

      done();
    }).catch(done);
  });
  it('should import a repo with valid info, and create a timecard, falling back on default branch', function(done) {
    let skt = socketHelpers.createMockSocketWith({
      repos: [],
    });

    let response = importRepo({
      type: "server/IMPORT_REPO",
      repo: {user: "a-user", repo: "a-repo", foo: "bar", default_branch: "default-branch", is_private: false},
      createtimecard: true,
    }, skt).then(() => {

      // create a timecard in the right way
      assert.deepEqual(repo.createTimecardInRepo.firstCall.args, [
        "a-user",
        "a-repo",
        "default-branch",
        card.baseTimecard(),
        skt.request.user,
      ]);

      // added the repo
      assert.deepEqual(User.update.firstCall.args.slice(0, 2), [{_id: skt.request.user}, {
        $push: {
          repos: {
            user: "a-user",
            repo: "a-repo",
            foo: "bar",
            is_private: false,
            default_branch: "default-branch",
          },
        },
      }]);

      done();
    }).catch(done);
  });
  it('should import a repo with valid info, and create a timecard, including timecard data in action', function(done) {
    let skt = socketHelpers.createMockSocketWith({
      repos: [],
    });

    let response = importRepo({
      type: "server/IMPORT_REPO",
      repo: {user: "a-user", repo: "a-repo", foo: "bar", is_private: false},
      createtimecard: "master",
      timecard: {foo: "bar"},
    }, skt).then(() => {

      // create a timecard in the right way
      assert.deepEqual(repo.createTimecardInRepo.firstCall.args, [
        "a-user",
        "a-repo",
        "master",
        Object.assign({}, card.baseTimecard(), {foo: "bar"}),
        skt.request.user,
      ]);

      // added the repo
      assert.deepEqual(User.update.firstCall.args.slice(0, 2), [{_id: skt.request.user}, {
        $push: {
          repos: {user: "a-user", repo: "a-repo", foo: "bar", is_private: false},
        },
      }]);

      done();
    }).catch(done);
  });

  describe("with a private repo", () => {
    it('should import a private repo with valid info', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
        plan: "disco",
      });

      let response = importRepo({
        type: "server/IMPORT_REPO",
        repo: {user: "a-user", repo: "a-repo", foo: "bar", is_private: true},
      }, skt).then((data) => {
        assert.deepEqual(User.update.firstCall.args.slice(0, 2), [{_id: skt.request.user}, {
          $push: {
            repos: {user: "a-user", repo: "a-repo", foo: "bar", is_private: true},
          },
        }]);
        done();
      });
    });
    it('should not import a private repo with valid info when we\'ve gone over the limit', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [{user: "a-user", repo: "a-repo", foo: "bar", is_private: true}],
        plan: "disco", // only one repo, and we've already got a private one
      });

      let response = importRepo({
        type: "server/IMPORT_REPO",
        repo: {user: "a-user", repo: "a-repo", foo: "bar", is_private: true},
      }, skt).then(() => {
        done("Should have failed.");
      }).catch((data) => {
        assert.equal(data, "You don't have enough alloted private repos to create another. Please upgrade your plan.");
        done();
      });
    });
  });
});
