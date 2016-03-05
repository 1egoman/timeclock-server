import React from 'react';
import {RepoComponent} from './repo';
import BranchPicker from './branchPicker';
import {connect} from 'react-redux';
import {
  openRepoImportDialog,
  importFromGithubRepo,
  changeBranch,
  getTimecard,
  requestAllUserRepos,
} from '../actions/repo';
import RepoImport from './repoImport';
import {getCurrentBranch, getAllBranches} from '../helpers/branch';
import {getTimeDelta, getAvatarFor} from '../helpers/timecard';
import {getProviderBadgeForRepo} from '../helpers/provider_badge';
import _ from "underscore";
import Select from 'react-select';
import Infinite from 'react-infinite';
import { getRepoByIndex } from '../helpers/get_repo';

export const RepoDetailsComponent = ({
  repo,
  discovered_repos,
  repo_import_dialog_open,
  repo_import_page,
  repo_details,
  timecard,
  timecard_users,

  current_branch,
  branches,

  user,

  current_page,
  can_paginate_forward,

  importNewRepo,
  chooseBranch,
  printReport,
  getMoreTimes,
  toImportRepoPage,
}) => {
  // import new repos
  if (repo_import_dialog_open && Object.keys(discovered_repos).length !== 0) {
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

  // loading message for the above reop import dialog
  } else if (repo_import_dialog_open) {
    return <div className="repo-details repo-details-empty">
      <h2>Fetching Repositories</h2>
      <p>We'll be back in a sec.</p>
    </div>;

  // a repo was selected
  } else if (repo) {
    // get the branches that were fetched from the serverside
    let select_branches = getAllBranches({repo_details, repo}).map((i) => {
      return {value: i, label: i}
    });

    return <div className="repo-details">
      {/* the header on top */}
      <div className="repo-details-header">
        {/* Repo name and readme badge*/}
        <h1>
          {repo.user}/<span className="repo-name">{repo.repo}</span>
          <span className="repo-details-provider-badge">{getProviderBadgeForRepo(repo)}</span>
          <img
            className="repo-details-badge"
            src={`/${repo.user}/${repo.repo}.svg`}
            data-toggle="popover"
            data-placement="bottom"
            title="Embeddable Badge"
            data-content={`[![Waltz unpaid time](http://waltzapp.co/${repo.user}/${repo.repo}.svg${repo.is_private ? '?token='+user.badge_token : '' })](http://waltzapp.co/${repo.user}/${repo.repo})`}
          />
        </h1>

        {/* choose a branch to start on */}
        <div className="repo-details-branch-select">
          <BranchPicker />
        </div>

        <div className="repo-details-report-link">
          {/* a url to the repo */}
          <input
            type="text"
            className="form-control repo-details-report-link-box"
            value={`http://waltzapp.co/embed/${repo.user}/${repo.repo}/${current_branch}${repo.is_private ? '?token='+user.badge_token : ''}`}
            readOnly={true}
          />

          {/* print a copy of the report */}
          <button
            className="btn btn-info repo-details-print-report"
            onClick={printReport(repo, current_branch)}
          >Print Report</button>
        </div>
      </div>

      {/* list of all times in the timecard */}
      {timecard ? <div className="repo-details-report-table">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {timecard.card.map((day, dct) => {
              return day.times.map((time, tct) => {
                let delta = getTimeDelta(time.start, time.end, null, user.settings.long_work_period);
                return <tr key={`${dct}-${tct}`}>
                  <td className="avatar-col">
                    <span
                      data-toggle="tooltip"
                      data-placement="left"
                      title={time.by}
                    >
                      {
                        getAvatarFor(timecard_users, time.by).avatar_img ||
                        <span className="fa fa-user avatar-col" ></span>
                      }
                    </span>
                  </td>
                  <td>{day.date}</td>
                  <td>{time.start}</td>
                  <td>{time.end}</td>
                  <td>{delta.markup}</td>
                </tr>;
              })
            })}
          </tbody>
        </table>

        {/* Go to the next page of times */}
        <button
          onClick={getMoreTimes(repo, current_branch, ++current_page)}
          className={`btn btn-default ${can_paginate_forward ? 'shown' : 'hidden'}`}
        >More...</button>
      </div> : <div className="repo-details repo-details-empty">
        <h2>Loading timecard...</h2>
      </div>}
    </div>;

  } else {
    return <div className="repo-details repo-details-empty">
      <h2>Nothing selected.</h2>
    </div>;
  }
};

const RepoDetails = connect((store, ownProps) => {
  return {
    repo: getRepoByIndex(store, store.active_repo),
    repo_import_dialog_open: store.repo_import_dialog_open,
    current_branch: getCurrentBranch(store),
    repo_details: store.repo_details,

    current_page: store.repo_details._page || 0,
    can_paginate_forward: store.repo_details._canpaginateforward || false,

    timecard: store.repo_details.timecard,
    timecard_users: store.repo_details.users,

    user: store.user,

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
    chooseBranch(branch) {
      dispatch(changeBranch(branch));
    },

    // fetch some more times from the server
    getMoreTimes(repo, branch, page=1) {
      return () => dispatch(getTimecard(repo, branch, page));
    },

    // print a copy of the report
    printReport(repo, current_branch) {
      return () => window.open(`/embed/${repo.user}/${repo.repo}/${current_branch}`).print();
    },

    toImportRepoPage(page) {
      return () => dispatch(requestAllUserRepos(page));
    },
  };
})(RepoDetailsComponent);

export default RepoDetails;
