import React from 'react';
import { Loader, Modal } from '@mantine/core';

type Props = {
  open: boolean;
  selectedRecordingsCount: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function TurnOffAutoArchiveModal({ 
  open, 
  loading, 
  selectedRecordingsCount, 
  onClose, 
  onConfirm 
}: Props) {
  const title = selectedRecordingsCount
    ? `Turn off auto-archive for ${selectedRecordingsCount} video${
        selectedRecordingsCount > 1 ? 's' : ''
      }?`
    : `Turn off auto-archive for video?`;
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
      size="500px"
      classNames={{
        root: "vento-modal",
      }}
    >
      <p>
        You can change this later.
      </p>
      <div className="cta-container">
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
        <button onClick={onConfirm} className="confirm-btn">
          {loading ? (
            <Loader size="sm" color="black" />
          ) : (
            <p>Turn off auto-archive</p>
          )}
        </button>
      </div>
    </Modal>
  );
}
