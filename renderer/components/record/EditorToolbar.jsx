import { useState, useReducer } from 'react';
import { Tooltip, Modal, Loader, Popover } from '@mantine/core';
import { BsFillPlayFill } from 'react-icons/bs';
import { IoIosPause } from 'react-icons/io';
import { MdDone, MdFiberManualRecord } from 'react-icons/md';
import { FaUndo } from 'react-icons/fa';
import { VscTrash } from 'react-icons/vsc';
import { IoSettingsOutline } from 'react-icons/io5';
import { RiTimerLine } from 'react-icons/ri';
import { useEditorStore } from '../../stores/editorStore';
import { useRecordStore } from '../../stores/recordStore';
import { formatTimer } from '../../lib/helper-pure';
import styles from '../../styles/modules/Toolbar.module.scss';
import cx from 'classnames';

/**
 * Enhanced Editor Toolbar component for desktop editor.
 * Features:
 * - Play/pause controls
 * - Trim button/mode
 * - Blur button/mode
 * - CTA button/mode
 * - Delete/undo actions
 */

function EditorToolbar({ onStop, onPause, videoLoaded, isVideoEdit, onCancelEdit }) {
  const [undoAllEditsLoading, setUndoAllEditsLoading] = useState(false);
  const [showEditToolTip, setShowEditToolTip] = useState(false);
  const [timerPopupOpen, setTimerPopupOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modalStates, setModalStates] = useReducer(
    (prev, current) => ({ ...prev, ...current }),
    {
      deleteConfirm: false,
      cancelEditConfirm: false,
      undoEditsCompleted: false,
      settings: false,
    }
  );

  const {
    toggleVideo,
    isPlaying,
    hasDraggedCursor,
    totalVideoDuration,
  } = useEditorStore((state) => ({
    toggleVideo: state.toggleVideo,
    isPlaying: state.isPlaying(),
    hasDraggedCursor: state.hasDraggedCursor,
    totalVideoDuration: state.totalVideoDuration,
  }));

  const { recordingState, currentRecordingTime, elapsedRecordingTime, maxRecordingTime } = useRecordStore((state) => ({
    recordingState: state.recordingState,
    currentRecordingTime: state.currentRecordingTime,
    elapsedRecordingTime: state.elapsedRecordingTime,
    maxRecordingTime: state.maxRecordingTime,
  }));

  const showDragTip = !hasDraggedCursor;
  const isRecording = recordingState === "recording" || recordingState === "recording-cam";
  const isPaused = recordingState === "paused";
  const reachedMaxRecordingTime = currentRecordingTime <= 0;

  // Use currentRecordingTime (remaining recording time) like the web version
  // This represents the countdown/remaining time, not the total video duration
  const displayTime = currentRecordingTime;

  function handleCancel() {
    const event = new CustomEvent('VENTO_EDITOR_STOP');
    document.dispatchEvent(event);
    onStop?.(false);
  }

  async function handleCancelEdit() {
    setUndoAllEditsLoading(true);
    // TODO: Implement undo edits logic
    setTimeout(() => {
      setUndoAllEditsLoading(false);
      setModalStates({ undoEditsCompleted: true, cancelEditConfirm: false });
    }, 1000);
  }

  return (
    <>
      <div className={cx(styles.toolbar, 'toolbar')}>
        <div className={styles.statusText}>
          <div
            className={cx(styles.status, {
              [styles.statusPaused]: !isRecording,
            })}
          >
            <MdFiberManualRecord />
            {reachedMaxRecordingTime ? (
              "Max recording time reached"
            ) : (
              <>
                {isRecording ? "Recording" : "Paused"}
                <span className={styles.timer}>
                  {formatTimer(displayTime)}
                </span>
              </>
            )}
          </div>
        </div>

        {showDragTip && (
          <span className={cx(styles.dragCursorTip, 'drag-cursor-tip')}>
            Drag <div className="cursor" /> below the video to rewind!
          </span>
        )}

        <div className={styles.buttons}>
          <Popover
            opened={timerPopupOpen}
            onChange={setTimerPopupOpen}
            position="right"
            withArrow
            shadow="md"
          >
            <Popover.Target>
              <Tooltip label="Set recording countdown">
                <button onClick={() => setTimerPopupOpen(true)}>
                  <RiTimerLine size={20} />
                </button>
              </Tooltip>
            </Popover.Target>
            <Popover.Dropdown>
              <label>Countdown</label>
              <ul className="btn-group">
                <li>
                  <button onClick={() => setTimerPopupOpen(false)}>None</button>
                </li>
                <li>
                  <button onClick={() => setTimerPopupOpen(false)}>3s</button>
                </li>
                <li>
                  <button onClick={() => setTimerPopupOpen(false)}>5s</button>
                </li>
              </ul>
            </Popover.Dropdown>
          </Popover>

          <Tooltip label="Finish editing recording">
            <button
              id="editorCompleteButton"
              onClick={() => onStop?.(true)}
              disabled={!videoLoaded}
              style={videoLoaded ? {} : { pointerEvents: 'none', opacity: '0.5' }}
            >
              Save Video
              <MdDone />
            </button>
          </Tooltip>

          <Tooltip label="Undo All Edits">
            <button
              id="cancelEditButton"
              onClick={() => setModalStates({ cancelEditConfirm: true })}
              disabled={!isVideoEdit}
              style={isVideoEdit ? {} : { pointerEvents: 'none', opacity: '0.5' }}
            >
              Undo All Edits
              <FaUndo style={{ width: '20px', paddingLeft: '5px' }} />
            </button>
          </Tooltip>

          <Popover
            opened={showEditToolTip}
            onChange={setShowEditToolTip}
            position="top"
            withArrow
            shadow="md"
          >
            <Popover.Target>
              <Tooltip label="Input Settings" zIndex={20}>
                <button onClick={() => setModalStates({ settings: true })}>
                  <IoSettingsOutline size={20} />
                </button>
              </Tooltip>
            </Popover.Target>
            <Popover.Dropdown>
              <p>Change your camera & audio settings here before re-recording</p>
            </Popover.Dropdown>
          </Popover>

          <Tooltip label="Delete recording">
            <button
              id="editorStopButton"
              onClick={() => setModalStates({ deleteConfirm: true })}
            >
              <VscTrash size={20} />
            </button>
          </Tooltip>
        </div>
      </div>

      <Modal
        opened={modalStates.deleteConfirm}
        onClose={() => setModalStates({ deleteConfirm: false })}
        title="Delete Recording?"
        centered
        size="auto"
        classNames={{
          root: 'vento-modal',
        }}
      >
        <p>This action is permanent</p>
        <div className="cta-container">
          <button
            onClick={() => setModalStates({ deleteConfirm: false })}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button onClick={handleCancel} className="confirm-btn--delete">
            Yes, Delete
          </button>
        </div>
      </Modal>

      <Modal
        opened={modalStates.cancelEditConfirm && !modalStates.undoEditsCompleted}
        onClose={() => setModalStates({ cancelEditConfirm: false })}
        title={
          <>
            <p style={{ fontSize: '16px' }}>
              Selecting &quot;Undo All Edits&quot; will undo all changes you&apos;ve made since
              your last save.
              <b>This cannot be undone</b>
            </p>
          </>
        }
        centered
        size="auto"
        classNames={{
          root: 'vento-modal',
        }}
      >
        <div className="cta-container">
          <button
            onClick={() => setModalStates({ cancelEditConfirm: false })}
            className="cancel-btn"
            style={{
              borderRadius: '7.5px',
              background: '#F7F7F7!',
            }}
          >
            <b>Continue Editing</b>
          </button>
          <button onClick={handleCancelEdit} className="confirm-btn--delete">
            {undoAllEditsLoading ? (
              <Loader size="sm" color="black" />
            ) : (
              <b>Undo All Edits</b>
            )}
          </button>
        </div>
      </Modal>
    </>
  );
}

export default EditorToolbar;
