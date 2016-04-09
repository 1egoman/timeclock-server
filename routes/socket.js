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
      getCommits = require("../lib/events/getCommits"),
      resetToken = require("../lib/events/resetToken"),
      changeSetting = require("../lib/events/changeSetting"),
      shareWith = require("../lib/events/shareWith"),

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

exports.onSocketAction = function(socket) {
  let repo = required_repo, User = user_model;
  return function(action) {
    console.log("New", action.type, "by", socket.request.user.username);

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
      }, sendError(socket));

    // delete a repo from a user's account
    } else if (action.type === 'server/DELETE_REPO') {
      deleteRepo(action, socket).then(() => {
        mixpanel.track(socket, "repo.delete", {repo: action.repo, user: action.user});
        socket.emit("action", {
          type: "server/REPO_DELETED",
          repo: action.repo,
          user: action.user,
        });
      }, sendError(socket));

    // get the branches for a repo
    } else if (action.type === 'server/GET_BRANCHES') {
      getBranches(action, socket).then((branches) => {
        mixpanel.track(socket, "branches.get", {branches});
        socket.emit("action", {
          type: "server/BRANCHES_FOR",
          branches,
        });
      }, sendError(socket));

    // get the commits for a repo
    } else if (action.type === 'server/GET_COMMITS') {
      getCommits(action, socket).then((commits) => {
        mixpanel.track(socket, "commits.get", {commits});
        socket.emit("action", {
          type: "server/COMMITS_FOR",
          commits,
        });
      }, sendError(socket));


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
      }, sendError(socket));

    // change the value of a sumset of settings within the user model
    } else if (action.type === 'server/CHANGE_SETTING') {
      changeSetting(action, socket).then((data) => {
        mixpanel.track(socket, "user.change.setting");
        socket.emit("action", {
          type: "server/SETTING_CHANGED",
          settings: data,
        });
      }, sendError(socket));

    } else if (action.type === 'server/SHARE_WITH') {
      shareWith(action, socket).then((data) => {
        mixpanel.track(socket, "user.share.with", {
          emails: action.emails,
          message: action.message,
        });
        socket.emit("action", {
          type: "server/SHARE_COMPLETE",
          emails: action.emails,
          user: action.user,
          repo: action.repo,
        });
      }, sendError(socket));

    } else if (action.type === 'server/REINIT') {
      exports.emitInit(socket, {user: action.user, repo: action.repo}, null);
    }
  };
}

exports.emitInit = function(socket, path, branch) {
  let match, active_repo = null;

  function serverInit(props) {
    props = props || {}
    socket.emit("action", {
      type: "server/INIT",
      repos: socket.request.user.repos,
      active_repo,
      branch,

      timecard: props.timecard,
      branches: props.branches,
      commits: props.commits,
      users: props.users,
      page: props.page,

      // the normal user, plus their allottments for paid services.
      user: Object.assign(
        user_model.sanitize(socket.request.user),
        {allotments: user_model.getAllotments(socket.request.user)}
      ),
    });
  }

  // passing user and repo manually
  if (path.user && path.repo) {
    active_repo = [path.user, path.repo];
    getRepoInitializeDetails(socket, path.user, path.repo, branch).then(serverInit);

  // a path was sent instead
  } else if (match = path.match(/\/app\/([\w]+)\/([\w]+)/)) {
    active_repo = [match[1], match[2]];
    getRepoInitializeDetails(
      socket,
      match[1], // the user name
      match[2], // the repo name
      branch, // the current branch
      match[3] // the page we are on
    ).then(serverInit);
  } else {
    // initalize without a repo
    serverInit();
  }
}

// fetch all the important info needed to rehydrate a repo when a new one is
// selected.
function getRepoInitializeDetails(socket, user, repo, branch, page) {
  return Promise.all([
    getTimecard({user, repo, branch}, socket),
    getBranches({user, repo}, socket),
    getCommits({user, repo, ref: branch}, socket),
  ]).then((props) => {
    return Object.assign(props[0], {
      branches: props[1],
      commits: props[2],
      page,
    });
  });
}

