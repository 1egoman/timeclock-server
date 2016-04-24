"use strict";
const assert = require("assert"),
      Promise = require("promise"),
      socketHelpers = require("../helpers/socket"),
      repo = require("../../lib/repo"),
      card = require("../../lib/card"),
      getStats = require("../../lib/events/getStats"),
      sinon = require("sinon"),
      lolex = require("lolex"),
      User = require("../../lib/models/user");

describe("lib/events/getStats.js", function() {
  describe("generateWorkActivityGraph", function() {
    // fake the current date in tests
    let clock;
    before(() => {
      clock = lolex.install(new Date(2016, 3, 24).getTime()); // April 24th
    });
    after(() => {
      clock.uninstall();
    });

    it('should generate a graph for a timecard (full length)', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      }),
      timecard = {
        card: [
          {
            date: "Sat Apr 23 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          {
            date: "Sun Apr 24 2016",
            disabled: "Mon Apr 25 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          }
        ]
      };

      let response = getStats(timecard, undefined, skt).then((stats) => {
        assert.deepEqual(stats, {
          workActivityGraph: {
            labels: ["April 24", "April 23", "April 22", "April 21", "April 20", "April 19", "April 18", "April 17", "April 16", "April 15", "April 14", "April 13", "April 12", "April 11", "April 10", "April 9", "April 8", "April 7", "April 6", "April 5", "April 4", "April 3", "April 2", "April 1", "March 31", "March 30", "March 29", "March 28", "March 27", "March 26"],
            datasets: [
              {label: "Unpaid time", data: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
              {label: "Paid time", data: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
            ]
          },
        });
        done();
      }).catch(done);
    });
    it('should generate a graph for a timecard', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      }),
      timecard = {
        card: [
          {
            date: "Sat Apr 23 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          {
            date: "Sun Apr 24 2016",
            disabled: "Mon Apr 25 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          }
        ]
      };

      let response = getStats(timecard, 5, skt).then((stats) => {
        assert.deepEqual(stats, {
          workActivityGraph: {
            labels: ["April 24", "April 23", "April 22", "April 21", "April 20"],
            datasets: [
              {label: "Unpaid time", data: [0, 1, 0, 0, 0]},
              {label: "Paid time", data: [1, 0, 0, 0, 0]},
            ],
          },
        });
        done();
      }).catch(done);
    });
    it('should generate a graph for a timecard (multiple times)', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      }),
      timecard = {
        card: [
          {
            date: "Sat Apr 23 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
            times: [{start: "3:00:00", end: "5:00:00"}],
          },
          {
            date: "Sun Apr 24 2016",
            disabled: "Mon Apr 25 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          }
        ]
      };

      let response = getStats(timecard, 5, skt).then((stats) => {
        assert.deepEqual(stats, {
          workActivityGraph: {
            labels: ["April 24", "April 23", "April 22", "April 21", "April 20"],
            datasets: [
              {label: "Unpaid time", data: [0, 2, 0, 0, 0]},
              {label: "Paid time", data: [1, 0, 0, 0, 0]},
            ],
          },
        });
        done();
      }).catch(done);
    });
    it('should generate a graph for a timecard (multiple disabled times)', function(done) {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      }),
      timecard = {
        card: [
          {
            date: "Sat Apr 23 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          {
            date: "Sun Apr 24 2016",
            disabled: "Mon Apr 25 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          {
            date: "Sun Apr 22 2016",
            disabled: "Mon Apr 25 2016",
            times: [{start: "1:00:00", end: "6:00:00"}],
          }
        ]
      };

      let response = getStats(timecard, 5, skt).then((stats) => {
        assert.deepEqual(stats, {
          workActivityGraph: {
            labels: ["April 24", "April 23", "April 22", "April 21", "April 20"],
            datasets: [
              {label: "Unpaid time", data: [0, 1, 0, 0, 0]},
              {label: "Paid time", data: [1, 0, 5, 0, 0]},
            ],
          },
        });
        done();
      }).catch(done);
    });
  });
});
