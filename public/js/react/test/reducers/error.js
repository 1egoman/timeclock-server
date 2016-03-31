"use strict";
import assert from "assert";
import helpers from "../helpers";
import { error } from '../../reducers/error';
const old_state = helpers.initialState;

describe('reducers/error.js', function() {
  describe('error', function() {
    it('should show an error', function() {
      let new_state = error(null, {
        type: "server/ERROR",
        error: "i-am-an-error",
      });
      assert.deepEqual(new_state, {
        error: "i-am-an-error",
        from: "backend",
      });
    });
    it('should hide the error modal', function() {
      let new_state = error(null, {
        type: "HIDE_ERROR_MODAL",
      });
      assert.deepEqual(new_state, null);
    });
    it('should not be effected by another event', function() {
      let new_state = error(null, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, null);
    });
  });
});
