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
    it('should mark badge token as indetermiante on server/RESET_TOKEN', function() {
      let new_state = user(old_state.user, {
        type: "server/RESET_TOKEN",
        username: "a-username",
        old_token: "i-am-the-old-token",
      });
      assert.deepEqual(new_state, {badge_token: null});
    });
    it('should reset token on server/TOKEN_RESET', function() {
      let new_state = user(old_state.user, {
        type: "server/TOKEN_RESET",
        user: {foo: "bar"},
        badge_token: "i-am-a-badge-token",
      });
      assert.deepEqual(new_state, {badge_token: "i-am-a-badge-token"});
    });
    it('should update setting on server/SETTING_CHANGED', function() {
      let new_state = user(old_state.user, {
        type: "server/SETTING_CHANGED",
        settings: {foo: "bar"},
      });
      assert.deepEqual(new_state, {settings: {foo: "bar"}});
    });
    it('should update setting on server/UPDATE_SETTING_PREEMPTIVE', function() {
      let new_state = user(old_state.user, {
        type: "UPDATE_SETTING_PREEMPTIVE",
        settings: {foo: "bar"},
      });
      assert.deepEqual(new_state, {settings: {foo: "bar"}});
    });
    it('should not be effected by another event', function() {
      let new_state = user({foo: "bar"}, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, {foo: "bar"});
    });
  });
});
