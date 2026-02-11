import { Modal } from "@mantine/core";

type AnonymousLimitReachedModalProps = {
  opened: boolean;
  onConfirm:() => void;
  onClose: () => void;
};

export default function AnonymousLimitReachedModal({
  opened,
  onClose,
  onConfirm,
}: AnonymousLimitReachedModalProps) {

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
      <p>Thanks for trying out Vento! To record more, <a href="/auth" style={{ color: "#67E997" }}>&nbsp;Signup</a> to get 9 additional recordings!</p>
      <div className="cta-container">
        <a onClick={onConfirm} className="confirm-btn">
          Signup
        </a>
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
      </div>
    </Modal>
  );
}
