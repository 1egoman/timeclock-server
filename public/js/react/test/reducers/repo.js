"use strict";
import assert from "assert";
import helpers from "../helpers";
import {
  repos,
  activeRepo,
  repoImportDialogOpen,
  discoveredRepos,
  discoveredReposPage,
  repoDetails,
} from '../../reducers/repo';
const old_state = helpers.initialState;

describe('reducers/repo.js', function() {
  describe('repoImportDialogOpen', function() {
    it('should show the dialog on server/DISCOVER_REPOS', function() {
      let new_state = repoImportDialogOpen(old_state.repo_import_dialog_open, {
        type: "server/DISCOVER_REPOS",
      });
      assert.deepEqual(new_state, true);
    });
    it('should hide the dialog on SELECT_REPO', function() {
      let new_state = repoImportDialogOpen(old_state.repo_import_dialog_open, {
        type: "SELECT_REPO",
      });
      assert.deepEqual(new_state, false);
    });
    it('should show the dialog on server/REPO_IMPORT', function() {
      let new_state = repoImportDialogOpen(old_state.repo_import_dialog_open, {
        type: "server/REPO_IMPORT",
      });
      assert.deepEqual(new_state, false);
    });
    it('should not be effected by another event', function() {
      let new_state = activeRepo(old_state.repo_import_dialog_open, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, old_state.repo_import_dialog_open);
    });
  });
  describe('repos', function() {
    it('should work with PUT_REPO', function() {
      let new_state = repos(old_state.repos, {
        type: "PUT_REPO",
        index: 0,
        repo: {foo: "bar"},
      });
      assert.deepEqual(new_state, [{
        foo: "bar"
      }, ...old_state.repos.slice(1)]);
    });
    it('should work with server/PUT_REPO', function() {
      let new_state = repos(old_state.repos, {
        type: "server/PUT_REPO",
        index: 0,
        repo: {foo: "bar"},
      });
      assert.deepEqual(new_state, [{
        foo: "bar"
      }, ...old_state.repos.slice(1)]);
    });
    it('should work with server/INIT', function() {
      let new_state = repos(old_state.repos, {
        type: "server/INIT",
        repos: [{foo: "bar"}],
      });
      assert.deepEqual(new_state, [{foo: "bar"}]);
    });
    it('should not be effected by another event', function() {
      let new_state = repos(old_state.repos, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, old_state.repos);
    });
  });
  describe('activeRepo', function() {
    it('should select a repo on SELECT_REPO', function() {
      let new_state = activeRepo(old_state.active_repo, {
        type: "SELECT_REPO",
        index: 12,
      });
      assert.deepEqual(new_state, 12);
    });
    it('should deselect all repos on server/DISCOVER_REPOS', function() {
      let new_state = activeRepo(old_state.active_repo, {
        type: "server/DISCOVER_REPOS",
      });
      assert.deepEqual(new_state, null);
    });
    it('should not be effected by another event', function() {
      let new_state = activeRepo(old_state.active_repo, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, old_state.active_repo);
    });
  });
  describe('discoveredRepos', function() {
    it('should create the event', function() {
      let new_state = discoveredRepos(old_state.discovered_repos, {
        type: "server/REPOS_DISCOVERED",
        repos: [{foo: "bar"}],
        page: 1,
      });
      assert.deepEqual(new_state, [{foo: "bar"}]);
    });
    it('should not be effected by another event', function() {
      let new_state = discoveredRepos(old_state.discovered_repos, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, old_state.discovered_repos);
    });
  });
  describe('repoDetails', function() {
    it('should change branch on CHANGE_BRANCH', function() {
      let new_state = repoDetails(Object.assign({}, old_state.repo_details, {
        timecard: {foo: "bar"}, // to test the clearing of the timecard
      }), {
        type: "CHANGE_BRANCH",
        branch: "another-branch"
      });
      assert.deepEqual(new_state, {
        branch: "another-branch",
        branches: null,
        timecard: null,
        _comesfrom: [null, null],
        _page: 0,
        _canpaginateforward: false,
      });
    });
    it('should reset branch on SELECT_REPO', function() {
      let new_state = repoDetails(old_state.repo_details, {
        type: "SELECT_REPO",
        index: 0,
      });
      assert.deepEqual(new_state, {
        branch: null,
        branches: null,
        timecard: null,
        _comesfrom: [null, null],
        _page: 0,
        _canpaginateforward: false,
      });
    });
    it('should reset branch on server/BRANCHES_FOR', function() {
      let new_state = repoDetails(old_state.repo_details, {
        type: "server/BRANCHES_FOR",
        branches: ["master", "dev", "a-branch"],
      });
      assert.deepEqual(new_state, {
        branch: null,
        branches: ["master", "dev", "a-branch"],
        timecard: null,
        _comesfrom: [null, null],
        _page: 0,
        _canpaginateforward: false,
      });
    });
    it('should reset branch on server/TIMECARD', function() {
      let new_state = repoDetails(old_state.repo_details, {
        type: "server/TIMECARD",
        user: "username",
        repo: "a-repository",
        timecard: {foo: "bar"},
        users: [{foo: "baz"}],
        page: 0,
        canpaginateforward: false,
      });
      assert.deepEqual(new_state, {
        branch: null,
        branches: null,
        timecard: {foo: "bar"},
        users: [{foo: "baz"}],
        _comesfrom: ["username", "a-repository", null],
        _page: 0,
        _canpaginateforward: false,
      });
    });
    it('should amend to timecard on server/TIMECARD', function() {
      // fetch an iterim page in the group (any page but last)
      let new_state = repoDetails(old_state.repo_details, {
        type: "server/TIMECARD",
        user: "username",
        repo: "a-repository",
        branch: "ref",
        timecard: {card: [{foo: "bar"}]},
        users: [{foo: "baz"}],
        page: 0,
        canpaginateforward: true,
      });
      assert.deepEqual(new_state, {
        branch: null,
        branches: null,
        timecard: {card: [{foo: "bar"}]},
        users: [{foo: "baz"}],
        _comesfrom: ["username", "a-repository", "ref"],
        _page: 0,
        _canpaginateforward: true,
      });

      // now, "fetch" the last page in the group
      let second_new_state = repoDetails(new_state, {
        type: "server/TIMECARD",
        user: "username",
        repo: "a-repository",
        branch: "ref",
        timecard: {card: [{hello: "world"}]},
        users: [{second: "user"}],
        page: 1,
        canpaginateforward: false,
      });
      assert.deepEqual(second_new_state, {
        branch: null,
        branches: null,
        timecard: {card: [{foo: "bar"}, {hello: "world"}]},
        users: [{foo: "baz"}, {second: "user"}],
        _comesfrom: ["username", "a-repository", "ref"],
        _page: 1,
        _canpaginateforward: false,
      });
    });
    it('should not be effected by another event', function() {
      let new_state = repoDetails(old_state.repo_details, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, old_state.repo_details);
    });
  });
  describe('discoveredReposPage', function() {
    it('should create the event', function() {
      let new_state = discoveredReposPage(old_state.discovered_repos_page, {
        type: "server/REPOS_DISCOVERED",
        repos: [{foo: "bar"}],
        page: 1,
      });
      assert.deepEqual(new_state, 1);
    });
    it('should not be effected by another event', function() {
      let new_state = discoveredRepos(old_state.discovered_repos_page, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, old_state.discovered_repos_page);
    });
  });
});
