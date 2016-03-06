
// get the repo in the store by its passed index `["username", "repository"]`
export function getRepoByIndex(store, index) {
  if (Array.isArray(index)) {
    return store.repos.find((repo) => {
      return repo.user === index[0] && repo.repo === index[1];
    });
  } else {
    return null;
  }
}
