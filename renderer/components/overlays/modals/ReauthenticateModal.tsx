import { REAUTHENTICATE_USER_MESSAGE } from "../../../lib/constants";
import { Modal } from "@mantine/core";

type ReauthenticateModalProps = {
  opened: boolean;
  onClose: () => void;  
  reauthenticateUser: () => void;
};

export default function ReauthenticateModal({
  opened,
  onClose,
  reauthenticateUser,
}:ReauthenticateModalProps) {
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
        style={{fontSize: '17px'}}
    >
        <p>
            {REAUTHENTICATE_USER_MESSAGE}
        </p>
        <br />
        <div
          className="cta-container"
          style={{ width: "fit-content", margin: "auto" }}
        >
          <button
            onClick={() => {
              reauthenticateUser();
              onClose();
            }}
            className="confirm-btn"
          >
            Got it!
          </button>
        </div>
    </Modal>
  );
}
