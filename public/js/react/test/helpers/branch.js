"use strict";
import assert from "assert";
import helpers from "../helpers";
import { getCurrentBranch } from '../../helpers/branch';

describe('helpers/branch.js', function() {
  it('should get the current branch', function() {
    // first, go for the branch in the repo model
    assert.equal(getCurrentBranch({
      repo_details: {
        branch: "a-branch"
      },
    }), "a-branch");

    // if we can pick a default branch, do that
    assert.equal(getCurrentBranch({
      repo_details: {
        branch: null,
      },
      repos: [{default_branch: "master"}],
      active_repo: 0,
    }), "master");

    // else, master
    assert.equal(getCurrentBranch({
      repo_details: {
        branch: null,
      },
      repos: [],
      active_repo: null,
    }), "master");
  });
});
