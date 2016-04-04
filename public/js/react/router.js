import React from 'react';
import { Router, Route, Link } from 'react-router';

// "Components"
import RepoList from './components/repoList';
import RepoDetails from './components/repoDetails';
import SettingsList from './components/settingsList';
import Nav from './components/nav';

// the "main view" that the user encounters
export function repoView(view) {
  return ({params}) => {
    return <div>
      <Nav />
      <div className="col-md-4 col-lg-3">
        <RepoList />
      </div>
      <div className="col-md-8 col-lg-9">
        <RepoDetails
          user={params.user}
          repo={params.repo}
          view={view || "times"}
        />
      </div>
    </div>;
  };
}
export function settingsView({params}) {
  return <div>
    <Nav />
    <div className="container">
      <SettingsList />
    </div>
  </div>;
}

// a "catchall" at the end of all the routes
export function notFoundRoute({params}) {
  return <div>
    <Nav />
    <div className="col-md-4 col-lg-3">
      <RepoList />
    </div>
    <div className="col-md-8 col-lg-9 repo-details repo-details-empty">
      <h2>That route doesn't exist.</h2>
      <Link to="/app/">Back to civilization</Link>
    </div>
  </div>;
}
