"use strict";
import assert from "assert";
import helpers from "../helpers";
import {
  repos,
  activeRepo,
  repoImportDialogOpen,
  discoveredRepos,
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
        repos: [{foo: "bar"}]
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
});
