"use strict";
const assert = require("assert"),
      Promise = require("promise"),
      socketHelpers = require("../helpers/socket"),
      repo = require("../../lib/repo"),
      card = require("../../lib/card"),
      changeSetting = require("../../lib/events/changeSetting"),
      sinon = require("sinon"),
      User = require("../../lib/models/user");

describe("lib/events/changeSetting.js", function() {
  describe("with a successful user model update", function() {
    beforeEach(() => {
      sinon.stub(User, "update").callsArgWith(2, null);
    });
    afterEach(() => {
      User.update.restore();
    });

    it('should get branches successfully', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        settings: {
          long_work_period: 0,
        },
      });

      let response = changeSetting({
        type: "server/CHANGE_SETTING",
        changes: {long_work_period: 123},
      }, skt).then((settings) => {
        assert.deepEqual(settings, {long_work_period: 123});
        done();
      }).catch(done);
    });
  });
  describe("with a failed update", function() {
    beforeEach(() => {
      sinon.stub(User, "update").callsArgWith(2, "big bad error");
    });
    afterEach(() => {
      User.update.restore();
    });

    it('should handle errors', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        settings: {
          long_work_period: 0,
        },
      });

      let response = changeSetting({
        type: "server/CHANGE_SETTING",
        changes: {long_work_period: 123},
      }, skt).then(() => {
        done("Should have failed.");
      }).catch((error) => {
        assert.deepEqual(error.message, "big bad error");
        done();
      }).catch(done);
    });
  });
});
