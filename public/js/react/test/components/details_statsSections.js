"use strict";
import assert from "assert";
import helpers from "../helpers";
import React from 'react';
import sinon from 'sinon';
import {ProgressBar} from 'react-bootstrap';
import {
  contributorBarGraph,
} from '../../components/details/statsSections';

describe('components/statsSections.js', function() {
  it('should render a bar graph with one user', function() {
    assert.deepEqual(contributorBarGraph({user: 1}), [
      <ProgressBar bsStyle={undefined} now={100} label="user" key={0} />
    ]);
  });
  it('should render a bar graph with two users', function() {
    assert.deepEqual(contributorBarGraph({user: 1, user_two: 2}), [
      <ProgressBar bsStyle={undefined} now={1/3 * 100} label="user" key={0} />,
      <ProgressBar bsStyle={"success"} now={2/3 * 100} label="user_two" key={1} />
    ]);
  });
  it('should render a bar graph with over the amount of users expected', function() {
    assert.deepEqual(contributorBarGraph({one: 1, two: 1, three: 1, four: 1, five: 1, six: 1}), [
      <ProgressBar bsStyle={undefined} now={1/6 * 100} label="one" key={0} />,
      <ProgressBar bsStyle="success" now={1/6 * 100} label="two" key={1} />,
      <ProgressBar bsStyle="info" now={1/6 * 100} label="three" key={2} />,
      <ProgressBar bsStyle="warning" now={1/6 * 100} label="four" key={3} />,
      <ProgressBar bsStyle="danger" now={1/6 * 100} label="five" key={4} />,
      <ProgressBar now={16.666666666666693} label="Others" striped key={-1} />,
    ]);
  });
  it('should render a bar graph with 1 user, with a different useFirst', function() {
    assert.deepEqual(contributorBarGraph({one: 1}, 3), [
      <ProgressBar bsStyle={undefined} now={100} label="one" key={0} />,
    ]);
  });
  it('should render a bar graph with 2 users, with a different useFirst', function() {
    assert.deepEqual(contributorBarGraph({one: 1, two: 1}, 3), [
      <ProgressBar bsStyle={undefined} now={50} label="one" key={0} />,
      <ProgressBar bsStyle="success" now={50} label="two" key={1} />,
    ]);
  });
  it('should render a bar graph with over the amount of users expected, with a different useFirst', function() {
    assert.deepEqual(contributorBarGraph({one: 1, two: 1, three: 1, four: 1, five: 1, six: 1}, 3), [
      <ProgressBar bsStyle={undefined} now={1/6 * 100} label="one" key={0} />,
      <ProgressBar bsStyle="success" now={1/6 * 100} label="two" key={1} />,
      <ProgressBar bsStyle="info" now={1/6 * 100} label="three" key={2} />,
      <ProgressBar now={50.00000000000002} label="Others" striped key={-1} />,
    ]);
  });
});
