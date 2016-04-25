"use strict";
import assert from "assert";
import helpers from "../helpers";
import moment from "moment";
import {
  calculateAverageWorkPeriodLength,
  calculateAverageCommitTime,
  calculateAverageCommitsPerWorkPeriod,
  calculateContributors,
  calculateAverageCommitsPerContributorPerWorkPeriod,
  getLastContributor,
  formatTime,
  colorizeGraph,
} from '../../helpers/stats';

const HOUR_IN_MS = 60 * 60 * 1000;
const MIN_IN_MS = 60 * 1000;

let sampleTimecard = {
  "reportFormat": "default",
  "hourlyRate": 30,
  "name": "My Project",
  "tagline": "Project description here",
  "primaryColor": "#d45500",
  "card": [
    {
      "date": "Sun Jan 17 2016",
      "disabled": "Sun Feb 14 2016",
      "times": [
        {
          "start": "1:00:00",
          "end": "10:00:00"
        }
      ]
    },
    {
      "date": "Tue Jan 19 2016",
      "disabled": "Sun Feb 14 2016",
      "times": [
        {
          "start": "1:00:00",
          "end": "10:00:00"
        }
      ]
    },
    {
      "date": "Sat Jan 23 2016",
      "disabled": "Sun Feb 14 2016",
      "times": [
        {
          "start": "1:00:00",
          "end": "10:00:00"
        }
      ]
    },
  ]
}

describe("calculateAverageWorkPeriodLength", function() {
  it("should work with empty timecard", function() {
    assert.equal(
      calculateAverageWorkPeriodLength({card: [{
        "date": "Sun Jan 17 2016",
        "times": []
      }]}),
      0
    );
  });
  it("should not work with invalid timecard", function() {
    assert.equal(
      calculateAverageWorkPeriodLength({iAm: "invalid"}),
      null
    );
  });
  it("should calculate average work period length when all times are even", function() {
    assert.equal(
      calculateAverageWorkPeriodLength(sampleTimecard),
      9 * HOUR_IN_MS // 9 hours
    );
  });
  it("should calculate average work period length when times are all different", function() {
    assert.equal(
      calculateAverageWorkPeriodLength({card: [{
        "date": "Sun Jan 17 2016",
        "times": [
          {start: "1:00:00", end: "5:00:00"},
          {start: "6:00:00", end: "6:30:00"},
        ]
      }]}),
      2.25 * HOUR_IN_MS // 2.25 hours
    );
  });
  it("should not take into account non-ending times", function() {
    assert.equal(
      calculateAverageWorkPeriodLength({card: [{
        "date": "Sun Jan 17 2016",
        "times": [
          {start: "1:00:00", end: "5:00:00"},
          {start: "6:00:00"},
        ]
      }]}),
      4 * HOUR_IN_MS // 4 hours
    );
  });
});
describe("calculateAverageCommitTime", function() {
  it("should work with equal length commits", function() {
    assert.equal(
      calculateAverageCommitTime([
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T10:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message 1",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T10:50:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T10:55:00Z"
        },
      ]),
      5 * MIN_IN_MS // 5 minutes
    );
  });
  it("should work with unequal length commits", function() {
    assert.equal(
      calculateAverageCommitTime([
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T10:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message 1",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T10:50:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T11:00:00Z"
        },
      ]),
      7.5 * MIN_IN_MS // 7.5 minutes
    );
  });
  it("should not work with one commit", function() {
    assert.equal(
      calculateAverageCommitTime([
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T10:45:00Z"
        },
      ]),
      null
    );
  });
  it("should not count commits with a bad 'when' date in them, one commit", function() {
    assert.equal(
      calculateAverageCommitTime([
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T10:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "i'm invalid"
        },
      ]),
      null
    );
  });
  it("should not count commits with a bad 'when' date in them, many commits", function() {
    assert.equal(
      calculateAverageCommitTime([
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T10:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "i'm invalid"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T10:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T10:50:00Z"
        },
      ]),
      5 * MIN_IN_MS // 5 minutes
    );
  });
  it("should not work when given bad arguments", function() {
    assert.equal(calculateAverageCommitTime(null), null);
    assert.equal(calculateAverageCommitTime([]), null);
    assert.equal(calculateAverageCommitTime(123), null);
    assert.equal(calculateAverageCommitTime("a string"), null);
  });
});
describe("calculateAverageCommitsPerWorkPeriod", function() {
  it("should calculate the average", function() {
    assert.equal(
      calculateAverageCommitsPerWorkPeriod({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00"},
              {start: "3:00:00", end: "8:00:00"},
            ],
          },
        ]
      }, [
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T01:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message 1",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T01:50:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T03:00:00Z"
        },
      ]),
      1/8 // "average" commits per "average" work period
    );
  });
  it("should calculate the average using data that calculates to the same totals", function() {
    assert.equal(
      calculateAverageCommitsPerWorkPeriod({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00"},
              {start: "3:00:00", end: "8:00:00"},
              {start: "5:00:00", end: "10:00:00"},
            ],
          },
        ]
      }, [
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T01:00:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message 1",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T01:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T02:15:00Z"
        },
      ]),
      1/8 // "average" commits per "average" work period
    );
  });
  it("should calculate the average, with one time", function() {
    assert.equal(
      calculateAverageCommitsPerWorkPeriod({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "5:00:00"},
            ],
          },
        ]
      }, [
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T01:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message 1",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T01:50:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T03:00:00Z"
        },
      ]),
      1/6.4 // 6.4 "average" commits per "average" work period
            // went down from the previous test (7.2) because there is less time
            // on average per work period
    );
  });
  it("should calculate the average, with one commit range (2 commits)", function() {
    assert.equal(
      calculateAverageCommitsPerWorkPeriod({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "5:00:00"},
              {start: "5:00:00", end: "10:00:00"},
            ],
          },
        ]
      }, [
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T01:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T03:00:00Z"
        },
      ]),
      1/3.6 // 3.6 "average" commits per "average" work period
            // again, this is lower, because fewer, longer commits increase the
            // average commit time substantially (less to divide by).
    );
  });
  it("should not work with bad timecard", function() {
    assert.equal(
      calculateAverageCommitsPerWorkPeriod({
        iAm: "a bad timecard",
      }, [
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T01:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T03:00:00Z"
        },
      ]),
      null
    );
  });
  it("should not work with bad commits", function() {
    assert.equal(
      calculateAverageCommitsPerWorkPeriod({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "5:00:00"},
              {start: "5:00:00", end: "10:00:00"},
            ],
          },
        ]
      }, "bad commits"),
      null
    );
  });
  it("should not work with bad timecard/commits", function() {
    assert.equal(
      calculateAverageCommitsPerWorkPeriod("bad timecard", "bad commits"),
      null
    );
  });
});
describe("calculateContributors", function() {
  it("should calculate contributors with zero contributors", function() {
    assert.deepEqual(
      calculateContributors({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [],
          },
        ]
      }),
      {}
    );
  });
  it("should calculate contributors with only one", function() {
    assert.deepEqual(
      calculateContributors({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00", by: "user"},
              {start: "3:00:00", end: "8:00:00", by: "user"},
            ],
          },
        ]
      }),
      {user: 2}
    );
  });
  it("should calculate contributors with two", function() {
    assert.deepEqual(
      calculateContributors({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00", by: "user"},
              {start: "3:00:00", end: "8:00:00", by: "user two"},
            ],
          },
        ]
      }),
      {user: 1, "user two": 1}
    );
  });
  it("should calculate contributors with greater than two", function() {
    assert.deepEqual(
      calculateContributors({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00", by: "user"},
              {start: "3:00:00", end: "8:00:00", by: "user two"},
              {start: "5:00:00", end: "7:00:00", by: "user three"},
            ],
          },
        ]
      }),
      {user: 1, "user two": 1, "user three": 1}
    );
  });
  it("should not calculate contributors with a bad timecard", function() {
    assert.deepEqual(
      calculateContributors({ i_am: "malformed"}),
      false
    );
  });
});
describe("calculateAverageCommitsPerContributorPerWorkPeriod", function() {
  it("should calculate the average with one user only", function() {
    assert.equal(
      calculateAverageCommitsPerContributorPerWorkPeriod({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00", by: "user"},
              {start: "3:00:00", end: "8:00:00", by: "user"},
            ],
          },
        ]
      }, [
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T01:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message 1",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T01:50:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T03:00:00Z"
        },
      ]),
      1/8 // "average" commits per "average" work period
    );
  });
  it("should calculate the average with two users", function() {
    assert.equal(
      calculateAverageCommitsPerContributorPerWorkPeriod({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00", by: "user"},
              {start: "3:00:00", end: "8:00:00", by: "user2"},
            ],
          },
        ]
      }, [
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T01:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message 1",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T01:50:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T03:00:00Z"
        },
      ]),
      1/16 // "average" commits per "average" work period / 2 users
    );
  });
  it("should not calculate the average with a bad timecard", function() {
    assert.equal(
      calculateAverageCommitsPerContributorPerWorkPeriod({i_am: "malformed"}, [
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message abc",
          "sha": "e314554fb963b43ee14be08826284f143fe7ae6f",
          "when": "2016-03-26T01:45:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message 1",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T01:50:00Z"
        },
        {
          "committer": {
            "username": "1egoman",
            "avatar": "https://avatars.githubusercontent.com/u/1704236?v=3",
            "url": "https://github.com/1egoman",
            "type": "user"
          },
          "message": "Commit message",
          "sha": "2f019b63b2c26748538e1d7bf711522eb05fb96c",
          "when": "2016-03-26T03:00:00Z"
        },
      ]),
      false
    );
  });
  it("should not calculate average with no commits", function() {
    assert.equal(
      calculateAverageCommitsPerContributorPerWorkPeriod({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00", by: "user"},
              {start: "3:00:00", end: "8:00:00", by: "user2"},
            ],
          },
        ]
      }, []),
      false
    );
  });
});
describe("getLastContributor", function() {
  it("should get the last contributor of a timecard", function() {
    assert.deepEqual(
      getLastContributor({
        card: [
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00", by: "bad-user"},
              {start: "3:00:00", end: "8:00:00", by: "user"},
            ],
          },
        ]
      }),
      {
        when: new Date("Sun Jan 17 2016 3:00:00"),
        author: "user",
      }
    );
  });
  it("should get the last contributor of a timecard with mutiple days", function() {
    assert.deepEqual(
      getLastContributor({
        card: [
          {
            "date": "Sat Jan 16 2016",
            "times": [
              {start: "1:30:00", end: "6:00:00", by: "bad-user"},
              {start: "3:40:00", end: "8:00:00", by: "bad-user"},
            ],
          },
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00", by: "bad-user"},
              {start: "3:00:00", end: "8:00:00", by: "user"},
            ],
          },
        ]
      }),
      {
        when: new Date("Sun Jan 17 2016 3:00:00"),
        author: "user",
      }
    );
  });
  it("should not get last contributor from a badly formatted date", function() {
    assert.deepEqual(
      getLastContributor({
        card: [
          {
            "date": "I am bogus!",
            "times": [
              {start: "1:30:00", end: "6:00:00", by: "bad-user"},
              {start: "3:40:00", end: "8:00:00", by: "bad-user"},
            ],
          },
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "1:00:00", end: "6:00:00", by: "bad-user"},
              {start: "3:00:00", end: "8:00:00", by: "user"},
            ],
          },
        ]
      }),
      {
        when: new Date("Sun Jan 17 2016 3:00:00"),
        author: "user",
      }
    );
  });
  it("should not get last contributor from a badly formatted time", function() {
    assert.deepEqual(
      getLastContributor({
        card: [
          {
            "date": "Sat Jan 16 2016",
            "times": [
              {start: "1:30:00", end: "6:00:00", by: "bad-user"},
              {start: "3:40:00", end: "8:00:00", by: "bad-user"},
            ],
          },
          {
            "date": "Sun Jan 17 2016",
            "times": [
              {start: "bad format", end: "6:00:00", by: "bad-user"},
              {start: "3:00:00", end: "8:00:00", by: "user"},
            ],
          },
        ]
      }),
      {
        when: new Date("Sun Jan 17 2016 3:00:00"),
        author: "user",
      }
    );
  });
  it("should not get contributors with bad timecard", function() {
    assert.deepEqual(getLastContributor({foo: "bar"}), null);
  });
});
describe("formatTime", function() {
  it("should format a time given an epoch", function() {
    assert.equal(formatTime(3600000), "1 hours and 0 minutes");
    assert.equal(formatTime(3630000), "1 hours and 30 minutes");
    assert.equal(formatTime(3640000), "1 hours and 40 minutes");
    assert.equal(formatTime(36000000), "10 hours and 0 minutes");
    assert.equal(formatTime(36030000), "10 hours and 30 minutes");
    assert.equal(formatTime(36040000), "10 hours and 40 minutes");
  });
});
describe("colorizeGraph", function() {
  it("should add color to a section of a graph datastructure", function() {
    assert.deepEqual(
      colorizeGraph({
        labels: ["a", "b", "c"],
        datasets: [
          {
            label: "label a",
            data: [1, 2, 3],
          },
          {
            label: "label b",
            data: [1, 2, 3],
          }
        ],
      }, "label a", "red"),
      {
        labels: ["a", "b", "c"],
        datasets: [
          {
            label: "label a",
            data: [1, 2, 3],
            fillColor: "red",
            strokeColor: "red",
            pointColor: "red",
            pointHighlightFill: "red",
          },
          {
            label: "label b",
            data: [1, 2, 3],
          }
        ],
      }
    );
  });
  it("should add color to a section of a graph datastructure (with point color)", function() {
    assert.deepEqual(
      colorizeGraph({
        labels: ["a", "b", "c"],
        datasets: [
          {
            label: "label a",
            data: [1, 2, 3],
          },
          {
            label: "label b",
            data: [1, 2, 3],
          }
        ],
      }, "label a", "red", "green"),
      {
        labels: ["a", "b", "c"],
        datasets: [
          {
            label: "label a",
            data: [1, 2, 3],
            fillColor: "red",
            strokeColor: "red",
            pointColor: "green",
            pointHighlightFill: "green",
          },
          {
            label: "label b",
            data: [1, 2, 3],
          }
        ],
      }
    );
  });
  it("should add color to multiple sections of a graph datastructure", function() {
    assert.deepEqual(
      colorizeGraph({
        labels: ["a", "b", "c"],
        datasets: [
          {
            label: "label a",
            data: [1, 2, 3],
          },
          {
            label: "label a",
            data: [1, 2, 3],
          }
        ],
      }, "label a", "red", "green"),
      {
        labels: ["a", "b", "c"],
        datasets: [
          {
            label: "label a",
            data: [1, 2, 3],
            fillColor: "red",
            strokeColor: "red",
            pointColor: "green",
            pointHighlightFill: "green",
          },
          {
            label: "label a",
            data: [1, 2, 3],
            fillColor: "red",
            strokeColor: "red",
            pointColor: "green",
            pointHighlightFill: "green",
          },
        ],
      }
    );
  });
  it("should not work for bad data", function() {
    assert.deepEqual(
      colorizeGraph({bad: "data"}, "label a", "red", "green"),
      {bad: "data"}
    );
  });
});
