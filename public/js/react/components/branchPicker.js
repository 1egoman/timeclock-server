import React from 'react';
import {connect} from 'react-redux';
import { changeBranch, getTimecard } from '../actions/repo';
import {getCurrentBranch, getAllBranches} from '../helpers/branch';
import _ from "underscore";
import Select from 'react-select';
import { getRepoByIndex } from '../helpers/get_repo';

export const BranchPickerComponent = ({
  current_branch,
  branches,
  repo,

  chooseBranch,
}) => {
  if (branches) {
    let select_branches = branches.map((i) => {
      return {value: i, label: i}
    });
    return <Select
      value={current_branch || repo.default_branch}
      options={select_branches}
      clearable={false}
      onChange={chooseBranch(repo)}
    />
  } else {
    return null;
  }
};

export function mapPropsToStore(store, props) {
  return {
    current_branch: getCurrentBranch(store),
    branches: getAllBranches(store),
    repo: getRepoByIndex(store, store.active_repo),
  };
}

const BranchPicker = connect(mapPropsToStore, (dispatch, props) => {
  return {

    // go to a new branch, and pull in the new timecard for that branch
    chooseBranch(repo) {
      return (branch) => {
        dispatch(changeBranch(branch));
        dispatch(getTimecard(repo, branch));
      };
    }
  };
})(BranchPickerComponent);

export default BranchPicker;
