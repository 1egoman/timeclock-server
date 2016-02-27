"use strict";

// initialize github repo import
export function openRepoImportDialog(state) {
  return {
    type: "REPO_IMPORT_DIALOG",
    state,
  }
};

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
