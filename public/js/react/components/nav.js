import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';

export const NavComponent = ({title, logged_in_user}) => {
  let login_controls = logged_in_user ? <ul className="nav navbar-nav pull-right">
  <li><a href="/auth/logout">Logout {logged_in_user.username}</a></li>
  <li>
    <Link to="/app/settings"><i className="fa fa-cog"></i></Link>
  </li>
  </ul> : <ul className="nav navbar-nav pull-right">
    <li><a href="/login">Login</a></li>
  </ul>;

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
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </button>
        <span className="navbar-brand">
          <Link to="/app/">
            <img src="/img/logo.svg" />
          </Link>
        </span>
      </div>

      <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul className="nav navbar-nav">
          <li><a href="/features">Features</a></li>
          <li><a href="/pricing">Pricing</a></li>
        </ul>
        {login_controls}
      </div>
    </div>
  </nav>;
}

const Nav = connect((store, props) => {
  return {
    title: "Waltz",
    logged_in_user: store.user,
  };
}, (dispatch, props) => {
  return {};
})(NavComponent);

export default Nav;
