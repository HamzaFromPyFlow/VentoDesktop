import React from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useRecordStore } from '../stores/recordStore';
import { BiVideo, BiMicrophone } from 'react-icons/bi';
import { CgScreen } from 'react-icons/cg';
import { BiSelection } from 'react-icons/bi';
import { BiPlus } from 'react-icons/bi';

function TabButton({ active, children, onClick, value }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={[
        'flex items-center gap-2 px-4 py-2 text-sm md:text-base transition-colors border-b-2',
        active
          ? 'text-black font-medium border-[#68E996]'
          : 'text-gray-500 border-transparent hover:text-gray-700',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export default function InputSettings({ children, onResolutionClick }) {
  const { mode, setMode, selectedVideoInputId, selectedAudioInputId } = useSettingsStore(
    (state) => ({
      mode: state.mode,
      setMode: state.setMode,
      selectedVideoInputId: state.selectedVideoInputId,
      selectedAudioInputId: state.selectedAudioInputId,
    })
  );

  const { recordingState } = useRecordStore((state) => ({
    recordingState: state.recordingState,
  }));

  const isCameraRecording = recordingState === 'recording-cam';

  const handleModeChange = (newMode) => {
    setMode(newMode);
    // When switching to screen/selection, disable camera
    if (newMode === 'screen' || newMode === 'selection') {
      useSettingsStore.setState({ selectedVideoInputId: 'none' });
    }
  };

  return (
    <div className="rounded-[32px] border border-[#F3F3F3] bg-white shadow-[0_22px_80px_rgba(0,0,0,0.06)] p-4 md:p-6 flex flex-col gap-3 max-w-[600px] mx-auto">
      {/* Tabs - only show when not recording */}
      {!isCameraRecording && (
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 border-b border-gray-200 pb-2">
          <TabButton active={mode === 'camera'} onClick={handleModeChange} value="camera">
            <BiVideo size={18} />
            <span>Camera Only</span>
          </TabButton>
          <TabButton active={mode === 'screencam'} onClick={handleModeChange} value="screencam">
            <BiVideo size={18} />
            <span>Camera</span>
            <BiPlus size={14} />
            <CgScreen size={16} />
            <span>Screen</span>
          </TabButton>
          <TabButton active={mode === 'screen'} onClick={handleModeChange} value="screen">
            <CgScreen size={16} />
            <span>Screen Only</span>
          </TabButton>
          <TabButton active={mode === 'selection'} onClick={handleModeChange} value="selection">
            <BiSelection size={16} />
            <span>Selection</span>
          </TabButton>
        </div>
      )}

      {/* Preview area */}
      <div className="mt-2 rounded-3xl border border-[#E5F8EA] bg-[#FBFFFD] min-h-[180px] md:min-h-[200px] relative overflow-hidden">
        {/* Screen / canvas preview */}
        {(mode === 'screencam' || mode === 'screen' || mode === 'selection') && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            <div className="w-[92%] h-[80%] rounded-2xl bg-white shadow-inner border border-[#E5F8EA]" />
          </div>
        )}

        {/* Camera preview placeholder */}
        {mode !== 'screen' && (
          <div
            className={[
              'rounded-2xl border border-[#E5F8EA] bg-gray-200 overflow-hidden',
              mode === 'camera'
                ? 'absolute inset-4'
                : 'absolute bottom-4 right-4 w-32 h-24 md:w-40 md:h-28',
            ].join(' ')}
          >
            {/* Static placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-500 text-xs">
              Camera Preview
            </div>
          </div>
        )}
      </div>

      {/* Camera + mic selection rows - only show when not recording */}
      {!isCameraRecording && (
        <div className="mt-2 flex flex-col gap-2">
          {/* Camera row */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
              <BiVideo size={16} />
            </div>
            <div className="flex-1 flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm relative">
              <span className="text-gray-700">
                {selectedVideoInputId === 'none'
                  ? 'Camera Access Denied'
                  : 'Camera Selected'}
              </span>
              {selectedVideoInputId === 'none' && (
                <button className="text-[#68E996] font-medium absolute right-3" type="button">
                  Allow
                </button>
              )}
            </div>
          </div>

          {/* Microphone row */}
          <div className="flex items-center gap-3 opacity-60">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
              <BiMicrophone size={16} />
            </div>
            <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400 text-center">
              Microphone selection (coming soon in desktop)
            </div>
          </div>
        </div>
      )}

      {/* Action container - children (button or toolbar) */}
      <div className="mt-2">{children}</div>

      {/* Bottom controls row */}
      <div className="mt-3 flex items-center justify-between gap-4 text-xs md:text-sm">
        <button
          type="button"
          onClick={onResolutionClick}
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-600 hover:bg-gray-100"
        >
          <span className="text-base">⚙️</span>
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-[#F8F8F8] px-4 py-2 text-gray-800 hover:bg-gray-100"
        >
          <span>Anonymous Mode</span>
          <span className="text-xs rounded-full border border-gray-300 px-1.5 py-0.5 text-gray-500">
            ?
          </span>
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-gray-700 hover:bg-gray-50"
        >
          <span>720p</span>
        </button>
      </div>

      {/* Terms text */}
      <p className="mt-2 text-xs text-center text-gray-500">
        By clicking "Start Recording", you agree to our{' '}
        <a href="#/policy?content=terms-of-service" className="text-[#68E996] hover:underline">
          Terms
        </a>{' '}
        and our{' '}
        <a href="#/policy?content=privacy-policy" className="text-[#68E996] hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
