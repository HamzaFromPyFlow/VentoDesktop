import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "@mantine/core";

import Header from "../../components/common/Header";
import VideoPlayer from "../../components/media/VideoPlayer";
import { isUserFreePlan } from "../../lib/payment-helper";
import { logClientEvent } from "../../lib/misc";
import { useAuth } from "../../stores/authStore";
import type { RecordingModel } from "@schema/index";
import { getRecording } from "../../lib/server/data";
import styles from "../../styles/modules/ViewRecording.module.scss";

export default function ViewRecording() {
  const { recordingId } = useParams();
  const { ventoUser } = useAuth();

  const [recording, setRecording] = useState<RecordingModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recordingId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getRecording(recordingId)
      .then((res) => {
        if (cancelled) return;
        if (!res) {
          setError("Recording not found.");
        } else {
          setRecording(res);
          logClientEvent("page.view.viewRecording");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load recording.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [recordingId]);

  const videoJsOptions = useMemo(() => {
    if (!recording) return undefined;

    return {
      allowEndVideoModal:
        (!!!ventoUser?.id || isUserFreePlan(ventoUser)) &&
        isUserFreePlan(recording.user ?? undefined),
      sources: [
        {
          src: recording.videoUrl,
        },
      ],
      trackSource: (recording as any).transcription?.webVTTUrl,
      textTrackSettings: false,
      createdAt: recording.createdAt,
    };
  }, [recording, ventoUser]);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.leftColumn}>
          {loading && (
            <div className={styles.encodingText}>
              <Loader />
            </div>
          )}

          {!loading && error && (
            <div className={styles.encodingText}>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && recording && (
            <>
              <div className={styles.videoHeaderPrompt}>
                <div className={styles.infoContainer}>
                  <div className={styles.leftColumn}>
                    <h1 className={styles.title}>{recording.title}</h1>
                  </div>
                </div>
              </div>

              {recording.videoUrl ? (
                <VideoPlayer options={videoJsOptions} />
              ) : (
                <div className={styles.encodingText}>
                  <p>Video is not yet available.</p>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}

