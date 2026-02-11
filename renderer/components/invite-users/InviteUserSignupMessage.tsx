import React, { useState } from 'react';
import InviteAcceptedMessage from './InviteAcceptedMessage';
import styles from '../../styles/modules/InviteUsers.module.scss';

enum INVITE_STATE {
  ACCEPT = 'ACCEPT',
  DECLINE = 'DECLINE'
}

interface InviteUserSignupMessageProps {
  teamName: string;
  profileName: string;
  email: string;
  onClose: () => void;
  onAccept: () => Promise<void>;
  onDecline: () => Promise<void>;
}

export default function InviteUserSignupMessage({
  teamName,
  profileName,
  email,
  onClose,
  onAccept,
  onDecline,
}: InviteUserSignupMessageProps) {
  const [loading, setLoading] = useState<INVITE_STATE | null>(null);
  const [result, setResult] = useState<INVITE_STATE | null>(null);

  const handleAccept = async () => {
    setLoading(INVITE_STATE.ACCEPT);
    await onAccept();
    setResult(INVITE_STATE.ACCEPT);
    setLoading(null);
  };

  const handleDecline = async () => {
    setLoading(INVITE_STATE.DECLINE);
    await onDecline();
    setResult(INVITE_STATE.DECLINE);
    setLoading(null);
  };

  const onAcceptClose = () => {
    onClose();
    // TODO: Reload or navigate
    window.location.reload();
  };

  if (result === INVITE_STATE.ACCEPT) {
    return (<InviteAcceptedMessage email={email} profileName={profileName} teamName={teamName} onClose={onAcceptClose} />);
  }

  if (result === INVITE_STATE.DECLINE) {
    return (
      <div className={styles.successContainer}>
        <p>
          We&#39;ve notified {profileName} ({email}) you&#39;ve declined the invitation to join <strong>{teamName}</strong> team.
        </p>
        <button className={styles.gotItBtn} onClick={onClose}>
          Got it
        </button>
      </div>
    );
  }

  return (
    <div className={styles.successContainer}>
      <p>
        You&#39;ve been invited to join <strong>{teamName}</strong>&#39;s team by {profileName} ({email}). Select whether to accept or decline invitation.
      </p>
      <div className={styles.inviteSignupBtnRow}>
        <button
          className={styles.acceptInviteBtn}
          onClick={handleAccept}
          disabled={!!loading}
        >
          {loading === INVITE_STATE.ACCEPT ? <span className={styles.spinner} /> : 'Accept Invite'}
        </button>
        <button
          className={styles.declineInviteBtn}
          onClick={handleDecline}
          disabled={!!loading}
        >
          {loading === INVITE_STATE.DECLINE ? <span className={styles.spinner} /> : 'Decline'}
        </button>
      </div>
    </div>
  );
}
