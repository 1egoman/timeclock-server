import React from 'react';
import {connect} from 'react-redux';
import {Button, Input} from 'react-bootstrap';

// user info pane
export function repoCommitsComponent({
  user,
  repoDetails,
}) {
  if (user) {
    return <div className="repo-commits">
      abc
    </div>;
  } else {
    return null;
  }
}

export function mapStateToProps(store, props) {
  return {
    user: store.user,
    repoDetails: store.repoDetails,
  };
};

const repoCommits = connect(mapStateToProps, (dispatch, props) => {
  return {};
})(repoCommitsComponent);

export default repoCommits;
