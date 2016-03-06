exports.repos = [
  {
    user: "username",
    repo: "a-repo",
    desc: "a-desc",
    is_pending: false,
    is_private: false,
    has_timecard: true,
    owner_type: "user",
    default_branch: "master",
    provider: "github",
  },
  {
    user: "username",
    repo: "a-repo",
    desc: "a-desc",
    is_pending: false,
    is_private: false,
    has_timecard: true,
    owner_type: "user",
    default_branch: "master",
    provider: "github",
  },
];

exports.github_repos = [
  {
    id: 123,
    full_name: "username/a-repo",
    name: "a-repo",
    description: "a-desc",
    private: false,
    timecard: {card: []},
    owner: {type: "user"},
    default_branch: "master",
    provider: "github",
  },
  {
    id: 456,
    full_name: "username/a-repo",
    name: "a-repo",
    description: "a-desc",
    private: false,
    timecard: {card: []},
    owner: {type: "user"},
    default_branch: "master",
    provider: "github",
  },
];

exports.userlogout = undefined;

exports.user1 = {
  username: "username",
  badge_token: "badge-token",
  profile_url: "http://example.com/user/profile/here",
  provider: "github",
  access_token: "access-token-is-here",
  github_id: 12345,
  _id: "the-user-id-in-mongo",
}

exports.timecard = {
  reportFormat: "default",
  hourlyRate: 10,
  name: "My Project",
  tagline: "Project description here",
  bgcolor: "#d45500",
  card: [
    {
      "date": "Sun Jan 17 2016",
      "disabled": "Sun Feb 14 2016",
      "times": [
        {
          "start": "11:43:00",
          "end": "13:43:03",
          "by": "1egoman"
        }
      ]
    },
    {
      "date": "Tue Jan 19 2016",
      "disabled": "Sun Feb 14 2016",
      "times": [
        {
          "start": "13:15:38",
          "end": "18:30:40"
        }
      ]
    },
    {
      "date": "Sat Jan 23 2016",
      "disabled": "Sun Feb 14 2016",
      "times": [
        {
          "start": "15:00:00",
          "end": "19:30:40"
        }
      ]
    },
  ]
}
