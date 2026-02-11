import React from 'react';
import { Modal } from '@mantine/core';

type NotificationModalProps = {
  opened: boolean;
  modalTitle: string;
  modalBody: string;
  onClose: () => void;
};

export default function NotificationModal({
  opened,
  modalTitle,
  modalBody,
  onClose,
}: NotificationModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={modalTitle}
      centered
      size="auto"
      classNames={{
        root: 'vento-modal',
      }}
    >
      <p>{modalBody}</p>
      <div className="cta-container">
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
      </div>
    </Modal>
  );
}
