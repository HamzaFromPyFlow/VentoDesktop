import { Modal } from "@mantine/core";

type InviteUsersGenralModelProps = {
  opened: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnClickOutside?: boolean;
};

export default function InviteUsersGenralModel({
  opened,
  onClose,
  children,
  closeOnClickOutside,
}: InviteUsersGenralModelProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      closeOnClickOutside={closeOnClickOutside ?? true}
      centered
      size="md"
      withCloseButton={false}
      classNames={{
        root: `vento-modal invite-users`,
      }}
    >
      {children}
    </Modal>
  );
}
