import { getRepoByIndex } from '../helpers/get_repo';

// get the current branch being viewed
export function getCurrentBranch(state) {
  if (Number.isFinite(state.active_repo)) {
    return state.repo_details.branch || getRepoByIndex(state, state.active_repo).default_branch || "master";
  } else {
    return state.repo_details.branch || "master";
  }
}

// get all branches for the active repo
export function getAllBranches(state) {
  if (Array.isArray(state.active_repo)) {
    if (state.repo_details) {
      return state.repo_details.branches || getRepoByIndex(state, state.active_repo).branches || [];
    } else {
      return getRepoByIndex(state, state.active_repo).branches || [];
    }
  } else {
    return []; // no active repo = no active branches
  }
}
