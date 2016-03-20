"use strict";
const assert = require("assert"),
      Promise = require("promise"),
      mocking = require("./helpers/mocking"),
      sinon = require("sinon"),
      User = require("../lib/model/user"),
      socket = require("../routes/socket");

// create a "mock" socket that wraps the real functionality
function createSocketWrapping(data, done, userN) {
  userN = userN || 1; // which user to log in (`logout` to be unauthed)
  return {
    emit(action, payload) {
      assert.equal(action, "action");
      assert.deepEqual(payload, data);
      done();
    },
    request: {
      user: mocking[`user${userN}`],
    },
  };
}

describe("routes/socket.js", function() {
  describe("server/DISCOVER_REPOS", function() {
    // it('should discover the repos specified', function(done) {
    //   let skt = createSocketWrapping({
    //     type: "server/REPOS_DISCOVERED",
    //     repos: mocking.repos,
    //   }, done), action = {type: "server/DISCOVER_REPOS"};
    //
    //   let response = socket(skt, {
    //     getUserRepos() {
    //       return new Promise((resolve) => resolve(mocking.github_repos));
    //     },
    //   })(action);
    // });
    it('should error on error', function(done) {
      let skt = createSocketWrapping({
        type: "server/ERROR",
        error: "an error",
      }, done), action = {type: "server/DISCOVER_REPOS"};

      let response = socket(skt, {
        getUserRepos() {
          return new Promise((resolve, reject) => reject("an error"));
        },
      })(action);
    });
  });
  describe("server/IMPORT_REPO", function() {
    it('should import a repo with valid info', function(done) {
      sinon.stub(User, "update").callsArgWith(2, null);
      let skt = {
        emit(action, data) {
          assert.equal(action, "action");
          if (data.type === "server/PUT_REPO") {
            assert.deepEqual(data, {
              type: "server/PUT_REPO",
              repo: mocking.repos[0],
            });
          } else {
            assert.deepEqual(data, {
              type: "server/REPO_IMPORT",
              repo: mocking.repos[0],
            });
          }
        },
        request: {user: mocking.user1},
      }, action = {
        type: "server/IMPORT_REPO",
        repo: mocking.repos[0],
      };

      let response = socket(skt)(action);

      assert(User.update.calledWith({_id: mocking.user1}, {
        $push: {repos: mocking.repos[0]},
      }));
      done();
    });
    it('should error on error', function(done) {
      let skt = createSocketWrapping({
        type: "server/ERROR",
        error: "an error",
      }, done), action = {
        type: "server/IMPORT_REPO",
        repo: mocking.repos[0],
      };

      let response = socket(skt, {}, {
        // mongoose user model
        update(identifier, query, cb) {
          assert.deepEqual(query, {
            $push: {repos: mocking.repos[0]},
          });
          cb("an error"); // no error
        },
      })(action);
    });
  });
  describe("server/GET_BRANCHES", function() {
    it('should get a repo\'s branches', function(done) {
      let skt = createSocketWrapping({
        type: "server/BRANCHES_FOR",
        branches: ["master", "a-branch"],
      }, done), action = {
        type: "server/GET_BRANCHES",
        user: "username",
        repo: "repo",
      };

      let response = socket(skt, {
        getBranchesForRepo() {
          return new Promise((resolve) => resolve([{name: "master"}, {name: "a-branch"}]));
        },
      })(action);
    });
    it('should error on error', function(done) {
      let skt = createSocketWrapping({
        type: "server/ERROR",
        error: "an error",
      }, done), action = {
        type: "server/GET_BRANCHES",
        user: "username",
        repo: "repo",
      };

      let response = socket(skt, {
        getBranchesForRepo() {
          return new Promise((resolve, reject) => reject("an error"));
        },
      })(action);
    });
  });
  describe("server/GET_TIMECARD", function() {
    it('should get a timecard for a repo');
    it('should error on error');
  });
});
