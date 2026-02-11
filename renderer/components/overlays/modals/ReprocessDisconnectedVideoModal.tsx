import { formatTime } from "../../../lib/helper-pure";
import { Loader, Modal } from "@mantine/core";
import { useState } from "react";

type ReprocessDisconnectedVideoModalProps = {
  opened: boolean;
  onClose: () => void;
  recordingId: string;
  userId: string;
  estimatedTime: number;
  onReprocessingSucceeded: () => void;
  onReprocessingFailed: () => void;
};

export default function ReprocessDisconnectedVideoModal({
  opened,
  onClose,
  onReprocessingSucceeded,
  onReprocessingFailed,
  recordingId,
  userId,
  estimatedTime,
}: ReprocessDisconnectedVideoModalProps) {
  const [loading, setLoading] = useState(false);
  // Estimated time for reconnection is almost half the duration of the video for premium users and 1 minute for free users
  const formattedEstimatedTime = estimatedTime === -1 
  ? "around 1 minute" 
  : formatTime(estimatedTime / 2);

  async function onContinue() {
    setLoading(true);
    const streamingUrl = import.meta.env.VITE_STREAMING_URL || '';
    const response = await fetch(
      `${streamingUrl}/re-process-disconnected-video/${recordingId}/${userId}`
    );
    if (response.status === 200) {
      onReprocessingSucceeded();
    } else {
      onReprocessingFailed();
    }
    setLoading(false);
  }

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      withCloseButton={false}
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
      <div style={{ marginBottom: "20px", marginTop: "10px" }}>
        <p>You experienced a connection issue during recording.</p>
        <br />
        <p>
          To make sure your trim is accurate, we need to reprocess your video.
          This should take <b>{formattedEstimatedTime}</b> for a recording of this length.
        </p>
      </div>
      <div
        className="cta-container"
        style={{ width: "fit-content", margin: "auto" }}
      >
        <a onClick={onContinue} className="confirm-btn">
          Re-process
          {loading && <Loader size="sm" color="black" />}
        </a>
      </div>
    </Modal>
  );
}
