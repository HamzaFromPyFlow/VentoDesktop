import React from 'react';
import { Menu } from '@mantine/core';
import { BiLink } from 'react-icons/bi';
import { BsThreeDots } from 'react-icons/bs';
import { FaUndo } from 'react-icons/fa';
import { IoShareSocial } from 'react-icons/io5';
import { MdOutlineEdit } from 'react-icons/md';
import { RiDeleteBinLine } from 'react-icons/ri';

type FolderItemDropDownProps = {
  isShared?: boolean;
  isArchived?: boolean;
  onDelete?: () => void;
  onRename?: () => void;
  onShare?: () => void;
  onUnShare?: () => void;
  onCopyLink?: () => void;
};

export default function FolderItemDropdown({
  isShared,
  isArchived,
  onDelete,
  onRename,
  onShare,
  onUnShare,
  onCopyLink,
}: FolderItemDropDownProps) {
  return (
    <Menu shadow="md" position="right" radius="md">
      <Menu.Target>
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
            fill: 'black',
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
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          onClick={(e) => {
            e.preventDefault();
            onRename?.();
          }}
          icon={<MdOutlineEdit size={14} />}
        >
          Rename Folder
        </Menu.Item>
        <Menu.Item
          onClick={(e) => {
            e.preventDefault();
            onDelete?.();
          }}
          icon={<RiDeleteBinLine size={14} />}
          style={{ color: 'red' }}
        >
          Delete Folder
        </Menu.Item>
        {!isShared && !isArchived && (
          <Menu.Item
            onClick={(e) => {
              e.preventDefault();
              onShare?.();
            }}
            icon={<IoShareSocial size={14} />}
          >
            Share Folder
          </Menu.Item>
        )}
        {isShared && !isArchived && (
          <>
            <Menu.Item
              onClick={(e) => {
                e.preventDefault();
                onUnShare?.();
              }}
              icon={<FaUndo size={12} />}
            >
              Unshare Folder
            </Menu.Item>
            <Menu.Item
              onClick={(e) => {
                e.preventDefault();
                onCopyLink?.();
              }}
              icon={<BiLink size={16} />}
            >
              Copy Folder Link
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
