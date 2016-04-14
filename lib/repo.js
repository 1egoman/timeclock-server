"use strict";
const request = require("request"),
      GitHubApi = require("github"),
      github = new GitHubApi({ version: "3.0.0" }),
      base64 = require("base-64"),
      async = require("async"),
      _ = require("underscore"),
      UserCache = require("./models/usercache"),
      Promise = require("promise");

let card;
setTimeout(() => {
  card = require("./card");
}, 0);

exports.getFileFromRepo = function getFileFromRepo(username, repo, filename, branch, user) {
  filename = filename || ".timecard.json";
  // console.log(`https://raw.githubusercontent.com/${username}/${repo}/${branch}/${filename}?token=${user && user.access_token}`, username, repo, filename)
  return new Promise((resolve, reject) => {
    if (user) {
      return exports.getRepoDetails({user: user}, username, repo).then((details) => {
        branch = branch || details.default_branch || "master";
        github.authenticate({
          type: "oauth",
          token: user.access_token
        });
        github.repos.getContent({
          user: username,
          repo: repo,
          path: filename,
          ref: branch,
        }, (err, data) => {
          if (err) {
            reject(err);
          } else if (data.message) {
            reject("Not found");
          } else {
            let file = base64.decode(data.content);
            try {
              let json = JSON.parse(file);
              resolve(json);
            } catch (e) {
              resolve(file);
            }
          }
        });
      });
    } else {
      // for unauthed requests we'll use the "raw" github url.
      request({
        method: "get",
        url: `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${filename}`,
        headers: {
          "Cache-Control": "no-cache"
        }
      }, (err, resp, body) => {
        if (err) {
          reject(err);
        } else if (body === "Not Found") {
          reject("Not found")
        } else {
          try {
            let json = JSON.parse(body);
            resolve(json);
          } catch (e) {
            resolve(body);
          }
        }
      });
    }
  });
}

// get the metadata for a repo that github stores (name, desc, owner, etc...)
exports.getRepoDetails = function getRepoDetails(req, username, repo) {
  return new Promise((resolve, reject) => {
    github.authenticate({
      type: "oauth",
      token: req.user.access_token
    });
    github.repos.get({
      user: username,
      repo: repo,
    }, (err, data) => {
      if (err) {
        reject(err)
      } else if (data.message === "Not Found") {
        reject("Not Found");
      } else {
        resolve(data);
      }
    });
  });
}

// get all of a user's repos
exports.getUserRepos = function getRepoDetails(req, page) {
  return new Promise((resolve, reject) => {
    github.authenticate({
      type: "oauth",
      token: req.user.access_token
    });
    github.repos.getAll({
      visibility: "all",
      affiliation: "owner,collaborator",
      sort: "updated",
      page: page + 1,
    }, (err, data) => {
      if (err) {
        reject(err)
      } else if (data.message === "Not Found") {
        reject("Not Found");
      } else {
        async.map(data, (repo, done) => {
          // fetch a `.timecard.json` file from the repo, if possible. If there's
          // an error, then we don't have a timecard.
          exports.getFileFromRepo(repo.owner.login, repo.name, null, repo.default_branch, req.user).then((data) => {
            done(null, data);
          }).catch((err) => {
            done(null, {});
          });
        }, (err, has_timecard) => {
          if (err) {
            reject(err);
          } else {
            // merge the timecard into each item
            resolve(data.map((item, ct) => {
              return _.extend(item, {timecard: has_timecard[ct]});
            }));
          }
        });
      }
    });
  });
}

// return the branches for a specified repo
exports.getBranchesForRepo = function getBranchesForRepo(req, user, repo) {
  return new Promise((resolve, reject) => {
    github.authenticate({
      type: "oauth",
      token: req.user.access_token
    });
    github.repos.getBranches({
      user: user,
      repo: repo,
    }, (err, data) => {
      if (err) {
        reject(err)
      } else if (data.message === "Not Found") {
        reject("Not Found");
      } else {
        resolve(data);
      }
    });
  });
}

// return the commits for a given repo branch
exports.getCommitsForRepo = function getCommitsForRepo(req, user, repo, ref) {
  return new Promise((resolve, reject) => {
    github.authenticate({
      type: "oauth",
      token: req.user.access_token,
    });

    // assemble the event to send.
    let get_commit;
    if (ref) {
      get_commit = {
        user: user,
        repo: repo,
        sha: ref, // can be a branch, or is not specified default to the default branch
      };
    } else {
      get_commit = {
        user: user,
        repo: repo,
      };
    }

    github.repos.getCommits(get_commit, (err, data) => {
      if (err) {
        reject(err)
      } else if (data.message === "Not Found") {
        reject("Not Found");
      } else {
        resolve(data);
      }
    });
  });
}

// get a user's picture to go next to their relevant clocks in / out
exports.getUserMetaFor = function getUserPictureFor(req, user, provider) {
  return new Promise((resolve, reject) => {
    provider = provider || "github"; // for now, assume github

    // try to find a cached version of the user first
    UserCache.findOne({username: user, provider: provider}).exec((err, cached_user) => {
      if (err) {
        reject(err)
      } else if (cached_user) {
        cached_user._id = undefined; // remove the database id from the query
        resolve(cached_user);
      } else {
        // try to find the user
        github.authenticate({
          type: "oauth",
          token: req.user.access_token
        });
        github.search.users({
          q: user,
        }, (err, data) => {
          if (err) {
            reject(err);
          } else {
            // cache the user, and move forward
            let our_user = data.items.find((u) => u.login === user);
            if (our_user) {
              let cached_user = {
                username: our_user.login,
                id: our_user.id,
                avatar: our_user.avatar_url,
                url: our_user.html_url,
                type: our_user.type.toLowerCase(),
                provider: provider,
              }
              new UserCache(cached_user).save((err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(cached_user);
                }
              });
            } else {
              // uhh, the user dosn't exist?
              resolve(null);
            }
          }
        })
      }
    });
  });
}

// create a timecard in a repo where one doesn't already exist
exports.createTimecardInRepo = function createTimecardInRepo(username, repo, branch, timecard_contents, user) {
  // console.log(username, repo, branch, timecard_contents, user)
  // Create the timecard.
  console.log(`Creating a new timecard in ${username}/${repo} on branch ${branch}`);

  // be sure the timecard is actually not in the repo
  return exports.getFileFromRepo(username, repo, ".timecard.json", branch, user)
  .then((data) => {
    if (typeof data === "object" && card.assertIsCard(data)) {
      // card already created
      console.log("Oops, theres already a card in the repo.");
      return data;
    } else {
      throw new Error("It looks like there's already a timecard present, but it isn't valid. Try deleting the timecard and trying this again.");
    }
  }, () => {
    return new Promise((resolve, reject) => {
      // couldn't find the card, so add it
      github.authenticate({
        type: "oauth",
        token: user.access_token,
      });
      github.repos.createFile({
        user: username,
        repo: repo,
        path: ".timecard.json",
        message: "Created timecard for Waltz: http://waltzapp.co",
        content: base64.encode(JSON.stringify(timecard_contents, null, 2)),
        branch,
        committer: {
          name: "Waltz",
          email: "hello@waltzapp.co",
        },
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  });
}

// attempt to update the database using
exports.saveRepoMetaToDatabase = function(user, whichrepo, timecard) {
  let repository = user.repos.find((r) => {
    return r.user === whichrepo[0] && r.repo === whichrepo[1];
  });

  if (repository) {
    repository.primary_color = timecard.primaryColor;
    repository.secondary_color = timecard.secondaryColor;
    return user.save().then(() => timecard); // return timecard
  } else {
    return timecard;
  }
}
