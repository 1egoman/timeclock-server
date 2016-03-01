import React from 'react';
import { Router, Route, hashHistory } from 'react-router';

// "Components"
import RepoList from './components/repoList';
import RepoDetails from './components/repoDetails';
import RepoImport from './components/repoImport';
import Nav from './components/nav';

// the "main view" that the user encounters
export function repoView({params}) {
  return <div>
    <Nav />
    <div className="col-md-4 col-lg-3">
      <RepoList />
    </div>
    <div className="col-md-8 col-lg-9">
      <RepoDetails user={params.user} repo={params.repo} />
    </div>
  </div>;
}
