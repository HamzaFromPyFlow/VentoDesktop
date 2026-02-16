import React, { useReducer, useState } from 'react';
import { Menu, Modal, TextInput, Loader, Select } from '@mantine/core';
import { BsThreeDots } from 'react-icons/bs';
import { GrCode } from 'react-icons/gr';
import { AiFillLock } from 'react-icons/ai';
import { CgRename } from 'react-icons/cg';
import { MdOutlineEdit, MdOutlineArchive, MdOutlineUnarchive } from 'react-icons/md';
import { HiDownload, HiOutlineFolder } from 'react-icons/hi';
import { BiLink } from 'react-icons/bi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { IoDiamondOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';

import { useAuth } from '../../stores/authStore';
import { isUserFreePlan } from '../../lib/payment-helper';
import { logClientEvent, onCopyLink } from '../../lib/misc';
import webAPI from '../../lib/webapi';
import SetPasswordModal from '../overlays/modals/SetPasswordModal';
import DownloadVideoModal from '../overlays/modals/DownloadVideoModal';
import DownloadPricingModal from '../overlays/modals/DownloadPricingModal';
import PricingPageModal from '../overlays/modals/PricingPageModal';
import TurnOffAutoArchiveModal from '../overlays/modals/TurnOffAutoArchiveModal';

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
  position?: 'bottom' | 'right' | 'left' | 'top';
};

type ModalStates = {
  renameVideo: boolean;
  moveToFolder: boolean;
  deleteVideoConfirmation: boolean;
  addPassword: boolean;
  removePassword: boolean;
  pageAuthenticated: boolean;
  downloadVideoModal: boolean;
  downloadPricingModal: boolean;
  pricingPageModal: boolean;
  turnOffAutoArchiveModal: boolean;
};

type PasswordStates = {
  password: string;
  confirmPassword: string;
  currentPassword: string;
  passwordErrors: {
    newPasswordError: string;
    newConfirmedPasswordError: string;
    currentPasswordError: string;
  };
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
  position = 'right',
  children,
}: RecordingItemDropdownProps) {
  const { ventoUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const [modalStates, setModalStates] = useReducer(
    (prev: ModalStates, cur: Partial<ModalStates>) => ({ ...prev, ...cur }),
    {
      renameVideo: false,
      moveToFolder: false,
      deleteVideoConfirmation: false,
      addPassword: false,
      removePassword: false,
      pageAuthenticated: false,
      downloadVideoModal: false,
      downloadPricingModal: false,
      pricingPageModal: false,
      turnOffAutoArchiveModal: false,
    }
  );

  const [passwordStates, setPasswordStates] = useReducer(
    (prev: PasswordStates, cur: Partial<PasswordStates>) => ({ ...prev, ...cur }),
    {
      password: '',
      confirmPassword: '',
      currentPassword: '',
      passwordErrors: {
        newPasswordError: '',
        newConfirmedPasswordError: '',
        currentPasswordError: '',
      },
    }
  );

  const [renameTitle, setRenameTitle] = useState(recording.title || '');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  function onCopyEmbed(e: React.MouseEvent) {
    e.preventDefault();
    webAPI.recording.recordingUpdateRecording(recording.id, {
      embedded_created: true,
    });
    
    const baseUrl = window.location.origin;
    const embeddedVideo = `<iframe src="${baseUrl}/#/view/${recording.id}/embed" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>`;
    const code = `<div style="position: relative; padding-bottom: 64.94708994708994%; height: 0;">${embeddedVideo}</div>`;

    navigator.clipboard.writeText(code);

    showNotification({
      message: 'Embedded code copied to clipboard!',
      icon: <BiLink color="white" />,
      autoClose: 2000,
    });

    logClientEvent('click.recording.more', {
      action: 'Copy Embed',
    });
  }

  async function onDownloadVideo() {
    if (isUserFreePlan(ventoUser)) {
      const downloadsCount = ventoUser?.downloadsLimit ?? 0;
      if (downloadsCount <= 0) {
        setModalStates({ downloadPricingModal: true });
        return;
      }
      setModalStates({ downloadVideoModal: true });
    } else {
      await handleDownload();
    }
  }

  async function handleDownload() {
    setDownloadLoading(true);
    try {
      const downloadUrl = `/#/view/${recording.id}/download`;
      window.open(downloadUrl, '_blank');
      logClientEvent('click.recording.more', {
        action: 'Download Recording',
      });
    } catch (error) {
      console.error('Error downloading video:', error);
    } finally {
      setDownloadLoading(false);
      setModalStates({ downloadVideoModal: false });
    }
  }

  async function handleRename() {
    if (!renameTitle.trim()) {
      setModalStates({ renameVideo: false });
      return;
    }

    setLoading(true);
    try {
      await onUpdateTitle(renameTitle.trim());
      setModalStates({ renameVideo: false });
      showNotification({
        message: 'Recording renamed successfully!',
        color: 'green',
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Error renaming recording:', error);
      showNotification({
        message: 'Failed to rename recording',
        color: 'red',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleMoveToFolder() {
    if (!selectedFolderId) {
      setModalStates({ moveToFolder: false });
      return;
    }

    setLoading(true);
    try {
      await onMoveConfirm(selectedFolderId);
      setModalStates({ moveToFolder: false });
      setSelectedFolderId(null);
    } catch (error) {
      console.error('Error moving recording:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPassword(password: string) {
    setLoading(true);
    try {
      await onUpdatePassword(password);
      setModalStates({ addPassword: false, removePassword: false });
      setPasswordStates({
        password: '',
        confirmPassword: '',
        passwordErrors: {
          newPasswordError: '',
          newConfirmedPasswordError: '',
          currentPasswordError: '',
        },
      });
      showNotification({
        message: 'Password protection enabled!',
        color: 'green',
        autoClose: 2000,
      });
    } catch (error: any) {
      console.error('Error setting password:', error);
      showNotification({
        message: error.message || 'Failed to set password',
        color: 'red',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRemovePassword() {
    setLoading(true);
    try {
      await onUpdatePassword(undefined);
      setModalStates({ removePassword: false });
      showNotification({
        message: 'Password protection disabled!',
        color: 'green',
        autoClose: 2000,
      });
    } catch (error: any) {
      console.error('Error removing password:', error);
      showNotification({
        message: error.message || 'Failed to remove password',
        color: 'red',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleEditRecording() {
    if (recording.videoUrl?.endsWith('.mp4')) {
      showNotification({
        message: 'This video needs to be reprocessed before editing',
        color: 'orange',
        autoClose: 3000,
      });
      return;
    }
    navigate(`/record/${recording.id}/edit`);
  }

  const folderOptions = [
    { value: '-1', label: 'No Folder' },
    ...folders.map((folder: FolderViewModel) => ({
      value: folder.id,
      label: folder.name,
    })),
  ];

  return (
    <>
      <Menu shadow="md" position={position} radius="md">
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
          {!recording.isArchived && (
            <Menu.Item onClick={onCopyEmbed} icon={<GrCode size={14} />}>
              Get Embed Code
            </Menu.Item>
          )}
          {!recording.isArchived && (
            <Menu.Item
              onClick={(e) => {
                e.preventDefault();
                if (isUserFreePlan(ventoUser)) {
                  setModalStates({ pricingPageModal: true });
                  return;
                }
                if (recording.metadata?.password) {
                  setModalStates({ removePassword: true });
                } else {
                  setModalStates({ addPassword: true });
                }
                logClientEvent('click.recording.more', {
                  action: 'Password Protection',
                });
              }}
              icon={<AiFillLock size={14} />}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {recording.metadata?.password ? 'Disable' : 'Enable'} Password Protection
                {isUserFreePlan(ventoUser) && (
                  <IoDiamondOutline size={18} style={{ verticalAlign: 'middle' }} />
                )}
              </span>
            </Menu.Item>
          )}
          {!recording.isArchived && (
            <Menu.Item
              onClick={(e) => {
                e.preventDefault();
                setRenameTitle(recording.title || '');
                setModalStates({ renameVideo: true });
              }}
              icon={<CgRename size={14} />}
            >
              Rename Recording
            </Menu.Item>
          )}
          {allowEdit && !recording.isArchived && (
            <Menu.Item
              onClick={(e) => {
                e.preventDefault();
                handleEditRecording();
              }}
              icon={<MdOutlineEdit size={14} />}
            >
              Edit Recording
            </Menu.Item>
          )}
          {(!ventoUser || isUserFreePlan(ventoUser)) && !recording.isArchived && !allowEdit && (
            <Menu.Item
              onClick={(e) => {
                e.preventDefault();
                setModalStates({ pricingPageModal: true });
              }}
              icon={<MdOutlineEdit size={14} />}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Edit Recording
                <IoDiamondOutline size={18} style={{ verticalAlign: 'middle' }} />
              </span>
            </Menu.Item>
          )}
          {!recording.isArchived && (
            <Menu.Item onClick={onDownloadVideo} icon={<HiDownload size={14} />}>
              Download Recording
            </Menu.Item>
          )}
          {!recording.isArchived && (
            <Menu.Item
              onClick={(e) => {
                e.preventDefault();
                webAPI.recording.recordingUpdateRecording(recording.id, {
                  updatedAt: new Date().toISOString(),
                });
                const currentUrl = `${window.location.origin}/#/view/${recording.id}`;
                onCopyLink(currentUrl);
                logClientEvent('click.recording.more', {
                  action: 'Copy Link',
                });
              }}
              icon={<BiLink size={14} />}
            >
              Copy Link
            </Menu.Item>
          )}
          <Menu.Item
            onClick={(e) => {
              e.preventDefault();
              setSelectedFolderId(null);
              setModalStates({ moveToFolder: true });
            }}
            icon={<HiOutlineFolder size={14} />}
          >
            Move to ...
          </Menu.Item>
          {onArchiveConfirm && (
            <Menu.Item
              onClick={async (e) => {
                e.preventDefault();
                if (isUserFreePlan(ventoUser) && recording.isArchived) {
                  setModalStates({ pricingPageModal: true });
                  return;
                }
                if (recording.isArchived) {
                  await onArchiveConfirm();
                } else {
                  // Show archive confirmation
                  if (window.confirm('Are you sure you want to archive this recording?')) {
                    await onArchiveConfirm();
                  }
                }
              }}
              icon={recording.isArchived ? <MdOutlineUnarchive size={16} /> : <MdOutlineArchive size={16} />}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {!recording.isArchived ? 'Archive Video' : 'Un-archive Video'}
                {isUserFreePlan(ventoUser) && recording.isArchived && (
                  <IoDiamondOutline size={18} style={{ verticalAlign: 'middle' }} />
                )}
              </span>
            </Menu.Item>
          )}
          {!(recording.isArchived || recording.autoArchiveDisabled) && (
            <Menu.Item
              onClick={(e) => {
                e.preventDefault();
                if (isUserFreePlan(ventoUser)) {
                  setModalStates({ pricingPageModal: true });
                  return;
                }
                setModalStates({ turnOffAutoArchiveModal: true });
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '19px',
                    height: '20px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: '4px', color: 'black' }}>Auto</p>
                    <MdOutlineArchive size={12} />
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Turn off Auto Archive
                  {isUserFreePlan(ventoUser) && (
                    <IoDiamondOutline size={18} style={{ verticalAlign: 'middle' }} />
                  )}
                </span>
              </div>
            </Menu.Item>
          )}
          <Menu.Item
            onClick={(e) => {
              e.preventDefault();
              setModalStates({ deleteVideoConfirmation: true });
            }}
            icon={<RiDeleteBinLine size={14} />}
            style={{ color: '#dc3545' }}
          >
            Delete Recording
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {/* Rename Modal */}
      <Modal
        opened={modalStates.renameVideo}
        onClose={() => {
          setModalStates({ renameVideo: false });
          setRenameTitle(recording.title || '');
        }}
        title="Rename Recording"
        centered
        size="auto"
        classNames={{
          root: 'vento-modal',
        }}
      >
        <TextInput
          value={renameTitle}
          onChange={(e) => setRenameTitle(e.currentTarget.value)}
          placeholder="Enter recording title"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleRename();
            }
          }}
          style={{ marginBottom: '20px', width: '350px' }}
        />
        <div className="cta-container">
          <button onClick={() => setModalStates({ renameVideo: false })} className="cancel-btn">
            Cancel
          </button>
          <button onClick={handleRename} className="confirm-btn" disabled={loading || !renameTitle.trim()}>
            {loading ? <Loader size="sm" color="black" /> : 'Rename'}
          </button>
        </div>
      </Modal>

      {/* Move to Folder Modal */}
      <Modal
        opened={modalStates.moveToFolder}
        onClose={() => {
          setModalStates({ moveToFolder: false });
          setSelectedFolderId(null);
        }}
        title="Move to Folder"
        centered
        size="auto"
        classNames={{
          root: 'vento-modal',
        }}
      >
        <Select
          placeholder="Select a folder"
          data={folderOptions}
          value={selectedFolderId}
          onChange={(value) => setSelectedFolderId(value)}
          style={{ marginBottom: '20px', width: '350px' }}
        />
        <div className="cta-container">
          <button
            onClick={() => {
              setModalStates({ moveToFolder: false });
              setSelectedFolderId(null);
            }}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button onClick={handleMoveToFolder} className="confirm-btn" disabled={loading}>
            {loading ? <Loader size="sm" color="black" /> : 'Move'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={modalStates.deleteVideoConfirmation}
        onClose={() => setModalStates({ deleteVideoConfirmation: false })}
        title="Delete Recording"
        centered
        size="auto"
        classNames={{
          root: 'vento-modal',
        }}
      >
        <p>Are you sure you want to delete this recording? This action cannot be undone.</p>
        <div className="cta-container">
          <button onClick={() => setModalStates({ deleteVideoConfirmation: false })} className="cancel-btn">
            Cancel
          </button>
          <button
            onClick={() => {
              onDeleteConfirm();
              setModalStates({ deleteVideoConfirmation: false });
            }}
            className="confirm-btn"
            style={{ backgroundColor: '#dc3545' }}
          >
            Delete
          </button>
        </div>
      </Modal>

      {/* Set Password Modal */}
      <SetPasswordModal
        opened={modalStates.addPassword}
        loading={loading}
        errorMessage={passwordStates.passwordErrors.newPasswordError || passwordStates.passwordErrors.newConfirmedPasswordError}
        onClose={() => {
          setModalStates({ addPassword: false });
          setPasswordStates({
            password: '',
            confirmPassword: '',
            passwordErrors: {
              newPasswordError: '',
              newConfirmedPasswordError: '',
              currentPasswordError: '',
            },
          });
        }}
        onSubmit={handleSetPassword}
      />

      {/* Remove Password Modal */}
      <Modal
        opened={modalStates.removePassword}
        onClose={() => setModalStates({ removePassword: false })}
        title="Remove Password"
        centered
        size="auto"
        classNames={{
          root: 'vento-modal',
        }}
      >
        <p>You&apos;re about to remove password protection for this video</p>
        <div className="cta-container">
          <button onClick={() => setModalStates({ removePassword: false })} className="cancel-btn">
            Cancel
          </button>
          <button onClick={handleRemovePassword} className="confirm-btn" disabled={loading}>
            {loading ? <Loader size="sm" color="black" /> : 'Confirm'}
          </button>
        </div>
      </Modal>

      {/* Download Video Modal */}
      <DownloadVideoModal
        opened={modalStates.downloadVideoModal}
        downloadsCount={ventoUser?.downloadsLimit ?? 0}
        loading={downloadLoading}
        onClose={() => setModalStates({ downloadVideoModal: false })}
        onConfirm={handleDownload}
      />

      {/* Download Pricing Modal */}
      <DownloadPricingModal
        opened={modalStates.downloadPricingModal}
        downloadsCount={ventoUser?.downloadsLimit ?? 0}
        onClose={() => setModalStates({ downloadPricingModal: false })}
        onConfirm={() => {
          setModalStates({ downloadPricingModal: false, pricingPageModal: true });
        }}
      />

      {/* Pricing Page Modal */}
      <PricingPageModal
        opened={modalStates.pricingPageModal}
        onClose={() => setModalStates({ pricingPageModal: false })}
      />

      {/* Turn Off Auto Archive Modal */}
      <TurnOffAutoArchiveModal
        open={modalStates.turnOffAutoArchiveModal}
        loading={loading}
        selectedRecordingsCount={1}
        onClose={() => setModalStates({ turnOffAutoArchiveModal: false })}
        onConfirm={async () => {
          await onTurnOffAutoArchiveConfirm();
          setModalStates({ turnOffAutoArchiveModal: false });
        }}
      />
    </>
  );
}
