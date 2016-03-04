export function user(state = null, action) {
  if (action.type === "server/INIT") {
    return action.user;

  } else if (action.type === "server/RESET_TOKEN") {
    return Object.assign({}, state, {
      badge_token: null, // mark the token as indeterminant
    });

  } else if (action.type === "server/TOKEN_RESET") {
    return Object.assign({}, state, {
      badge_token: action.badge_token,
    });

  } else if (action.type === "UPDATE_SETTING_PREEMPTIVE" || action.type === "server/SETTING_CHANGED") {
    return Object.assign({}, state, {
      settings: action.settings,
    });

  } else {
    return state;
  }
}
