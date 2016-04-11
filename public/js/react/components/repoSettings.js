import React from 'react';
import {connect} from 'react-redux';
import {OverlayTrigger, Popover, Panel, Tabs, Tab} from 'react-bootstrap';
import _ from 'underscore';
import {getRepoByIndex} from '../helpers/get_repo';

export function repoSettingsComponent({
  repo,
  user,
}) {
  return <div className="repo-settings container">
    <h1>Settings</h1>
    <Panel header="Embeddable Badge">
      <img
        className="repo-details-badge"
        src={`/${repo.user}/${repo.repo}.svg`}
      />
      <p>
        This badge provides a simple way for both freelancers and clients to view
        payment status on a project.
        To embed, copy the below code into the respective embed location.
      </p>
      <Tabs defaultActiveKey={0}>
        <Tab eventKey={0} title="Markdown">
          <pre>
            [![Waltz unpaid time](http://waltzapp.co/{repo.user}/{repo.repo}.svg{repo.is_private ? '?token='+user.badge_token : '' })](http://waltzapp.co/{repo.user}/{repo.repo})
          </pre>
        </Tab>
      </Tabs>
    </Panel>
  </div>;
}

export function mapStateToProps(store, props) {
  return {
    color: props.color,
    repo: getRepoByIndex(store, store.active_repo),
    user: store.user,
  };
};

const repoSettings = connect(mapStateToProps, (dispatch, props) => {
  return {};
})(repoSettingsComponent);

export default repoSettings;
