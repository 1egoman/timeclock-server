
// reset the badge token associated with a user
export function resetBadgeTokenForUser(user) {
  return {
    type: "server/RESET_TOKEN",
    username: user.username,
    old_token: user.badge_token,
  }
};

// tell the server to update the specified setting.
export function changeSetting(changes) {
  return {
    type: "server/CHANGE_SETTING",
    changes,
  }
};

// before the server responds, update the setting preemptively.
export function preemptiveSettingUpdate(changes) {
  return {
    type: "server/UPDATE_SETTING_PREEMPTIVE",
    changes,
  }
};
