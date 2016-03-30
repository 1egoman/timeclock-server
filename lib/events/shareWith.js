"use strict";
const repo = require("../repo"),
      card = require("../card"),
      mailer = require("../mailer"),
      User = require("../models/user"),
      Repo = require("../models/repo"),
      _ = require("underscore");

// server/SHARE_WITH
module.exports = function shareWith(action, socket) {
  return new Promise((resolve, reject) => {
    if (action.user && action.repo) {
      return User.findRepo(socket.request.user, action.user, action.repo).then((repo) => {
        console.log(`Sending email invite to ${action.emails.join(', ')} for ${action.user}/${action.repo}`);
        return mailer.send({
          subject: `You've been invited look at ${action.user}/${action.repo} on Waltz`,
          recipient: action.emails,
          body: `
            <body class="body" bgcolor="#eee" style="background: #EEE; padding: 64px; color: #333;">
              <img
                src="http://waltzapp.co/img/logo.png"
                style="display: block; margin: 64px auto 0px auto; width: 80px;"
                alt="Waltz Logo"
              />
              <div style="width: 500px; margin: 64px auto; background: #FFF; padding: 20px;">
                <h1>Hello!</h1>
                <p>
                  You have been invited to look at an invoice for ${action.user}/${action.repo} on Waltz, a
                  simple way for freelancers to create great looking invoices for clients.
                </p>
                <p sstyle="margin-bottom: 20px;">${action.message || ""}</p>
                <a target="_blank" style="font-size: 16px; border: 1px solid #51c4c4; border-radius: 2px; padding: 6px;" href="${Repo.shareUrl(socket.request.user, repo, "mail")}">
                  Click here to take a look.
                </a>

                <p style="margin-top: 20px;">From,</p>
                <p>Your pals at Waltz</p>
              </div>

              <footer style="font-size: 10px; color: #999; margin-top: 10px; text-align: center;">
                We won't send you any more automated communication about Waltz unless you interact with Waltz or are invited to view another invoice.
              </footer>
            </body>
          `,
        });
      });
    } else {
      reject("Please specify a repo to share.");
    }
  });
}
