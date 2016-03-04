import React from 'react';

// return the badge that a specific provider requests next to the respective
// repo name
export function getProviderBadgeForRepo(repo, newWindow=true) {
  let target = newWindow ? "_blank": "";
  switch (repo.provider.toLowerCase()) {
    case "github":
      return <a className="repo-provider-badge repo-provider-badge-github" target={target} href={`//github.com/${repo.user}/${repo.repo}`}>
        <span className="fa fa-github"></span>
      </a>;
    case "bitbucket":
      return <a className="repo-provider-badge repo-provider-badge-bitbucket" target={target} href={`//bitbucket.org/${repo.user}/${repo.repo}/src`}>
        <span className="fa fa-bitbucket"></span>
      </a>;
    default:
      return <a
        className="repo-provider-badge repo-provider-badge-unknown"
        data-toggle="tooltip"
        data-placement="bottom"
        title="We are unsure of this repository's origin."
      ><span className="fa fa-question-circle"></span></a>;
  }
}

// return the a badge that links to a user
export function getUserBadge(user, newWindow=true) {
  let target = newWindow ? "_blank": "";
  switch (user.provider.toLowerCase()) {
    case "github":
      return <a
        className="user-provider-badge user-provider-badge-github"
        target={target}
        href={`//github.com/${user.username}`}
      >
        <span className="fa fa-github"></span>
      </a>;
    case "bitbucket":
      return <a
        className="user-provider-badge user-provider-badge-bitbucket"
        target={target}
        href={`//bitbucket.com/${user.username}`}
      >
        <span className="fa fa-bitbucket"></span>
      </a>;
    default:
      return <a
        className="user-provider-badge user-provider-badge-unknown"
        data-toggle="tooltip"
        data-placement="bottom"
        title="We are unsure of this user's origin."
      ><span className="fa fa-question-circle"></span></a>;
  }
}
