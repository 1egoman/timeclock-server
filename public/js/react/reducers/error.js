// the backend rasied an error
export function error(state = null, action) {
  if (action.type === "server/ERROR") {
    return {
      error: action.error || "We've had a problem on our end. Constact us for assistance.",
      from: "backend",
    };
  } else if (action.type === "HIDE_ERROR_MODAL") {
    return null;
  } else {
    return state;
  }
};
