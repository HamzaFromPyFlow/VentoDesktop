import { Modal } from "@mantine/core";
import { useState } from "react";

type BlurMessageModalProps = {
    opened: boolean;
    onClose: (dontShowAgain?: boolean) => void;
};

export default function BlurMessageModal({ opened, onClose }: BlurMessageModalProps) {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleGotIt = () => {
        onClose(dontShowAgain);
    };

    return (
        <Modal
            opened={opened}
            onClose={handleGotIt}
            withCloseButton={false}
            centered
            size="auto"
            classNames={{
                root: "vento-modal",
            }}
        >
            <div>
                <p>
                    Blurring a portion of your video requires us to reprocess your recording.
                    This may take a while.
                </p>

                <div className="cta-container">
                    <div style={{ width: "130px" }}>
                        <button
                            onClick={handleGotIt}
                            className="gotIt-btn"
                            style={{ width: "130px" }}
                        >
                            Got it
                        </button>
                    </div>
                </div>

                <label
                    style={{
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                    }}
                >
                    <input
                        type="checkbox"
                        checked={dontShowAgain}
                        onChange={(e) => setDontShowAgain(e.target.checked)}
                    />
                    Don&apos;t show this message again
                </label>
            </div>
        </Modal>
    );
}
