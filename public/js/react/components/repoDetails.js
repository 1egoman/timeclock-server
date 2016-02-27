import React from 'react';
import {RepoComponent} from './repo';
import {connect} from 'react-redux';
import {
  openRepoImportDialog,
  importFromGithubRepo,
} from '../actions/repo';
import RepoImport from './repoImport';
import _ from "underscore";

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
      <ul className="repos">
        {Object.keys(discovered_repos).map((key, ct) => {
          return <div key={ct}>
            <h4>{key}</h4>
            {discovered_repos[key].map((repo, ct) => {
              return <RepoComponent
                key={ct}
                repo={repo}
                selected={false}
              >
                {
                  repo.has_timecard ? 
                  <button className="btn btn-success btn-pick-me" onClick={importNewRepo(repo)}>Import</button> :
                  <button
                    className="btn btn-warning disabled btn-pick-me"
                    data-toggle="tooltip"
                    data-placement="left"
                    title="No timecard was found. Please run `waltz init` in the repo to create a new timecard."
                  >No Timecard</button>
                }
              </RepoComponent>
            })}
          </div>;
        })}
      </ul>
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

    // group the discovered repos by their respective user
    discovered_repos: _.groupBy(store.discovered_repos, (repo) => repo.user),
  };
}, (dispatch, ownProps) => {
  return {
    importNewRepo(repo) {
      return () => dispatch(importFromGithubRepo(repo));
    }
  };
})(RepoDetailsComponent);

export default RepoDetails;
