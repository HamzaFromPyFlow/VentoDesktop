import { generateUrl } from "../../../lib/helper-pure";
import webAPI from "../../../lib/webapi";
import { Loader, Modal } from "@mantine/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type ReprocessOldVideoModalProps = {
  opened: boolean;
  onClose: () => void;
  recordingId: string;
  userId: string;
};

export default function ReprocessOldVideoModal({
  opened,
  onClose,
  recordingId,
  userId,
}: ReprocessOldVideoModalProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onContinue() {
    setLoading(true);
    const streamingUrl = import.meta.env.VITE_STREAMING_URL || '';
    const response = await fetch(`${streamingUrl}/re-process-video/${recordingId}/${userId}`);
    if (response.status === 200) {
      const videoUrl = await webAPI.recording.recordingGetSignedUrl(`${userId}/${recordingId}/v0/video-1080p_0.m3u8`);
      const audioUrl = await webAPI.recording.recordingGetSignedUrl(`${userId}/${recordingId}/v0/master.mp3`);
      await webAPI.recording.recordingUpdateRecording(recordingId, {
        videoUrl: videoUrl.publicUrl,
        audioUrl: audioUrl.publicUrl,
      })
      navigate(`/view/${recordingId}?re-processed=true`)
    } else {
      // Show error notification - simplified for desktop
      console.error('Re-processing failed. Please contact chat support for assistance.');
    }
    setLoading(false);
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={false}
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
      <p>Your video was recorded on an older version of Vento. We need to reprocess your video before you can edit.</p>
      <div className="cta-container">
        <a onClick={onContinue} className="confirm-btn">
          Re-process my video
          {loading && <Loader size="sm" color="black" />}
        </a>
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
      </div>
    </Modal>
  );
}
