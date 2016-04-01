import React from 'react';
import {connect} from 'react-redux';
import { showShareModal } from '../actions/modal';
import { shareWithEmails } from '../actions/repo';
import {
  Modal,
  Input,
  Button,
} from 'react-bootstrap';
import {reduxForm} from 'redux-form';

export const shareWithClientComponent = ({
  user,
  show,
  active_repo,

  // from redux-form
  fields: {email, message},
  handleSubmit,

  hideModal,
  submitShare,
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
        {...email}
      />
      <Input
        type="textarea"
        label="Add an optional message"
        placeholder="Take a look at my timesheet!"
        style={{resize: "vertical"}}
        {...message}
      />
    </Modal.Body>
    <Modal.Footer>
      <Button
        className="pull-right"
        bsStyle="primary"
        onClick={handleSubmit(submitShare.bind(this, active_repo))}
      >Share</Button>
    </Modal.Footer>
  </Modal>;
};

let shareWithClient = connect((store, props) => {
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
    submitShare([user, repo], {email, message}) {
      dispatch(shareWithEmails(user, repo, [email], message));
    },
  };
})(shareWithClientComponent);

// add redux-form for the email and message data
shareWithClient = reduxForm({
  fields: ["email", "message"],
  form: "share_with_client",
})(shareWithClient);

export default shareWithClient;
