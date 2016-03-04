"use strict";
import assert from "assert";
import helpers from "../helpers";
import {
  resetBadgeTokenForUser,
  changeSetting,
  preemptiveSettingUpdate,
} from '../../actions/settings';

describe('actions/repo.js', function() {
  describe('resetBadgeTokenForUser', function() {
    it('should create the event', function() {
      assert.deepEqual(resetBadgeTokenForUser({
        username: "a-username",
        badge_token: "a-token",
      }), {
        type: "server/RESET_TOKEN",
        username: "a-username",
        old_token: "a-token",
      });
    });
  });
  describe('changeSetting', function() {
    it('should create the event', function() {
      assert.deepEqual(changeSetting({
        foo: "bar",
      }), {
        type: "server/CHANGE_SETTING",
        changes: {foo: "bar"},
      });
    });
  });
  describe('preemptiveSettingUpdate', function() {
    it('should create the event', function() {
      assert.deepEqual(preemptiveSettingUpdate({
        foo: "bar",
      }), {
        type: "server/UPDATE_SETTING_PREEMPTIVE",
        changes: {foo: "bar"},
      });
    });
  });
});
