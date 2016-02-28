import React from 'react';
import {connect} from 'react-redux';

export const NavComponent = ({title}) => {
  return <nav className="navbar">
    <div className="container-fluid">
      <div className="navbar-header">
        <button
          type="button"
          className="navbar-toggle collapsed"
          data-toggle="collapse"
          data-target="#bs-example-navbar-collapse-1"
          aria-expanded="false"
        >
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a className="navbar-brand" href="/">{title}</a>
      </div>

      <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul className="nav navbar-nav">
          <li><a href="/features">Features</a></li>
          <li><a href="/pricing">Pricing</a></li>
        </ul>
      </div>

    </div>
  </nav>;
}

const Nav = connect((store, props) => {
  return {
    title: "Waltz"
  };
}, (dispatch, props) => {
  return {};
})(NavComponent);

export default Nav;
