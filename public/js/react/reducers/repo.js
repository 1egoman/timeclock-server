"use strict";

// only handles the repos part of the state
export function repos(state = [], action) {
  switch(action.type) {
    case "IMPORT_REPO_GITHUB":
      return [
        ...state,
        {
          user: state.user,
          repo: sate.repo,
          is_pending: true
        },
      ];
    default:
      return state;
  }
}

// make a new repo active in the sidebar selector
export function activeRepo(state = null, action) {
  if (action.type === "SELECT_REPO") {
    return action.index;
  } else {
    return state;
  }
}

