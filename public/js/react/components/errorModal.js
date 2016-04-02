import React from 'react';
import {connect} from 'react-redux';
import {Modal, Button} from 'react-bootstrap';
import {hideErrorModal} from '../actions/modal';

export function ErrorModalComponent({error, hideModal}) {
  return <Modal show={Boolean(error)} onHide={hideModal}>
    <Modal.Header closeButton>
      <Modal.Title>Error</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {error ? error.error : null}
    </Modal.Body>
  </Modal>;
}

export function mapStateToProps(store) {
  return {
    error: store.error,
  };
};

const ErrorModal = connect(mapStateToProps, (dispatch) => {
  return {
    hideModal() {
      dispatch(hideErrorModal());
    },
  };
})(ErrorModalComponent);
export default ErrorModal;
