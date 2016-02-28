"use strict";
import assert from "assert";
import helpers from "../helpers";
import {
  getCurrentBranch,
  getAllBranches,
} from '../../helpers/branch';

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
  it('should get all branches', function() {
    // We've got nothing == no branches
    assert.equal(getAllBranches({}).length, 0);

    // if we can pick from the repo-details, that is preferred
    assert.equal(getAllBranches({
      repo_details: {
        branch: null,
        branches: ["master", "dev"]
      },
      repos: [{branches: ["master"]}],
      active_repo: 0,
    }).length, 2); // ["master", "dev"]

    // otherwise, pick from the repo model itself
    assert.equal(getAllBranches({
      repo_details: {
        branch: null,
        branches: null,
      },
      repos: [{branches: ["master", "dev"]}],
      active_repo: 0,
    }).length, 2); // ["master", "dev"]
  });
});
