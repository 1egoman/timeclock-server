"use strict";
import assert from "assert";
import helpers from "../helpers";
import React from "react";
import {
  getProviderBadgeForRepo,
} from '../../helpers/provider_badge';

describe('helpers/provider_badge', function() {
  it('should return a badge for github', function() {
    assert.deepEqual(getProviderBadgeForRepo({
      provider: "github",
      user: "username",
      repo: "iamarepository",
    }), <a
      className="repo-provider-badge repo-provider-badge-github"
      target="_blank"
      href="//github.com/username/iamarepository"
    >
      <span className="fa fa-github"></span>
    </a>);
  });
  it('should return a badge for bitbucket', function() {
    assert.deepEqual(getProviderBadgeForRepo({
      provider: "bitbucket",
      user: "username",
      repo: "iamarepository",
    }), <a
      className="repo-provider-badge repo-provider-badge-bitbucket"
      target="_blank"
      href="//bitbucket.org/username/iamarepository/src"
    >
      <span className="fa fa-bitbucket"></span>
    </a>);
  });
  it('should return a badge for other', function() {
    assert.deepEqual(getProviderBadgeForRepo({
      provider: "something-else",
      user: "username",
      repo: "iamarepository",
    }), <a
      className="repo-provider-badge repo-provider-badge-unknown"
      data-toggle="tooltip"
      data-placement="bottom"
      title="We are unsure of this repository's origin."
    >
      <span className="fa fa-question-circle"></span>
    </a>);
  });
  it('should not open in new tab if prompted', function() {
    assert.deepEqual(getProviderBadgeForRepo({
      provider: "github",
      user: "username",
      repo: "iamarepository",
    }, false), <a
      className="repo-provider-badge repo-provider-badge-github"
      target=""
      href="//github.com/username/iamarepository"
    >
      <span className="fa fa-github"></span>
    </a>);
  });
});
