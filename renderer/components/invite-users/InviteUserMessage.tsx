import React from 'react';
import styles from '../../styles/modules/InviteUsers.module.scss';
// TODO: Import team store when available
// import useTeamStore from '../../stores/team';

interface InviteUserMessageProps {
  onClose: () => void;
  email: string;
  check: boolean;
}

export default function InviteUserMessage({ onClose, email, check }: InviteUserMessageProps) {
  // TODO: Get from team store
  // const { isTeamTab } = useTeamStore.getState();
  const isTeamTab = false;

  const handleClose = () => {
    onClose();
    if (!isTeamTab && check) {
      // TODO: Navigate to profile page with team tab
      // window.location.href = '/profile?tab=team'
      console.log('Navigate to profile?tab=team');
    }
  };

  return (
    <div className={styles.successContainer}>
      {check ? (
        <p>
          An invite has been sent to <b>{email}</b> to join your team!
        </p>) : (
        <p>
          Oops! Looks like the invite failed to send. Please try again.
        </p>
      )}
      <button className={styles.gotItBtn} onClick={handleClose}>
        Got it
      </button>
    </div>
  );
}
