"use strict";
const mongoose = require("mongoose"),
      Repo = require('./repo'),
      mailer = require("../mailer"),
      Promise = require("promise");

let User = new mongoose.Schema({
  github_id: Number,
  repos: [Repo.schema],
  user: Object,
  username: String,
  provider: String,
  profile_url: String,
  avatar: String,
  email: String,
  name: String,

  settings: {
    long_work_period: {
      type: Number,
      default: 90, // 90 minutes
    },
    payment_email: String,
  },

  badge_token: String,

  access_token: String,
  refresh_token: String,

  plan: String,
});

// return only the "public" attributes of the user
User.statics.sanitize = function(user) {
  return {
    username: user.username,
    provider: user.provider,
    profile_url: user.profile_url,
    badge_token: user.badge_token,
    github_id: user.github_id,
    avatar: user.avatar,
    settings: user.settings,
    plan: user.plan,
    email: user.email,
  };
};

// get the plan stats behind the string specified in the user model
// As we aren't enforcing the paid limits right now, return a ton of
// public repos.
User.statics.getAllotments = function(user) {
  return {
    "disco": {
      private_repos: 1,
    },
    "jive": {
      private_repos: 5,
    },
    "polka": {
      private_repos: 10,
    },
  }[user.plan] || {
    // free plan
    private_repos: 9999,
  }
}

// return the repos allotted to a user
User.statics.getRepos = function(user) {
  return new Promise((resolve) => resolve(user.repos));
}

// return a repo by username and reponame is a user has access to it
User.statics.findRepo = function(user, search_user, search_repo) {
  return User.statics.getRepos(user).then((repos) => {
    return repos.find((repo) => {
      return repo.user === search_user && repo.repo === search_repo;
    });
  });
}

User.statics.sendWelcomeMailer = function(user) {
  console.log("Sending welcome mailer to", user.email);
  if (user.email) {
    return mailer.send({
      subject: `Welcome to Waltz, ${user.name || user.email}.`,
      recipient: [user.email],
      body: `
      <body class="body" bgcolor="#eee" style="background: #EEE; padding: 64px; color: #333;">
        <img
          src="http://waltzapp.co/img/logo.png"
          style="display: block; margin: 0px auto; width: 80px;"
          alt="Waltz Logo"
        />
        <div style="width: 500px; margin: 64px auto; background: #FFF; padding: 20px;">
          <h1>Hey, you're awesome.</h1>
          <p style="margin-bottom: 20px;">
            Thanks for signing up for Waltz. You've now made timekeeping a lot
            easier and more accurate at the same time for all your clients.
            We know you'll love it as much as we do.
          </p>
          <a target="_blank" href="http://waltzapp.co/app/" style="font-size: 16px; border: 1px solid #51c4c4; border-radius: 2px; padding: 6px;" >
            Take me to the app.
          </a>
          <p style="margin-top: 20px;">From,</p>
          <p>Your pals at Waltz</p>
        </div>

        <footer style="font-size: 10px; color: #999; margin-top: 10px; text-align: center;">
          We won't send you any more automated communication about Waltz unless you give us express permission.
        </footer>
      </body>
      `
    });
  } else {
    return "No email to send mailer to."
  }
}

module.exports = mongoose.model("User", User);
