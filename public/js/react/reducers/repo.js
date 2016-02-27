"use strict";

// open the repo import dialog
export function repoImportDialogOpen(state = false, action) {
  if (action.type === "REPO_IMPORT_DIALOG") {
    return action.state || false;
  } else if (action.type === "SELECT_REPO") {
    return false;
  } else {
    return state;
  }
}

// only handles the repos part of the state
export function repos(state = [], action) {
  switch(action.type) {

    // originally, add the template repo
    case "IMPORT_REPO_GITHUB":
      return [
        ...state,
        {
          user: action.user,
          repo: action.repo,
          is_pending: true,
          provider: "github",
        },
      ];

    // initialize all repos at start
    case "server/INIT":
      return action.repos;

    // update the repo
    case "PUT_REPO":
      state[action.index] = action.repo;
      return state;

    default:
      return state;
  }
}

// make a new repo active in the sidebar selector
export function activeRepo(state = null, action) {
  if (action.type === "SELECT_REPO") {
    return action.index;

  // when importing a new repo, deselect the current entry
  } else if (action.type === "REPO_IMPORT_DIALOG") {
    return null;
  } else {
    return state;
  }
}

export function discoveredRepos(state = [], action) {
  if (action.type === "server/REPOS_DISCOVERED") {
    return action.repos;
  } else {
    return state;
  }
}
