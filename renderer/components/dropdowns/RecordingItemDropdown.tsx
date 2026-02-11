import React from 'react';
import { Menu } from '@mantine/core';
import { BsThreeDots } from 'react-icons/bs';

// TODO: Define proper types
type RecordingModalItem = any;
type FolderViewModel = any;

type RecordingItemDropdownProps = {
  recording: RecordingModalItem;
  children?: React.ReactNode;
  allowEdit?: boolean;
  folders: FolderViewModel[];
  onDeleteConfirm: () => void;
  onArchiveConfirm?: () => Promise<void>;
  onMoveConfirm: (folderId: string) => void;
  onUpdatePassword: (password?: string) => void;
  onUpdateTitle: (title: string) => Promise<void>;
  onTurnOffAutoArchiveConfirm: () => Promise<void>;
};

export default function RecordingItemDropdown({
  recording,
  allowEdit,
  folders,
  onDeleteConfirm,
  onMoveConfirm,
  onArchiveConfirm,
  onUpdatePassword,
  onUpdateTitle,
  onTurnOffAutoArchiveConfirm,
  children,
}: RecordingItemDropdownProps) {
  // TODO: Implement full dropdown menu with all options
  // For now, this is a placeholder
  return (
    <Menu shadow="md" position="right" radius="md">
      <Menu.Target>
        {children || (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            style={{
              width: '2rem',
              height: '2rem',
              padding: '0px',
              borderRadius: '100%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
            }}
          >
            <BsThreeDots size={15} />
          </button>
        )}
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={onDeleteConfirm}>Delete</Menu.Item>
        {onArchiveConfirm && (
          <Menu.Item onClick={() => onArchiveConfirm()}>
            Archive
          </Menu.Item>
        )}
        {/* TODO: Add more menu items */}
      </Menu.Dropdown>
    </Menu>
  );
}
