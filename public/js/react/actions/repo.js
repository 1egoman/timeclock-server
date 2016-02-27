
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
