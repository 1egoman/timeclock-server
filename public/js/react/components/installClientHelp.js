import React from 'react';
import {connect} from 'react-redux';
import {Modal, Button} from 'react-bootstrap';
import {showWaltzInstallInstructions} from '../actions/repo';

export function InstallClientHelpComponent({client_help_dialog, hideModal}) {
  return <Modal show={client_help_dialog} onHide={hideModal}>
    <Modal.Header closeButton>
      <Modal.Title>Installing the Waltz Client</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>
        Unlike iTunes or Photoshop, you won’t be able to launch Waltz from your
        dock or taskbar. You will be using the command line via a tool such as
        Terminal.
      </p> 
      <h2>Install Node</h2>
      <p>Waltz is written in node.js, which is a prerequisite to installing Waltz.</p>
      <h4>Mac</h4>
      <p>
        Go to nodejs.org, click ‘install’, and run through the install process.
      </p>
      <h4>Ubuntu</h4>
      <p>
        Run the following in a terminal to install node:
      </p>
      <pre>
        curl -sL https://deb.nodesource.com/setup | sudo -E bash -<br/>
        sudo apt-get install -y nodejs
      </pre>
      <h4>Windows</h4>
      <p>Currently, windows support is not supported.</p>

      <h2>Install Waltz</h2>
      <p>Open a terminal and paste the following snippet:</p>
      <pre>
        npm install -g waltz<br/>
        waltz --version
      </pre>
    </Modal.Body>
  </Modal>;
}

const InstallClientHelp = connect((store) => {
  return {
    client_help_dialog: store.client_help_dialog,
  };
}, (dispatch) => {
  return {
    hideModal() {
      dispatch(showWaltzInstallInstructions(false));
    },
  };
})(InstallClientHelpComponent);
export default InstallClientHelp;
