import React from 'react';
import {connect} from 'react-redux';
import _ from "underscore";
import {RepoComponent} from './repo';
import {
  importFromGithubRepo,
  requestAllUserRepos,
} from '../actions/repo';

const ImportRepoComponent = ({
  discovered_repos,
  repo_import_page,

  importNewRepo,
  toImportRepoPage,
}) => {
  return <div className="repo-details repo-details-import">
    <h2>Import a new Repository</h2>
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
                  title="No timecard was found in the default branch. Please run `waltz init` in the repo to create a new timecard."
                >No Timecard</button>
              }
            </RepoComponent>
          })}
        </div>;
      })}
    </ul>

    <button
      className="btn btn-primary btn-load-more"
      onClick={toImportRepoPage(++repo_import_page)}
    >Load More Repositories</button>
  </div>;
}

const ImportRepo  = connect((store, ownProps) => {
  return {
    // group the discovered repos by their respective user
    discovered_repos: _.groupBy(
      // first, filter out all ther repos that already are added
      store.discovered_repos.filter((repo) => {
        return !store.repos.some((i) => {
          return i.user === repo.user && i.repo === repo.repo;
        });
      })
    // then, sort by owner
    , (repo) => repo.user),
    repo_import_page: store.discovered_repos_page,
  };
}, (dispatch, ownProps) => {
  return {
    importNewRepo(repo) {
      return () => dispatch(importFromGithubRepo(repo));
    },
    toImportRepoPage(page) {
      return () => dispatch(requestAllUserRepos(page));
    },
  };
})(ImportRepoComponent);

export default ImportRepo;
