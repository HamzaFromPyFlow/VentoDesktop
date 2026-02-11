import React, { useState } from 'react';
import styles from '../../styles/modules/InviteUsers.module.scss';
// TODO: Import when available
// import webAPI from '../../lib/webapi';
// import { TeamMemberModel } from '../../lib/types';

interface CancelInvitationProps {
  onClose: () => void;
  email: string;
  teamId: string;
  invitationId: string;
  updateMember: (email: string, status: string) => void; // TODO: Use proper TeamMemberModel.status type
}

export default function CancelInvitation({ onClose, email, teamId, invitationId, updateMember }: CancelInvitationProps) {
  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const handleCancel = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call
      // await webAPI.team.teamRevokeInvitation(teamId, invitationId);
      setLoading(false);
      setCancelled(true);
      updateMember(email, 'INV_CANCELLED'); // TODO: Use TeamMemberModel.status.INV_CANCELLED
    } catch (err) {
      setLoading(false);
      console.error('Failed to cancel invitation:', err);
    }
  };

  if (cancelled) {
    return (
      <div className={styles.successContainer}>
        <h2 className={styles.modalHeading}>Invitation Cancelled</h2>
        <p className={styles.UserText}>
          The invitation to <strong>{email}</strong> has been cancelled. They will no longer be able to accept this invite.
        </p>
        <button className={styles.gotItBtn} onClick={onClose}>
          Got it
        </button>
      </div>
    );
  }

  return (
    <div className={styles.successContainer}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 20px 0' }}>Cancel Invite?</h1>
      <p style={{ fontSize: '16px', lineHeight: '1.5', margin: '0 0 32px 0', color: '#374151' }}>
        {email} will be unable to join until you send another invitation.
      </p>
      <div className={styles.UserBtnRow}>
        <button
          className={styles.cancelInviteBtn}
          onClick={onClose}
          disabled={loading}
        >
          Go Back
        </button>
        <button
          className={styles.removeUserBtn}
          onClick={handleCancel}
          disabled={loading}
        >
          {loading ? <span className={styles.spinner} /> : 'Cancel Invitation'}
        </button>
      </div>
    </div>
  );
}
