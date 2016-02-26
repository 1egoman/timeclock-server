"use strict";

// import a new repo from github
export function importFromGithubRepo(user, repo) {
  return {
    type: "IMPORT_REPO_GITHUB",
    user,
    repo,
  }
};

// Select a new repo to be the active one.
export function selectRepo(index) {
  return {
    type: "SELECT_REPO",
    index,
  }
};
