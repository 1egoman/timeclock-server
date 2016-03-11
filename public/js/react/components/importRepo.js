import React from 'react';
import {connect} from 'react-redux';
import _ from "underscore";
import {RepoComponent} from './repo';
import {
  importFromGithubRepo,
  requestAllUserRepos,
  askUserToCreateNewTimecard,
  changeStagingTimecardData,
} from '../actions/repo';
import {Modal, Button, Input} from 'react-bootstrap';

const ImportRepoComponent = ({
  discovered_repos,
  confirm_timecard_for,
  repo_import_page,
  new_timecard_staging,

  importNewRepo,
  toImportRepoPage,
  confirmNewTimecard,
  changeStagingTimecardData,
}) => {
  {/* confirm adding a new timecard to a repository */}
  let createNewTimecardModal;
  if (confirm_timecard_for) {
    {/*
      The data that will be used to formulate the new timecard.
      By default, start with info that is within the current repo and extend
      it as needed to include user-included data.
    */}
    let timecardTemplate = {
      name: new_timecard_staging.name || confirm_timecard_for.repo,
      desc: new_timecard_staging.desc || confirm_timecard_for.desc,
    };

    createNewTimecardModal = <Modal
        show={confirm_timecard_for !== null}
        onHide={confirmNewTimecard(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Create a new timecard in&nbsp;
            {confirm_timecard_for.user}/
            <strong>{confirm_timecard_for.repo}</strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-new-timecard">
            <img src="/img/add_timecard_web.svg" className="center-block" />
            <p>
              We'll make a commit to this repository's <strong>
                {confirm_timecard_for.default_branch}
              </strong> branch with a base timecard that you can customize below.
            </p>

            {/* edit the timecard name and description before adding */}
            <Input
              type="text"
              placeholder={confirm_timecard_for.repo}
              label="Project Name"
              onChange={changeStagingTimecardData("name")}
            />
            <Input
              type="text"
              placeholder={confirm_timecard_for.desc}
              label="Project Description"
              onChange={changeStagingTimecardData("desc")}
            />

            {/* Create a timecard on the default branch */}
            <Button bsStyle="primary" onClick={importNewRepo(confirm_timecard_for, true, timecardTemplate)}>
              Create new timecard
            </Button>
        </div>
      </Modal.Body>
    </Modal>;
  }

  return <div className="repo-details repo-details-import">
    <h2>Import a new Repository</h2>
    {createNewTimecardModal}

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
                  className="btn btn-info btn-pick-me"
                  onClick={confirmNewTimecard(ct)}
                >Create new Timecard</button>
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

    // for repos that don't already have a timecard, give the user an option to
    // add one.
    confirm_timecard_for: (Number.isFinite(store.discovered_repo_new_timecard) ?
      store.discovered_repos[store.discovered_repo_new_timecard] :
      null
    ),
    new_timecard_staging: store.new_timecard_staging,
  };
}, (dispatch, ownProps) => {
  return {
    importNewRepo(repo, createTimecard, timecardTempl) {
      return () => dispatch(importFromGithubRepo(repo, createTimecard, timecardTempl));
    },
    toImportRepoPage(page) {
      return () => dispatch(requestAllUserRepos(page));
    },
    confirmNewTimecard(ct) {
      return () => dispatch(askUserToCreateNewTimecard(ct));
    },
    changeStagingTimecardData(name) {
      return (event) => dispatch(changeStagingTimecardData(name, event.target.value));
    },
  };
})(ImportRepoComponent);

export default ImportRepo;
