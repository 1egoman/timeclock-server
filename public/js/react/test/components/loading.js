import React from 'react';
import assert from 'assert';
import Loading from '../../components/loading';
import sinon from 'sinon';

describe('components/loading.js', function() {
  it('should render a loading message with all args', function() {
    assert.deepEqual(Loading({
      size: "md",
      title: "I'm a title",
      message: "I'm a cool message",
      spinner: true,
    }), <div className="loading loading-md">
      <i className="fa fa-spinner fa-spin" />
      <h1>I'm a title</h1>
      <p>I'm a cool message</p>
    </div>);
  });
  it('should render a loading message, falling back on title', function() {
    assert.deepEqual(Loading({
      size: "sm",
      message: "I'm a cool message",
      spinner: true,
    }), <div className="loading loading-sm">
      <i className="fa fa-spinner fa-spin" />
      <h1>Loading...</h1>
      <p>I'm a cool message</p>
    </div>);
  });
  it('should render a loading message, falling back on message', function() {
    sinon.stub(Math, "random", () => 0); // used internally to pick the message to return
    assert.deepEqual(Loading({
      size: "lg",
      title: "I'm a title",
      spinner: true,
    }), <div className="loading loading-lg">
      <i className="fa fa-spinner fa-spin" />
      <h1>I'm a title</h1>
      <p>We'll be back in a sec.</p>
    </div>);
    Math.random.restore();
  });
  it('should render a loading message, falling back on size', function() {
    assert.deepEqual(Loading({
      title: "I'm a title",
      message: "I'm a cool message",
      spinner: true,
    }), <div className="loading loading-md">
      <i className="fa fa-spinner fa-spin" />
      <h1>I'm a title</h1>
      <p>I'm a cool message</p>
    </div>);
  });
  it('should render a loading message, without spinner', function() {
    assert.deepEqual(Loading({
      size: "md",
      title: "I'm a title",
      message: "I'm a cool message",
      spinner: false,
    }), <div className="loading loading-md">
      {null}
      <h1>I'm a title</h1>
      <p>I'm a cool message</p>
    </div>);
  });
});
