"use strict";
import assert from "assert";
import helpers from "../helpers";
import {
  repos,
  activeRepo,
  repoImportDialogOpen,
  discoveredRepos,
  discoveredReposPage,
  discoveredRepoNewTimecard,
  repoDetails,
  newTimecardData,
  helpInstallingClient,
  error,
} from '../../reducers/repo';
const old_state = helpers.initialState;

describe('reducers/repo.js', function() {
  describe('repoImportDialogOpen', function() {
    it('should show the dialog on server/DISCOVER_REPOS', function() {
      let new_state = repoImportDialogOpen(old_state.repo_import_dialog_open, {
        type: "server/DISCOVER_REPOS",
      });
      assert.deepEqual(new_state, true);
    });
    it('should hide the dialog on SELECT_REPO', function() {
      let new_state = repoImportDialogOpen(old_state.repo_import_dialog_open, {
        type: "SELECT_REPO",
      });
      assert.deepEqual(new_state, false);
    });
    it('should show the dialog on server/REPO_IMPORT', function() {
      let new_state = repoImportDialogOpen(old_state.repo_import_dialog_open, {
        type: "server/REPO_IMPORT",
      });
      assert.deepEqual(new_state, false);
    });
    it('should not be effected by another event', function() {
      let new_state = activeRepo(old_state.repo_import_dialog_open, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, old_state.repo_import_dialog_open);
    });
  });
  describe('repos', function() {
    it('should work with PUT_REPO', function() {
      let new_state = repos(old_state.repos, {
        type: "PUT_REPO",
        index: 0,
        repo: {foo: "bar"},
      });
      assert.deepEqual(new_state, [{
        foo: "bar"
      }, ...old_state.repos.slice(1)]);
    });
    it('should work with server/PUT_REPO', function() {
      let new_state = repos(old_state.repos, {
        type: "server/PUT_REPO",
        index: 0,
        repo: {foo: "bar"},
      });
      assert.deepEqual(new_state, [{
        foo: "bar"
      }, ...old_state.repos.slice(1)]);
    });
    it('should work with server/DELETE_REPO', function() {
      let new_state = repos(old_state.repos, {
        type: "server/DELETE_REPO",
        user: "username",
        repo: "reponame",
      });
      assert.deepEqual(new_state, old_state.repos.filter(({user, repo}) => {
        return !(user === "username" && repo === "reponame");
      }));
    });
    it('should work with server/INIT', function() {
      let new_state = repos(old_state.repos, {
        type: "server/INIT",
        repos: [{foo: "bar"}],
      });
      assert.deepEqual(new_state, [{foo: "bar"}]);
    });
    it('should not be effected by another event', function() {
      let new_state = repos(old_state.repos, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, old_state.repos);
    });
  });
  describe('activeRepo', function() {
    it('should select a repo on SELECT_REPO', function() {
      let new_state = activeRepo(old_state.active_repo, {
        type: "SELECT_REPO",
        index: 12,
      });
      assert.deepEqual(new_state, 12);
    });
    it('should deselect all repos on server/DISCOVER_REPOS', function() {
      let new_state = activeRepo(old_state.active_repo, {
        type: "server/DISCOVER_REPOS",
      });
      assert.deepEqual(new_state, null);
    });
    it('should not be effected by another event', function() {
      let new_state = activeRepo(old_state.active_repo, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, old_state.active_repo);
    });
  });
  describe('discoveredRepos', function() {
    it('should add repos with no existing repos', function() {
      let new_state = discoveredRepos([], {
        type: "server/REPOS_DISCOVERED",
        repos: [{foo: "bar"}],
        page: 1,
      });
      assert.deepEqual(new_state, [{foo: "bar"}]);
    });
    it('should add unique repos with preexisting repos', function() {
      let new_state = discoveredRepos([{user: "user-exists", repo: "repo-exists"}], {
        type: "server/REPOS_DISCOVERED",
        repos: [{user: "i-am-new", repo: "i-am-too"}, {user: "user-exists", repo: "repo-exists"}],
        page: 0,
      });
      assert.deepEqual(new_state, [{user: "user-exists", repo: "repo-exists"}, {user: "i-am-new", repo: "i-am-too"}]);
    });
    it('should not be effected by another event', function() {
      let new_state = discoveredRepos(old_state.discovered_repos, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, old_state.discovered_repos);
    });
  });
  describe('repoDetails', function() {
    it('should change branch on CHANGE_BRANCH', function() {
      let new_state = repoDetails(Object.assign({}, old_state.repo_details, {
        timecard: {foo: "bar"}, // to test the clearing of the timecard
      }), {
        type: "CHANGE_BRANCH",
        branch: "another-branch"
      });
      assert.deepEqual(new_state, {
        branch: "another-branch",
        branches: null,
        timecard: null,
        commits: null,
        _comesfrom: [null, null],
        _page: 0,
        _canpaginateforward: false,
        error: null,
      });
    });
    it('should reset branch and close all modals on SELECT_REPO', function() {
      let new_state = repoDetails(old_state.repo_details, {
        type: "SELECT_REPO",
        index: 0,
      });
      assert.deepEqual(new_state, {
        branch: null,
        branches: null,
        commits: null,
        timecard: null,
        _comesfrom: [null, null],
        _page: 0,
        _canpaginateforward: false,
        show_share_modal: false,
        error: null,
      });
    });
    it('should switch repo tab on SWITCH_REPO_TAB', function() {
      let new_state = repoDetails(old_state.repo_details, {
        type: "SWITCH_REPO_TAB",
        tab: "my-tab"
      });
      assert.deepEqual(new_state, {
        branch: null,
        branches: null,
        commits: null,
        timecard: null,
        _comesfrom: [null, null],
        _page: 0,
        _canpaginateforward: false,
        _tab: "my-tab",
        error: null,
      });
    });
    it('should reset branch and close all modals on server/REPO_DELETED', function() {
      let new_state = repoDetails(old_state.repo_details, {
        type: "server/REPO_DELETED",
        user: "username",
        repo: "reponame",
      });
      assert.deepEqual(new_state, {
        branch: null,
        branches: null,
        commits: null,
        timecard: null,
        _comesfrom: [null, null],
        _page: 0,
        _canpaginateforward: false,
        show_share_modal: false,
        error: null,
      });
    });
    it('should reset branch on server/BRANCHES_FOR', function() {
      let new_state = repoDetails(old_state.repo_details, {
        type: "server/BRANCHES_FOR",
        branches: ["master", "dev", "a-branch"],
      });
      assert.deepEqual(new_state, {
        branch: null,
        branches: ["master", "dev", "a-branch"],
        commits: null,
        timecard: null,
        _comesfrom: [null, null],
        _page: 0,
        _canpaginateforward: false,
        error: null,
      });
    });
    it('should update commits on server/COMMITS_FOR', function() {
      let new_state = repoDetails(old_state.repo_details, {
        type: "server/COMMITS_FOR",
        commits: [{committer: {username: "a-user"}, message: "abc", sha: "my-sha"}],
      });
      assert.deepEqual(new_state, {
        branch: null,
        branches: null,
        commits: [{committer: {username: "a-user"}, message: "abc", sha: "my-sha"}],
        timecard: null,
        _comesfrom: [null, null],
        _page: 0,
        _canpaginateforward: false,
        error: null,
      });
    });
    it('should reset branch on server/TIMECARD', function() {
      let new_state = repoDetails(old_state.repo_details, {
        type: "server/TIMECARD",
        user: "username",
        repo: "a-repository",
        timecard: {foo: "bar"},
        users: [{foo: "baz"}],
        page: 0,
        canpaginateforward: false,
      });
      assert.deepEqual(new_state, {
        branch: null,
        branches: null,
        commits: null,
        timecard: {foo: "bar"},
        users: [{foo: "baz"}],
        _comesfrom: ["username", "a-repository", null],
        _page: 0,
        _canpaginateforward: false,
        error: null,
      });
    });
    it('should amend to timecard on server/TIMECARD', function() {
      // fetch an iterim page in the group (any page but last)
      let new_state = repoDetails(old_state.repo_details, {
        type: "server/TIMECARD",
        user: "username",
        repo: "a-repository",
        branch: "ref",
        timecard: {card: [{foo: "bar"}]},
        users: [{foo: "baz"}],
        page: 0,
        canpaginateforward: true,
      });
      assert.deepEqual(new_state, {
        branch: null,
        branches: null,
        commits: null,
        timecard: {card: [{foo: "bar"}]},
        users: [{foo: "baz"}],
        _comesfrom: ["username", "a-repository", "ref"],
        _page: 0,
        _canpaginateforward: true,
        error: null,
      });

      // now, "fetch" the last page in the group
      let second_new_state = repoDetails(new_state, {
        type: "server/TIMECARD",
        user: "username",
        repo: "a-repository",
        branch: "ref",
        timecard: {card: [{hello: "world"}]},
        users: [{second: "user"}],
        page: 1,
        canpaginateforward: false,
      });
      assert.deepEqual(second_new_state, {
        branch: null,
        branches: null,
        commits: null,
        timecard: {card: [{foo: "bar"}, {hello: "world"}]},
        users: [{foo: "baz"}, {second: "user"}],
        _comesfrom: ["username", "a-repository", "ref"],
        _page: 1,
        _canpaginateforward: false,
        error: null,
      });
    });
    it('should amend to timecard on server/TIMECARD, and assume current branch', function() {
      // fetch an iterim page in the group (any page but last)
      let new_state = repoDetails(Object.assign({}, old_state.repo_details, {
        branch: "ref",
        _comesfrom: ["username", "a-repository", null],
        timecard: {card: []},
        users: [],
      }), {
        type: "server/TIMECARD",
        user: "username",
        repo: "a-repository",
        branch: "ref",
        timecard: {card: [{foo: "bar"}]},
        users: [{foo: "baz"}],
        page: 0,
        canpaginateforward: true,
      });
      assert.deepEqual(new_state, {
        branch: "ref",
        branches: null,
        commits: null,
        timecard: {card: [{foo: "bar"}]},
        users: [{foo: "baz"}],
        _comesfrom: ["username", "a-repository", "ref"],
        _page: 0,
        _canpaginateforward: true,
        error: null,
      });

      // now, "fetch" the last page in the group
      let second_new_state = repoDetails(new_state, {
        type: "server/TIMECARD",
        user: "username",
        repo: "a-repository",
        branch: "ref",
        timecard: {card: [{hello: "world"}]},
        users: [{second: "user"}],
        page: 1,
        canpaginateforward: false,
      });
      assert.deepEqual(second_new_state, {
        branch: "ref",
        branches: null,
        commits: null,
        timecard: {card: [{foo: "bar"}, {hello: "world"}]},
        users: [{foo: "baz"}, {second: "user"}],
        _comesfrom: ["username", "a-repository", "ref"],
        _page: 1,
        _canpaginateforward: false,
        error: null,
      });
    });
    it('should add error on server/ERROR', function() {
      let new_state = repoDetails(old_state.repo_details, {
        type: "server/ERROR",
        error: "NO_TIMECARD_IN_REPO",
      });
      assert.deepEqual(new_state, {
        branch: null,
        branches: null,
        commits: null,
        timecard: null,
        _comesfrom: [null, null], // the repo behind the current timecard
        _page: 0,
        _canpaginateforward: false,
        error: "There isn't a timecard in this repo. Please add one by running waltz init locally,\n              or if you have, push up your changes\n              .",
      });
    });
    it('should open repo share modal on SHOW_REPO_SHARE_MODAL', function() {
      let new_state = repoDetails(old_state.repo_details, {
        type: "SHOW_REPO_SHARE_MODAL",
        value: true,
      });
      assert.deepEqual(new_state, {
        branch: null,
        branches: null,
        timecard: null,
        _comesfrom: [null, null], // the repo behind the current timecard
        _page: 0,
        _canpaginateforward: false,
        error: null,
        commits: null,
        show_share_modal: true,
      });
    });
    it('should let the modal know we\'ve initated the share to the server on server/SHARE_WITH', function() {
      let new_state = repoDetails(old_state.repo_details, {
        type: "server/SHARE_WITH",
      });
      assert.deepEqual(new_state, {
        branch: null,
        branches: null,
        timecard: null,
        _comesfrom: [null, null], // the repo behind the current timecard
        _page: 0,
        _canpaginateforward: false,
        error: null,
        commits: null,
        show_share_modal: false,
        waiting_for_share_modal_response: true,
      });
    });
    it('should update state when share complete on server/SHARE_COMPLETE', function() {
      let new_state = repoDetails(old_state.repo_details, {
        type: "server/SHARE_COMPLETE",
      });
      assert.deepEqual(new_state, {
        branch: null,
        branches: null,
        timecard: null,
        _comesfrom: [null, null], // the repo behind the current timecard
        _page: 0,
        _canpaginateforward: false,
        error: null,
        show_share_modal: false,
        commits: null,
        waiting_for_share_modal_response: false,
      });
    });
    it('should work with server/INIT', function() {
      let new_state = repoDetails(old_state.repoDetails, {
        type: "server/INIT",
        active_repo: ["user", "repo"],
        page: "times",
        timecard: {
          card: [{abc: "def"}],
        },
        users: [{username: "user"}],
        repos: [{user: "user", repo: "bar"}, {user: "user", repo: "repo"}],
        commits: [{message: "foo bar commit"}],
        branches: ["abc", "master"],
        branch: "master-current",
      });
      assert.deepEqual(new_state, {
        timecard: {
          card: [{abc: "def"}],
        },
        users: [{username: "user"}],
        repos: [{user: "user", repo: "bar"}, {user: "user", repo: "repo"}],
        commits: [{message: "foo bar commit"}],
        branches: ["abc", "master"],
        _comesfrom: ["user", "repo", "master-current"],
        show_share_modal: false,
        branch: null,
        _tab: "times", // default to times
      });
    });
    it('should not be effected by another event', function() {
      let new_state = repoDetails(old_state.repo_details, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, old_state.repo_details);
    });
  });
  describe('discoveredReposPage', function() {
    it('should create the event', function() {
      let new_state = discoveredReposPage(old_state.discovered_repos_page, {
        type: "server/REPOS_DISCOVERED",
        repos: [{foo: "bar"}],
        page: 1,
      });
      assert.deepEqual(new_state, 1);
    });
    it('should not be effected by another event', function() {
      let new_state = discoveredRepos(old_state.discovered_repos_page, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, old_state.discovered_repos_page);
    });
  });
  describe('discoveredRepoNewTimecard', function() {
    it('should create the event', function() {
      let new_state = discoveredRepoNewTimecard(old_state.discovered_repo_new_timecard, {
        type: "NEW_TIMECARD_IN_DISCOVERED_REPO",
        user: 'a-user',
        repo: 'a-repo',
      });
      assert.deepEqual(new_state, ['a-user', 'a-repo']);
    });
    it('should clear the state when a repo is created', function() {
      let new_state = discoveredRepoNewTimecard(old_state.discovered_repo_new_timecard, {
        type: "server/REPO_IMPORT",
      });
      assert.deepEqual(new_state, false);
    });
    it('should not be effected by another event', function() {
      let new_state = discoveredRepoNewTimecard(old_state.discovered_repos_page, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, old_state.discovered_repos_page);
    });
  });
  describe('newTimecardData', function() {
    it('should create the event', function() {
      let new_state = newTimecardData(old_state.new_timecard_data, {
        type: "CHANGE_NEW_TIMECARD_DATA",
        data: {foo: "bar"}
      });
      assert.deepEqual(new_state, {foo: "bar"});
    });
    it('should not be effected by another event', function() {
      let new_state = newTimecardData(old_state.new_timecard_data, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, old_state.new_timecard_data);
    });
  });
  describe('newTimecardData', function() {
    it('should create the event', function() {
      let new_state = helpInstallingClient(false, {
        type: "HELP_INSTALL_WALTZ",
        value: true,
      });
      assert.deepEqual(new_state, true);
    });
    it('should not be effected by another event', function() {
      let new_state = newTimecardData(false, {
        type: "SOME_OTHER_EVENT",
      });
      assert.deepEqual(new_state, false);
    });
  });
});
