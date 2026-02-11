import { Modal } from "@mantine/core";

type AudioDisconnectModalProps = {
  opened: boolean;
  onClose: () => void;
};
export default function AudioDisconnectModal({
  opened,
  onClose,
}: AudioDisconnectModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={"Audio device issue"}
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
      <p>
        Your recording has stopped due to an issue with the audio input device. Please check your microphone connection, update input settings and try again.
      </p>

      <div className="cta-container">
        <button
          onClick={onClose}
          className="cancel-btn"
        >
          Close
        </button>

      </div>
    </Modal>
  );
}
