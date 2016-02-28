import React from 'react';
import {connect} from 'react-redux';
import { changeBranch } from '../actions/repo';
import {getCurrentBranch, getAllBranches} from '../helpers/branch';
import _ from "underscore";
import Select from 'react-select';

export const BranchPickerComponent = ({
  current_branch,
  branches,
  chooseBranch,
}) => {
  let select_branches = branches.map((i) => {
    return {value: i, label: i}
  });
  return <Select
    value={current_branch}
    options={select_branches}
    clearable={false}
    onChange={chooseBranch}
  />
};

const BranchPicker = connect((store, ownProps) => {
  return {
    current_branch: getCurrentBranch(store),
    branches: getAllBranches(store),
  };
}, (dispatch, ownProps) => {
  return {
    chooseBranch(branch) {
      dispatch(changeBranch(branch));
    }
  };
})(BranchPickerComponent);

export default BranchPicker;
