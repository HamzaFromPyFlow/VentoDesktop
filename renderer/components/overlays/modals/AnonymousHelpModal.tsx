import { Modal } from "@mantine/core";

type AnonymousHelpModalProps = {
    opened: boolean;
    onClose: () => void;
  };

export default function AnonymousHelpModal({
  opened,
  onClose,
}: AnonymousHelpModalProps) {

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
          <div>
            <p className="modal-paragraph">
              We&apos;ll save your recording for <b>60 minutes</b> so you can try
              Vento without signing up. Once you&apos;re done, you can sign-up
              and save your recording.
            </p>
            <br/>
            <span>
              Already a Vento customer? <a href="/auth/login" style={{ color: "#67E997" }}>&nbsp;Login</a>
            </span>
    
            <div className="cta-container" style={{ width: "10vw" }}>
              <button
                onClick={() => {
                  onClose();
                }}
                className="confirm-btn"
              >
                Got it!
              </button>
            </div>
          </div>
        </Modal>
      );
}
