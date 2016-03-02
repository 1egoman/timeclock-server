"use strict";
import assert from "assert";
import helpers from "../helpers";
import {
  importFromGithubRepo,
  selectRepo,
  requestAllUserRepos,
  openRepoImportDialog,
  changeBranch,
  getBranches,
  getTimecard,
} from '../../actions/repo';

describe('actions/repo.js', function() {
  describe('openRepoImportDialog', function() {
    it('should create the event', function() {
      assert.deepEqual(openRepoImportDialog(true), {
        type: "REPO_IMPORT_DIALOG",
        state: true,
        provider: "github",
      });
    });
  });
  describe('importFromGithubRepo', function() {
    it('should create the event', function() {
      assert.deepEqual(importFromGithubRepo({foo: "bar"}), {
        type: "server/IMPORT_REPO",
        repo: {foo: "bar"},
        provider: "github",
      });
    });
  });
  describe('requestAllUserRepos', function() {
    it('should create the event', function() {
      assert.deepEqual(requestAllUserRepos(), {
        type: "server/DISCOVER_REPOS",
      });
    });
  });
  describe('selectRepo', function() {
    it('should create the event', function() {
      assert.deepEqual(selectRepo({user: "username", repo: "repository"}), {
        type: "SELECT_REPO",
        index: ["username", "repository"],
      });
    });
  });
  describe('changeBranch', function() {
    it('should create the event', function() {
      assert.deepEqual(changeBranch("master"), {
        type: "CHANGE_BRANCH",
        branch: "master",
      });
    });
  });
  describe('getBranches', function() {
    it('should create the event', function() {
      assert.deepEqual(getBranches({user: "username", repo: "repository"}), {
        type: "server/GET_BRANCHES",
        user: "username",
        repo: "repository",
      });
    });
  });
  describe('getTimecard', function() {
    it('should create the event', function() {
      assert.deepEqual(getTimecard({user: "username", repo: "repository"}), {
        type: "server/GET_TIMECARD",
        user: "username",
        repo: "repository",
        branch: null,
        page: 0,
      });
      assert.deepEqual(getTimecard({user: "username", repo: "repository"}, "a-branch"), {
        type: "server/GET_TIMECARD",
        user: "username",
        repo: "repository",
        branch: "a-branch",
        page: 0,
      });
      assert.deepEqual(getTimecard({user: "username", repo: "repository"}, "a-branch", 1), {
        type: "server/GET_TIMECARD",
        user: "username",
        repo: "repository",
        branch: "a-branch",
        page: 1,
      });
    });
  });
});
