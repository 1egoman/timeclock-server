import React from 'react';
import {RepoComponent} from './repo';
import {connect} from 'react-redux';
import {
  openRepoImportDialog,
  importFromGithubRepo,
} from '../actions/repo';
import RepoImport from './repoImport';

export const RepoDetailsComponent = ({
  repo,
  discovered_repos,
  repo_import_dialog_open,

  importNewRepo,
}) => {
  // import new repos
  if (repo_import_dialog_open) {
    return <div className="repo-details repo-details-import">
      <h2>Import new repos</h2>
      {discovered_repos.map((repo, ct) => {
        return <RepoComponent key={ct} repo={repo} selected={false} onRepoClick={importNewRepo(repo)} />;
      })}
    </div>;

  // a repo was selected
  } else if (repo) {
    return <div className="repo-details">
      {/* Repo name and readme badge*/}
      <h1>
        {repo.user}/<span className="repo-name">{repo.repo}</span>
        <img className="repo-details-badge" src={`/${repo.user}/${repo.repo}.svg`} />
      </h1>

      {/* embedded invoice */}
      <div className="repo-details-embed-container">
        <iframe className="repo-details-embed" src={`/embed/${repo.user}/${repo.repo}`} />
      </div>
    </div>;

  } else {
    return <div className="repo-details repo-details-import">
      <h2>Nothing Selected</h2>
    </div>;
  }
};

const RepoDetails = connect((store, ownProps) => {
  return {
    repo: store.repos[store.active_repo],
    repo_import_dialog_open: store.repo_import_dialog_open,
    discovered_repos: store.discovered_repos,
  };
}, (dispatch, ownProps) => {
  return {
    importNewRepo(repo) {
      return () => dispatch(importFromGithubRepo(repo));
    }
  };
})(RepoDetailsComponent);

export default RepoDetails;
