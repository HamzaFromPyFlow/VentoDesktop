import { create } from 'zustand';

// Minimal recording store for VentoDesktop.
// This mirrors just the pieces used by the desktop RecordInitMenu.

export const useRecordStore = create((set) => ({
  recordingState: 'none', // "none" | "recording-cam" | "recording"
  lastDisplayType: 'monitor', // "monitor" | "camera" | "selection"
  mediaRecorder: null, // MediaRecorder instance (will be set when recording starts)

  setLastDisplayType: (newState) => set({ lastDisplayType: newState }),
  setRecordingState: (newState) => set({ recordingState: newState }),
  setMediaRecorder: (recorder) => set({ mediaRecorder: recorder }),
}));

