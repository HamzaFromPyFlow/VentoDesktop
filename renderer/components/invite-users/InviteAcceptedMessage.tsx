import React, { useEffect, useRef } from 'react';
import styles from '../../styles/modules/InviteUsers.module.scss';

interface InviteAcceptedMessageProps {
  teamName: string;
  profileName: string;
  email: string;
  onClose: () => void;
}

export default function InviteAcceptedMessage({ teamName, profileName, email, onClose }: InviteAcceptedMessageProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.blur();
    }
  }, []);

  return (
    <div className={styles.successContainer}>
      <p>
        Congrats! You&#39;re now part of <strong>{teamName}</strong> team! We&#39;ve notified {profileName} ({email}) you&#39;ve accepted!
      </p>
      <button ref={buttonRef} className={styles.gotItBtn} onClick={onClose}>
        Got it
      </button>
    </div>
  );
}
