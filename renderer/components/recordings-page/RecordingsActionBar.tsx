import React, { useState } from 'react';
import styles from '../../styles/modules/RecordingsPage.module.scss';
import ArchiveMultipleVideosModal from '../overlays/modals/ArchiveMultipleVideosModal';
import DeleteMultipleVideosModal from '../overlays/modals/DeleteMultipleVideosModal';
import MoveMultipleRecordingsModal from '../overlays/modals/MoveMultipleRecordingsModal';
import TurnOffAutoArchiveModal from '../overlays/modals/TurnOffAutoArchiveModal';

type FolderModel = {
  id: string;
  name: string;
  isShared?: boolean;
  isArchived?: boolean;
  recordingCount?: number;
  archivedRecordingCount?: number;
};

type RecordingsActionBarProps = {
  loading: boolean;
  isUserPremium: boolean;
  folders: FolderModel[];
  currentFolder?: FolderModel;
  isArchivedPage?: boolean;
  selectedRecordings: string[];
  onDeleteConfirm: () => Promise<void>;
  onArchiveConfirm?: () => Promise<void>;
  onMoveConfirm: (folderId: string) => void;
  onTurnOffAutoArchiveConfirm: () => Promise<void>;
  onCancelConfirm: () => void;
};

export default function RecordingsActionBar({
  selectedRecordings,
  folders,
  loading,
  currentFolder,
  isUserPremium,
  isArchivedPage,
  onArchiveConfirm,
  onMoveConfirm,
  onDeleteConfirm,
  onTurnOffAutoArchiveConfirm,
  onCancelConfirm,
}: RecordingsActionBarProps) {
  const recordingsCount = selectedRecordings.length;
  const [deleteRecordingsModalOpened, setDeleteRecordingsModalOpened] = useState(false);
  const [archiveRecordingsModalOpened, setArchiveRecordingsModalOpened] = useState(false);
  const [moveMultipleRecordingsModalOpened, setMoveMultipleRecordingsModalOpened] = useState(false);
  const [turnOffAutoArchiveModalOpened, setTurnOffAutoArchiveModalOpened] = useState(false);

  return (
    <>
      <div className={styles.actionBar}>
        <p>{selectedRecordings.length} video{selectedRecordings.length > 1 && 's'} selected</p>
        <div className={styles.actionBarBtns}>
          {!isArchivedPage && isUserPremium && (
            <button onClick={() => setTurnOffAutoArchiveModalOpened(true)}>
              Turn off Auto Archive
            </button>
          )}
          <button onClick={() => setMoveMultipleRecordingsModalOpened(true)}>
            Move to Folder
          </button>
          {(isUserPremium || (!isArchivedPage && !isUserPremium)) && onArchiveConfirm && (
            <button onClick={() => setArchiveRecordingsModalOpened(true)}>
              {isArchivedPage ? 'Un-Archive' : 'Archive'}
            </button>
          )}
          <button 
            onClick={() => setDeleteRecordingsModalOpened(true)} 
            style={{ color: 'red' }}
          >
            Delete
          </button>
          <button onClick={onCancelConfirm}>Cancel</button>
        </div>
      </div>
      <DeleteMultipleVideosModal
        open={deleteRecordingsModalOpened}
        selectedRecordingsCount={recordingsCount}
        loading={loading}
        onClose={() => setDeleteRecordingsModalOpened(false)}
        onConfirm={async () => {
          try {
            await onDeleteConfirm();
            setDeleteRecordingsModalOpened(false);
          } catch (error) {
            console.error("Error during deletion:", error);
          } finally {
            setDeleteRecordingsModalOpened(false);
          }
        }}
      />
      <ArchiveMultipleVideosModal
        open={archiveRecordingsModalOpened}
        selectedRecordingsCount={recordingsCount}
        loading={loading}
        isArchivedPage={isArchivedPage ?? false}
        onClose={() => setArchiveRecordingsModalOpened(false)}
        onConfirm={async () => {
          try {
            if (onArchiveConfirm) {
              await onArchiveConfirm();
            }
          } catch (error) {
            console.error("Error during archive:", error);
          } finally {
            setArchiveRecordingsModalOpened(false);
          }
        }}
      />
      <MoveMultipleRecordingsModal
        loading={loading}
        folders={folders}
        currentFolder={currentFolder}
        selectedRecordingsCount={recordingsCount}
        open={moveMultipleRecordingsModalOpened}
        onConfirm={onMoveConfirm}
        onClose={() => setMoveMultipleRecordingsModalOpened(false)}
      />
      <TurnOffAutoArchiveModal
        open={turnOffAutoArchiveModalOpened}
        selectedRecordingsCount={recordingsCount}
        loading={loading}
        onClose={() => setTurnOffAutoArchiveModalOpened(false)}
        onConfirm={onTurnOffAutoArchiveConfirm}
      />
    </>
  );
}
