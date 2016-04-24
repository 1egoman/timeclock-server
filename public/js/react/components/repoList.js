import React from 'react';
import Repo from './repo';
import {connect} from 'react-redux';
import {requestAllUserRepos, deleteRepo} from '../actions/repo';
import { getRepoByIndex, getActiveRepoIndex } from '../helpers/get_repo';
import {
  Button,
  Popover,
  OverlayTrigger,
  DropdownButton,
  MenuItem,
} from 'react-bootstrap';
import Loading from './loading';

export const RepoListComponent = ({
  repos,
  active_repo,
  is_importing_repo,
  importNewRepo,
  deleteRepo,
}) => {
  // the items themselves
  let items;
  if (repos.length) {
    items = repos.map((repo, ct) => {
      // delete popover
      let delete_popover = <Popover title="Really Delete?" id="delete-repo">
        <Button bsStyle="primary" onClick={deleteRepo(repo)}>Yes, do it</Button>
      </Popover>;

      return <MenuItem eventKey={ct} key={ct}>
        <Repo
        repo={repo}
        index={ct}
        selected={active_repo && active_repo[0] === repo.user && active_repo[1] === repo.repo}
        >
          {/* delete popover */}
          <OverlayTrigger
            trigger="click"
            rootClose
            placement="top"
            overlay={delete_popover}
          >
            <i className="fa fa-trash pull-right repo-delete" />
          </OverlayTrigger>
        </Repo>
      </MenuItem>;
    });
  } else {
    items = <Loading
      title="No Projects"
      message={<span>Why not <span className="click" onClick={importNewRepo}>import a new one?</span></span>}
    />;
  }

  return <ul className={`repos repos-list`}>
    <div className="repos-controls">
      <h4 className="repos-label">Projects</h4>
    </div>
    {items}
  </ul>;
};

export function mapStateToProps(store, props) {
  return {
    repos: store.repos,
    active_repo: store.active_repo,
    is_importing_repo: store.repo_import_dialog_open,
  };
}

const RepoList = connect(mapStateToProps, (dispatch, ownProps) => {
  return {
    importNewRepo() {
      dispatch(requestAllUserRepos());
    },
    deleteRepo(repo) {
      return () => dispatch(deleteRepo(repo.user, repo.repo));
    },
  };
})(RepoListComponent);

export default RepoList;
