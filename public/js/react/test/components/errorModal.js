import React from 'react';
import assert from 'assert';
import {ErrorModalComponent, mapStateToProps} from '../../components/errorModal';
import sinon from 'sinon';
import {Modal, Button} from 'react-bootstrap';

describe('components/loading.js', function() {
  describe('ErrorModalComponent', function() {
    it('should show modal when there\'s an error', function() {
      let hideModalStub = () => "hide-modal-fn";
      assert.deepEqual(ErrorModalComponent({
        error: {
          error: "i-am-an-error",
          from: "backend",
        },
        hideModal: hideModalStub,
      }), <Modal show={true} onHide={hideModalStub}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>i-am-an-error</Modal.Body>
      </Modal>);
    });
    it('should not show modal when there is not an error', function() {
      let hideModalStub = () => "hide-modal-fn";
      assert.deepEqual(ErrorModalComponent({
        error: null,
        hideModal: hideModalStub,
      }), <Modal show={false} onHide={hideModalStub}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{null}</Modal.Body>
      </Modal>);
    });
  });
  describe('mapStateToProps', function() {
    it('should correctly map state to props', function() {
      assert.deepEqual(mapStateToProps({
        error: {
          error: "i-am-an-error",
          from: "backend",
        },
      }), {
        error: {
          error: "i-am-an-error",
          from: "backend",
        },
      });
    });
  });
});
