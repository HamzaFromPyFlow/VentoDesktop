import webAPI from "../../../lib/webapi";
import { Loader, Modal } from "@mantine/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type EditModalProps = {
  opened: boolean;
  onClose: () => void;
  recordingId: string;
};

export default function EditModal({
  opened,
  onClose,
  recordingId,
}: EditModalProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onContinue() {
    setLoading(true);
    await webAPI.recording.recordingCreateEditCopy(recordingId);
    navigate(`/record/${recordingId}/edit`);
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Video?"
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
      <p>Don&apos;t worry, you can cancel any edits made, Continue?</p>
      <div className="cta-container">
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
        <a onClick={onContinue} className="confirm-btn">
          Continue
          {loading && <Loader size="sm" color="black" />}
        </a>
      </div>
    </Modal>
  );
}
