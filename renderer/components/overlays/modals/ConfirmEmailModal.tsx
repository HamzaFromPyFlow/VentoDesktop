import { Loader, Modal } from "@mantine/core";
import { useState } from "react";

type ConfirmEmailModalProps = {
  opened: boolean;
  newEmail: string;
  loading: boolean;
  isNotificationEmail?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmEmailModal({
  opened,
  newEmail,
  loading,
  isNotificationEmail,
  onClose,
  onConfirm,
}: ConfirmEmailModalProps) {
  const [shouldReturnFocus, setShouldReturnFocus] = useState(false);
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      title="Confirm your new email password"
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
      <p>
        New {isNotificationEmail && <u>notifications</u>} email address: <b>{newEmail}</b>
      </p>
      <br />
      <p>Please confirm this email address is correct.</p>
      <br />
      <div className="cta-container">
        <button
          onClick={() => {
            setShouldReturnFocus(true);
            onClose();
          }}
          className="cancel-btn modal-btn"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            setShouldReturnFocus(false);
            onConfirm();
          }}
          className="confirm-btn modal-btn"
          data-autofocus
        >
          {loading ? (
            <Loader size="sm" color="black" />
          ) : (
            <p>Confirmed</p>
          )}
        </button>
      </div>
    </Modal>

  );
}
