import React, { useState } from 'react';
import styles from '../../styles/modules/InviteUsers.module.scss';
// TODO: Import when available
// import webAPI from '../../lib/webapi';
// import { TeamMemberModel } from '../../lib/types';

interface ResendInviteUserProps {
  onClose: () => void;
  email: string;
  teamId: string;
  updateMember: (email: string, status: string) => void; // TODO: Use proper TeamMemberModel.status type
}

export default function ResendInviteUser({ onClose, email, teamId, updateMember }: ResendInviteUserProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call
      // await webAPI.team.teamCreateInvitation(teamId, { email });
      setLoading(false);
      setSent(true);
      updateMember(email, 'PENDING'); // TODO: Use TeamMemberModel.status.PENDING
    } catch (err) {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.successContainer}>
        <p className={styles.UserText}>
          An invite has been sent to {email} to join your team!
        </p>
        <button className={styles.gotItBtn} onClick={onClose}>
          Got it
        </button>
      </div>
    );
  }

  return (
    <div className={styles.successContainer}>
      <p className={styles.UserText}>
        Resend the invite to {email}?
      </p>
      <div className={styles.UserBtnRow}>
        <button
          className={styles.reSendUserBtnOutline}
          onClick={handleResend}
          disabled={loading}
        >
          {loading ? <span className={styles.spinner} /> : 'Resend'}
        </button>
        <button
          className={styles.cancelInviteBtn}
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
