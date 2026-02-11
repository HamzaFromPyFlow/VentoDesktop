import { Modal } from "@mantine/core";

type ReprocessDisconnectedVideoModalProps = {
  opened: boolean;
  onClose: () => void;
  reProcessed: boolean;
};

export default function ReprocessDisconnectedVideoModalResult({
  opened,
  onClose,
  reProcessed = false,
}: ReprocessDisconnectedVideoModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      trapFocus={false}
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
      <div>
        <p className="modal-paragraph" style={{ marginBottom: "20px" }}>
          {reProcessed
            ? "Reprocessing successful. You can now trim your video!"
            : "We were unable to reprocess your video. Please contact support."}
        </p>

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
      </div>
    </Modal>
  );
}
