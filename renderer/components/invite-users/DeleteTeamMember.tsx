import React, { useState } from 'react';
import styles from '../../styles/modules/InviteUsers.module.scss';
// TODO: Import when available
// import webAPI from '../../lib/webapi';
// import { TeamMemberModel } from '../../lib/types';

interface DeleteTeamMemberProps {
  onClose: () => void;
  email: string;
  removeMember: (email: string) => void;
  teamId: string;
  status: string; // TODO: Use proper TeamMemberModel.status type
}

export default function DeleteTeamMember({
  onClose,
  email,
  removeMember,
  teamId,
  status,
}: DeleteTeamMemberProps) {
  const [loading, setLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call
      // await webAPI.team.teamRemoveMember(teamId, { email, moveContent: false });
      setLoading(false);
      setDeleted(true);
      removeMember(email);
    } catch (err) {
      setLoading(false);
      console.error('Failed to delete team member:', err);
    }
  };

  if (deleted) {
    return (
      <div className={styles.successContainer}>
        <p>
          {email} has been permanently deleted from your team!
        </p>
        <button className={styles.gotItBtn} onClick={onClose}>
          Got it
        </button>
      </div>
    );
  }

  const getDescriptionText = () => {
    if (status === 'DECLINED' || status === 'INV_CANCELLED') {
      return "This will permanently remove the invitation record from your team.";
    }
    if (status === 'REVOKED') {
      return "This will permanently remove this user from your team list.";
    }
    return "This will permanently remove this user from your team.";
  };

  return (
    <div className={styles.successContainer}>
      <p className={styles.UserText}>
        Are you sure you want to permanently delete <strong>{email}</strong> from your team list?
      </p>
      <p className={styles.UserText} style={{ fontSize: '14px', marginTop: '8px' }}>
        {getDescriptionText()}
      </p>
      <div className={styles.UserBtnRow}>
        <button
          className={styles.removeUserBtn}
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? <span className={styles.spinner} /> : 'Delete User'}
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
