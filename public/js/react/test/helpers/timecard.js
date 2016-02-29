"use strict";
import assert from "assert";
import helpers from "../helpers";
import {
  formatTime,
  getTimeDelta,
} from '../../helpers/timecard';
import React from 'react';

describe('helpers/timecard.js', function() {
  describe('formatTime', function() {
    it('should change the format of some times', function() {
      assert.deepEqual(formatTime("1:30:12", "%H:%M:%S"), new Date(5412000));
      assert.equal(formatTime("1:30:12", "%I:%M:%S", "%H:%M:%S"), "20:30:12");
      assert.equal(formatTime("05 May 2016", "%d %B %Y", "%Y %m %b"), "2016 05 May");
    });
  });
  describe('getTimeDelta', function() {
    // assuming the default `tooLongDuration` of 45 minutes
    it('should get the time from the start to end', function() {
      assert.deepEqual(getTimeDelta("1:00:00", "1:30:12"), {
        duration: 30.2,
        tooLong: false,
        markup: <span className="time-delta">
          <strong>{30} min</strong>, {12} sec
          {undefined}
        </span>,
      });
    });
    it('should get the time from the start to end, and trigger `tooLong`', function() {
      assert.deepEqual(getTimeDelta("1:00:00", "4:00:00"), {
        duration: 180,
        tooLong: true,
        markup: <span className="time-delta">
          <strong>{180} min</strong>, {0} sec
          <span
            className="warning"
            data-toggle="tooltip"
            data-placement="left"
            title={`This work period was longer than 90 minutes.`}
          >
            <span className="fa fa-warning"></span>
          </span>
        </span>,
      });
    });
  });

  describe('getAvatarFor', function() {
    it('should have tests');
  });
});
