"use strict";
import assert from "assert";
import helpers from "../helpers";
import React from 'react';
import Select from 'react-select';
import sinon from 'sinon';
import {Button, Popover, OverlayTrigger, Input} from 'react-bootstrap';
import {
  repoSummaryComponent,
  clientInfo,
  lastWorker,
  mapStateToProps,
} from '../../components/repoSummary/repoSummary';

describe('components/repoSummary', function() {
  describe('clientInfo', function() {
    it('should show client name / owed amt with an hourly rate', function() {
      assert.deepEqual(
        clientInfo({
          repo: { client_name: "John Smith" },
          timecard: {
            hourlyRate: 50.00,
            card: [{
              date: "Sun Jan 17 2016",
              times: [{start: "1:00:00", end: "2:10:00"}],
            }]
          }
        }),
        <div className="repo-summary-client-info">
          <h1>John Smith</h1>
          <small>
            <span className="repo-summary-balance">58.33</span>
          </small>
        </div>
      );
    });
    it('should show client name / owed amt with a total rate', function() {
      assert.deepEqual(
        clientInfo({
          repo: { client_name: "John Smith" },
          timecard: {
            totalRate: 50.00,
            card: [{
              date: "Sun Jan 17 2016",
              times: [{start: "1:00:00", end: "2:10:00"}],
            }]
          }
        }),
        <div className="repo-summary-client-info">
          <h1>John Smith</h1>
          <small>
            <span className="repo-summary-balance">50.00</span>
          </small>
        </div>
      );
    });
    it('should show client name / owed amt with no rate', function() {
      assert.deepEqual(
        clientInfo({
          repo: { client_name: "John Smith" },
          timecard: {
            card: [{
              date: "Sun Jan 17 2016",
              times: [{start: "1:00:00", end: "2:10:00"}],
            }]
          }
        }),
        <div className="repo-summary-client-info">
          <h1>John Smith</h1>
          {null}
        </div>
      );
    });
    it('should show client name with a falsey timecard', function() {
      assert.deepEqual(
        clientInfo({
          repo: { client_name: "John Smith" },
          timecard: null,
        }),
        <div className="repo-summary-client-info">
          <h1>John Smith</h1>
          {null}
        </div>
      );
    });
    it('should not show client name when it doesnt exist', function() {
      assert.deepEqual(
        clientInfo({
          repo: {},
          timecard: null,
        }),
        <div className="repo-summary-client-info">
          <h1>Client</h1>
          {null}
        </div>
      );
    });
    it('should show placeholder with no repo name or amount due', function() {
      assert.deepEqual(
        clientInfo({
          repo: null,
          timecard: null,
        }),
        <div className="repo-summary-client-info"></div>
      );
    });
    it('should show amt owed with no client name', function() {
      assert.deepEqual(
        clientInfo({
          repo: {},
          timecard: {
            totalRate: 50.00,
            card: [{
              date: "Sun Jan 17 2016",
              times: [{start: "1:00:00", end: "2:10:00"}],
            }]
          }
        }),
        <div className="repo-summary-client-info">
          <h1>Client</h1>
          <small>
            <span className="repo-summary-balance">50.00</span>
          </small>
        </div>
      );
    });
  });
  describe('lastWorker', function() {
    it('should show last committer and the time they worked when both are given', function() {
      assert.deepEqual(
        lastWorker({
          color: "#ff0000",
          timecard: {
            hourlyRate: 50.00,
            card: [{
              date: "Sun Jan 17 2016",
              times: [{start: "1:00:00", end: "2:10:00", by: "user"}],
            }]
          },
          users: [{ username: "user", avatar: "http://example.com/avatar.png" }],
        }),
        <div className="repo-summary-committer-info" style={{backgroundColor: "#ff0000"}}>
          <img className="avatar-img" src="http://example.com/avatar.png" />
          <h2>user</h2>
          <small>
            <span className="start-time">1:00:00</span>
            2:10:00
          </small>
        </div>
      );
    });
    it('should show when the last person worked, but without user', function() {
      assert.deepEqual(
        lastWorker({
          color: "#ff0000",
          timecard: {
            hourlyRate: 50.00,
            card: [{
              date: "Sun Jan 17 2016",
              times: [{start: "1:00:00", end: "2:10:00"}],
            }]
          },
          users: [{ username: "user", avatar: "http://example.com/avatar.png" }],
        }),
        <div className="repo-summary-committer-info" style={{backgroundColor: "#ff0000"}}>
          <div className="avatar-spacer"></div>
          <h2>Last Contributed</h2>
          <small>
            <span className="start-time">1:00:00</span>
            2:10:00
          </small>
        </div>
      );
    });
    it('should show when the last person worked, but without user and time', function() {
      assert.deepEqual(
        lastWorker({
          color: "#ff0000",
          timecard: {
            hourlyRate: 50.00,
            card: [{
              date: "Sun Jan 17 2016",
              times: [],
            }]
          },
          users: [{ username: "user", avatar: "http://example.com/avatar.png" }],
        }),
        <div className="repo-summary-committer-info" style={{backgroundColor: "#ff0000"}}>
          <div className="avatar-spacer"></div>
          <h2>Last Contributed</h2>
        </div>
      );
    });
    it('should show when the last person worked, but without user definition', function() {
      assert.deepEqual(
        lastWorker({
          color: "#ff0000",
          timecard: {
            hourlyRate: 50.00,
            card: [{
              date: "Sun Jan 17 2016",
              times: [{start: "1:00:00", end: "2:10:00", by: "user"}],
            }]
          },
          users: [], // no user here
        }),
        <div className="repo-summary-committer-info" style={{backgroundColor: "#ff0000"}}>
          <div className="avatar-spacer"></div>
          <h2>user</h2>
          <small>
            <span className="start-time">1:00:00</span>
            2:10:00
          </small>
        </div>
      );
    });
    it('should show loading msg without a timecard', function() {
      assert.deepEqual(
        lastWorker({
          color: "#ff0000",
          timecard: null,
        }),
        <div className="repo-summary-committer-info" style={{backgroundColor: "#ff0000"}}>
          <h2>Loading last committer</h2>
        </div>
      );
    });
  });
  describe('mapStateToProps', function() {
    it('should inherit from props', function() {
      assert.deepEqual(mapStateToProps({}, {foo: "bar"}), {
        foo: "bar",
        users: [],
      });
    });
    it('should inherit from props, and add state users', function() {
      assert.deepEqual(mapStateToProps({
        repo_details: {
          users: ["usera", "userb"],
        },
      }, {foo: "bar"}), {
        foo: "bar",
        users: ["usera", "userb"],
      });
    });
  });
});
