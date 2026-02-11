import React, { useEffect, useState } from 'react';
import { Loader, Modal } from '@mantine/core';
import { HiOutlineFolder } from 'react-icons/hi';
import { IoHomeOutline } from 'react-icons/io5';

type FolderModel = {
  id: string;
  name: string;
  isShared?: boolean;
  isArchived?: boolean;
  recordingCount?: number;
  archivedRecordingCount?: number;
};

type MoveMultipleRecordingsProps = {
  open: boolean;
  loading?: boolean;
  folders: FolderModel[];
  selectedRecordingsCount: number;
  currentFolder?: FolderModel | null;
  onClose: () => void;
  onConfirm: (folderId: string) => void;
};

export default function MoveMultipleRecordingsModal({
  open,
  onClose,
  onConfirm,
  folders,
  currentFolder,
  selectedRecordingsCount,
  loading,
}: MoveMultipleRecordingsProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>();
  const title = `Move ${selectedRecordingsCount} Video${selectedRecordingsCount > 1 ? 's' : ''} To...`;

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  useEffect(() => {
    if (!open) setSelectedFolderId(undefined);
  }, [open]);

  const displayFolders = currentFolder
    ? [
        {
          id: '-1',
          name: 'Recordings(Home)',
          isShared: false,
          isArchived: false,
        },
        ...folders,
      ]
    : folders;

  return (
    <Modal
      opened={open}
      onClose={handleClose}
      title={title}
      centered
      size="auto"
      classNames={{
        root: "vento-modal vento-modal--move-to-folder",
      }}
    >
      {displayFolders.length === 0 && (
        <span className="create-folder-prompt">
          No Folders available, create them <a href="#/recordings">here</a>
        </span>
      )}

      <ul className="folder-list">
        {displayFolders.map((folder) => (
          <li key={folder.id}>
            <div
              tabIndex={0}
              role="button"
              onClick={() => setSelectedFolderId(folder.id)}
              className={selectedFolderId === folder.id ? 'selected' : undefined}
              style={{ cursor: 'pointer' }}
            >
              {folder.id === '-1' ? (
                <IoHomeOutline size={20} />
              ) : (
                <HiOutlineFolder size={20} />
              )}
              <span className="folder-name">
                {folder.name}
                {folder.isArchived && <strong>&nbsp;&nbsp;(Archived)</strong>}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="cta-container">
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
        <button
          disabled={!selectedFolderId}
          onClick={() => selectedFolderId && onConfirm(selectedFolderId)}
          className="confirm-btn"
        >
          {loading ? (
            <Loader size="sm" color="black" />
          ) : (
            <p>Move</p>
          )}
        </button>
      </div>
    </Modal>
  );
}
