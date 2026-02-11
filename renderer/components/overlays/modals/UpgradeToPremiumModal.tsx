import { Loader, Modal } from '@mantine/core';
import styles from '../../../styles/modules/RecordApp.module.scss';

type UpgradeToPremiumModalProps = {
  opened: boolean;
  recordingLimitReached: boolean;
  paymentSuccessful: boolean;
  onClose: () => void;
};

export default function UpgradeToPremiumModal({
  opened,
  onClose,
  recordingLimitReached,
  paymentSuccessful,
}: UpgradeToPremiumModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={false}
      size="auto"
      trapFocus={false}
      style={{ padding: "0px" }}
      classNames={{ root: "upgradeModalRoot" }}
    >
      <div className={styles.upgradeModal}>
        {paymentSuccessful && (
          <h1 style={{ marginBottom: "2rem" }}>Thank you for subscribing to Vento!</h1>
        )}
        <img
          src="/assets/yellow-logo.png"
          alt="yellow vento logo"
          className={styles.logo}
        />
        <img
          src="/assets/background-yellow-curves.svg"
          alt="background"
          className={styles.curves}
        />
        <div className={styles.content}>
          <h2>Upgrade to Premium</h2>
          <p>Get unlimited hosted videos and more features</p>
          {/* TODO: Add pricing details and upgrade button */}
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </Modal>
  );
}
