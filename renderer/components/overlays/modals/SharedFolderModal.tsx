import React from 'react';
import { Modal } from '@mantine/core';
import { BiLink } from 'react-icons/bi';
import { FaUndo } from 'react-icons/fa';

type Props = {
  open: boolean;
  folderName: string;
  sharedFolderLink: string;
  onClose: () => void;
  onConfirm: () => void;
  onUnshare: () => void;
};

// Adjust the folder name to avoid overflow
const adjustFolderName = (folderName: string) => {
  const maxLength = 20;
  if (folderName.length > maxLength) {
    return folderName.substring(0, maxLength) + '...';
  }
  return folderName;
};

export default function SharedFolderModal({ 
  open, 
  folderName, 
  sharedFolderLink, 
  onClose, 
  onConfirm, 
  onUnshare 
}: Props) {
  const adjustedFolderName = adjustFolderName(folderName);
  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={` Folder ${adjustedFolderName} shared!`}
      withCloseButton={false}
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
        title: "share-folder-modal-title"
      }}
    >
      <p>
        {sharedFolderLink}
      </p>
      <div className="cta-container">
        <button onClick={onConfirm} className="confirm-btn">
          <BiLink size={22} />
          Copy Folder Link
        </button>
        <button onClick={onUnshare} className="cancel-btn">
          <FaUndo size={16} />
          UnShare Folder
        </button>
      </div>
    </Modal>
  );
}
