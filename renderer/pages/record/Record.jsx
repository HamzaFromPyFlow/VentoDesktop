import React, { useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import RecordInitMenu from '../../components/record/RecordInitMenu';
import { useRecordStore } from '../../stores/recordStore';

function RecordPage() {
  const { id: recordingId } = useParams();
  const { currentRecording, startRecording } = useRecordStore((state) => ({
    currentRecording: state.currentRecording,
    startRecording: state.startRecording,
  }));

  // Function to handle recording start and navigation (matches web version)
  // Use deferred hash update for Electron compatibility to avoid dev tools disconnection
  const startVideoRecording = useCallback(async () => {
    try {
      const recording = await startRecording();
      if (recording && recording.id) {
        // Navigate to /record/[id] after recording is created
        // Defer hash update to avoid dev tools disconnection in Electron
        // Use requestAnimationFrame to ensure it happens after current execution context
        const newHash = `#/record/${recording.id}`;
        requestAnimationFrame(() => {
          try {
            // Use replaceState first (doesn't trigger navigation events)
            if (window.history && window.history.replaceState) {
              window.history.replaceState(null, '', newHash);
            }
            // Then update hash for HashRouter (only if different to avoid unnecessary updates)
            if (window.location.hash !== newHash) {
              window.location.hash = newHash;
            }
          } catch (err) {
            console.error('[RecordPage] Error updating hash:', err);
            // Fallback: direct hash assignment
            window.location.hash = newHash;
          }
        });
      }
    } catch (error) {
      console.error('[RecordPage] Error starting recording:', error);
      throw error;
    }
  }, [startRecording]);

  // If we have a recordingId in URL but no currentRecording, try to load it
  // This handles the case where user navigates directly to /record/[id]
  useEffect(() => {
    if (recordingId && !currentRecording) {
      // Recording ID is in URL but not loaded - this is expected for new recordings
      // The recording will be created when user starts recording
      console.log('[RecordPage] Recording ID in URL:', recordingId);
    }
  }, [recordingId, currentRecording]);

  return (
    <main className="min-h-screen bg-white">
      <Header pricing={false} startRecording={false} />
      <RecordInitMenu startVideoRecording={startVideoRecording} />
    </main>
  );
}

export default RecordPage;

