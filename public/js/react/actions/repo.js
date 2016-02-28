
// initialize github repo import
export function openRepoImportDialog(state) {
  return {
    type: "REPO_IMPORT_DIALOG",
    state,
  }
};

// import a new repo from github
export function importFromGithubRepo(repo) {
  return {
    type: "server/IMPORT_REPO",
    repo: repo,
    provider: "github",
  }
};

// Select a new repo to be the active one.
export function selectRepo(index) {
  return {
    type: "SELECT_REPO",
    index,
  }
};

export function requestAllUserRepos() {
  return {
    type: "server/DISCOVER_REPOS",
  }
};

export function changeBranch(branch) {
  return {
    type: "CHANGE_BRANCH",
    branch,
  }
};

// query the backend for the branches of the current repo
export function getBranches(repo) {
  return {
    type: "server/GET_BRANCHES",
    user: repo.user,
    repo: repo.repo,
  };
}

// get the contents of a timecard
export function getTimecard(repo) {
  return {
    type: "server/GET_TIMECARD",
    user: repo.user,
    repo: repo.repo,
  }
};
