"use strict";
const assert = require("assert"),
      mockFs = require("mock-fs"),
      card = require("../lib/card"),
      repo = require("../lib/repo"),
      fs = require("fs"),
      async = require("async"),
      sinon = require("sinon"),
      strftime = require("strftime"),
      sampleCard = {
        reportFormat: "default",
        hourlyRate: 50.00,
        card: [
          {
            date: "Sun Jan 24 2016",
            times: [{
              start: "07:44:00",
              end: "07:45:00"
            }, {
              start: "07:46:00",
              end: "07:47:00"
            }]
          }
        ]
      }

describe('card.assertIsCard()', function() {
  it("should assert good cards as true", function() {
    assert(card.assertIsCard({card: []}));
    assert(card.assertIsCard({card: [{date: "Fri Feb 19 2016", times: []}]}));
    assert(card.assertIsCard({card: [
      {date: "Fri Feb 19 2016", times: [{start: "12:20:00"}]}
    ]}));
    assert(card.assertIsCard({card: [
      {date: "Fri Feb 19 2016", times: [{
        start: "2:20:00",
        end: "2:30:00",
      }]}
    ]}));
    assert(card.assertIsCard({card: [
      {date: "Fri Feb 19 2016", times: [{
        start: "2:20:00",
        by: "a-username",
        end: "2:30:00",
      }, {
        start: "4:40:00",
        by: "a-username",
        end: "5:31:23",
      }, {
        start: "5:66:77",
      }]}
    ]}));
    assert(card.assertIsCard({card: [
      {date: "Fri Feb 19 2016", times: [{
        start: "2:20:00",
        by: "a-username",
        end: "2:30:00",
      }]},
      {date: "Fri Feb 18 2016", times: [{
        start: "2:20:00",
        end: "2:30:00",
      }]},
    ]}));
    assert(card.assertIsCard({card: [
      {date: "Fri Feb 19 2016", times: [{
        start: "2:20:00",
        end: "2:30:00",
      }]},
      {date: "Mon Feb 22 2016", times: [{
        start: "2:20:00",
        end: "2:30:00",
        disabled: "Wed Feb 24 2016"
      }]},
    ]}));
  });
  it("should assert bad cards as false", function() {
    assert(!card.assertIsCard("not an object"));
    assert(!card.assertIsCard({card: ["not an object"]}));
    assert(!card.assertIsCard({card: [{date: "Fri Feb 19 2016", times: ["not an object"]}]}));
    assert(!card.assertIsCard({card: [{date: "Fri Feb 19 2016", times: [{end: "no start"}]}]}));
    assert(!card.assertIsCard({card: [ // a smart ass with unix epoch time
      {date: 11111, times: [{
        start: 123,
        end: 456,
      }]}
    ]}));
  });
});

describe('card.getSpotForDay()', function() {
  it('should pick the correct timecard section for the current day', function() {
    assert.deepEqual(card.getSpotForDay([{date: strftime(card.DAY_REPR), foo: "bar"}]), {
      date: strftime(card.DAY_REPR),
      foo: "bar"
    });
    assert.deepEqual(card.getSpotForDay([
      {
        date: strftime(card.DAY_REPR),
        foo: "bar",
      }, {
        date: "something else",
        foo: "baz",
      }
    ]), {
      date: strftime(card.DAY_REPR),
      foo: "bar"
    });
  });
});

describe('card.totalDuration()', function() {
  it('should get the total duration of all cards', function() {
    assert.equal(card.totalDuration({card: []}), 0);
    assert.equal(card.totalDuration({
      card: [
        {
          date: "Mon Feb 22 2016",
          times: [{
            start: "11:00:00",
            end: "12:00:00"
          }],
        }
      ]
    }), 3600); // 1 hour in seconds
    assert.equal(card.totalDuration({
      card: [
        {
          date: "Mon Feb 22 2016",
          times: [{
            start: "11:00:00",
            end: "12:00:00"
          }, {
            start: "3:00:00",
            end: "4:30:30",
          }],
        }
      ]
    }), 9030); // 2 hours, 30 minutes, and 30 seconds in seconds
    assert.equal(card.totalDuration({
      card: [
        {
          date: "Mon Feb 22 2016",
          times: [{
            start: "3:00:00",
            end: "4:00:00",
          }],
        },
        {
          date: "Mon Feb 22 2016",
          disabled: "Mon Feb 22 2016",
          times: [{
            start: "3:00:00",
            end: "4:30:30",
          }],
        }
      ]
    }), 3600); // 1 hour (the second one is disabled)
    assert.equal(card.totalDuration({ // test to be sure the callback for each iteraction works, too
      card: [
        {
          date: "Mon Feb 22 2016",
          times: [{
            start: "3:00:00",
            end: "4:00:00",
          }],
        },
        {
          date: "Mon Feb 22 2016",
          disabled: "Mon Feb 22 2016",
          times: [{
            start: "3:00:00",
            end: "4:30:30",
          }],
        }
      ]
    }, (day, time) => {
      if (day.disabled) {
        assert.equal(day.date, "Mon Feb 22 2016");
        assert.deepEqual(time, {start: "3:00:00", end: "4:30:30"});
      } else {
        assert.equal(day.date, "Mon Feb 22 2016");
        assert.deepEqual(time, {start: "3:00:00", end: "4:00:00"});
      }
    }), 3600); // 1 hour (the second one is disabled)
  });
});

describe('card.getReportTemplate()', function() {
  beforeEach(() => {
    let call = sinon.stub(repo, "getFileFromRepo");

    call
    .withArgs("waltz-app", "themes", "testing.ejs")
    .onFirstCall()
    .resolves("Hello World!\n")

    call
    .withArgs("waltz-app", "themes", "default.ejs")
    .onFirstCall()
    .resolves("Hello Default World!\n");
  });
  afterEach(() => repo.getFileFromRepo.restore());

  it('should get the report for a github repo', function(done) {
    card.getReportTemplate("waltz-app/themes:testing.ejs").then((data) => {
      assert.equal(data, "Hello World!\n");
      done();
    }).catch(done);
  });
  it('should get the report for a default theme', function(done) {
    card.getReportTemplate("testing").then((data) => {
      assert.equal(data, "Hello World!\n");
      done();
    }).catch(done);
  });
  it('should get the report for the default theme entry', function(done) {
    card.getReportTemplate().then((data) => {
      assert.equal(data, "Hello Default World!\n");
      done();
    }).catch(done);
  });
  it('should get the report for a local file', function(done) {
    card.getReportTemplate('./test/helpers/theme.ejs').then((data) => {
      assert.equal(data.toString(), "Hello Local World!\n");
      done();
    }).catch(done);
  });
});

describe('card.getCard()', function() {
  beforeEach(() => mockFs({}));
  afterEach(() => mockFs.restore());

  it('should find a .timecard.json in one last folder', function () {
    fs.writeFile("../../.timecard.json", JSON.stringify(sampleCard));

    card.getCard().then((card) => {
      assert.deepEqual(card, sampleCard);
    })
  });

  it('should find a .timecard.json in another folder', function () {
    fs.writeFile("../.timecard.json", JSON.stringify(sampleCard));

    card.getCard().then((card) => {
      assert.deepEqual(card, sampleCard);
    })
  });

  it('should find a .timecard.json', function () {
    fs.writeFile(".timecard.json", JSON.stringify(sampleCard));

    card.getCard().then((card) => {
      assert.deepEqual(card, sampleCard);
    })
  });
});

describe('card.getTimecardRenderDetails()', function() {
  it('should correctly return the timecard', function() {
    assert.deepEqual(card.getTimecardRenderDetails({card: []}, {}), {
      timecard: {card: []},
      args: {},
      totalTime: 0,
      totalCost: null,
      paidTime: 0,
      paidCost: null,
    });

    let card_for_test = [
      {
        date: "Mon Feb 22 2016", times: [
          {
            start: "10:00:00", end: "11:00:00"
          }
        ]
      }
    ];
    assert.deepEqual(card.getTimecardRenderDetails({card: card_for_test}, {}), {
      timecard: {card: card_for_test},
      args: {},
      totalTime: 3600,
      totalCost: null,
      paidTime: 0,
      paidCost: null,
    });
  });
  it('should correctly calculate the cost of a timecard', function() {
    assert.deepEqual(card.getTimecardRenderDetails(sampleCard), {
      timecard: sampleCard,
      args: {},
      totalTime: 120,
      totalCost: 1.67,
      paidTime: 0,
      paidCost: 0,
    });
  });
  it('should correctly calculate the cost of a timecard, with a titleCost', function() {
    let titleSampleCard = Object.assign({}, sampleCard, {hourlyRate: null, totalRate: 1000.00});
    assert.deepEqual(card.getTimecardRenderDetails(titleSampleCard), {
      timecard: titleSampleCard,
      args: {},
      totalTime: 120,
      totalCost: 1000.00,
      paidTime: 0,
      paidCost: null,
    });
  });
  it('should be sure that any args passed are returned', function() {
    assert.deepEqual(card.getTimecardRenderDetails({card: []}, {foo: "bar", another: 1}), {
      timecard: {card: []},
      args: {foo: "bar", another: 1},
      totalTime: 0,
      totalCost: null,
      paidTime: 0,
      paidCost: null,
    });
    assert.deepEqual(card.getTimecardRenderDetails({card: [], args: {foo: "bar", another: 1}}), {
      timecard: {
        args: {foo: "bar", another: 1},
        card: [],
      },
      args: {foo: "bar", another: 1},
      totalTime: 0,
      totalCost: null,
      paidTime: 0,
      paidCost: null,
    });
  });
  it('should be sure that args are extended correctly', function() {
    assert.deepEqual(card.getTimecardRenderDetails({card: [], args: {foo: "bar", another: 1}}, {foo: "baz"}), {
      timecard: {
        args: {foo: "bar", another: 1},
        card: [],
      },
      args: {foo: "baz", another: 1},
      totalTime: 0,
      totalCost: null,
      paidTime: 0,
      paidCost: null,
    });
  });
});

describe('card.cardInit()', function() {
  beforeEach(() => mockFs({})); // mock fs for the duration of this section.
  afterEach(() => mockFs.restore());

  it('should create a new timecard', function(done) {
    card.cardInit().then(() => {
      fs.readFile(".timecard.json", "utf8", (err, data) => {
        if (err) {
          done(err);
        } else {
          assert.deepEqual(JSON.parse(data), {
            "reportFormat": "default",
            "hourlyRate": 0,
            "card": []
          });
          done();
        }
      });
    }).catch(done);
  });

  it('should reject on error', function(done) {
    card.cardInit().then(done).catch(() => {
      done();
    });
  });
});

describe('card.waltzIn()', function() {
  beforeEach(() => mockFs({
    '.timecard.json': JSON.stringify({card: []}),
  }, {createCwd: false}));
  afterEach(mockFs.restore);

  it('should waltz in at this time', function(done) {
    card.waltzIn().then((opts) => {
      card.getCard().then((timecard) => {
        assert.deepEqual(timecard, {
          card: [{
            date: opts.day,
            times: [{
              start: opts.time,
              by: "a-username",
            }]
          }]
        });
        done();
      }).catch(done);
    }).catch(done);
  });

  it('should waltz in at this time, waltz out, then waltz back in', function(done) {
    card.waltzIn().then((opts) => {
      card.getCard().then((timecard) => {
        assert.deepEqual(timecard, {
          card: [{
            date: opts.day,
            times: [{
              start: opts.time,
              by: "a-username",
            }]
          }]
        });

        card.waltzOut().then((out_opts) => {
          card.getCard().then((timecard) => {
            assert.deepEqual(timecard, {
              card: [{
                date: opts.day,
                times: [{
                  start: opts.time,
                  end: out_opts.time,
                  by: "a-username",
                }]
              }]
            });

            card.waltzIn().then((second_opts) => {
              card.getCard().then((timecard) => {
                assert.deepEqual(timecard, {
                  card: [{
                    date: opts.day,
                    times: [{
                      start: opts.time,
                      end: out_opts.time,
                      by: "a-username",
                    }, {
                      start: second_opts.time,
                      by: "a-username",
                    }]
                  }]
                });
                done();
              });
            });
          }).catch(done);
        }).catch(done);
      }).catch(done);
    }).catch(done);
  });
});

describe('card.waltzOut()', function() {
  beforeEach(() => mockFs({
    '.timecard.json': JSON.stringify({card: []}),
  }, {createCwd: false}));
  afterEach(mockFs.restore);

  it('should error when waltzing out without waltzing in', function(done) {
    card.waltzOut().catch((err) => {
      assert.equal(err.message, "You never waltzed in!");
      done();
    });
  });

  it('should error when waltzing out without an empty time', function(done) {
    card.waltzIn()
    .then(card.waltzOut)
    .then(() => {
      card.waltzOut().catch((err) => {
        assert.equal(err.message, "There aren't any currently open times that can be closed. Most likely, you ran `waltz out` twice.");
        done();
      });
    });
  });

  it('should waltz in at this time, then waltz out', function(done) {
    // fs.readdir(".", console.log.bind(console))
    // fs.readFile(".timecard.json", console.log.bind(console))
    card.waltzIn().then((opts) => {
      card.getCard().then((timecard) => {
        assert.deepEqual(timecard, {
          card: [{
            date: opts.day,
            times: [{
              start: opts.time,
              by: "a-username",
            }]
          }]
        });

        card.waltzOut().then((out_opts) => {
          card.getCard().then((timecard) => {
            assert.deepEqual(timecard, {
              card: [{
                date: opts.day,
                times: [{
                  start: opts.time,
                  end: out_opts.time,
                  by: "a-username",
                }]
              }]
            });
            done();
          }).catch(done);
        }).catch(done);
      }).catch(done);
    }).catch(done);
  });
});
