import { transcriptionLanguage } from "../../../lib/types";
import { Loader, Modal } from "@mantine/core";

type TranscriptionModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  language: string;
  loading: boolean;
};
export default function TranscriptionModal({
  open,
  onClose,
  onConfirm,
  language,
  loading,
}: TranscriptionModalProps) {
  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={`Your transcription selection is ${
        transcriptionLanguage.find((lang) => lang.value === language)?.label
      }`}
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
      <p>
        Make sure your Vento was recorded in&nbsp;
        <strong>
          {transcriptionLanguage.find((lang) => lang.value === language)?.label}
        </strong>
        &nbsp;before selecting &quot;Generate&quot; or your transcription may be
        inaccurate.
      </p>

      <div className="cta-container">
        <button onClick={onConfirm}
         className="confirm-btn"
        >
          {loading ? (
            <Loader color="dark" size="sm" className="loader" />
          ) : (
            <p> Generate </p>
          )}
        </button>

        <button
          onClick={onClose}
          disabled={loading}
          className="cancel-btn"
        >
          Pick Another Language
        </button>
        
      </div>
    </Modal>
  );
}
