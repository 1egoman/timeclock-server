// the backend rasied an error
export function error(state = null, action) {
  if (action.type === "server/ERROR" && !isErrorCode(action.error)) {
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

// Error codes are all upercase.
// For example: 'NO_TIMECARD_IN_REPO'
function isErrorCode(error) {
  return error.toUpperCase() === error;
}
