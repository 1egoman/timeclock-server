import React from 'react';
import {RepoComponent} from './repo';
import BranchPicker from './branchPicker';
import {connect} from 'react-redux';
import {
  openRepoImportDialog,
  importFromGithubRepo,
  changeBranch,
} from '../actions/repo';
import RepoImport from './repoImport';
import {getCurrentBranch} from '../helpers/branch';
import {getTimeDelta, getAvatarFor} from '../helpers/timecard';
import {getProviderBadgeForRepo} from '../helpers/provider_badge';
import _ from "underscore";
import Select from 'react-select';

export const RepoDetailsComponent = ({
  repo,
  discovered_repos,
  repo_import_dialog_open,
  repo_details,
  timecard,
  timecard_users,

  current_branch,
  branches,

  importNewRepo,
  chooseBranch,
  printReport,
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
                    title="No timecard was found. Please run `waltz init` in the repo to create a new timecard."
                  >No Timecard</button>
                }
              </RepoComponent>
            })}
          </div>;
        })}
      </ul>
    </div>;

  // loading message for the above reop import dialog
  } else if (repo_import_dialog_open) {
    return <div className="repo-details repo-details-empty">
      <h2>Fetching Repositories</h2>
      <p>We'll be back in a sec.</p>
    </div>;

  // a repo was selected
  } else if (repo) {
    let select_branches = repo.branches.map((i) => {
      return {value: i, label: i}
    });

    return <div className="repo-details">
      {/* the header on top */}
      <div className="repo-details-header">
        {/* Repo name and readme badge*/}
        <h1>
          {repo.user}/<span className="repo-name">{repo.repo}</span>
          <span className="repo-details-provider-badge">{getProviderBadgeForRepo(repo)}</span>
          <img className="repo-details-badge" src={`/${repo.user}/${repo.repo}.svg`} />
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
            value={`http://waltzapp.co/embed/${repo.user}/${repo.repo}/${current_branch}`}
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
                let delta = getTimeDelta(time.start, time.end);
                return <tr key={`${dct}-${tct}`}>
                  <td className="avatar-col">
                    <span
                      data-toggle="tooltip"
                      data-placement="left"
                      title={time.by}
                    >
                      {getAvatarFor(timecard_users, time.by).avatar_img}
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
    repo: store.repos[store.active_repo],
    repo_import_dialog_open: store.repo_import_dialog_open,
    current_branch: getCurrentBranch(store),
    repo_details: store.repo_details,

    timecard: store.repo_details.timecard,
    timecard_users: store.repo_details.users,

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
  };
}, (dispatch, ownProps) => {
  return {
    importNewRepo(repo) {
      return () => dispatch(importFromGithubRepo(repo));
    },
    chooseBranch(branch) {
      dispatch(changeBranch(branch));
    },

    // print a copy of the report
    printReport(repo, current_branch) {
      return () => window.open(`/embed/${repo.user}/${repo.repo}/${current_branch}`).print();
    },
  };
})(RepoDetailsComponent);

export default RepoDetails;
