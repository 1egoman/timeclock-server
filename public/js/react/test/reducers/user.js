"use strict";
import assert from "assert";
import helpers from "../helpers";
import {
  user
} from '../../reducers/user';
const old_state = helpers.initialState;

describe('reducers/user.js', function() {
  describe('user', function() {
    it('should add a user on server/INIT', function() {
      let new_state = user(old_state.user, {
        type: "server/INIT",
        user: {foo: "bar"},
      });
      assert.deepEqual(new_state, {foo: "bar"});
    });
    it('should not be effected by another event', function() {
      let new_state = user({foo: "bar"}, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, {foo: "bar"});
    });
  });
});
