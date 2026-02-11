import { Modal } from '@mantine/core';
import { generateUrl } from '../../../lib/helper-pure';
import styles from '../../../styles/modules/AdminBillingModal.module.scss';

type AdminBillingModalProps = {
  opened: boolean;
  onClose: () => void;
  billingAction: () => void;
};

export default function AdminBillingModal({
  opened,
  onClose,
  billingAction,
}: AdminBillingModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="md"
      withCloseButton={false}
      classNames={{
        root: `vento-modal admin-billing`,
      }}
    >
      <>
        <p>
          To remove team members from your billing, select &quot;Take me to my Team&quot;. If you want to manage account billing,
          select &quot;Take me to billing&quot;.
        </p>
        <div className={styles.adminBillingModalActions}>
          <button onClick={() => window.location.href = generateUrl("/profile?tab=team")}>
            Take me to my Team
          </button>
          <button
            onClick={() => {
              onClose();
              billingAction();
            }}
          >
            Take me to billing
          </button>
        </div>
      </>
    </Modal>
  );
}
