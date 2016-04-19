"use strict";
import assert from "assert";
import helpers from "../helpers";
import {
  formatTime,
  getTimeDelta,
  getAvatarFor,
  generateTimeMarkup,
} from '../../helpers/timecard';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

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
      assert.deepEqual(getTimeDelta("1:00:00", "1:30:12", {disabled: false}), {
        duration: 30.2,
        tooLong: false,
        markup: <span className="time-delta">
          <span><strong>{30} min</strong>, {12} sec</span>
          <span className="repo-details-report-table-indicators">
            {undefined}
            {undefined}
          </span>
        </span>,
      });
    });
    it('should get the time from the start to end, in an incomplete zone', function() {
      assert.deepEqual(getTimeDelta("1:00:00", undefined, {disabled: false}), {
        duration: null,
        tooLong: false,
        markup: <span className="time-delta time-delta-incomplete">
          No Duration
        </span>,
      });
    });
    it('should get the time from the start to end, and trigger `tooLong`', function() {
      assert.deepEqual(getTimeDelta("1:00:00", "4:00:00", {disabled: false}), {
        duration: 180,
        tooLong: true,
        markup: <span className="time-delta">
          <span><strong>{180} min</strong>, {0} sec</span>
          <span className="repo-details-report-table-indicators">
            <OverlayTrigger placement="left" overlay={
              <Tooltip id="long-work">
                This work period was longer than {90} minutes.
              </Tooltip>
            }>
              <i className="fa fa-warning warning" />
            </OverlayTrigger>
            {undefined}
          </span>
        </span>,
      });
    });
    it('should get the time from the start to end, and trigger `isDisabled`', function() {
      assert.deepEqual(getTimeDelta("1:00:00", "1:10:00", {disabled: true}), {
        duration: 10,
        tooLong: false,
        markup: <span className="time-delta">
          <span><strong>{10} min</strong>, {0} sec</span>
          <span className="repo-details-report-table-indicators">
            {undefined}
            <OverlayTrigger placement="left" overlay={
              <Tooltip id="already-paid">This time has been paid.</Tooltip>
            }>
              <i className="fa fa-money success" />
            </OverlayTrigger>
          </span>
        </span>,
      });
    });
  });
  describe.only('generateTimeMarkup', function() {
    it('should generate markup for a time in minutes', function() {
      assert.deepEqual(
        generateTimeMarkup(10.00),
        <span><strong>{10} min</strong>, {0} sec</span>
      );
    });
    it('should generate markup for a time in minutes and seconds', function() {
      assert.deepEqual(
        generateTimeMarkup(10.50),
        <span><strong>{10} min</strong>, {30} sec</span>
      );
    });
  })
  describe('getAvatarFor', function() {
    let user_pool = [
      {username: "a-user-one", avatar: "sauce"},
      {username: "a-user-two", avatar: "pig"},
      {username: "a-user-three", avatar: "monster"},
    ];
    it('should find a user that is in the pool', function() {
      assert.deepEqual(getAvatarFor(user_pool, "a-user-one"), {
        user: {username: "a-user-one", avatar: "sauce"},
        avatar_img: <img className="avatar-img" src="sauce" />
      })
    });
    it('should not find a user not in the pool', function() {
      assert.deepEqual(getAvatarFor(user_pool, "i-am-bogus"), {
        user: null,
        avatar_img: null,
        error: "No user found.",
      })
    });
  });
});
