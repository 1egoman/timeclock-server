"use strict";
import assert from "assert";
import helpers from "../helpers";
import {
  getRepoByIndex,
} from '../../helpers/get_repo';
import React from 'react';

describe('helpers/get_repo.js', function() {
  describe('getRepoByIndex', function() {
    let initial_state = {
      repos: [
        {
          user: "user",
          repo: "a-repo",
        },
        {
          user: "user",
          repo: "b-repo",
        },
        {
          user: "another-user",
          repo: "b-repo",
          foo: "bar",
        },
      ],
      active_repo: null,
    };

    it('should find an active repo by its specified index', function() {
      assert.deepEqual(getRepoByIndex(initial_state, ["user", "a-repo"]), {
        user: "user",
        repo: "a-repo",
      });
      assert.deepEqual(getRepoByIndex(initial_state, ["another-user", "b-repo"]), {
        user: "another-user",
        repo: "b-repo",
        foo: "bar",
      });
    });
    it('should not find a repo with an invalid index', function() {
      assert.deepEqual(getRepoByIndex(initial_state, ["user", "i-dont-exist"]), null);
      assert.deepEqual(getRepoByIndex(initial_state, null), null);
      assert.deepEqual(getRepoByIndex(initial_state, 0), null);
      assert.deepEqual(getRepoByIndex(initial_state, 4), null);
    });
  });
});
