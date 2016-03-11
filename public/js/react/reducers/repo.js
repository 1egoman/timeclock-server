"use strict";

// open the repo import dialog
export function repoImportDialogOpen(state = false, action) {
  if (action.type === "server/DISCOVER_REPOS") {
    return true;
  } else if (action.type === "SELECT_REPO") {
    return false;
  } else if (action.type === "server/REPO_IMPORT") {
    return false;
  } else {
    return state;
  }
}

// only handles the repos part of the state
export function repos(state = [], action) {
  switch(action.type) {

    // initialize all repos at start
    case "server/INIT":
      return action.repos;

    // update the repo
    case "PUT_REPO":
    case "server/PUT_REPO":
      if (typeof action.index === "undefined") {
        return state.concat([action.repo]);
      } else {
        state[action.index] = action.repo;
        return state;
      }

    default:
      return state;
  }
}

// make a new repo active in the sidebar selector
export function activeRepo(state = null, action) {
  if (action.type === "SELECT_REPO") {
    return action.index;

  // when importing a new repo, deselect the current entry
  } else if (action.type === "server/DISCOVER_REPOS") {
    return null;

  // when an external route change happens
  // } else if (action.type === "@@router/LOCATION_CHANGE") {
  //   return 0;
  } else {
    return state;
  }
}

export function discoveredRepos(state = [], action) {
  if (action.type === "server/REPOS_DISCOVERED") {
    return state.concat(action.repos);
  // } else if (action.type === "server/REPO_IMPORT") {
  //   // when a new repo is imported, remove it from `discovered_repos`
  //   return state.filter((i) => !(i.user === action.repo.user && i.repo === action.repo.repo))
  } else {
    return state;
  }
}

export function repoDetails(state = {branch: null}, action) {
  if (action.type === "CHANGE_BRANCH") {
    return Object.assign({}, state, {
      branch: action.branch,
      timecard: null, // reset the timecard so the view reloads
      error: null,
    });

  // on repo change, set the branch to the default
  // and copy the branches into the repo details
  } else if (action.type === "SELECT_REPO") {
    return Object.assign({}, state, {
      branch: null,
      branches: null,
      timecard: null,
      error: null,
    });

  // the current repo's branches
  } else if (action.type === "server/BRANCHES_FOR") {
    return Object.assign({}, state, {branches: action.branches, error: null});

  // the timecard assosiated with a repository
  } else if (action.type === "server/TIMECARD") {
    if (
      action.user === state._comesfrom[0] &&
      action.repo === state._comesfrom[1] &&
      action.branch === state._comesfrom[2]
    ) {
      // merge the new repo query and the old, since they belong to the same repo
      // or, if there wasn't a timecard to start with, just return the new card.
      return Object.assign({}, state, {
        timecard: Object.assign({}, action.timecard, {
          card: (function(state) {
            if (state.timecard && Array.isArray(state.timecard.card)) {
              return state.timecard.card.concat(action.timecard.card);
            } else {
              return action.timecard.card;
            }
          })(state),
        }),
        users: state.users.concat(action.users),

        // the page we are on, and whether we can advance to the next page
        _page: action.page,
        _canpaginateforward: action.canpaginateforward,
        error: null,
      });
    } else {
      // the repo that we are referencing changed, so update atomically
      return Object.assign({}, state, {
        timecard: action.timecard,
        users: action.users,

        _comesfrom: [action.user, action.repo, action.branch], // mark what timecard this comes from for later
        _page: action.page || 0,
        _canpaginateforward: action.canpaginateforward,
        error: null,
      });
    }

  // No timecard in the repo?
  } else if (action.type === "server/ERROR" && action.error === "NO_TIMECARD_IN_REPO") {
    return Object.assign({}, state, {
      error: `There isn't a timecard in this repo. Please add one by running waltz init locally,
              or if you have, push up your changes
              ${state.default_branch ? " to "+state.default_branch : ''}.`,
    });

  } else {
    return state;
  }
}

// the page of discovered repos we have loaded up to
export function discoveredReposPage(state = 0, action) {
  if (action.type === "server/REPOS_DISCOVERED") {
    return action.page || 0;
  } else {
    return state;
  }
}

// the index of `state.discovered_repos` that we currently have an active repo
// that has a timecard being created for it.
export function discoveredRepoNewTimecard(state = false, action) {
  if (action.type === "NEW_TIMECARD_IN_DISCOVERED_REPO") {
    return [action.user, action.repo];
  } else if (action.type === "server/REPO_IMPORT") {
    return false; // clear staging timecard on repo import
  } else {
    return state;
  }
}

// the metadata associated with the timecard to be (ie, a staging area)
export function newTimecardData(state = {}, action) {
  if (action.type === "CHANGE_NEW_TIMECARD_DATA") {
    return Object.assign({}, state, action.data);
  } else if (action.type === "server/REPO_IMPORT") {
    return {}; // clear staging timecard on repo import
  } else {
    return state;
  }
}
