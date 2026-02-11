import { Loader, Modal } from "@mantine/core";
import { useState } from "react";

type UpdateTeamNameModalProps = {
  opened: boolean;
  newName: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function UpdateTeamNameModal({
  opened,
  newName,
  loading,
  onClose,
  onConfirm,
}: UpdateTeamNameModalProps) {
  const [shouldReturnFocus, setShouldReturnFocus] = useState(false);
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      title="Confirm your new team name"
      centered
      size="auto"
      classNames={{
        root: "vento-modal",
      }}
    >
      <p>
        New Team Name: <b>{newName}</b>
      </p>
      <br />
      <p>Please confirm this name is correct.</p>
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
