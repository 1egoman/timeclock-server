export function showWaltzInstallInstructions(value = true) {
  return {
    type: "HELP_INSTALL_WALTZ",
    value,
  };
};

export function hideErrorModal() {
  return {
    type: "HIDE_ERROR_MODAL",
  };
};

export function showShareModal(value=true) {
  return {
    type: "SHOW_REPO_SHARE_MODAL",
    value,
  };
};
