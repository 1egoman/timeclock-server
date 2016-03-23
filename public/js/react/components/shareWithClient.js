import React from 'react';
import {connect} from 'react-redux';
import {
  showShareModal,
} from '../actions/repo';
import {
  Modal,
  Input,
  Button,
} from 'react-bootstrap';

export const shareWithClientComponent = ({
  user,
  show,
  active_repo,

  hideModal,
}) => {
  return <Modal show={show} onHide={hideModal}>
    <Modal.Header closeButton>
      <Modal.Title>Share {active_repo[0]}/{active_repo[1]} with...</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Input
        type="text"
        placeholder="email@example.com"
        label="Who should we share with?"
      />
      <Input
        type="textarea"
        label="Add an optional message"
        placeholder="Take a look at my groovy invoice!"
        style={{resize: "vertical"}}
      />
    </Modal.Body>
    <Modal.Footer>
      <Button className="pull-right" bsStyle="primary" onClick={submitShare}>Share</Button>
    </Modal.Footer>
  </Modal>;
};

const shareWithClient = connect((store, props) => {
  return {
    user: store.user,
    active_repo: store.active_repo,
    show: store.repo_details.show_share_modal,
  };
}, (dispatch, props) => {
  return {
    hideModal() {
      dispatch(showShareModal(false)); // hide it
    },
    submitShare(emails, msg) {
      dispatch(shareWithEmails(emails, msg));
    },
  };
})(shareWithClientComponent);
export default shareWithClient;
