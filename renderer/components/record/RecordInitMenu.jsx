import React, { useState } from 'react';
import { Loader } from '@mantine/core';
import { CgRecord } from 'react-icons/cg';
import { useRecordStore } from '../../stores/recordStore';
import { useSettingsStore } from '../../stores/settingsStore';
import InputSettings from './InputSettings';
import CameraOnlyRecordingToolbar from './CameraOnlyRecordingToolbar';

// Desktop clone of the vento premium record-init-menu component.
// This matches the structure and behavior of the original, but simplified
// for desktop (no network checks, payments, or real recording yet).

function RecordInitMenu() {
  const { recordingState, setRecordingState, lastDisplayType, setLastDisplayType, mediaRecorder } =
    useRecordStore((state) => ({
      recordingState: state.recordingState,
      setRecordingState: state.setRecordingState,
      lastDisplayType: state.lastDisplayType,
      setLastDisplayType: state.setLastDisplayType,
      mediaRecorder: state.mediaRecorder,
    }));

  const { mode, selectedVideoInputId } = useSettingsStore((state) => ({
    mode: state.mode,
    selectedVideoInputId: state.selectedVideoInputId,
  }));

  const [preparing, setPreparing] = useState(false);

  // If user is recording camera only
  const isCameraRecording = recordingState === 'recording-cam';

  /**
   * Before we allow user to start recording, we need to check if user has reached their recording limit.
   * Simplified version for desktop - just starts recording without API checks.
   */
  async function startRecord() {
    setPreparing(true);
    setLastDisplayType('monitor');
    
    // Check if camera mode but no video source selected
    if (mode === 'camera' && selectedVideoInputId === 'none') {
      // In desktop, we'll just proceed anyway for now
      console.warn('Camera mode selected but no video source');
      setPreparing(false);
      return;
    }

    // Simulate a brief delay (like network checks in original)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For desktop, we'll just simulate starting recording
    setPreparing(false);
    setRecordingState('recording-cam');
  }

  /**
   * This is the function that is called when user clicks on the pause button.
   */
  function onCameraRecordingPause() {
    if (localStorage?.getItem('hasPaused') === 'true' && localStorage.getItem('hasPausedSecond') !== 'true') {
      localStorage.setItem('hasPausedSecond', 'true');
    }
    localStorage.setItem('hasPaused', 'true');

    const event = new CustomEvent('VENTO_EDITOR_STOP');
    document.dispatchEvent(event);

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    // For desktop, just stop recording state
    setRecordingState('none');
  }

  /**
   * This is the function that is called when user clicks on the finish button.
   * @param redirectToEditor - If true, open the editor component after recording is done.
   */
  async function onCameraRecordingStop(redirectToEditor = true) {
    const event = new CustomEvent('VENTO_EDITOR_STOP');
    document.dispatchEvent(event);

    // Stop recording if we are
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    // For desktop, just reset state
    setRecordingState('none');
    setPreparing(false);
  }

  return (
    <>
      {/* Prompt - only show when not recording */}
      {recordingState !== 'recording-cam' && (
        <p className="mb-3 text-base text-gray-700 text-center max-w-[800px] mx-auto px-4 md:px-6">
          An audio chime will play when recording starts! <strong>PS:</strong> Make sure your browser is up to date!
        </p>
      )}

      {/* InputSettings wrapper*/}
      <div className="max-w-[650px] mx-auto px-4 md:px-6 py-4 md:py-6">
        <InputSettings onResolutionClick={() => console.log('Resolution click - modal coming soon')}>
          {isCameraRecording ? (
            <CameraOnlyRecordingToolbar
              onPause={onCameraRecordingPause}
              onStop={(finishAndSave) => onCameraRecordingStop(!finishAndSave)}
            />
          ) : (
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#68E996] py-3 text-base font-medium text-black shadow-md hover:bg-[#4fd47f] disabled:opacity-60"
              id="startRecordingBtn"
              onClick={startRecord}
              disabled={preparing}
              type="button"
            >
              {preparing ? (
                <Loader size="sm" color="#fff" />
              ) : (
                <>
                  Start Recording
                  <CgRecord size="1.25rem" />
                </>
              )}
            </button>
          )}
        </InputSettings>
      </div>
    </>
  );
}

export default RecordInitMenu;
