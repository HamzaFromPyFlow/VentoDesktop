import React from 'react';
import { Loader, Modal } from '@mantine/core';

type Props = {
  open: boolean;
  selectedRecordingsCount: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteMultipleVideosModal({ 
  open, 
  selectedRecordingsCount, 
  loading, 
  onClose, 
  onConfirm 
}: Props) {
  const title = `Delete ${selectedRecordingsCount} video${selectedRecordingsCount > 1 ? 's' : ''}?`;
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };
  return (
    <Modal
      opened={open}
      onClose={handleClose}
      title={title}
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
      <p>
        Once deleted, these videos will no longer be available.
      </p>
      <div className="cta-container">
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
        <button onClick={onConfirm} className="confirm-btn--delete">
          {loading ? (
            <Loader size="sm" color="white" />
          ) : (
            <p style={{ color: 'white' }}>Delete Video{selectedRecordingsCount > 1 && 's'}</p>
          )}
        </button>
      </div>
    </Modal>
  );
}
