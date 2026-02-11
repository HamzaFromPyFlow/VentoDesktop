import React, { useEffect, useState } from 'react';
import { Loader } from '@mantine/core';
import styles from '../../styles/modules/InviteUsers.module.scss';
// TODO: Import when available
// import webAPI from '../../lib/webapi';
// import { TeamMemberModel } from '../../lib/types';

enum REMOVAL_TYPE {
  MOVE_CONTENT = 'MOVE_CONTENT',
  KEEP_CONTENT = 'KEEP_CONTENT',
}

interface RevokeTeamMemberProps {
  onClose: () => void;
  email: string;
  removeMember: (email: string) => void;
  updateMember: (email: string, status: string) => void; // TODO: Use proper TeamMemberModel.status type
  teamId: string;
  isDeclined: boolean;
  isPremium: boolean;
}

export default function RevokeTeamMember({
  onClose,
  email,
  removeMember,
  updateMember,
  teamId,
  isDeclined,
  isPremium,
}: RevokeTeamMemberProps) {
  const [removalType, setRemovalType] = useState<REMOVAL_TYPE>(REMOVAL_TYPE.MOVE_CONTENT);
  const [loading, setLoading] = useState(false);
  const [removed, setRemoved] = useState<null | REMOVAL_TYPE>(null);
  const [billingInfo, setBillingInfo] = useState<{ fcpu: number, pcpu: number, totalAmountBilled: number, nextBillingDate: string, planFrequency: string } | null>(null);
  const [checkRecording, setCheckRecording] = useState(false);
  const [loadingRecordings, setLoadingRecordings] = useState(true);

  useEffect(() => {
    const checkBilling = async () => {
      try {
        // TODO: Implement API call
        // const response = await webAPI.team.teamGetBillingInfo();
        // setBillingInfo({
        //   fcpu: response.fcpu,
        //   pcpu: response.pcpu,
        //   totalAmountBilled: response.totalAmountBilled,
        //   nextBillingDate: response.nextBillingDate,
        //   planFrequency: response.planFrequency,
        // });
      } catch (error) {
        console.error('Failed to get billing info:', error);
      }
    };

    if (isPremium) {
      checkBilling();
    }
  }, [isPremium]);

  useEffect(() => {
    const checkRecordings = async () => {
      setLoadingRecordings(true);
      try {
        // TODO: Implement API call
        // const response = await webAPI.team.teamCheckUserRecordings(email);
        // setCheckRecording(response);
      } catch (error) {
        console.error('Failed to check recordings:', error);
      } finally {
        setLoadingRecordings(false);
      }
    };
    checkRecordings();
  }, [email]);

  const handleRevoke = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call
      // await webAPI.team.teamRemoveMember(teamId, { email, moveContent: (removalType === REMOVAL_TYPE.MOVE_CONTENT && !isDeclined && checkRecording) ? true : false });
      setLoading(false);
      if (isDeclined) {
        removeMember(email);
        setRemoved(REMOVAL_TYPE.KEEP_CONTENT);
      } else {
        updateMember(email, 'REVOKED'); // TODO: Use TeamMemberModel.status.REVOKED
        setRemoved(removalType);
      }
    } catch (err) {
      setLoading(false);
      console.error('Failed to revoke team member:', err);
    }
  };

  if (removed === REMOVAL_TYPE.KEEP_CONTENT) {
    return (
      <div className={styles.successContainer}>
        <p>
          {email} has been revoked from your team!
        </p>
        <button className={styles.gotItBtn} onClick={onClose}>
          Got it
        </button>
      </div>
    );
  }

  if (removed === REMOVAL_TYPE.MOVE_CONTENT) {
    return (
      <div className={styles.successContainer}>
        <p>
          {email} has been revoked from your team and a folder of {email ? `${email}'s` : 'their'} content has been added to your recordings.
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
        When you select &#34;Revoke User&#34;, {email} will no longer have access to your team and workspaces.
        <br />
        {isPremium && billingInfo &&
          <>
            {` We'll refund a prorated amount of `}<b>${billingInfo.pcpu}</b>{` for the remainder of the ${billingInfo.planFrequency}.`}
            <br />
          </>
        }
        {!isDeclined && checkRecording &&
          <b>Please choose your revocation type:</b>
        }
      </p>
      {!isDeclined && (
        <>
          {loadingRecordings ? (
            <div className={styles.spinloader + ' ' + styles.notice}>
              <Loader color="dark" size="sm" />
            </div>
          ) : checkRecording ? (
            <div className={styles.removeUserRadioGroup}>
              <label className={styles.removeUserRadioLabel}>
                <input
                  type="radio"
                  name="removeType"
                  checked={removalType === REMOVAL_TYPE.MOVE_CONTENT}
                  onChange={() => setRemovalType(REMOVAL_TYPE.MOVE_CONTENT)}
                />
                Revoke user from team and workspaces and move user content to admin
              </label>
              <label className={styles.removeUserRadioLabel}>
                <input
                  type="radio"
                  name="removeType"
                  checked={removalType === REMOVAL_TYPE.KEEP_CONTENT}
                  onChange={() => setRemovalType(REMOVAL_TYPE.KEEP_CONTENT)}
                />
                Revoke user from team and workspaces, allow user to keep all of their content
              </label>
            </div>
          ) : null}
        </>
      )}
      <div className={styles.UserBtnRow}>
        <button
          className={styles.removeUserBtn}
          onClick={handleRevoke}
          disabled={loading || (isPremium && !billingInfo) || loadingRecordings}
        >
          {loading ? <span className={styles.spinner} /> : 'Revoke User'}
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
