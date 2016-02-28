"use strict";
const repo = require("../lib/repo"),
      User = require("../lib/models/user");

module.exports = function(socket) {
  return (action) => {
    // discover all repos to import
    if (action.type === 'server/DISCOVER_REPOS') {
      console.log(`Discovering all repos for ${socket.request.user.username}`);
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
          })
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
          let repo = Object.assign({}, action.repo, {
            branches: ["master"],
          });

          socket.emit("action", {
            type: "server/PUT_REPO",
            repo: repo,
          });
          socket.emit("action", {
            type: "server/REPO_IMPORT",
            repo: repo,
          });
        }
      });

    // get the branches for a repo
    } else if (action.type === 'server/GET_BRANCHES') {
      repo.getBranchesForRepo({user: socket.request.user}, action.user, action.repo).then((branches) => {
        socket.emit("action", {
          type: "server/BRANCHES_FOR",
          repo: repo,
          branches: branches.map((b) => b.name),
        });
      }, (err) => {
        socket.emit("action", {
          type: "server/ERROR",
          error: err,
        });
      });

    } else if (action.type === 'server/GET_TIMECARD') {
      repo.getFileFromRepo(action.user, action.repo, null, action.branch, socket.request.user).then((timecard) => {
        socket.emit("action", {
          type: "server/TIMECARD",
          user: action.user,
          repo: action.repo,
          timecard: timecard,
        });
      }, (err) => {
        socket.emit("action", {
          type: "server/ERROR",
          error: err,
        });
      });
    }
  };
}
