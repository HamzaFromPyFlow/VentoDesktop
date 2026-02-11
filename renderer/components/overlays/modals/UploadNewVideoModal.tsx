import React, { useState } from 'react';
import { Modal, Transition } from '@mantine/core';

type UploadNewVideoModalProps = {
  opened: boolean;
  onClose: () => void;
};

export default function UploadNewVideoModal({
  opened,
  onClose,
}: UploadNewVideoModalProps) {
  const [closeOnClickOutside, setCloseOnClickOutside] = useState(true);

  return (
    <Transition
      mounted={opened}
      transition="slide-up"
      duration={500}
      timingFunction="ease"
    >
      {(transitionStyles) => (
        <Modal
          opened={opened}
          closeOnClickOutside={closeOnClickOutside}
          onClose={onClose}
          centered
          trapFocus
          size="auto"
          withCloseButton={false}
          style={transitionStyles}
          classNames={{
            root: 'modalRoot',
          }}
        >
          {/* TODO: Implement UploadArea component */}
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Upload Video functionality coming soon...</p>
            <button onClick={onClose}>Close</button>
          </div>
        </Modal>
      )}
    </Transition>
  );
}
