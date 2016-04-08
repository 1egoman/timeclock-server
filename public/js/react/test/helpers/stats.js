"use strict";
import assert from "assert";
import helpers from "../helpers";
import moment from "moment";
import {
  calculateAverageWorkPeriodLength,
  calculateAverageCommitTime,
  calculateAverageCommitsPerWorkPeriod,
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
  });
});
describe.only("calculateAverageCommitsPerWorkPeriod", function() {
  it("should calculate the average ", function() {
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
      0
    );
  });
});
