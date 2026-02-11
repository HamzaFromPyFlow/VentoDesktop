import { Modal } from "@mantine/core";

type EmptyTranscriptionModalProps = {
    open: boolean;
    onClose: () => void;
};

export default function EmptyTranscriptionModal({
    open,
    onClose,
  }: EmptyTranscriptionModalProps) {
    return(
    <Modal
      opened={open}
      onClose={onClose}
      centered
      size="auto"
      withCloseButton={false}
      classNames={{
          root: "vento-modal",
      }}
    >
      <p>
          Looks like your recording didn&apos;t have any words or you chose the wrong language.
      </p>

      <div className="cta-container">
        <button onClick = {() => {
            onClose();
          }}
          className = "confirm-btn"
        >
          Got it
        </button>
      </div>
    </Modal>
    );
}
