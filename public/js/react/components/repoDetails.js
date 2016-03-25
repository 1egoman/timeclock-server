import React from 'react';
import BranchPicker from './branchPicker';
import {connect} from 'react-redux';
import {
  openRepoImportDialog,
  changeBranch,
  getTimecard,
  showWaltzInstallInstructions,
  showShareModal,
} from '../actions/repo';
import ImportRepo from './importRepo';
import {getCurrentBranch, getAllBranches} from '../helpers/branch';
import {getTimeDelta, getAvatarFor} from '../helpers/timecard';
import {getProviderBadgeForRepo} from '../helpers/provider_badge';
import {getRepoByIndex} from '../helpers/get_repo';
import Loading from './loading';
import ShareWithClient from './shareWithClient';

function emptyTimecard({helpInstallingWaltz}) {
  return <div className="timecard timecard-is-empty">
    <h1>This timecard is empty.</h1>
    <p>To start adding times, run <code>waltz in</code> in a local copy of the repository.</p>
    <a onClick={helpInstallingWaltz}>How do I install waltz?</a>
  </div>;
}

// render all of the time regions within the timecard as a table
function renderTimecardTable(timecard, timecard_users, user) {
  return timecard.card.map((day, dct) => {
    return day.times.map((time, tct) => {
      let delta = getTimeDelta(time.start, time.end, day, null, user.settings.long_work_period);
      return <tr key={`${dct}-${tct}`} className={day.disabled ? "disabled" : "enabled"}>
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
        <td>{typeof time.end !== "undefined" ? time.end : "(no end)"}</td>
        <td>{delta.markup}</td>
      </tr>;
    })
  });
}

export const RepoDetailsComponent = ({
  repo,
  has_discovered_repos,
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
  helpInstallingWaltz,
  openShareModal,
}) => {
  // import new repos
  if (repo_import_dialog_open && has_discovered_repos) {
    return <ImportRepo />;

  // loading message for the above reop import dialog
  } else if (repo_import_dialog_open) {
    return <Loading
      title="Fetching Repositories"
      spinner
    />;

  // a repo error
  } else if (repo_details.error) {
    return <div>
      <h1>Uh, oh!</h1>
      <p>{repo_details.error}</p>
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

          {/* open a share dialog so the user can share the invoice with clients or collaborators */}
          <div className="repo-details-report-share">
            <ShareWithClient />
            {/* share the report */}
            <button
              className="btn btn-success"
              onClick={openShareModal.bind(this)}
            >Share Invoice</button>
          </div>

          {/* print a copy of the report */}
          <button
            className="btn btn-info repo-details-print-report"
            onClick={printReport(repo, current_branch)}
          >Print Invoice</button>
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
            {renderTimecardTable(timecard, timecard_users, user)}
          </tbody>
        </table>

        {/* if timecard is empty, let the user know */}
        {timecard.card.length === 0 && emptyTimecard({helpInstallingWaltz})}

        {/* Go to the next page of times */}
        <button
          onClick={getMoreTimes(repo, current_branch, ++current_page)}
          className={`btn btn-default ${can_paginate_forward ? 'shown' : 'hidden'}`}
        >More...</button>
      </div> : <div className="repo-details repo-details-empty">
        <Loading
          title="Loading Timecard..."
          spinner
        />
      </div>}
    </div>;

  } else {
    return <div className="repo-details repo-details-empty">
      <h2>Nothing selected.</h2>
    </div>;
  }
};

export function mapStateToProps(store, props) {
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

    has_discovered_repos: store.discovered_repos && store.discovered_repos.length ? true : false,
    repo_import_page: store.discovered_repos_page,
  };
}

const RepoDetails = connect(mapStateToProps, (dispatch, props) => {
  return {
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

    helpInstallingWaltz() {
      dispatch(showWaltzInstallInstructions());
    },

    openShareModal() {
      dispatch(showShareModal());
    },
  };
})(RepoDetailsComponent);

export default RepoDetails;
