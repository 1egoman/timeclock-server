"use strict";
const required_repo = require("../lib/repo"),
      card = require("../lib/card"),
      async = require("async"),
      _ = require("underscore"),
      user_model = require("../lib/models/user"),
      uuid = require("uuid"),
      TIMECARD_PAGE_LENGTH = 20; // the amount of times that are returned per request,

module.exports = function(socket, use_repo, inject_user_model) {
  let repo = use_repo || required_repo;
  let User = user_model || inject_user_model;
  return (action) => {

    // discover all repos to import
    if (action.type === 'server/DISCOVER_REPOS') {
      process.env.NODE_ENV !== "test" && console.log(`Discovering all repos for ${socket.request.user.username}`);
      repo.getUserRepos({user: socket.request.user}).then((repos) => {
        socket.emit("action", {
          type: "server/REPOS_DISCOVERED",
          repos: repos.map((r) => {
            return {
              user: r.full_name.split('/')[0],
              repo: r.name,
              desc: r.description,
              is_pending: false,
              is_private: r.private || false,
              has_timecard: r.timecard && r.timecard.card ? true : false,
              owner_type: r.owner.type.toLowerCase(),
              default_branch: r.default_branch,
              provider: "github",
            }
          }),
          settings: socket.request.user.settings,
        });
      }, (err) => {
        socket.emit("action", {
          type: "server/ERROR",
          error: err,
        });
      });

    // import a repo
    } else if (action.type === 'server/IMPORT_REPO') {
      console.log("Import a repo!");

      User.update({_id: socket.request.user}, {$push: {repos: action.repo}}, (err) => {
        if (err) {
          socket.emit("action", {
            type: "server/ERROR",
            error: err,
          });
        } else {
          socket.emit("action", {
            type: "server/PUT_REPO",
            repo: action.repo,
          });
          socket.emit("action", {
            type: "server/REPO_IMPORT",
            repo: action.repo,
          });
        }
      });

    // get the branches for a repo
    } else if (action.type === 'server/GET_BRANCHES') {
      repo.getBranchesForRepo({user: socket.request.user}, action.user, action.repo).then((branches) => {
        socket.emit("action", {
          type: "server/BRANCHES_FOR",
          branches: branches.map((b) => b.name),
        });
      }, (err) => {
        socket.emit("action", {
          type: "server/ERROR",
          error: err,
        });
      });

    // get the timecard for the specified repo
    } else if (action.type === 'server/GET_TIMECARD') {
      repo.getFileFromRepo(action.user, action.repo, null, action.branch, socket.request.user).then((timecard) => {
        if (card.assertIsCard(timecard)) {

          // paginate according to the passed info
          if (typeof action.page !== "undefined") {
            let start = action.page * TIMECARD_PAGE_LENGTH;
            // return them in reverse so they are sorted in
            // reverse-chronological order
            timecard.card = timecard.card.reverse().slice(start, start + TIMECARD_PAGE_LENGTH);
          }

          // get all users in the timecard
          let all_users = timecard.card.map((day) => {
            return day.times.map((t) => t.by);
          });
          let reduced_users = _.compact(_.uniq(_.flatten(all_users)));

          // get all user details
          async.map(reduced_users, (username, done) => {
            repo.getUserMetaFor({user: socket.request.user}, username)
            .then((user) => done(null, user))
            .catch(done);
          }, (err, user_models) => {

            // send the timecard and the associated users
            socket.emit("action", {
              type: "server/TIMECARD",
              user: action.user,
              repo: action.repo,
              branch: action.branch,
              timecard: timecard,
              users: user_models,

              page: action.page,
              canpaginateforward: timecard.card.length >= TIMECARD_PAGE_LENGTH,
            });
          });
        } else {
          // uhh, the timecard doesn't validate
          socket.emit("action", {
            type: "server/TIMECARD",
            error: "Timecard isn't a timecard."
          });
        }
      }, (err) => {
        socket.emit("action", {
          type: "server/ERROR",
          error: err,
        });
      });

    // reset a badge token that is associated with a user
    } else if (action.type === 'server/RESET_TOKEN') {
      User.findOne({username: action.username, badge_token: action.old_token}).exec((err, user) => {
        if (err) {
          socket.emit("action", {
            type: "server/ERROR",
            err: err,
          });
        } else if (user) {
          user.badge_token = uuid.v4(); // generate new badge token
          user.save((err) => {
            if (err) {
              socket.emit("action", {
                type: "server/ERROR",
                err: err,
              });
            } else {
              socket.emit("action", {
                type: "server/TOKEN_RESET",
                user: User.sanitize(user),
                badge_token: user.badge_token,
              });
            }
          })
        } else {
          socket.emit("action", {
            type: "server/ERROR",
            err: "No user was found with that badge token.",
          });
        }
      });

    // change the value of a sumset of settings within the user model
    } else if (action.type === 'server/CHANGE_SETTING') {
      let new_settings = Object.assign(socket.request.user.settings, action.changes);
      User.update({_id: socket.request.user._id}, {settings: new_settings}).exec((err) => {
        if (err) {
          socket.emit("action", {
            type: "server/ERROR",
            err: err,
          });
        } else {
          socket.emit("action", {
            type: "server/SETTING_CHANGED",
            settings: new_settings,
          });
        }
      });

    // when the page loads for the first time, update the state to reflect the
    // initial url
    } else if (action.type === '@@router/LOCATION_CHANGE' && action.payload && action.payload.action === "POP") {
      let match;
      if (match = action.payload.pathname.match(/\/app\/([\w]+)\/([\w]+)/)) {
        module.exports(socket)({
          type: "server/GET_BRANCHES",
          user: match[1],
          repo: match[2],
        });
        module.exports(socket)({
          type: "server/GET_TIMECARD",
          user: match[1],
          repo: match[2],
          page: 0,
        });
        socket.emit("action", {type: "SELECT_REPO", index: [match[1], match[2]]});
      }
    }
  };
}
