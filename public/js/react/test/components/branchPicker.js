"use strict";
import assert from "assert";
import helpers from "../helpers";
import React from 'react';
import Select from 'react-select';
import sinon from 'sinon';
import {
  BranchPickerComponent,
  mapPropsToStore,
} from '../../components/details/branchPicker';

describe('components/branchPicker.js', function() {
  describe('bare component', function() {
    it('should render a branchpicker', function() {
      let chooseBranchSpy = sinon.spy();
      assert.deepEqual(BranchPickerComponent({
        current_branch: "master",
        branches: ["master", "branch-a", "branch-b"],
        chooseBranch: chooseBranchSpy,
        repo: helpers.testRepo,
      }), <Select
        value="master"
        options={[
          {value: "master", label: "master"},
          {value: "branch-a", label: "branch-a"},
          {value: "branch-b", label: "branch-b"}
        ]}
        clearable={false}
      />);
      assert(chooseBranchSpy.calledOnce);
      assert(chooseBranchSpy.calledWith(helpers.testRepo));
    });
    it('should render a branchpicker without a current branch', function() {
      let chooseBranchSpy = sinon.spy();
      assert.deepEqual(BranchPickerComponent({
        current_branch: null,
        branches: ["master", "branch-a", "branch-b"],
        chooseBranch: chooseBranchSpy,
        repo: helpers.testRepo,
      }), <Select
        value="master"
        options={[
          {value: "master", label: "master"},
          {value: "branch-a", label: "branch-a"},
          {value: "branch-b", label: "branch-b"}
        ]}
        clearable={false}
      />);
      assert(chooseBranchSpy.calledOnce);
      assert(chooseBranchSpy.calledWith(helpers.testRepo));
    });
  });
  describe('mapPropsToStore', function() {
    it('should correctly resolve props', function() {
      let state = Object.assign({}, helpers.initialState, {
        active_repo: ["username", "reponame"],
        repo_details: {
          branch: "master",
          branches: ["master", "my-branch"],
          timecard: null,
          _comesfrom: [null, null], // the repo behind the current timecard
          _page: 0,
          _canpaginateforward: false,
        },
        repos: [],
      });
      assert.deepEqual(mapPropsToStore(state, {}), {
        current_branch: "master",
        branches: ["master", "my-branch"],
        repo: undefined,
      });
    });
  });
});
