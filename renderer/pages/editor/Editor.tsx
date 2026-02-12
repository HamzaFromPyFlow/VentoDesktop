import { useEffect, useRef, useState, useCallback, useReducer } from 'react';
import { Loader } from '@mantine/core';
import { BsFillPlayFill } from 'react-icons/bs';
import { IoIosPause } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { formatVideoDurationWithMs, convertToMilliseconds, updateBlurAfterTrim } from '@lib/helper-pure';
import { DEFAULT_LINK_TEXT, DEFAULT_LINK_URL } from '@lib/constants';
import { CtaType } from '@lib/types';
import type { AuthorAnnotation } from '@schema/models/AuthorAnnotation';
import type { ChapterHeading } from '@schema/models/ChapterHeading';
import webAPI from '@lib/webapi';
import Header from '../../components/common/Header';
import VideoPlayer from '../../components/media/VideoPlayer';
import Timeline from '../../components/record/Timeline';
import EditorToolbar from '../../components/record/EditorToolbar';
import BlurSettings from '../../components/record/BlurSettings';
import BlurRegionSelector from '../../components/record/BlurRegionSelector';
import CtaLinkInput from '../../components/record/CtaLinkInput';
import EditorEditDropdown, { Action } from '../../components/dropdowns/EditorEditDropdown';
import AnnotationOverlay from '../../components/overlays/AnnotationOverlay';
import ChapterHeadingOverlay from '../../components/overlays/ChapterHeadingOverlay';
import { useRecordStore } from '../../stores/recordStore';
import { useEditorStore } from '../../stores/editorStore';
import { useAuth } from '../../stores/authStore';
import styles from '../../styles/modules/Editor.module.scss';
// import cx from 'classnames'; // Unused import

/**
 * Full-featured desktop editor with all functionality:
 * - Video playback with VideoPlayer
 * - Enhanced Timeline with scrubbing, waveform, trim/blur/CTA markers
 * - Editor Toolbar with trim/blur/CTA buttons
 * - Blur settings and region selector
 * - CTA link input
 * - Headings & annotations overlays
 * - Save functionality with API integration
 * - Loading states and error handling
 */

// Simple UUID generator (fallback if uuid package not available)
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Type definitions
type ModalStates = {
  authorAnnotation: boolean;
  chapterHeading: boolean;
  editorTooltip: boolean;
};

type RecordingInfo = {
  currentHeading: ChapterHeading | null;
  currentAnnotation: AuthorAnnotation | null;
  currentCta: any | null;
  videoChapterHeadings: ChapterHeading[];
  videoAnnotations: AuthorAnnotation[];
  videoCTAs: any[];
  videoBlur: any[];
  currentVideoDuration: number;
};

function EditorPage() {
  const navigate = useNavigate();
  const { id: recordingId } = useParams();
  const { ventoUser } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);
  
  const [currentVideoDuration, setCurrentVideoDuration] = useState(0);
  const [isVideoEdit, setIsVideoEdit] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [currentRecording, setCurrentRecording] = useState<any | null>(null);

  const [modalStates, setModalStates] = useReducer<
    React.Reducer<ModalStates, Partial<ModalStates>>
  >(
    (prev, cur) => ({ ...prev, ...cur }),
    {
      authorAnnotation: false,
      chapterHeading: false,
      editorTooltip: false,
    }
  );

  const [info, setInfo] = useReducer<
    React.Reducer<RecordingInfo, Partial<RecordingInfo>>
  >(
    (prev, cur) => ({ ...prev, ...cur }),
    {
      currentHeading: null,
      currentAnnotation: null,
      currentCta: null,
      videoChapterHeadings: [] as ChapterHeading[],
      videoAnnotations: [] as AuthorAnnotation[],
      videoCTAs: [] as any[],
      videoBlur: [] as any[],
      currentVideoDuration: 0,
    } as RecordingInfo
  );

  const { finalVideoUrl } = useRecordStore((state: any) => ({
    finalVideoUrl: state.finalVideoUrl,
  }));

  const {
    totalVideoDuration,
    videoElement,
    trimMode,
    blurMode,
    ctaMode,
    trimStart,
    trimEnd,
    blurStart,
    blurEnd,
    blurRegion,
    blurIntensity,
    multiBlurRegion,
  } = useEditorStore((state: any) => ({
    totalVideoDuration: state.totalVideoDuration,
    videoElement: state.videoElement,
    trimMode: state.trimMode,
    blurMode: state.blurMode,
    ctaMode: state.ctaMode,
    trimStart: state.trimStart,
    trimEnd: state.trimEnd,
    blurStart: state.blurStart,
    blurEnd: state.blurEnd,
    blurRegion: state.blurRegion,
    blurIntensity: state.blurIntensity,
    multiBlurRegion: state.multiBlurRegion,
  }));

  // Load recording data from URL params if editing existing recording
  useEffect(() => {
    if (recordingId) {
      // Load recording from API
      webAPI.recording.recordingGetRecording(recordingId)
        .then((recording: any) => {
          setCurrentRecording(recording);
          setInfo({
            videoChapterHeadings: recording.metadata?.headings ?? [],
            videoAnnotations: recording.metadata?.annotations ?? [],
            videoCTAs: recording.metadata?.ctas ?? [],
            videoBlur: recording.metadata?.blur ?? [],
          });
        })
        .catch((err: any) => {
          console.error('Error loading recording:', err);
          setProcessingError('Failed to load recording. Please try again.');
        });
    }
  }, [recordingId]);

  // Initialize video element reference when VideoPlayer is ready
  const handlePlayerReady = useCallback((player: any) => {
    if (player && player.el) {
      const videoEl = player.el().querySelector('video');
      if (videoEl) {
        videoRef.current = videoEl;
        useEditorStore.setState({ videoElement: videoEl });

        // Set up duration tracking
        videoEl.addEventListener('loadedmetadata', () => {
          const duration = videoEl.duration * 1000;
          useEditorStore.setState({ totalVideoDuration: duration });
        });

        // Set up timeupdate tracking
        videoEl.addEventListener('timeupdate', () => {
          setCurrentVideoDuration(videoEl.currentTime * 1000);
          setInfo({ currentVideoDuration: videoEl.currentTime * 1000 });
        });
      }
    }
  }, []);

  // Update CTA list helper
  const updateCtaList = useCallback((currentCta: any) => {
    const updatedVideoCTAs = [...info.videoCTAs];
    const editingCtaIndex = info.videoCTAs.findIndex(
      (cta) => currentCta.id === cta.id
    );
    if (editingCtaIndex !== -1) {
      updatedVideoCTAs[editingCtaIndex] = currentCta;
    } else {
      updatedVideoCTAs.push(currentCta);
    }
    setInfo({
      currentCta: currentCta,
      videoCTAs: updatedVideoCTAs,
    });
    setIsVideoEdit(true);
  }, [info.videoCTAs]);

  // Handle CTA input changes
  const handleCtaToggle = useCallback((checked: boolean, done: boolean) => {
    if (info.currentCta) {
      const updatedCta = { ...info.currentCta, isActive: checked };
      setInfo({ currentCta: updatedCta });
      updateCtaList(updatedCta);
      if (done) {
        useEditorStore.setState({ ctaMode: false });
        setInfo({ currentCta: null });
      }
    }
  }, [info.currentCta, updateCtaList]);

  const handleCtaTextChange = useCallback((value: string) => {
    if (info.currentCta) {
      const updatedCta = { ...info.currentCta, linkCtaText: value };
      setInfo({ currentCta: updatedCta });
      updateCtaList(updatedCta);
    }
  }, [info.currentCta, updateCtaList]);

  const handleCtaUrlChange = useCallback((value: string) => {
    if (info.currentCta) {
      const updatedCta = { ...info.currentCta, linkCtaUrl: value };
      setInfo({ currentCta: updatedCta });
      updateCtaList(updatedCta);
    }
  }, [info.currentCta, updateCtaList]);

  const handleCtaTimeChange = useCallback((value: string) => {
    if (info.currentCta) {
      try {
        const timeMs = convertToMilliseconds(value);
        const updatedCta = { ...info.currentCta, time: timeMs };
        setInfo({ currentCta: updatedCta });
        updateCtaList(updatedCta);
      } catch (err) {
        console.error('Error parsing CTA time:', err);
      }
    }
  }, [info.currentCta, updateCtaList]);

  const handleDeleteCta = useCallback(() => {
    if (info.currentCta) {
      const updatedCTAs = info.videoCTAs.filter((cta) => cta.id !== info.currentCta.id);
      setInfo({ videoCTAs: updatedCTAs, currentCta: null });
      useEditorStore.setState({ ctaMode: false });
      setIsVideoEdit(true);
    }
  }, [info.currentCta, info.videoCTAs]);

  // Handle finish blur
  const handleFinishBlur = useCallback(async () => {
    if (!blurRegion || blurStart == null || blurEnd == null) {
      setProcessingError('Blur region, start time, or end time is missing.');
      return;
    }

    // Validate blur range
    if (blurStart >= blurEnd) {
      setProcessingError('Blur start time must be before end time.');
      return;
    }

    if (blurStart < 0 || blurEnd > totalVideoDuration) {
      setProcessingError('Blur range is outside video duration.');
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);

    try {
      const newRegion = {
        id: generateId(),
        region: [{
          x: blurRegion.x ?? 0,
          y: blurRegion.y ?? 0,
          width: blurRegion.width ?? 0,
          height: blurRegion.height ?? 0,
          shape: blurRegion.shape ?? 'square',
        }],
        blurIntensity: blurIntensity,
        blurStart: blurStart / 1000,
        blurEnd: blurEnd / 1000,
      };

      const updatedRegions = [...multiBlurRegion, newRegion];
      const updatedBlur = [...info.videoBlur, newRegion];

      useEditorStore.setState({
        multiBlurRegion: updatedRegions,
        blurMode: false,
        blurStart: undefined,
        blurEnd: undefined,
        blurRegion: null,
        blurIntensity: 100,
      });

      setInfo({
        currentCta: null,
        videoBlur: updatedBlur,
      });
      setIsVideoEdit(true);

      // TODO: Call backend API for blur processing if needed
      // await webAPI.recording.recordingCreateBackupForRecording(currentRecording?.id ?? "");
      // const model = await startBlur();
    } catch (err) {
      console.error('Error processing blur:', err);
      setProcessingError('Failed to process blur. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [blurRegion, blurStart, blurEnd, blurIntensity, totalVideoDuration, multiBlurRegion, info.videoBlur]);

  // Handle finish trim
  const handleFinishTrim = useCallback(async () => {
    if (trimStart == null || trimEnd == null) {
      setProcessingError('Trim start time or end time is missing.');
      return;
    }

    // Validate trim range
    if (trimStart >= trimEnd) {
      setProcessingError('Trim start time must be before end time.');
      return;
    }

    if (trimStart < 0 || trimEnd > totalVideoDuration) {
      setProcessingError('Trim range is outside video duration.');
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);

    try {
      // Update blur regions after trim
      const updatedBlur = updateBlurAfterTrim(
        info.videoBlur,
        trimStart / 1000,
        trimEnd / 1000
      );

      useEditorStore.setState({
        trimMode: false,
        trimStart: undefined,
        trimEnd: undefined,
      });

      setInfo({
        currentVideoDuration: 0,
        videoBlur: updatedBlur,
      });
      setIsVideoEdit(true);

      // TODO: Call backend API for trim processing if needed
      // await webAPI.recording.recordingCreateBackupForRecording(currentRecording?.id ?? "");
      // const model = await startTrim();
    } catch (err) {
      console.error('Error processing trim:', err);
      setProcessingError('Failed to process trim. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [trimStart, trimEnd, totalVideoDuration, info.videoBlur]);

  // Handle editor dropdown actions
  const handleEditorDropdownAction = useCallback(
    async (action: string) => {
      switch (action) {
        case Action.HEADING: {
          setModalStates({ chapterHeading: true });
          setInfo({
            currentHeading: {
              title: '',
              timestamp: currentVideoDuration, // Already in ms
            },
          });
          break;
        }
        case Action.ANNOTATION: {
          setModalStates({ authorAnnotation: true });
          setInfo({
            currentAnnotation: {
              text: '',
              timestamp: currentVideoDuration, // Already in ms
            },
          });
          break;
        }
        case Action.TRIM: {
          if (!currentRecording && !finalVideoUrl) {
            setProcessingError('No recording available to trim.');
            return;
          }
          useEditorStore.setState({ trimMode: true });
          break;
        }
        case Action.BLUR: {
          if (!currentRecording && !finalVideoUrl) {
            setProcessingError('No recording available to blur.');
            return;
          }
          useEditorStore.setState({ blurMode: true });
          break;
        }
        case Action.CTA: {
          const cta = {
            id: generateId(),
            time: currentVideoDuration,
            Ctatype: CtaType.TEXT_LINK,
            linkCtaText: DEFAULT_LINK_TEXT,
            linkCtaUrl: DEFAULT_LINK_URL,
            isActive: true,
          };
          updateCtaList(cta);
          useEditorStore.setState({ ctaMode: true });
          setInfo({ currentCta: cta });
          setIsVideoEdit(true);
          break;
        }
      }
    },
    [currentVideoDuration, currentRecording, finalVideoUrl, updateCtaList]
  );

  // Handle save video with edits
  const handleSaveVideo = useCallback(async () => {
    if (!currentRecording && !finalVideoUrl) {
      setProcessingError('No recording available to save.');
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);

    try {
      if (currentRecording) {
        // Update existing recording
        await webAPI.recording.recordingUpdateRecording(currentRecording.id, {
          metadata: {
            headings: info.videoChapterHeadings,
            annotations: info.videoAnnotations,
            ctas: info.videoCTAs,
            blur: info.videoBlur,
            version: 'v0',
          },
          transcription: currentRecording.transcription,
        });

        // Navigate to view page
        navigate(`/view/${currentRecording.id}`);
      } else {
        // For new recordings from finalVideoUrl, we'd need to upload first
        // For now, just show a message
        setProcessingError('Please upload your recording first before saving edits.');
        setIsProcessing(false);
        // TODO: Implement upload flow for new recordings
      }
    } catch (err) {
      console.error('Error saving video:', err);
      setProcessingError('Failed to save video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [currentRecording, finalVideoUrl, info, navigate]);

  // Handle cancel/discard
  const handleCancel = useCallback(() => {
    if (window.confirm('Are you sure you want to discard all changes?')) {
      useRecordStore.getState().resetStateForNewRecording();
      navigate('/recordings');
    }
  }, [navigate]);

  // Handle heading click
  const handleHeadingClick = useCallback((index: number) => {
    setInfo({
      currentHeading: info.videoChapterHeadings[index],
    });
    setModalStates({ chapterHeading: true });
    if (videoRef.current) {
      videoRef.current.currentTime = info.videoChapterHeadings[index].timestamp / 1000;
    }
  }, [info.videoChapterHeadings]);

  // Handle annotation click
  const handleAnnotationClick = useCallback((index: number) => {
    setInfo({
      currentAnnotation: info.videoAnnotations[index],
    });
    setModalStates({ authorAnnotation: true });
    if (videoRef.current) {
      videoRef.current.currentTime = info.videoAnnotations[index].timestamp / 1000;
    }
  }, [info.videoAnnotations]);

  // Update chapter heading
  const handleChapterHeadingUpdate = useCallback(async (newChapterHeadings: ChapterHeading[]) => {
    try {
      if (currentRecording) {
        await webAPI.recording.recordingCreateBackupForRecording(currentRecording.id);
      }
      setInfo({ videoChapterHeadings: newChapterHeadings });
      setIsVideoEdit(true);
    } catch (err) {
      console.error('Error creating backup:', err);
      setInfo({ videoChapterHeadings: newChapterHeadings });
      setIsVideoEdit(true);
    }
  }, [currentRecording]);

  // Update video annotation
  const handleVideoAnnotationUpdate = useCallback(async (newVideoAnnotations: AuthorAnnotation[]) => {
    try {
      if (currentRecording) {
        await webAPI.recording.recordingCreateBackupForRecording(currentRecording.id);
      }
      setInfo({ videoAnnotations: newVideoAnnotations });
      setIsVideoEdit(true);
    } catch (err) {
      console.error('Error creating backup:', err);
      setInfo({ videoAnnotations: newVideoAnnotations });
      setIsVideoEdit(true);
    }
  }, [currentRecording]);

  const editingHeadingIndex = info.videoChapterHeadings.findIndex(
    (heading) => heading.timestamp === info.currentHeading?.timestamp
  );

  const editingAnnotationIndex = info.videoAnnotations.findIndex(
    (annotation) => annotation.timestamp === info.currentAnnotation?.timestamp
  );

  const videoUrl = currentRecording?.videoUrl || finalVideoUrl;
  const audioUrl = currentRecording?.audioUrl || null;
  const transcription = currentRecording?.transcription || null;

  const options = videoUrl
    ? {
        sources: [{ src: videoUrl }],
        allowEndVideoModal: false,
        trackSource: transcription ? JSON.stringify(transcription) : null,
        createdAt: currentRecording?.createdAt || new Date().toISOString(),
      }
    : undefined;

  return (
    <>
      <Header hideNewRecordingButton />
      <main className={styles.editorMain}>
        {!videoUrl ? (
          <p>No recording loaded. Please record a video first.</p>
        ) : (
          <>
            {isProcessing && (
              <div className={styles.processingOverlay}>
                <Loader size="lg" color="blue" />
                <p>Processing...</p>
              </div>
            )}

            {processingError && (
              <div className={styles.errorMessage}>
                <p>{processingError}</p>
                <button onClick={() => setProcessingError(null)}>Dismiss</button>
              </div>
            )}

            <EditorToolbar
              onStop={(finishAndSave: boolean) => {
                if (finishAndSave) {
                  handleSaveVideo();
                } else {
                  handleCancel();
                }
              }}
              onPause={() => {
                useEditorStore.getState().playVideo(false);
              }}
              videoLoaded={!!videoElement}
              isVideoEdit={isVideoEdit}
              onCancelEdit={() => {
                // Reset all edits
                if (currentRecording) {
                  setInfo({
                    videoChapterHeadings: currentRecording.metadata?.headings ?? [],
                    videoAnnotations: currentRecording.metadata?.annotations ?? [],
                    videoCTAs: currentRecording.metadata?.ctas ?? [],
                    videoBlur: currentRecording.metadata?.blur ?? [],
                  });
                  setIsVideoEdit(false);
                }
              }}
            />

            <section className={styles.videoContainer}>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <VideoPlayer options={options} onReady={handlePlayerReady} />
                {blurMode && videoRef.current && (
                  <BlurRegionSelector videoRef={videoRef} blurMode={blurMode} />
                )}
              </div>
            </section>

            <section className={styles.timelineContainer}>
              <Timeline
                onCurrentTimeUpdate={(durationInMs: number) => {
                  setCurrentVideoDuration(durationInMs);
                  setInfo({ currentVideoDuration: durationInMs });
                }}
                headings={info.videoChapterHeadings as any}
                onHeadingClick={handleHeadingClick}
                annotations={info.videoAnnotations as any}
                onAnnotationClick={handleAnnotationClick}
                ctas={info.videoCTAs as any}
                onCtaClick={(index: number) => {
                  setInfo({ currentCta: info.videoCTAs[index] });
                  useEditorStore.setState({ ctaMode: true });
                  if (videoRef.current) {
                    videoRef.current.currentTime = info.videoCTAs[index].time / 1000;
                  }
                }}
                onCtaDurationUpdate={(index: number, duration: number) => {
                  const updatedCtas = [...info.videoCTAs];
                  updatedCtas[index].time = duration;
                  setInfo({ videoCTAs: updatedCtas });
                  setIsVideoEdit(true);
                }}
                blur={info.videoBlur as any}
                audioUrl={audioUrl}
              />
            </section>

            <div className={styles.videoActionContainer}>
              <button
                id="playPauseBtn"
                className={styles.playPauseBtn}
                onClick={() => useEditorStore.getState().toggleVideo()}
              >
                {useEditorStore.getState().isPlaying() ? (
                  <IoIosPause size={20} />
                ) : (
                  <BsFillPlayFill size={20} />
                )}
              </button>
              <span className={styles.videoTimer}>
                <b>{formatVideoDurationWithMs(currentVideoDuration)}</b> /{' '}
                {formatVideoDurationWithMs(totalVideoDuration)}
              </span>
            </div>

            {/* Right column for editor controls */}
            <div className={styles.rightColumn}>
              {ctaMode && info.currentCta ? (
                <CtaLinkInput
                  currentCta={info.currentCta}
                  duration={formatVideoDurationWithMs(info.currentCta.time)}
                  onToggleActive={handleCtaToggle}
                  onTextChange={handleCtaTextChange}
                  onUrlChange={handleCtaUrlChange}
                  onTimeChange={handleCtaTimeChange}
                  onDeleteCta={handleDeleteCta}
                />
              ) : trimMode ? (
                <div className={styles.actionContainer}>
                  <button
                    className={styles.finishTrimBtn}
                    onClick={handleFinishTrim}
                    disabled={isProcessing}
                  >
                    Remove Selected Area
                    {isProcessing && <Loader size="sm" color="white" />}
                  </button>
                  <button
                    className={styles.cancelTrimBtn}
                    onClick={() =>
                      useEditorStore.setState({
                        trimMode: false,
                        trimStart: undefined,
                        trimEnd: undefined,
                      })
                    }
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                </div>
              ) : blurMode ? (
                <BlurSettings
                  onFinishBlur={handleFinishBlur}
                  blurMode={blurMode}
                  isProcessingBlur={isProcessing}
                  videoDuration={totalVideoDuration}
                />
              ) : (
                <div className={styles.actionContainer}>
                  <EditorEditDropdown
                    currentVideoDuration={currentVideoDuration}
                    onAction={handleEditorDropdownAction}
                    openTooltip={modalStates.editorTooltip}
                    setOpenTooltip={(val: boolean) => setModalStates({ editorTooltip: val })}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <ChapterHeadingOverlay
        open={modalStates.chapterHeading}
        currentHeading={info.currentHeading}
        videoChapterHeadings={info.videoChapterHeadings}
        currentVideoDuration={currentVideoDuration}
        editingHeadingIndex={editingHeadingIndex}
        setIsVideoEdit={setIsVideoEdit}
        onClose={() => setModalStates({ chapterHeading: false })}
        onVideoChapterHeadingUpdate={handleChapterHeadingUpdate}
        onChapterHeadingUpdate={(newCurrentHeading) =>
          setInfo({ currentHeading: newCurrentHeading })
        }
      />

      <AnnotationOverlay
        open={modalStates.authorAnnotation}
        currentAnnotation={info.currentAnnotation}
        videoAnnotations={info.videoAnnotations}
        currentVideoDuration={currentVideoDuration}
        editingAnnotationIndex={editingAnnotationIndex}
        setIsVideoEdit={setIsVideoEdit}
        userProfilePhoto={ventoUser?.profilePhotoUrl}
        onClose={() => setModalStates({ authorAnnotation: false })}
        onVideoAnnotationsUpdate={handleVideoAnnotationUpdate}
        onAnnotationUpdate={(newCurrentAnnotation) =>
          setInfo({ currentAnnotation: newCurrentAnnotation })
        }
      />
    </>
  );
}

export default EditorPage;
