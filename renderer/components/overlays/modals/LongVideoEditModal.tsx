import { Modal } from "@mantine/core";

type LongVideoEditModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function LongVideoEditModal({ open, onClose }: LongVideoEditModalProps) {
  return (
    <Modal
      opened={open}
      onClose={onClose}
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
      withCloseButton={false}
    >
      <p>
        Unfortunately, you are unable to re-record a video greater than 60 mins. We will be introducing the ability to do so in the near future. Sorry for the inconvience.
      </p>
      <div className="cta-container">
        <button onClick={onClose} className="confirm-btn no-grow">
          Got it
        </button>
      </div>
    </Modal >
  )
}
