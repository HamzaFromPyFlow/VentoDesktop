import { Modal } from "@mantine/core";

type ShowMessageModalProps = {
  message: string
  opened: boolean;
  onClose: () => void;
};

export default function ShowMessageModal({
  opened,
  message,
  onClose,
}: ShowMessageModalProps) {
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
        <p
          // style={{ whiteSpace: "nowrap" }}
          dangerouslySetInnerHTML={{
            __html: message,
          }}
        >
        </p>
        <br />
        <div
          className="cta-container"
          style={{ width: "fit-content", margin: "auto" }}
        >
          <button
            data-autofocus
            onClick={() => {
              onClose();
            }}
            className="confirm-btn modal-btn"
          >
            Got it!
          </button>
        </div>
    </Modal>
  );
}
