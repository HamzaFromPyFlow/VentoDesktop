import { Modal } from "@mantine/core";
type TranscriptionPricingModalProps = {
  opened: boolean;
  modalSource?: string;
  onConfirm: ()=> void;
  onClose: () => void;
};
export default function TranscriptionPricingModal({
  opened,
  onConfirm,
  onClose,
  modalSource = 'videoRerecorded'
}: TranscriptionPricingModalProps) {
  const isVideoRerecorded = modalSource === 'videoRerecorded';
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
        You {isVideoRerecorded && <span>re-recorded but you</span>} have&nbsp;
        <strong>0 transcription generations</strong>
        &nbsp;remaining. Keep your recording and transcripts in sync
        by upgrading to a paid plan!
      </p>
      <div className="cta-container">
        <a onClick={onConfirm} className="confirm-btn upgradePlan-btn">
          Upgrade Now
        </a>
        <button onClick={onClose} className="cancel-btn">
          Keep my free plan
        </button>
      </div>
    </Modal>
  );
}
