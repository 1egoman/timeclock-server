"use strict";
const required_repo = require("../lib/repo"),
      card = require("../lib/card"),
      async = require("async"),
      _ = require("underscore"),
      user_model = require("../lib/models/user"),
      uuid = require("uuid"),

      getTimecard = require("../lib/events/getTimecard"),
      importRepo = require("../lib/events/importRepo"),
      deleteRepo = require("../lib/events/deleteRepo"),
      getBranches = require("../lib/events/getBranches"),
      resetToken = require("../lib/events/resetToken"),
      changeSetting = require("../lib/events/changeSetting"),

      TIMECARD_PAGE_LENGTH = 20; // the amount of times that are returned per request,

let mx = require("mixpanel").init(process.env.MIXPANEL_TOKEN);
const mixpanel = require("../lib/mixpanel")(mx);

function sendError(socket) {
  return (err) => {
    console.error("CAUGHT ERROR", err.stack ? err.stack : err);
    socket.emit("action", {
      type: "server/ERROR",
      error: typeof err.message === "string" ? err.message : err,
    });
  };
}

module.exports = function(socket) {
  let repo = required_repo, User = user_model;
  return function(action) {
    // discover all repos to import
    if (action.type === 'server/DISCOVER_REPOS') {
      process.env.NODE_ENV !== "test" && console.log(`Discovering all repos for ${socket.request.user.username}`);
      repo.getUserRepos({user: socket.request.user}, action.page || 0).then((repos) => {
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
          page: action.page || 0,
        });
      }, (err) => {
        socket.emit("action", {
          type: "server/ERROR",
          error: err,
        });
      });

    // import a repo
    } else if (action.type === 'server/IMPORT_REPO') {
      importRepo(action, socket).then((repo) => {
        mixpanel.track(socket, "repo.import", {repo});
        socket.emit("action", {
          type: "server/PUT_REPO",
          repo: action.repo,
        });
        socket.emit("action", {
          type: "server/REPO_IMPORT",
          repo: action.repo,
        });
      }, sendError);

    // delete a repo from a user's account
    } else if (action.type === 'server/DELETE_REPO') {
      deleteRepo(action, socket).then(() => {
        mixpanel.track(socket, "repo.delete", {repo: action.repo, user: action.user});
        socket.emit("action", {
          type: "server/REPO_DELETED",
          repo: action.repo,
          user: action.user,
        });
      }, sendError);

    // get the branches for a repo
    } else if (action.type === 'server/GET_BRANCHES') {
      getBranches(action, socket).then((branches) => {
        mixpanel.track(socket, "branches.get", {branches});
        socket.emit("action", {
          type: "server/BRANCHES_FOR",
          branches,
        });
      }, sendError);

    // get the timecard for the specified repo
    } else if (action.type === 'server/GET_TIMECARD') {
      getTimecard(action, socket).then((timecard) => {
        mixpanel.track(socket, "repo.timecard.get", {timecard});
        socket.emit("action", Object.assign({
          type: "server/TIMECARD",
        }, timecard));
      }).catch(sendError(socket));

    // reset a badge token that is associated with a user
    } else if (action.type === 'server/RESET_TOKEN') {
      resetToken(action, socket).then((data) => {
        mixpanel.track(socket, "user.reset.token");
        socket.emit("action", Object.assign({
          type: "server/TOKEN_RESET",
        }, data));
      }, sendError);

    // change the value of a sumset of settings within the user model
    } else if (action.type === 'server/CHANGE_SETTING') {
      changeSetting(action, socket).then((data) => {
        mixpanel.track(socket, "user.change.setting");
        socket.emit("action", {
          type: "server/SETTING_CHANGED",
          settings: data,
        });
      }, sendError);

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
