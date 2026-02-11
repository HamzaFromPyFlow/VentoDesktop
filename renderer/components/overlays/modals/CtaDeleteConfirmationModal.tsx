import { Modal } from "@mantine/core";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function CtaDeleteConfirmationModal({ open, onClose, onConfirm }: Props) {
  return (
    <Modal
      opened={open}
      onClose={onClose}
      title="Delete CTA?"
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
      <p>
        This action is <strong>permanent</strong>
      </p>
      <div className="cta-container">
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
        <button onClick={onConfirm} className="confirm-btn--delete">
          Yes, Delete
        </button>
      </div>
    </Modal>
  );
}
