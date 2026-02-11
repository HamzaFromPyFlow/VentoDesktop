import { Loader, Modal } from "@mantine/core";

type DeleteTranscriptionModalProps = {
  opened: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};
export default function DeleteTranscriptionModal({
  opened,
  loading,
  onClose,
  onConfirm,
}: DeleteTranscriptionModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={"Delete your transcript?"}
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
      <p>
        Once deleted, this transcript will no longer be available
      </p>

      <div className="cta-container">
        <button onClick={onConfirm}
         className="confirm-btn--delete"
        >
          {loading ? (
            <Loader color="white" size="sm" className="loader" />
          ) : (
            <p style={{color: "white"}}> Delete Transcript </p>
          )}
        </button>

        <button
          onClick={onClose}
          disabled={loading}
          className="cancel-btn"
        >
          Cancel
        </button>
        
      </div>
    </Modal>
  );
}
