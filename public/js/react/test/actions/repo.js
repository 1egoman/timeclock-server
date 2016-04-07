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
  getCommits,
  getTimecard,
  askUserToCreateNewTimecard,
  changeStagingTimecardData,
  deleteRepo,
  shareWithEmails,
  switchRepoTab,
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
        createtimecard: false,
        timecard: null,
      });
    });
    it('should create the event, and create timecard', function() {
      assert.deepEqual(importFromGithubRepo({foo: "bar"}, true), {
        type: "server/IMPORT_REPO",
        repo: {foo: "bar"},
        provider: "github",
        createtimecard: true,
        timecard: null,
      });
    });
  });
  describe('requestAllUserRepos', function() {
    it('should create the event', function() {
      assert.deepEqual(requestAllUserRepos(), {
        type: "server/DISCOVER_REPOS",
        page: 0,
      });
    });
    it('should create the event with a page', function() {
      assert.deepEqual(requestAllUserRepos(1), {
        type: "server/DISCOVER_REPOS",
        page: 1,
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
  describe('getCommits', function() {
    it('should create the event', function() {
      assert.deepEqual(getCommits({user: "username", repo: "repository"}, "master"), {
        type: "server/GET_COMMITS",
        user: "username",
        repo: "repository",
        ref: "master"
      });
    });
    it('should create the event, without a branch', function() {
      assert.deepEqual(getCommits({user: "username", repo: "repository"}), {
        type: "server/GET_COMMITS",
        user: "username",
        repo: "repository",
        ref: null,
      });
    });
    it('should create the event, without a branch, defaulting to repo default_branch', function() {
      assert.deepEqual(getCommits({user: "username", repo: "repository", default_branch: "master"}), {
        type: "server/GET_COMMITS",
        user: "username",
        repo: "repository",
        ref: "master",
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
  describe('askUserToCreateNewTimecard', function() {
    it('should create the event', function() {
      assert.deepEqual(askUserToCreateNewTimecard('a-user', 'a-repo'), {
        type: "NEW_TIMECARD_IN_DISCOVERED_REPO",
        user: 'a-user',
        repo: 'a-repo',
      });
    });
    it('should create the event with a boolean', function() {
      assert.deepEqual(askUserToCreateNewTimecard(false, false), {
        type: "NEW_TIMECARD_IN_DISCOVERED_REPO",
        user: false,
        repo: false,
      });
    });
  });
  describe('changeStagingTimecardData', function() {
    it('should create the event', function() {
      assert.deepEqual(changeStagingTimecardData("name", "a-repo-name"), {
        type: "CHANGE_NEW_TIMECARD_DATA",
        data: {
          name: "a-repo-name",
        },
      });
    });
  });
  describe('deleteRepo', function() {
    it('should create the event', function() {
      assert.deepEqual(deleteRepo("user-name", "a-repo-name"), {
        type: "server/DELETE_REPO",
        user: "user-name",
        repo: "a-repo-name",
      });
    });
  });
  describe('shareWithEmails', function() {
    it('should create the event', function() {
      assert.deepEqual(shareWithEmails("a-user", "a-repo", ["foo@bar.com", "my@email.org"], "Lorem Ipsum."), {
        type: "server/SHARE_WITH",
        via: "email",
        emails: ["foo@bar.com", "my@email.org"],
        message: "Lorem Ipsum.",
        user: "a-user",
        repo: "a-repo",
      });
    });
  });
  describe('switchRepoTab', function() {
    it('should create the event', function() {
      assert.deepEqual(switchRepoTab("tab"), {
        type: "SWITCH_REPO_TAB",
        tab: "tab",
      });
    });
  });
});
