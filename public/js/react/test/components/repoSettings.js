"use strict";
import assert from "assert";
import helpers from "../helpers";
import React from 'react';
import Select from 'react-select';
import sinon from 'sinon';
import {OverlayTrigger, Popover, Panel, Tabs, Tab} from 'react-bootstrap';
import {
  embeddableBadge,
  embeddableBadgeCopy,
  mapStateToProps,
} from '../../components/details/repoSettings';

import {generateUser} from "../helpers/generators";

describe('components/details/repoSettings', function() {
  describe('embeddableBadge', function() {
    it('should allow user to pick badge embed code', function() {
      let user = generateUser();
      assert.deepEqual(
        embeddableBadge(
          { user: "user", repo: "repo", is_private: false },
          user
        ),
        <Panel header="Embeddable Badge">
          <img
            className="repo-details-badge"
            src={`/user/repo.svg`}
            alt="Embeddable Badge"
          />

          <p>{embeddableBadgeCopy()}</p>

          {/* The embed formats: Markdown, RST, or raw */}
          <Tabs defaultActiveKey={0} bsStyle="pills" animation={false}>
            <Tab eventKey={0} title="Markdown">
              <pre>
                [![Waltz unpaid time](http://waltzapp.co/{"user"}/{"repo"}.svg{""})](http://waltzapp.co/{"user"}/{"repo"})
              </pre>
            </Tab>
            <Tab eventKey={1} title="RST">
              <pre>
                .. image:: http://waltzapp.co/{"user"}/{"repo"}.svg{""}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;:target: http://waltzapp.co/{"user"}/{"repo"}
              </pre>
            </Tab>
            <Tab eventKey={2} title="Image URL">
              <pre>
                http://waltzapp.co/{"user"}/{"repo"}.svg{""}
              </pre>
            </Tab>
          </Tabs>
        </Panel>
      );
    });
    it('should allow user to pick badge embed code for a private repo', function() {
      let user = generateUser();
      assert.deepEqual(
        embeddableBadge(
          { user: "user", repo: "repo", is_private: true },
          user
        ),
        <Panel header="Embeddable Badge">
          <img
            className="repo-details-badge"
            src={`/user/repo.svg`}
            alt="Embeddable Badge"
          />

          <p>{embeddableBadgeCopy()}</p>

          {/* The embed formats: Markdown, RST, or raw */}
          <Tabs defaultActiveKey={0} bsStyle="pills" animation={false}>
            <Tab eventKey={0} title="Markdown">
              <pre>
                [![Waltz unpaid time](http://waltzapp.co/{"user"}/{"repo"}.svg{"?token="+user.badge_token})](http://waltzapp.co/{"user"}/{"repo"})
              </pre>
            </Tab>
            <Tab eventKey={1} title="RST">
              <pre>
                .. image:: http://waltzapp.co/{"user"}/{"repo"}.svg{"?token="+user.badge_token}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;:target: http://waltzapp.co/{"user"}/{"repo"}
              </pre>
            </Tab>
            <Tab eventKey={2} title="Image URL">
              <pre>
                http://waltzapp.co/{"user"}/{"repo"}.svg{"?token="+user.badge_token}
              </pre>
            </Tab>
          </Tabs>
        </Panel>
      );
    });
  });
  describe('mapStateToProps', function() {
    it('should inherit from props and state', function() {
      assert.deepEqual(mapStateToProps({
        repos: [{user: "user", repo: "repo", unique: true}],
        active_repo: ["user", "repo"],
        user: {username: "user", uniueq: 123},
      }, {color: "red"}), {
        color: "red",
        repo: {user: "user", repo: "repo", unique: true},
        user: {username: "user", uniueq: 123},
      });
    });
  });
});
