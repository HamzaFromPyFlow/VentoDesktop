import { Modal } from "@mantine/core";

type UploadVideoModalProps = {
  open: boolean;
  recordingId: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function UploadVideoModal({ open, recordingId, loading, onClose, onConfirm }: UploadVideoModalProps) {
  return (
    <Modal
      opened={open}
      onClose={onClose}
      title="Video Uploaded"
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
      <p>
        Your video has been uploaded successfully!
      </p>
      <div className="cta-container">
        <button onClick={onClose} className="cancel-btn">
          Close
        </button>
        <button onClick={onConfirm} className="confirm-btn">
          View Video
        </button>
      </div>
    </Modal >
  )
}
