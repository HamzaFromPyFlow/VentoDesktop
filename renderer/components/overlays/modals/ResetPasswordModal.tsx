import { Modal } from "@mantine/core";

type ResetPasswordModalProps = {
  message: string
  opened: boolean;
  onClose: () => void;
};

export default function ResetPasswordModal({
  opened,
  message,
  onClose,
}: ResetPasswordModalProps) {
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
            {message}
        </p>
        <br />
        <div
          className="cta-container"
          style={{ width: "fit-content", margin: "auto" }}
        >
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
