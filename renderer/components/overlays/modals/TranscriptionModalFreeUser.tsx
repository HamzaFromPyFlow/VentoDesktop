import { Loader, Modal } from "@mantine/core";
type FreeUserTranscriptionModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
};
export default function TranscriptionModalFreeUser({
  open,
  onClose,
  onConfirm,
  loading,
}: FreeUserTranscriptionModalProps) {
  return (
    <Modal
      opened={open}
      onClose={onClose}
      withCloseButton={false}
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
      <p>
        You have&nbsp;
        <strong>1 transcript generation</strong>
        &nbsp;remaining. Make sure you&apos;ve finish editing and selected the
        language spoken in your video to ensure your transcription is accurate.
      </p>
      <div className="cta-container">
        <button onClick={onConfirm} className="confirm-btn">
          {loading ? (
            <Loader color="dark" size="sm" className="loader" />
          ) : (
            <p> Generate Transcription</p>
          )}
        </button>
        <button
          onClick={onClose}
          disabled={loading}
          className="cancel-btn"
        >
          <strong> Cancel </strong>
        </button>
      </div>
    </Modal>
  );
}
