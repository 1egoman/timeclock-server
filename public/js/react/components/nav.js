import React from 'react';
import {connect} from 'react-redux';

export const NavComponent = ({title}) => {
  return <nav className="navbar">
    <div className="container-fluid">
      <div className="navbar-header">
        <a className="navbar-brand" href="/">
          {title}
        </a>
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
