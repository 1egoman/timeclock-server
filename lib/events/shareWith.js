"use strict";
const repo = require("../repo"),
      card = require("../card"),
      email = require("../email"),
      User = require("../models/user"),
      Repo = require("../models/repo"),
      _ = require("underscore");

// server/SHARE_WITH
module.exports = function shareWith(action, socket) {
  return new Promise((resolve, reject) => {
    if (action.user && action.repo) {
      return User.findRepo(socket.request.user, action.user, action.repo).then((repo) => {
        console.log(`Sending email invite to ${action.emails.join(', ')} for ${action.user}/${action.repo}`);
        return email.send({
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
                <a target="_blank" href="${Repo.shareUrl(socket.request.user, repo, "mail")}">
                  Click here to take a look.
                </a>

                <p>From,</p>
                <p>Your pals at Waltz</p>
              </div>
          </body>
          `,
        });
      });
    } else {
      reject("Please specify a repo to share.");
    }
  });
}
