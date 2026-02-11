import { Modal } from "@mantine/core";

type EditorDeleteModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function EditorDeleteModal({
  open,
  onClose,
  onConfirm,
}: EditorDeleteModalProps) {
  return (
    <Modal
      opened={open}
      onClose={onClose}
      title="Delete recording?"
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
      <p>
        This action is <strong>permanent!</strong>
      </p>
      <div className="cta-container">
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="confirm-btn--delete"
        >
          Yes, Delete
        </button>
      </div>
    </Modal>
  );
}
