"use strict";
import assert from "assert";
import helpers from "../helpers";
import React from 'react';
import Select from 'react-select';
import sinon from 'sinon';
import {Button, Popover, OverlayTrigger, MenuItem} from 'react-bootstrap';
import {
  RepoListComponent,
  importRepoButton,
  mapStateToProps,
} from '../../components/repoList';
import Repo from '../../components/repo';
import Loading from '../../components/loading';

describe('components/repoList.js', function() {
  describe('mapStateToProps', function() {
    it('should correctly resolve props', function() {
      let state = Object.assign({}, helpers.initialState, {
        active_repo: ["username", "reponame"],
        repos: [],
        repo_import_dialog_open: false,
      });
      assert.deepEqual(mapStateToProps(state, {}), {
        repos: [],
        active_repo: ["username", "reponame"],
        is_importing_repo: false,
      });
    });
  });
});
