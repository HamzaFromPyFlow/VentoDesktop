import React from 'react';
import { Modal } from '@mantine/core';

type InviteUsersModalProps = {
  opened: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function InviteUsersModal({
  opened,
  onClose,
  children
}: InviteUsersModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="auto"
      withFocusReturn={false}
      withCloseButton={false}
      classNames={{
        root: `vento-modal invite-users`,
      }}
    >
      {children}
    </Modal>
  );
}
