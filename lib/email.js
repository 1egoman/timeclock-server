"use strict";
const mail = require("mailgun-send"),
      emailValidator = require("email-validator"),
      htmlMinify = require("html-minifier").minify,
      _ = require("underscore");

mail.config({
  key: process.env.MAILGUN_TOKEN,
  sender: "noreply@waltzapp.co",
});

function validateEmails(emails) {
  return emails.every((email) => emailValidator.validate(email));
}

exports.send = function send(mailArgs) {
  return new Promise((resolve, reject) => {
    if (mailArgs.recipient && validateEmails(mailArgs.recipient)) {
      mailArgs.body = htmlMinify(mailArgs.body, {collapseWhitespace: true})
      mail.send(mailArgs);
      resolve();
    } else {
      reject("The provided emails weren't valid.");
    }
  });
}

