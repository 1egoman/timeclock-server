import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Navbar, Nav as NavGroup, NavItem, NavDropdown} from 'react-bootstrap';

export const NavComponent = ({title, logged_in_user, importNewRepo}) => {
  let login_controls = logged_in_user ? <ul className="nav navbar-nav right">
    <li><Link to="/app/import">Import Project</Link></li>
    <li className="dropdown">
      <a
        href="#"
        className="dropdown-toggle"
        data-toggle="dropdown"
        role="button"
        aria-haspopup="true"
        aria-expanded="false"
      >
      {logged_in_user.username} <span className="caret"></span>
      </a>
      <ul className="dropdown-menu">
        <li>
          <Link to="/app/settings">Settings</Link>
        </li>
        <li><a href="/auth/logout">Logout</a></li>
      </ul>
    </li>
  </ul> : <ul className="nav navbar-nav right">
    <li><a href="/login">Login</a></li>
  </ul>;

  return <Navbar>
    <div className="container-fluid">
      <Navbar.Header>
        <Navbar.Brand>
          <Link to="/app/">
            <img src="/img/logo.svg" />
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>

      <Navbar.Collapse>
        <NavGroup>
          <li><a href="/">Home</a></li>
          <li><Link to="/app/">Projects</Link></li>
          <li><a className="whats-new"></a></li>
        </NavGroup>
        {login_controls}
      </Navbar.Collapse>
    </div>
  </Navbar>;
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
