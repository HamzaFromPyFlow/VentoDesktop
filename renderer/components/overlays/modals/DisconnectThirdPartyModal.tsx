import { Loader, Modal } from "@mantine/core";

type DisconnectProviderModalProps = {
  opened: boolean;
  provider: "google.com" | "microsoft.com";
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DisconnectThirdPartyModal({
  opened,
  provider,
  loading,
  onClose,
  onConfirm,
}: DisconnectProviderModalProps) {
    const providerName = provider === "google.com" ? "Google" : "Microsoft";
    const modalTitle = `Disconnect your ${providerName} account?`
    return (
        <Modal
        opened={opened}
        onClose={onClose}
        title= {modalTitle}
        trapFocus={false}
        centered
        size="auto"
        classNames={{
            root: "vento-modal",
        }}
        >
        <p>
            Once you disconnect, you&apos;ll use your email and password to login.
        </p>
        <div className="cta-container">
            <button onClick={onClose} className="cancel-btn">
            Cancel
            </button>
            <button
            onClick={() => {
                onConfirm();
            }}
            className="confirm-btn"
            >
            {loading?               
                <Loader
                  color="dark"
                  size="sm"
                  className="loader"
                /> : <p>Disconnect</p>}
            </button>
        </div>
        </Modal>
    );
}
