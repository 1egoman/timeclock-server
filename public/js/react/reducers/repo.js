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

    // delete a repo
    case "server/REPO_DELETED":
      return state.filter((i) => {
        return !(
          i.user === action.user &&
          i.repo === action.repo
        );
      });

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

  } else if (action.type === "server/INIT") {
    return action.active_repo;
  } else {
    return state;
  }
}

export function discoveredRepos(state = [], action) {
  if (action.type === "server/REPOS_DISCOVERED") {
    // only add repos that already haven't been added already
    let new_repos = action.repos.filter((repo) => {
      return state.every((existing) => {
        return !(existing.user === repo.user && existing.repo === repo.repo);
      });
    });
    return state.concat(new_repos);
  } else {
    return state;
  }
}

export function repoDetails(state = {branch: null}, action) {
  if (action.type === "server/INIT" && action.active_repo) {
    // validate a page, returning times by default
    // if a user adds a route that makes no sense, lets catch and "redirect" to
    // `/app/user/repo/times`.

    return Object.assign({}, state, {
      timecard: Object.assign({}, action.timecard, {
        card: action.timecard.card.reverse(),
      }),
      users: action.users,
      branches: action.branches,
      commits: action.commits,
      repos: action.repos,
      sections_visible: state.sections_visible || [],

      show_share_modal: false,
      _comesfrom: [...action.active_repo, action.branch],
      _tab: action.page,
    });

  } else if (action.type === "CHANGE_BRANCH") {
    return Object.assign({}, state, {
      branch: action.branch,
      timecard: null, // reset the timecard so the view reloads
      error: null,
    });

  // on repo change, set the branch to the default
  // and copy the branches into the repo details
  } else if (action.type === "SELECT_REPO" || action.type === "server/REPO_DELETED") {
    return Object.assign({}, state, {
      branch: null,
      branches: null,
      timecard: null,
      error: null,
      show_share_modal: false,
    });

  // switch the active tab
  } else if (action.type === "SWITCH_REPO_TAB") {
    return Object.assign({}, state, {
      error: null,
      _tab: action.tab,
    });

  // the current repo's branches
  } else if (action.type === "server/BRANCHES_FOR") {
    return Object.assign({}, state, {branches: action.branches, error: null});

  // the commit history for the branch
  } else if (action.type === "server/COMMITS_FOR") {
    return Object.assign({}, state, {commits: action.commits, error: null});

  // the timecard assosiated with a repository
  } else if (action.type === "server/TIMECARD") {
    if (
      action.user === state._comesfrom[0] &&
      action.repo === state._comesfrom[1] &&

      // also, check to be sure the currently-shown thing is on the current
      // branch (ie, the user can switch branches which changes everything)
      // also, when the timecard loads initially, the timecard may not be
      // populated (because of the order of things). So, if not specified, just
      // assume the current branch is the right one.
      action.branch === (state._comesfrom[2] || state.branch)
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
        _comesfrom: [action.user, action.repo, action.branch],
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

  // open the share repo modal
  } else if (action.type === "SHOW_REPO_SHARE_MODAL") {
    return Object.assign({}, state, {
      show_share_modal: action.value,
      error: null,
    });

  // send share request to server
  } else if (action.type === "server/SHARE_WITH") {
    return Object.assign({}, state, {
      show_share_modal: false,
      waiting_for_share_modal_response: true,
      error: null,
    });

  // successfully shared, so close.
  } else if (action.type === "server/SHARE_COMPLETE") {
    return Object.assign({}, state, {
      show_share_modal: false,
      waiting_for_share_modal_response: false,
      error: null,
    });

  } else if (action.type === "EXPAND_COLLAPSE_TIMECARD") {
    if (action.state && !state.sections_visible) {
      // expand the timecard and we don't have any expanded already
      return Object.assign({}, state, {
        sections_visible: [action.day],
        error: null,
      });
    } else if (action.state && state.sections_visible.indexOf(action.day) === -1) {
      // expand the timecard section when we haven't already expanded the section
      return Object.assign({}, state, {
        sections_visible: state.sections_visible.concat([action.day]),
        error: null,
      });
    } else if (!action.state) {
      // close the section
      return Object.assign({}, state, {
        sections_visible: state.sections_visible.filter((i) => i !== action.day),
        error: null,
      });
    } else {
      return state;
    }


  // No timecard in the repo?
  } else if (action.type === "server/ERROR" && action.error === "NO_TIMECARD_IN_REPO") {
    return Object.assign({}, state, {
      error: `There isn't a timecard in this repo. Please add one by running waltz init locally,
              or if you have, push up your changes
              ${state.default_branch ? " to "+state.default_branch : ''}.`,
    });

  // clear errors on route change
  } else if (action.type === "@@router/LOCATION_CHANGE") {
    return Object.assign({}, state, {error: null});

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

// give the user a dialog on how to install the waltz command line tool
export function helpInstallingClient(state = false, action) {
  if (action.type === "HELP_INSTALL_WALTZ") {
    return action.value || false;
  } else {
    return state;
  }
}
