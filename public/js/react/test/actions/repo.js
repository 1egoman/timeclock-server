"use strict";
import assert from "assert";
import helpers from "../helpers";
import {
  importFromGithubRepo,
  selectRepo,
} from '../../actions/repo';

describe('actions/repo.js', function() {
  describe('importFromGithubRepo', function() {
    it('should create the event', function() {
      assert.deepEqual(importFromGithubRepo("username", "reponame"), {
        type: "IMPORT_REPO_GITHUB",
        user: "username",
        repo: "reponame",
      });
    });
  });
  describe('selectRepo', function() {
    it('should create the event', function() {
      assert.deepEqual(selectRepo(12), {
        type: "SELECT_REPO",
        index: 12,
      });
    });
  });
});
