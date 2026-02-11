import { create } from 'zustand';

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

type AuthState = {
  ventoUser: any | null;
  recordingNo: number;
  loadingUser: LoadingState;
  setVentoUser: (user: any | null) => void;
  setRecordingNo: (count: number) => void;
  setLoadingUser: (state: LoadingState) => void;
  signOut: () => void;
};

/**
 * Simple auth store for VentoDesktop.
 * This mirrors just the pieces we need from the web app's auth provider.
 * Replace implementations with real auth wiring when backend is connected.
 */
export const useAuth = create<AuthState>((set) => ({
  ventoUser: null,
  recordingNo: 0,
  loadingUser: 'idle',
  setVentoUser: (ventoUser) => set({ ventoUser }),
  setRecordingNo: (recordingNo) => set({ recordingNo }),
  setLoadingUser: (loadingUser) => set({ loadingUser }),
  signOut: () => {
    localStorage.removeItem('vento-token');
    set({ ventoUser: null, recordingNo: 0 });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },
}));

