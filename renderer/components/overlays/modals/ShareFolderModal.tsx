import React from 'react';
import { Modal } from '@mantine/core';
import { IoShareSocial } from 'react-icons/io5';

type Props = {
  open: boolean;
  folderName: string;
  onClose: () => void;
  onConfirm: () => void;
};

// Adjust the folder name length to maximum width
const adjustFolderName = (folderName: string) => {
  const maxLength = 20;
  if (folderName.length > maxLength) {
    return folderName.substring(0, maxLength) + '...';
  }
  return folderName;
};

export default function ShareFolderModal({ open, folderName, onClose, onConfirm }: Props) {
  const adjustedFolderName = adjustFolderName(folderName);
  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={`Share ${adjustedFolderName} ?`}
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
        title: "share-folder-modal-title"
      }}
    >
      <p>
        All videos in your folder will be viewable by anyone with this link. For more privacy, add password protection to videos in this folder.
      </p>
      <div className="cta-container">
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
        <button onClick={onConfirm} className="confirm-btn">
          <IoShareSocial size={18} />
          Share
        </button>
      </div>
    </Modal>
  );
}
