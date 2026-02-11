import { Modal } from "@mantine/core";

type BlurLimitReachedModalProps = {
    opened: boolean;
    onClose: () => void;
};

export default function BlurLimitReachedModal({
    opened,
    onClose,
}: BlurLimitReachedModalProps) {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            withCloseButton={false}
            centered
            size="auto"
            classNames={{
                root: "vento-modal",
            }}
        >
            <p style={{ textAlign: "center" }}>
                You have reached the limit of 10 blur regions.
                <br />
                Apply or delete existing regions to add more.
            </p>

            <div className="cta-container">
                <button onClick={onClose} className="confirm-btn">
                    Done
                </button>
            </div>
        </Modal>
    );
}
