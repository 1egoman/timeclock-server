"use strict";
const mail = require("mailgun-send"),
      mailer = require("../../lib/mailer"),
      sinon = require("sinon"),
      assert = require("assert"),
      htmlMinify = require("html-minifier").minify,
      socketHelpers = require("../helpers/socket"),
      shareWith = require("../../lib/events/shareWith");

describe("lib/events/shareWith.js", function() {
  beforeEach(() => {
    sinon.stub(mail, "send", () => true);
  });
  afterEach(() => {
    mail.send.restore();
  });

  it.only("should send an email when given the correct action", function(done) {
    let skt = socketHelpers.createMockSocketWith({
      repos: [{user: "a-user", repo: "a-repo"}],
    });

    shareWith({
      type: "server/SHARE_WITH",
      emails: ["user@example.com"],
      via: "email",
      user: "a-user",
      repo: "a-repo",
    }, skt).then(() => {
      assert(mail.send.calledOnce);
      assert.deepEqual(mail.send.firstCall.args, [{
        subject: `You've been invited look at a-user/a-repo on Waltz`,
        recipient: ["user@example.com"],
        body: htmlMinify(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>You've been invited look at a-user/a-repo on Waltz</title>
            <style type="text/css">${mailer.mailerCss()}</style>
          </head>
            <body class="body" bgcolor="#eee" style="background: #EEE; padding: 64px; color: #333;">
              <img
                src="http://waltzapp.co/img/logo.svg"
                style="display: block; margin: 64px auto 0px auto; width: 80px;"
                alt="Waltz Logo"
              />
              <div style="width: 500px; margin: 64px auto; background: #FFF; padding: 20px;">
                <h2>Hello!</h2>
                <p>
                  You have been invited to look at an timesheet for a-user/a-repo on Waltz, a
                  simple way for freelancers to create great looking timesheets for clients.
                </p>
                <p style="margin-bottom: 20px;"></p>
                <a target="_blank" style="font-size: 16px; border: 1px solid #51c4c4; border-radius: 2px; padding: 6px;" href="http://waltzapp.co/embed/a-user/a-repo?ref=mail">
                  Click here to take a look.
                </a>

                <p style="margin-top: 20px;">From,</p>
                <p>Your pals at Waltz</p>
              </div>
            </body>
          </html>
        `, {collapseWhitespace: true}),
      }]);
      done();
    }).catch(done);
  });
  it("should send an email when given the correct action for a private repo", function(done) {
    let skt = socketHelpers.createMockSocketWith({
      repos: [{user: "a-user", repo: "a-repo", is_private: true}]
    });

    shareWith({
      type: "server/SHARE_WITH",
      emails: ["user@example.com"],
      via: "email",
      user: "a-user",
      repo: "a-repo",
    }, skt).then(() => {
      assert(mail.send.calledOnce);
      assert.deepEqual(mail.send.firstCall.args, [{
        subject: `You've been invited look at a-user/a-repo on Waltz`,
        recipient: ["user@example.com"],
        body: htmlMinify(`
          <body bgcolor="#eee" style="background:#eee;padding:64px;">
            <img
              src="http://waltzapp.co/img/logo.svg"
              style="display:block;margin:64px auto 0px auto;width: 80px;"
              alt="Waltz Logo"
            />
            <div style="width:500px;margin:64px auto;background:#FFF;padding:20px;">
              <h2>Hello!</h2>
              <p>
                You have been invited to look at a timesheet for a-user/a-repo on Waltz, a
                simple way for freelancers to create great looking timecards for clients.
              </p>
              <p></p>
              <a target="_blank" href="http://waltzapp.co/embed/a-user/a-repo?token=badge-token&ref=mail">
                Click here to take a look.
              </a>

              <p>From,</p>
              <p>Your pals at Waltz</p>
            </div>
          </body>
        `, {collapseWhitespace: true}),
      }]);
      done();
    }).catch(done);
  });
  it("should not send an email with bad user / repo", function(done) {
    let skt = socketHelpers.createMockSocketWith({
      repos: [{user: "a-user", repo: "a-repo"}]
    });

    shareWith({
      type: "server/SHARE_WITH",
      emails: ["user@example.com"],
      via: "email",
      // no user or repo
    }, skt).then(() => {
      done("Should have failed.");
    }).catch((error) => {
      assert.equal(error, "The provided emails weren't valid.");
      done();
    });
  });
  it("should not send an email with invalid emails", function(done) {
    let skt = socketHelpers.createMockSocketWith({
      repos: [{user: "a-user", repo: "a-repo"}]
    });

    shareWith({
      type: "server/SHARE_WITH",
      emails: ["a bad email"],
      via: "email",
      user: "a-user",
      repo: "a-repo",
    }, skt).then(() => {
      done("Should have failed.");
    }).catch((error) => {
      assert.equal(error, "The provided emails weren't valid.");
      done();
    });
  });
});
