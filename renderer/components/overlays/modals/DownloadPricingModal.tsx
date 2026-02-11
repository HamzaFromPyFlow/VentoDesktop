import { Modal } from "@mantine/core";

type DownloadPricingModalProps = {
  opened: boolean;
  onConfirm: ()=> void;
  onClose: () => void;
  downloadsCount: number;
};

export default function DownloadPricingModal({
  opened,
  onConfirm,
  onClose,
  downloadsCount,
}: DownloadPricingModalProps) {

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
      <p>You have <b>{downloadsCount} downloads</b> remaining in your free plan.</p>
      <p>To download this video, upgrade to a paid plan to get unlimited downloads!</p>
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
