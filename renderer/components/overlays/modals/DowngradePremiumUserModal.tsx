import { Modal } from "@mantine/core";

type DowngradePremiumUserModalProps = {
  opened: boolean;
  onClose: () => void;
};

export default function DowngradePremiumUserModal({
  opened,
  onClose,
}: DowngradePremiumUserModalProps) {
  return (
    <Modal
        opened={opened}
        onClose={onClose}
        centered
        size="auto"
        withCloseButton={false}
        classNames={{
        root: "vento-modal",
        }}
    >
        <p>
        Reach out to support so we can help you downgrade.
        </p>
        <div className="cta-container" style={{ width: "10vw" }}>
        <button
            onClick={() => {
            onClose();
            }}
            className="confirm-btn"
        >
            Got it!
        </button>
        </div>
    </Modal>
  );
}
