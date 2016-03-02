export function user(state = null, action) {
  if (action.type === "server/INIT") {
    return action.user;
  } else {
    return state;
  }
}
