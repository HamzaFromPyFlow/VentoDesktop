import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Skeleton } from '@mantine/core';
import { BsThreeDots } from 'react-icons/bs';
import { GrFormView } from 'react-icons/gr';
import { MdOutlineArchive } from 'react-icons/md';
import RecordingItemDropdown from '../dropdowns/RecordingItemDropdown';
import { generateUrl, formatVideoDurationMinutes } from '../../lib/utils';
import styles from '../../styles/modules/RecordingsPage.module.scss';

// TODO: Define proper types
type RecordingModalItem = {
  id: string;
  title?: string;
  thumbnailUrl?: string;
  videoDuration?: string;
  encodingStatus?: string;
  recordingTimeStr?: string;
  isEditable?: boolean;
  autoArchiveDisabled?: boolean;
  createdAt: string;
  isArchived?: boolean;
  metadata?: any;
  userId?: string;
  videoUrl?: string;
};

type FolderViewModel = {
  id: string;
  name: string;
};

type RecordingItemProps = {
  recording: RecordingModalItem;
  folders: FolderViewModel[];
  isCheckboxMode: boolean;
  isSelected: boolean;
  onCheckboxChange: (isSelected: boolean) => void;
  onUpdateTitle: (title: string) => Promise<void>;
  onDeleteConfirm: () => void;
  onArchiveConfirm?: () => Promise<void>;
  onTurnOffAutoArchiveConfirm: () => Promise<void>;
  onMoveConfirm: (folderId: string) => void;
  onUpdatePassword: (password?: string) => void;
  onClick?: (e: React.MouseEvent) => void;
  viewCount?: number;
  hideActions?: boolean;
};

export default function RecordingItem({
  recording,
  folders,
  isCheckboxMode,
  isSelected,
  onCheckboxChange,
  onDeleteConfirm,
  onArchiveConfirm,
  onMoveConfirm,
  onUpdatePassword,
  onUpdateTitle,
  onTurnOffAutoArchiveConfirm,
  onClick,
  viewCount,
  hideActions,
}: RecordingItemProps) {
  const [searchParams] = useSearchParams();
  
  const getImageSrc = (recording: RecordingModalItem) => {
    const defaultThumbnail = "/assets/default-video-thumbnail.png";
    if (recording.encodingStatus !== "DONE") {
      return defaultThumbnail;
    }
    return recording.thumbnailUrl ?? defaultThumbnail;
  };
  
  const imageSource = getImageSrc(recording);
  const recordingUrl = !isCheckboxMode ? generateUrl(`/view/${recording.id}`, searchParams) : undefined;

  return (
    <a
      key={recording.id}
      href={recordingUrl}
      className={`${styles.recordingItem} ${!hideActions ? styles.multiSelect : ''}`}
      onClick={
        isCheckboxMode && onClick
          ? (e) => {
              e.preventDefault();
              onClick(e);
            }
          : undefined
      }
    >
      <picture className={`${styles.picture} ${isSelected && !hideActions ? styles.selected : ''} ${isCheckboxMode && !hideActions ? styles.checkboxMode : ''}`}>
        <source srcSet={imageSource} type="image/webp" />
        <img
          src={imageSource.replace(".webp", ".jpeg")}
          alt={`Thumbnail for recording of ${recording.title}`}
          loading="lazy"
          className={`${styles.thumbnail} ${!hideActions ? styles.multiSelect : ''} ${isCheckboxMode && !hideActions ? styles.checkboxMode : ''}`}
        />
        {!hideActions && (
          <input
            type="checkbox"
            checked={isSelected}
            style={isCheckboxMode ? { pointerEvents: 'none' } : undefined}
            onChange={(e) => {
              onCheckboxChange(e.target.checked);
            }}
            className={styles.checkbox}
            aria-label={`Select ${recording.title}`}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {!!recording.videoDuration && recording.videoDuration !== "0.00" && (
          <span className={styles.timestamp}>
            {formatVideoDurationMinutes(parseFloat(recording.videoDuration ?? '0'))}
          </span>
        )}
      </picture>

      <div className={styles.data}>
        <div>
          <span className={styles.title}>{recording.title}</span>
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {!hideActions && !isCheckboxMode && (
              <RecordingItemDropdown
                recording={recording}
                allowEdit={recording.isEditable}
                folders={folders}
                onDeleteConfirm={onDeleteConfirm}
                onArchiveConfirm={onArchiveConfirm}
                onMoveConfirm={onMoveConfirm}
                onUpdatePassword={onUpdatePassword}
                onUpdateTitle={onUpdateTitle}
                onTurnOffAutoArchiveConfirm={onTurnOffAutoArchiveConfirm}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className={styles.menuBtn}
                >
                  <BsThreeDots size={15} />
                </button>
              </RecordingItemDropdown>
            )}
          </div>
        </div>
        <div>
          <span className={styles.timeStr}>{recording.recordingTimeStr || 'Recently'}</span>
          {!hideActions && (
            <span className={styles.viewCount}>
              {recording.autoArchiveDisabled && (
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '31px',
                    height: '32px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: '8px', color: 'black' }}>Auto</p>
                    <MdOutlineArchive size={16} />
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      border: '2px solid gray',
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '0',
                      width: '100%',
                      height: '2px',
                      backgroundColor: 'gray',
                      transform: 'rotate(38deg) translateY(-50%)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              )}
              <GrFormView size={22.5} />
              {viewCount !== undefined ? viewCount : <Skeleton height={10} width={20} radius="xl" />}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
