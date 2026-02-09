import { create } from 'zustand';

// Settings store for VentoDesktop - mirrors useSettingsStore from vento web
export const useSettingsStore = create((set, get) => ({
  mode: 'camera', // "camera" | "screencam" | "screen" | "selection"
  selectedVideoInputId: 'none',
  selectedAudioInputId: 'none',
  availableVideoInput: [{ label: 'None', value: 'none' }],
  availableAudioInput: [{ label: 'None', value: 'none' }],
  cameraPosition: null, // { x: number, y: number } - position of camera preview in screencam mode
  cameraSize: { width: 310, height: 180 }, // { width: number, height: number } - size of camera preview in screencam mode (default: w-40 h-28)
  lastSelectedVideoInputId: null, // Store last selected camera to restore when switching back
  
  setMode: (mode) => set({ mode }),
  setSelectedVideoInputId: (id) => set({ selectedVideoInputId: id }),
  setSelectedAudioInputId: (id) => set({ selectedAudioInputId: id }),
  setCameraPosition: (position) => set({ cameraPosition: position }),
  setCameraSize: (size) => set({ cameraSize: size }),
}));
