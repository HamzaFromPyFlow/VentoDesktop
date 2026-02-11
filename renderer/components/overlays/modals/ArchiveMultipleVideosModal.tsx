import React from 'react';
import { Loader, Modal } from '@mantine/core';

type Props = {
  open: boolean;
  selectedRecordingsCount: number;
  loading: boolean;
  isArchivedPage: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ArchiveMultipleVideosModal({ 
  open, 
  loading, 
  isArchivedPage, 
  selectedRecordingsCount, 
  onClose, 
  onConfirm 
}: Props) {
  const title = `${isArchivedPage ? 'Un-' : ''}Archive ${selectedRecordingsCount} video${selectedRecordingsCount > 1 ? 's' : ''}?`;
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
      size="400px"
      classNames={{
        root: "vento-modal",
      }}
    >
      <p>
        {isArchivedPage ? 'You can archive these videos at any time' : 'You can un-archive these videos at any time.'}
      </p>
      <div className="cta-container">
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
        <button onClick={onConfirm} className="confirm-btn">
          {loading ? (
            <Loader size="sm" color="black" />
          ) : (
            <p>{isArchivedPage ? 'Un-' : ''}Archive Video{selectedRecordingsCount > 1 && 's'}</p>
          )}
        </button>
      </div>
    </Modal>
  );
}
