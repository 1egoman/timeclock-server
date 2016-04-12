import React from 'react';
import { Router, Route, Link } from 'react-router';

// "Components"
import RepoList from './components/repoList';
import RepoDetails from './components/details/repoDetails';
import SettingsList from './components/settingsList';
import Nav from './components/nav';

// the "main view" that the user encounters
export function repoView(view) {
  return ({params}) => {
    return <div>
      <Nav />
      <div className="repo-container">
        <RepoDetails
          user={params.user}
          repo={params.repo}
          startingView={view || "times"}
        />
        <RepoList />
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
    <div className="container">
      <h2>That route doesn't exist.</h2>
      <Link to="/app/">Back to civilization</Link>
    </div>
  </div>;
}
