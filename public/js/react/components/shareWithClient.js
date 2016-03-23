import React from 'react';
import {connect} from 'react-redux';
import {
  showShareModal,
} from '../actions/repo';
import {Modal, Input} from 'react-bootstrap';

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
      <h3>Share invoice with client</h3>
      <Input type="text" placeholder="Add email to share" />
    </Modal.Body>
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
  };
})(shareWithClientComponent);
export default shareWithClient;
