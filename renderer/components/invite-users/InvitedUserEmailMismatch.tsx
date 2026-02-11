import React, { useEffect, useRef } from 'react';
import styles from '../../styles/modules/InviteUsers.module.scss';

interface InvitedUserEmailMismatchProps {
  onClose: () => void;
}

export default function InvitedUserEmailMismatch({ onClose }: InvitedUserEmailMismatchProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.blur();
    }
  }, []);

  return (
    <div className={styles.successContainer}>
      <p>
        User email does not match invited user email.
      </p>
      <button ref={buttonRef} className={styles.gotItBtn} onClick={onClose}>
        Got it
      </button>
    </div>
  );
}
