import { create } from 'zustand';
import { useSettingsStore } from './settingsStore';

// Recording store for VentoDesktop.
// This is a simplified but real pipeline using MediaRecorder in the renderer.

export const useRecordStore = create((set, get) => ({
  // basic recording state
  recordingState: 'none', // "none" | "recording-cam" | "recording" | "paused"
  lastDisplayType: 'monitor', // "monitor" | "camera" | "selection"
  mediaRecorder: null, // MediaRecorder instance
  currentRecordingTime: 0, // ms
  finalVideoUrl: null, // object URL for the last recorded video

  // actions
  setLastDisplayType: (newState) => set({ lastDisplayType: newState }),
  setRecordingState: (newState) => set({ recordingState: newState }),
  setMediaRecorder: (recorder) => set({ mediaRecorder: recorder }),

  /**
   * Start a simple recording using MediaRecorder.
   * For now:
   * - camera mode: records camera + mic
   * - screen/screencam: records screen + mic (no camera overlay yet)
   */
  startRecording: async () => {
    if (get().mediaRecorder) return;

    const { mode, selectedVideoInputId, selectedAudioInputId } =
      useSettingsStore.getState();

    try {
      let stream;

      // Decide what to capture based on mode
      if (mode === 'camera') {
        // Camera only
        const videoConstraints =
          selectedVideoInputId && selectedVideoInputId !== 'none'
            ? { deviceId: { exact: selectedVideoInputId } }
            : true;
        const audioConstraints =
          selectedAudioInputId && selectedAudioInputId !== 'none'
            ? { deviceId: { exact: selectedAudioInputId } }
            : true;

        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: audioConstraints,
        });
      } else {
        // Screencam / screen / selection -> capture display + optional mic
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        stream = displayStream;
      }

      const chunks = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        const prevUrl = get().finalVideoUrl;
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }

        set({
          finalVideoUrl: url,
          mediaRecorder: null,
          recordingState: 'none',
          currentRecordingTime: 0,
        });

        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(1000);

      set({
        mediaRecorder,
        recordingState: mode === 'camera' ? 'recording-cam' : 'recording',
        currentRecordingTime: 0,
      });
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  },

  /**
   * Stop the current recording (if any).
   */
  stopRecording: () => {
    const { mediaRecorder } = get();
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  },

  /**
   * Reset state when abandoning a recording or discarding preview.
   */
  resetStateForNewRecording: () => {
    const prevUrl = get().finalVideoUrl;
    if (prevUrl) {
      URL.revokeObjectURL(prevUrl);
    }

    set({
      recordingState: 'none',
      mediaRecorder: null,
      currentRecordingTime: 0,
      finalVideoUrl: null,
    });
  },

  /**
   * Increment elapsed recording time (in ms).
   * Returns the updated time so UI can re-render if needed.
   */
  updateRecordedTime: () => {
    const { currentRecordingTime } = get();
    const next = currentRecordingTime + 1000;
    set({ currentRecordingTime: next });
    return next;
  },
}));


