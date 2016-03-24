"use strict";
const repo = require("../repo"),
      card = require("../card"),
      mail = require("mailgun-send"),
      _ = require("underscore");

mail.config({
  key: process.env.MAILGUN_TOKEN,
  // sender: "noreply@waltzapp.co",
  sender: "noreply@sandbox5cd9ca59d4b840ee8f79240882036873.mailgun.org",
});

// server/SHARE_WITH
module.exports = function changeSetting(action, socket) {
  return new Promise((resolve, reject) => {
    console.log(action)
    if (action.emails && action.user && action.repo) {
      mail.send({
        subject: `You've been invited look at ${action.user}/${action.repo} on Waltz`,
        recipient: action.emails,
        body: `
          <body bgcolor="#eee" style="background:#eee;padding:64px;">
            <img
              src="http://waltzapp.co/img/logo.svg"
              style="display:block;margin:64px auto 0px auto;width: 80px;"
              alt="Waltz Logo"
            />
            <div style="width:500px;margin:64px auto;background:#FFF;padding:20px;">
              <h2>Hello!</h2>
              <p>
                You have been invited to look at an invoice for ${action.user}/${action.repo} on Waltz, a
                simple way for freelancers to create great looking invoices for clients.
              </p>
              <p>${action.message || ""}</p>
              <a target="_blank" href="http://waltzapp.co/embed/${action.user}/${action.repo}?ref=mail">
                Click here to take a look.
              </a>

              <p>From,</p>
              <p>Your pals at Waltz</p>
            </div>
        </body>
        `,
      });
      resolve();
    } else {
      reject("No emails provided.");
    }
  });
}
