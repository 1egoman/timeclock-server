"use strict";
import assert from "assert";
import helpers from "../helpers";
import React from 'react';
import Select from 'react-select';
import sinon from 'sinon';
import {Button, Popover, OverlayTrigger, Input} from 'react-bootstrap';
import {
  userInfo,
  badgeToken,
  longWorkPeriod,
  settingsListComponent,
  mapStateToProps,
} from '../../components/settingsList';

describe('components/settingsList.js', function() {
  describe('userInfo', function() {
    it('should render user info', function() {
      assert.deepEqual(userInfo({
        user: {
          username: "a-username",
          avatar: "http://i-am-an-avatar-url",
          badge_token: "a-badge-token",
          provider: "github",
        },
      }), <div className="panel panel-default">
        <div className="panel-heading">Waltz Settings</div>
        <div className="panel-body">
          <img className="avatar-img" src="http://i-am-an-avatar-url" />
          <h1>
            a-username
            <span className="setting-list-provider-badge">
              <a
                className="user-provider-badge user-provider-badge-github"
                target="_blank"
                href={`//github.com/a-username`}
              >
                <span className="fa fa-github"></span>
              </a>
            </span>
          </h1>
        </div>
      </div>);
    });
  });
  describe('badgeToken', function() {
    it('should render badge token viewer/editor', function() {
      let resetTokenSpy = sinon.spy(), user = {
        username: "a-username",
        avatar: "http://i-am-an-avatar-url",
        badge_token: "a-badge-token",
        provider: "github",
      };
      assert.deepEqual(badgeToken({
        user,
        resetToken: resetTokenSpy,
      }), <div className="panel panel-default panel-half-height">
        <div className="panel-heading">Badge Token</div>
        <div className="panel-body">
          <p>
            This token is used to provide authentication on your behalf to private
            embedded badges and reports that are sent to others who may not be logged in.
            Resetting this token will <strong>break all existing private badges and and links to private
            invoices.</strong>
          </p>
          <div className="badge-token-box">
            <div className="token-box">a-badge-token</div>
            <div className="token-btn">
              <Button bsStyle="info" onClick={undefined}>
                Reset token
              </Button>
            </div>
          </div>
        </div>
      </div>);
      assert(resetTokenSpy.calledOnce);
      assert(resetTokenSpy.calledWith(user));
    });
    it('should show a spinner when there isn\'t a badge token available', function() {
      let resetTokenSpy = sinon.spy(), user = {
        username: "a-username",
        avatar: "http://i-am-an-avatar-url",
        provider: "github",
      };
      assert.deepEqual(badgeToken({
        user,
        resetToken: resetTokenSpy,
      }), <div className="panel panel-default panel-half-height">
        <div className="panel-heading">Badge Token</div>
        <div className="panel-body">
          <p>
            This token is used to provide authentication on your behalf to private
            embedded badges and reports that are sent to others who may not be logged in.
            Resetting this token will <strong>break all existing private badges and and links to private
            invoices.</strong>
          </p>
          <div className="badge-token-box">
            <div className="token-box">
              <i className="fa fa-spinner fa-spin" />
            </div>
            <div className="token-btn">
              <Button bsStyle="info" onClick={undefined}>
                Reset token
              </Button>
            </div>
          </div>
        </div>
      </div>);
      assert(resetTokenSpy.calledOnce);
      assert(resetTokenSpy.calledWith(user));
    });
  });
  describe('longWorkPeriod', function() {
    it('should render log work period viewer/editor', function() {
      let changeLongWorkPeriodDuration = () => "change-long-work-period-function";
      assert.deepEqual(longWorkPeriod({
        settings: {
          long_work_period: 90,
        },
        changeLongWorkPeriodDuration,
      }), <div className="panel panel-default panel-half-height">
        <div className="panel-heading">Long work period duration</div>
        <div className="panel-body">
          <p>
            Long work periods have been linked to muscle fatigue, RSI, headaches, and more.
            Waltz can warn you when a work period exceeds a predetermined amount,
            giving you a metric for tracking the harmful effects of long-term computer usage.
          </p>
          <Input
            type="number"
            addonBefore="A long work period is"
            addonAfter="minutes or longer."
            value={90}
            onChange={changeLongWorkPeriodDuration}
          />
        </div>
      </div>);
    });
  });
  describe('bare component', function() {
    it('should render a settingslist', function() {
      let resetTokenSpy = sinon.spy(), user = {
        username: "a-username",
        avatar: "http://i-am-an-avatar-url",
        badge_token: "a-badge-token",
        provider: "github",
      }, changeLongWorkPeriodDuration = () => "change-long-work-period-function";
      assert.deepEqual(settingsListComponent({
        user,
        settings: {
          long_work_period: 90,
        },
        resetToken: resetTokenSpy,
        changeLongWorkPeriodDuration,
      }), <div className="settings-list">
          {/* general user info */}
          <div className="col-md-12">
            <div className="panel panel-default">
              <div className="panel-heading">Waltz Settings</div>
              <div className="panel-body">
                <img className="avatar-img" src="http://i-am-an-avatar-url" />
                <h1>
                  a-username
                  <span className="setting-list-provider-badge">
                    <a
                      className="user-provider-badge user-provider-badge-github"
                      target="_blank"
                      href={`//github.com/a-username`}
                    >
                      <span className="fa fa-github"></span>
                    </a>
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* badge / report token */}
          <div className="col-md-6">
            <div className="panel panel-default panel-half-height">
              <div className="panel-heading">Badge Token</div>
              <div className="panel-body">
                <p>
                  This token is used to provide authentication on your behalf to private
                  embedded badges and reports that are sent to others who may not be logged in.
                  Resetting this token will <strong>break all existing private badges and and links to private
                  invoices.</strong>
                </p>
                <div className="badge-token-box">
                  <div className="token-box">a-badge-token</div>
                  <div className="token-btn">
                    <Button bsStyle="info" onClick={undefined}>
                      Reset token
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* health */}
          <div className="col-md-6">
            <div className="panel panel-default panel-half-height">
              <div className="panel-heading">Long work period duration</div>
              <div className="panel-body">
                <p>
                  Long work periods have been linked to muscle fatigue, RSI, headaches, and more.
                  Waltz can warn you when a work period exceeds a predetermined amount,
                  giving you a metric for tracking the harmful effects of long-term computer usage.
                </p>
                <Input
                  type="number"
                  addonBefore="A long work period is"
                  addonAfter="minutes or longer."
                  value={90}
                  onChange={changeLongWorkPeriodDuration}
                />
              </div>
            </div>
          </div>
      </div>);
      assert(resetTokenSpy.calledOnce);
      assert(resetTokenSpy.calledWith(user));
    });
    it('should render a settingslist without a user', function() {
      assert.deepEqual(settingsListComponent({
        user: null,
      }), <div className="settings-list settings-list-loading">
        Loading settings...
      </div>);
    });
  });
  describe('mapStateToProps', function() {
    it('should correctly resolve props with settings', function() {
      let state = Object.assign({}, helpers.initialState, {
        user: {foo: "bar", settings: {foo: "baz"}},
      });
      assert.deepEqual(mapStateToProps(state, {}), {
        user: {foo: "bar", settings: {foo: "baz"}},
        settings: {foo: "baz"},
      });
    });
    it('should correctly resolve props without settings', function() {
      let state = Object.assign({}, helpers.initialState, {
        user: {foo: "bar"},
      });
      assert.deepEqual(mapStateToProps(state, {}), {
        user: {foo: "bar"},
        settings: null,
      });
    });
    it('should correctly resolve props without user', function() {
      let state = Object.assign({}, helpers.initialState, {
        user: null,
      });
      assert.deepEqual(mapStateToProps(state, {}), {
        user: null,
        settings: null,
      });
    });
  });
});
