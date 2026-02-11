import { Modal } from "@mantine/core";

type RecoverVideoHelpModalProps = {
    opened: boolean;
    onClose: () => void;
  };

export default function RecoverVideoHelpModal({
  opened,
  onClose,
}: RecoverVideoHelpModalProps) {

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
    <p className="modal-paragraph">
        Your recording experienced a connection error. We&apos;ll recover
        all the data from when the interruption occurred. However, 
        you may need to record portions of your video again.
    </p>

    <div className="cta-container" style={{width:'10vw'}}>
      <button onClick = {() => {
          onClose();
        }}
        className = "confirm-btn"
      >
        Got it!
      </button>
    </div>
  </Modal>
  );
}
