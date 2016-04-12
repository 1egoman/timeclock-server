import React from 'react';
import {connect} from 'react-redux';
import { browserHistory } from 'react-router';
import {
  Nav,
  NavItem,
  Panel,
} from 'react-bootstrap';

// actions
import {
  openRepoImportDialog,
  changeBranch,
  getTimecard,
  switchRepoTab,
} from '../../actions/repo';
import {
  showWaltzInstallInstructions,
  showShareModal,
} from '../../actions/modal';

// helpers
import {getCurrentBranch, getAllBranches} from '../../helpers/branch';
import {
  getTimeScaleFactor,
  calculateLengthForCommits,
} from '../../helpers/timecard';
import {getProviderBadgeForRepo} from '../../helpers/provider_badge';
import {getRepoByIndex} from '../../helpers/get_repo';

// components
import Loading from '../loading';
import ImportRepo from '../importRepo';
import BranchPicker from './branchPicker';
import ShareWithClient from './shareWithClient';
import RepoCommits from './repoCommits';
import RepoTimesList from './repoTimesList';
import RepoSettings from './repoSettings';

const PX_PER_MIN = 3;

function emptyTimecard({helpInstallingWaltz}) {
  return <div className="timecard timecard-is-empty">
    <Panel>
      <h1>This timecard is empty.</h1>
      <p>To start adding times, run <code>waltz in</code> in a local copy of the repository.</p>
      <a onClick={helpInstallingWaltz}>How do I install waltz?</a>
    </Panel>
  </div>;
}

export const RepoDetailsComponent = ({
  repo,
  has_discovered_repos,
  repo_import_dialog_open,
  repo_import_page,
  repo_details,
  timecard,
  timecard_users,
  startingView,

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
  switchTab,
}) => {
  // return the view that we are currently in
  function validateView(page) {
    if (
      page === "times" ||
      page === "metrics" ||
      page === "settings"
    ) {
      return page;
    } else {
      return "times";
    }
  }
  function getCurrentView() { return validateView(repo_details._tab || startingView || "times"); }

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
  } else if (repo && repo_details.commits) {
    // get the branches that were fetched from the serverside
    let select_branches = getAllBranches({repo_details, repo}).map((i) => {
      return {value: i, label: i}
    });

    // scale factor for commit graph
    let scale = getTimeScaleFactor(calculateLengthForCommits(repo_details.commits), timecard, 1000);

    // primary color / secondary color for styling ui
    let primaryColor = repo_details.timecard && repo_details.timecard.primaryColor;

    let body = (function(view) {
      if (timecard && Array.isArray(timecard.card) && timecard.card.length) {
        switch (view) {
          case "times":
            /* list of all times in the timecard */
            return <div>
              <RepoTimesList
                scale={scale}
              />
              <button
                onClick={getMoreTimes(repo, current_branch, ++current_page)}
                className={`btn btn-default ${can_paginate_forward ? 'shown' : 'hidden'}`}
              >More...</button>
            </div>;

          case "metrics":
            return <RepoCommits
              disabled={!Boolean(Array.isArray(timecard.card) && timecard.card.length)}
            />;

          case "settings":
            return <RepoSettings
              color={primaryColor}
            />;

          default:
            return null;
        }
      } else if (timecard && Array.isArray(timecard.card) && timecard.card.length === 0) {
        return emptyTimecard({helpInstallingWaltz});
      } else {
        return <div className="repo-details repo-details-empty">
          <Loading
            title="Loading Timecard..."
            spinner
          />
        </div>;
      }
    })(getCurrentView());

    return <div className="repo-details">
      {/* the header on top */}
      <div className="repo-details-header" style={{backgroundColor: primaryColor}}>
        {/* Repo name and readme badge*/}
        <div className="repo-details-name">
          <h1>
            {repo.user}/<span className="repo-name">{repo.repo}</span>
            <span className="repo-details-provider-badge">{getProviderBadgeForRepo(repo)}</span>
          </h1>
        </div>
      </div>

      <div className="repo-details-break-bar">
        <div className="repo-details-secondary">
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

            {/* open a share dialog so the user can share the timecard with clients or collaborators */}
            <div className="repo-details-report-share">
              <ShareWithClient />
              {/* share the report */}
              <button
                className="btn btn-success"
                onClick={openShareModal.bind(this)}
              >Share</button>

              {/* print a copy of the report */}
              <button
                className="btn btn-info repo-details-print-report"
                onClick={printReport(repo, current_branch)}
              >Print</button>
            </div>
          </div>
        </div>

        {/* Tabs for switching context */}
        <div className="repo-details-tabswitcher">
          <Nav
            bsStyle="pills"
            activeKey={getCurrentView()}
            onSelect={switchTab.bind(this, repo.user, repo.repo)}
          >
            <NavItem eventKey="times">
              <i className="fa fa-clock-o" />
              Times
            </NavItem>
            <NavItem eventKey="metrics">
              <i className="fa fa-area-chart" />
              Metrics
            </NavItem>
            <NavItem eventKey="settings">
              <i className="fa fa-cog" />
              Settings
            </NavItem>
          </Nav>
        </div>
      </div>

      <div className="repo-details-body">
        <div className="repo-details-body-wrapper">
          {body}
        </div>
      </div>
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

    startingView: props.startingView,
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

    helpInstallingWaltz() { dispatch(showWaltzInstallInstructions()); },
    openShareModal() { dispatch(showShareModal()); },
    switchTab(user, repo, tab) {
      dispatch(switchRepoTab(tab));
      browserHistory.push(`/app/${user}/${repo}/${tab}`);
    },
  };
})(RepoDetailsComponent);

export default RepoDetails;
