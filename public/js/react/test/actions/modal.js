"use strict";
import assert from "assert";
import helpers from "../helpers";
import {
  showWaltzInstallInstructions,
  hideErrorModal,
  showShareModal,
} from '../../actions/modal';

describe('actions/modal.js', function() {
  describe('showWaltzInstallInstructions', function() {
    it('should create the event', function() {
      assert.deepEqual(showWaltzInstallInstructions(), {
        type: "HELP_INSTALL_WALTZ",
        value: true,
      });
    });
    it('should create the event with a defined value', function() {
      assert.deepEqual(showWaltzInstallInstructions(true), {
        type: "HELP_INSTALL_WALTZ",
        value: true,
      });
    });
    it('should create the event to hide modal', function() {
      assert.deepEqual(showWaltzInstallInstructions(false), {
        type: "HELP_INSTALL_WALTZ",
        value: false,
      });
    });
  });
  describe('showShareModal', function() {
    it('should create the event', function() {
      assert.deepEqual(showShareModal(false), {
        type: "SHOW_REPO_SHARE_MODAL",
        value: false,
      });
    });
    it('should create the event with true', function() {
      assert.deepEqual(showShareModal(true), {
        type: "SHOW_REPO_SHARE_MODAL",
        value: true,
      });
    });
    it('should create the event, defaulting to true', function() {
      assert.deepEqual(showShareModal(), {
        type: "SHOW_REPO_SHARE_MODAL",
        value: true,
      });
    });
  });
  describe('hideErrorModal', function() {
    it('should create the event', function() {
      assert.deepEqual(hideErrorModal(), {
        type: "HIDE_ERROR_MODAL",
      });
    });
  });
});
