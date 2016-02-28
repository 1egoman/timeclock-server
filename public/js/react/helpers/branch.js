// get the current branch being viewed
export function getCurrentBranch(state) {
  if (Number.isFinite(state.active_repo)) {
    return state.repo_details.branch || state.repos[state.active_repo].default_branch || "master";
  } else {
    return state.repo_details.branch || "master";
  }
}

// get all branches for the active repo
export function getAllBranches(state) {
  if (Number.isFinite(state.active_repo)) {
    if (state.repo_details) {
      return state.repo_details.branches || state.repos[state.active_repo].branches || [];
    } else {
      return state.repos[state.active_repo].branches || [];
    }
  } else {
    return []; // no active repo = no active branches
  }
}
