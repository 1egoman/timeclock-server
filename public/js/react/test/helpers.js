exports.initialState = {
  repo_import_dialog_open: false,
  discovered_repos: [],
  active_repo: null,
  repos: [
    {
      user: 'username',
      repo: 'reponame',
      desc: 'I am a repo descritpion',
      is_pending: false,
      is_private: false,
      has_timecard: false,
      owner_type: 'user',
    },
    {
      user: 'iamagroup',
      repo: 'reporedux',
      desc: 'I am a repo descritpion',
      is_pending: false,
      is_private: false,
      has_timecard: false,
      owner_type: 'group',
    },
    {
      user: 'iamagroup',
      repo: 'reporedux',
      desc: 'I am a repo descritpion',
      is_pending: false,
      is_private: true,
      has_timecard: false,
      owner_type: 'group',
    }
  ],
};
