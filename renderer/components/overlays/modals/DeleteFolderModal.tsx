import React from 'react';
import { Modal } from '@mantine/core';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteFolderModal({ open, onClose, onConfirm }: Props) {
  return (
    <Modal
      opened={open}
      onClose={onClose}
      title="Delete folder?"
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
      <p>
        This action is <strong>permanent</strong>. All videos in the folder will{" "}
        <strong>not</strong> be deleted, but will be moved to the root folder.
      </p>
      <div className="cta-container">
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
        <button onClick={onConfirm} className="confirm-btn--delete">
          Yes, Delete
        </button>
      </div>
    </Modal>
  );
}
