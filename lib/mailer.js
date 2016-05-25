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

// css to include with all mailers
function mailerCss() {
  return `
    body, .body {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      background: #eee;
      color: #333;
    }
    a {
      color: #51c4c4 !important;
      text-decoration: none;
      font-weight: bold;
    }
    .container {
      width: 500px;
      margin: 64px auto;
      background: #FFF;
      padding: 20px;
    }

    /* Some sensible defaults for images
    Bring inline: Yes. */
    img {outline:none; text-decoration:none; -ms-interpolation-mode: bicubic;}
    a img {border:none;}
    .image_fix {display:block;}
  `;
}
exports.mailerCss = mailerCss;

exports.send = function send(mailArgs) {
  return new Promise((resolve, reject) => {
    if (mailArgs.recipient && validateEmails(mailArgs.recipient)) {
      mailArgs.body = htmlMinify(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${mailArgs.subject}</title>
          <style type="text/css">${mailerCss()}</style>
        </head>
        ${mailArgs.body}
        </html>
      `, {collapseWhitespace: true})
      mail.send(mailArgs);
      resolve();
    } else {
      reject("The provided emails weren't valid.");
    }
  });
}
