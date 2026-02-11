import { Loader, Modal } from "@mantine/core";

type DownloadModalProps = {
  opened: boolean;
  onConfirm: ()=> void;
  onClose: () => void;
  downloadsCount: number;
  loading: boolean;
};

export default function DownloadVideoModal({
  opened,
  onConfirm,
  onClose,
  downloadsCount,
  loading,
}: DownloadModalProps) {

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
      <p>You have <b>{downloadsCount} video downloads</b> remaining on your free plan.</p>
      <p>Make sure you&apos;ve edited your video before downloading</p>
      <div className="cta-container">
        <a onClick={onConfirm} className="confirm-btn">
          { loading? (
            <Loader size="sm" color="black" />
          ):(
            <p>Download Video</p>
          )}
        </a>
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
      </div>
    </Modal>
  );
}
