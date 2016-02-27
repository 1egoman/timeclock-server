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
    it('should create the event', function() {
      let new_state = repoImportDialogOpen(old_state.repo_import_dialog_open, {
        type: "REPO_IMPORT_DIALOG",
        state: true,
      });
      assert.deepEqual(new_state, true);
    });
    it('should not be effected by another event', function() {
      let new_state = activeRepo(old_state.repo_import_dialog_open, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, old_state.repo_import_dialog_open);
    });
  });
  describe('repos', function() {
    it('should work with IMPORT_REPO_GITHUB', function() {
      let new_state = repos(old_state.repos, {
        type: "IMPORT_REPO_GITHUB",
        user: "username",
        repo: "reponame",
      });
      assert.deepEqual(new_state, [...old_state.repos, {
        is_pending: true,
        user: "username",
        repo: "reponame",
        provider: "github",
      }]);
    });
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
    it('should create the event', function() {
      let new_state = activeRepo(old_state.active_repo, {
        type: "SELECT_REPO",
        index: 12,
      });
      assert.deepEqual(new_state, 12);
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
