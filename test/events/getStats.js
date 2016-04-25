"use strict";
const assert = require("assert"),
      Promise = require("promise"),
      socketHelpers = require("../helpers/socket"),
      repo = require("../../lib/repo"),
      card = require("../../lib/card"),
      stats = require("../../lib/events/statsMethods"),
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
          payAmountBreakdownCircle: null,
          payFrequencyBreakdownCircle: [
            {
              color: "#51c4c4",
              label: "0 hours - 99 hours",
              value: 1,
            }
          ]
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
          payAmountBreakdownCircle: null,
          payFrequencyBreakdownCircle: [
            {
              color: "#51c4c4",
              label: "0 hours - 99 hours",
              value: 1,
            },
          ]
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
          payAmountBreakdownCircle: null,
          payFrequencyBreakdownCircle: [
            {
              color: "#51c4c4",
              label: "0 hours - 99 hours",
              value: 1,
            }
          ]
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
          payAmountBreakdownCircle: null,
          payFrequencyBreakdownCircle: [
            {
              color: "#51c4c4",
              label: "0 hours - 99 hours",
              value: 1,
            },
            {
              color: "#51c4c4",
              label: "100 hours - 199 hours",
              value: 1,
            }
          ]
        });
        done();
      }).catch(done);
    });
  });
  describe("generateClientPaymentAmountBreakdown", function() {
    it('generate breakdown by how much was paid at any one time', function() {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      }),
      timecard = {
        hourlyRate: 10, // easy numbers :)
        card: [
          { // $10 of work
            date: "Sun Apr 24 2016",
            disabled: "Tue Apr 25 2016", 
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          { // $10 of work
            date: "Mon Apr 25 2016",
            disabled: "Tue Apr 26 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          }
        ]
      };

      assert.deepEqual(
        stats.generateClientPaymentAmountBreakdown(timecard, skt),
        [ { label: '$10', value: 2, color: '#51c4c4' } ]
      );
    });
    it('generate breakdown by how much was paid at any one time, with unpaid time', function() {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      }),
      timecard = {
        hourlyRate: 10, // easy numbers :)
        card: [
          {
            date: "Sat Apr 23 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          { // $10 of work
            date: "Sun Apr 24 2016",
            disabled: "Tue Apr 25 2016", 
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          { // $10 of work
            date: "Mon Apr 25 2016",
            disabled: "Tue Apr 26 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          }
        ]
      };

      assert.deepEqual(
        stats.generateClientPaymentAmountBreakdown(timecard, skt),
        [ { label: '$10', value: 2, color: '#51c4c4' } ]
      );
    });
    it('generate breakdown by how much was paid at any one time, with malformed time', function() {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      }),
      timecard = {
        hourlyRate: 10, // easy numbers :)
        card: [
          {
            date: "Sat Apr 23 2016",
            times: [{start: "1:00:00", end: "not a time"}],
          },
          { // $10 of work
            date: "Sun Apr 24 2016",
            disabled: "Tue Apr 25 2016", 
            times: [{start: "1:00:00", end: "not a time"}],
          },
          { // $10 of work
            date: "Mon Apr 25 2016",
            disabled: "Tue Apr 26 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          }
        ]
      };

      assert.deepEqual(
        stats.generateClientPaymentAmountBreakdown(timecard, skt),
        [ { label: '$10', value: 1, color: '#51c4c4' } ]
      );
    });
    it('generate breakdown by how much was paid when those amounts differ', function() {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      }),
      timecard = {
        hourlyRate: 10, // easy numbers :)
        card: [
          {
            date: "Sat Apr 23 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          { // $10 of work
            date: "Sun Apr 24 2016",
            disabled: "Tue Apr 25 2016", 
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          { // $20 of work
            date: "Mon Apr 25 2016",
            disabled: "Tue Apr 26 2016",
            times: [{start: "1:00:00", end: "3:00:00"}],
          }
        ]
      };

      assert.deepEqual(
        stats.generateClientPaymentAmountBreakdown(timecard, skt),
        [
          {label: '$10', value: 1, color: '#51c4c4'},
          {label: '$20', value: 1, color: '#51c4c4'},
        ]
      );
    });
    it('generate breakdown by how much was paid, with multiple times per day', function() {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      }),
      timecard = {
        hourlyRate: 10, // easy numbers :)
        card: [
          {
            date: "Sat Apr 23 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          { // $10 of work
            date: "Sun Apr 24 2016",
            disabled: "Tue Apr 25 2016", 
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          { // $20 of work
            date: "Mon Apr 25 2016",
            disabled: "Tue Apr 25 2016",
            times: [{start: "1:00:00", end: "3:00:00"}],
          }
        ]
      };

      assert.deepEqual(
        stats.generateClientPaymentAmountBreakdown(timecard, skt),
        [
          {label: '$30', value: 1, color: '#51c4c4'},
        ]
      );
    });
    it('generate breakdown by how much was paid, with multiple times per day', function() {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      }),
      timecard = {
        hourlyRate: 10, // easy numbers :)
        card: [
          {
            date: "Sat Apr 23 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          { // $10 of work
            date: "Sun Apr 24 2016",
            disabled: "Tue Apr 25 2016", 
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          { // $20 of work
            date: "Mon Apr 25 2016",
            disabled: "Tue Apr 25 2016",
            times: [{start: "1:00:00", end: "3:00:00"}],
          }
        ]
      };

      assert.deepEqual(
        stats.generateClientPaymentAmountBreakdown(timecard, skt),
        [
          {label: '$30', value: 1, color: '#51c4c4'},
        ]
      );
    });
    it('generate breakdown with multiple times per day, but some days aren\'t disabled', function() {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      }),
      timecard = {
        hourlyRate: 10, // easy numbers :)
        card: [
          {
            date: "Sat Apr 23 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          { // $10 of work
            date: "Sun Apr 24 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          { // $20 of work
            date: "Mon Apr 25 2016",
            disabled: "Tue Apr 25 2016",
            times: [{start: "1:00:00", end: "3:00:00"}],
          }
        ]
      };

      assert.deepEqual(
        stats.generateClientPaymentAmountBreakdown(timecard, skt),
        [
          {label: '$20', value: 1, color: '#51c4c4'},
        ]
      );
    });
    it('should not work with a bad timecard', function() {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      }),
      timecard = {bad: "timecard"};

      assert.deepEqual(
        stats.generateClientPaymentAmountBreakdown(timecard, skt),
        null
      );
    });
    describe('colors in chart', function() {
      it('below 500', function() {
        let skt = socketHelpers.createMockSocketWith({
          repos: [],
        }),
        timecard = {
          hourlyRate: 10, // easy numbers :)
          card: [
            {
              date: "Mon Apr 25 2016",
              disabled: "Tue Apr 25 2016",
              times: [{start: "1:00:00", end: "6:00:00"}],
            }
          ]
        };

        assert.deepEqual(
          stats.generateClientPaymentAmountBreakdown(timecard, skt),
          [{label: '$50', value: 1, color: '#51c4c4'}]
        );
      });
      it('at 500', function() {
        let skt = socketHelpers.createMockSocketWith({
          repos: [],
        }),
        timecard = {
          hourlyRate: 100, // easy numbers :)
          card: [
            {
              date: "Mon Apr 25 2016",
              disabled: "Tue Apr 25 2016",
              times: [{start: "1:00:00", end: "6:00:00"}],
            }
          ]
        };

        assert.deepEqual(
          stats.generateClientPaymentAmountBreakdown(timecard, skt),
          [{label: '$500', value: 1, color: '#8a51c4'}]
        );
      });
      it('at 1000', function() {
        let skt = socketHelpers.createMockSocketWith({
          repos: [],
        }),
        timecard = {
          hourlyRate: 200, // easy numbers :)
          card: [
            {
              date: "Mon Apr 25 2016",
              disabled: "Tue Apr 25 2016",
              times: [{start: "1:00:00", end: "6:00:00"}],
            }
          ]
        };

        assert.deepEqual(
          stats.generateClientPaymentAmountBreakdown(timecard, skt),
          [{label: '$1000', value: 1, color: '#E2D54A'}]
        );
      });
      it('at 5000', function() {
        let skt = socketHelpers.createMockSocketWith({
          repos: [],
        }),
        timecard = {
          hourlyRate: 1000, // easy numbers :)
          card: [
            {
              date: "Mon Apr 25 2016",
              disabled: "Tue Apr 25 2016",
              times: [{start: "1:00:00", end: "6:00:00"}],
            }
          ]
        };

        assert.deepEqual(
          stats.generateClientPaymentAmountBreakdown(timecard, skt),
          [{label: '$5000', value: 1, color: '#8ac450'}]
        );
      });
    });
  });
  describe("generateClientPaymentFreqBreakdown", function() {
    it('generate breakdown by how much was paid at any one time', function() {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      }),
      timecard = {
        card: [
          {
            date: "Sun Apr 24 2016",
            disabled: "Tue Apr 25 2016", 
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          {
            date: "Mon Apr 25 2016",
            disabled: "Tue Apr 26 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          }
        ]
      };

      assert.deepEqual(
        stats.generateClientPaymentFreqBreakdown(timecard, skt),
        [ { label: '0 hours - 99 hours', value: 2, color: '#51c4c4' } ]
      );
    });
    it('generate breakdown by how much was paid at any one time, with unpaid time', function() {
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
            disabled: "Tue Apr 25 2016", 
            times: [{start: "1:00:00", end: "2:00:00"}],
          },
          {
            date: "Mon Apr 25 2016",
            disabled: "Tue Apr 26 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          }
        ]
      };

      assert.deepEqual(
        stats.generateClientPaymentFreqBreakdown(timecard, skt),
        [ { label: '0 hours - 99 hours', value: 2, color: '#51c4c4' } ]
      );
    });
    it('generate breakdown by how much was paid at any one time, with malformed time', function() {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      }),
      timecard = {
        card: [
          {
            date: "Sat Apr 23 2016",
            times: [{start: "1:00:00", end: "not a time"}],
          },
          {
            date: "Sun Apr 24 2016",
            disabled: "Tue Apr 25 2016", 
            times: [{start: "1:00:00", end: "not a time"}],
          },
          {
            date: "Mon Apr 25 2016",
            disabled: "Tue Apr 26 2016",
            times: [{start: "1:00:00", end: "2:00:00"}],
          }
        ]
      };

      assert.deepEqual(
        stats.generateClientPaymentFreqBreakdown(timecard, skt),
        [ { label: '0 hours - 99 hours', value: 2, color: '#51c4c4' } ]
      );
    });
    it('generate breakdown by how much was paid when those amounts differ', function() {
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
            disabled: "Tue Apr 25 2016", 
            times: [{start: "0:00:00", end: "24:00:00"}],
          },
          {
            date: "Sun Apr 24 2016",
            disabled: "Sat Apr 30 2016", 
            times: [{start: "0:00:00", end: "24:00:00"}],
          },
        ]
      };

      assert.deepEqual(
        stats.generateClientPaymentFreqBreakdown(timecard, skt),
        [
          {label: '0 hours - 99 hours', value: 1, color: '#51c4c4'},
          {label: '100 hours - 199 hours', value: 1, color: '#51c4c4'},
        ]
      );
    });
    it('should not work with a bad timecard', function() {
      let skt = socketHelpers.createMockSocketWith({
        repos: [],
      }),
      timecard = {bad: "timecard"};

      assert.deepEqual(
        stats.generateClientPaymentFreqBreakdown(timecard, skt),
        null
      );
    });
    describe('colors in chart', function() {
      it('below 200', function() {
        let skt = socketHelpers.createMockSocketWith({
          repos: [],
        }),
        timecard = {
          card: [
            {
              date: "Mon Apr 25 2016",
              disabled: "Tue Apr 26 2016",
              times: [{start: "1:00:00", end: "2:00:00"}],
            }
          ]
        };

        assert.deepEqual(
          stats.generateClientPaymentFreqBreakdown(timecard, skt),
          [{label: '0 hours - 99 hours', value: 1, color: '#51c4c4'}]
        );
      });
      it('at 200', function() {
        let skt = socketHelpers.createMockSocketWith({
          repos: [],
        }),
        timecard = {
          card: [
            {
              date: "Sun Apr 24 2016",
              disabled: "Wed May 4 2016", 
              times: [{start: "0:00:00", end: "24:00:00"}],
            },
          ]
        };

        assert.deepEqual(
          stats.generateClientPaymentFreqBreakdown(timecard, skt),
          [{label: '200 hours - 299 hours', value: 1, color: "#8ac450"}]
        );
      });
      it('at 400', function() {
        let skt = socketHelpers.createMockSocketWith({
          repos: [],
        }),
        timecard = {
          card: [
            {
              date: "Sun Apr 24 2016",
              disabled: "Wed May 11 2016", 
              times: [{start: "0:00:00", end: "24:00:00"}],
            },
          ]
        };

        assert.deepEqual(
          stats.generateClientPaymentFreqBreakdown(timecard, skt),
          [{label: '400 hours - 499 hours', value: 1, color: "#E2D54A"}]
        );
      });
      it('at 800', function() {
        let skt = socketHelpers.createMockSocketWith({
          repos: [],
        }),
        timecard = {
          card: [
            {
              date: "Sun Apr 24 2016",
              disabled: "Wed Jun 1 2016", 
              times: [{start: "0:00:00", end: "24:00:00"}],
            },
          ]
        };

        assert.deepEqual(
          stats.generateClientPaymentFreqBreakdown(timecard, skt),
          [{label: '900 hours - 999 hours', value: 1, color: "#c45151"}]
        );
      });
    });
  });
});
