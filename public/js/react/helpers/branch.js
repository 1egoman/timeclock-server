// get the current branch being viewed
export function getCurrentBranch(state) {
  if (state.active_repo) {
    return state.repo_details.branch || state.repos[state.active_repo].default_branch || "master";
  } else {
    return state.repo_details.branch || "master";
  }
}
