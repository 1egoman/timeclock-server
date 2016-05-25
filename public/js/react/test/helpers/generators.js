const faker = require("faker");

export function generateUser(username=faker.internet.userName(), provider="github", plan="free", extra) {
  let allotments = (function(plan) {
    return {
      "disco": {
        private_repos: 1,
      },
      "jive": {
        private_repos: 5,
      },
      "polka": {
        private_repos: 10,
      },
    }[plan] || {
      // free plan
      private_repos: 0,
    }
  })(plan);
  return Object.assign({
    username,
    provider,
    email: faker.internet.email(),
    profile_url: `http://github.com/${username}`,
    badge_token: faker.random.uuid(),
    github_id: faker.random.number(),
    avatar: faker.internet.avatar(),
    settings: {
      long_work_period: 90,
      payment_email: "",
    },
    allotments,
  }, extra);
}

export function generateRepo(
  username=faker.internet.userName(),
  repo=faker.internet.userName(),
  extra
) {
  return Object.assign({
    username,
    repo,
    desc: faker.lorem.sentence(),
    is_pending: false,
    has_timecard: true,
    is_private: false,
    owner_type: "user",
    default_branch: "master",
    provider: "github",
    primary_color: faker.internet.color(),
  }, extra);
}
