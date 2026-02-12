import { useState, useEffect, useReducer } from 'react';
import { useAuth } from '../../stores/authStore';
import { toTitleCase } from '@lib/helper-pure';
import webAPI from '@lib/webapi';
import { TeamMemberModel } from '@schema/index';
import { FaUserAlt } from 'react-icons/fa';
import CancelInvitation from '../../components/invite-users/CancelInvitation';
import DeleteTeamMember from '../../components/invite-users/DeleteTeamMember';
import ResendInviteUser from '../../components/invite-users/ResendInviteUser';
import RevokeTeamMember from '../../components/invite-users/RevokeTeamMember';
import InviteUsersGenralModel from '../../components/overlays/modals/InviteUsersGeneralModal';
import UpdateTeamNameModal from '../../components/overlays/modals/UpdateTeamNameModal';
import styles from '../../styles/modules/Profile.module.scss';

export default function TeamTab({ members, setMembers }) {
  const { ventoUser } = useAuth();
  const [teamName, setTeamName] = useState(ventoUser?.teamMemberships?.[0]?.team?.name || '');
  const [nameError, setNameError] = useState(null);
  const [teamNameUpdated, setTeamNameUpdated] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resendModalOpen, setResendModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [updateTeamNameModalOpened, setUpdateTeamNameModalOpened] = useState(false);

  useEffect(() => {
    setTeamName(ventoUser?.teamMemberships?.[0]?.team?.name || '');
  }, [ventoUser]);

  const handleTeamNameUpdate = (e) => {
    const nameValue = e.target.value;
    setNameError(nameValue === '' ? 'Name cannot be empty' : null);
    setTeamNameUpdated(nameValue !== ventoUser?.teamMemberships?.[0]?.team?.name);
    setTeamName(nameValue);
  };

  const updateMember = (email, status) => {
    setMembers((prev) =>
      prev.map((member) =>
        (member.user?.email || member.user?.name) === email
          ? { ...member, status }
          : member
      )
    );
  };

  const removeMember = (email) => {
    setMembers((prev) =>
      prev.filter((member) => (member.user?.email || member.user?.name) !== email)
    );
  };

  const onSubmitTeamName = async () => {
    if (!ventoUser?.teamMemberships?.[0]?.teamId) return;
    try {
      await webAPI.team.teamUpdate(ventoUser.teamMemberships[0].teamId, { name: teamName });
      setUpdateTeamNameModalOpened(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!ventoUser?.teamMemberships || ventoUser?.teamMemberships?.length === 0) {
    return null;
  }

  const isAdmin = ventoUser?.teamMemberships?.[0]?.role === TeamMemberModel.role.ADMIN;

  return (
    <>
      <div className={styles.teamTableContainer}>
        <table className={styles.teamTable}>
          <thead className={styles.teamTableHead}>
            <tr>
              <th className={styles.userCol}>User</th>
              <th className={styles.smallCol}>Role</th>
              <th className={styles.smallCol}>Status</th>
              <th className={styles.largeCol}>Billing</th>
              {isAdmin && (
                <>
                  <th className={styles.smallCol}></th>
                  <th className={styles.smallCol}></th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {members.map((member, idx) => (
              <tr
                key={member.id}
                className={`${styles.rowWrapper} ${idx % 2 === 0 ? styles.darkBg : styles.lightBg}`}
              >
                <td>
                  <div className={styles.userInfo}>
                    {member.user?.profilePhotoUrl ? (
                      <img
                        src={member.user.profilePhotoUrl}
                        alt="user profile"
                        className={styles.avatar}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <FaUserAlt className={styles.avatar} />
                    )}
                    <span className={styles.userName}>{member.user?.name || 'Unknown'}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.standardWeight}>{toTitleCase(member.role)}</div>
                </td>
                <td>
                  <div className={styles.standardWeight}>{toTitleCase(member.status)}</div>
                </td>
                <td>
                  <div className={styles.standardWeight}>{member.billingPlan || 'N/A'}</div>
                </td>
                {isAdmin && (
                  <>
                    <td style={{ textAlign: 'right' }}>
                      {member.role === TeamMemberModel.role.RECORDER &&
                        (member.status === TeamMemberModel.status.DECLINED ||
                          member.status === TeamMemberModel.status.INV_CANCELLED) && (
                          <button
                            className={styles.reSendUserBtnOutline}
                            onClick={() => {
                              setSelectedMember(member);
                              setResendModalOpen(true);
                            }}
                          >
                            Resend Invite
                          </button>
                        )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {member.role === TeamMemberModel.role.RECORDER &&
                        member.status === TeamMemberModel.status.PENDING && (
                          <button
                            className={styles.cancelInviteBtnOutline}
                            onClick={() => {
                              setSelectedMember(member);
                              setCancelModalOpen(true);
                            }}
                          >
                            Cancel Invite
                          </button>
                        )}
                      {member.role === TeamMemberModel.role.RECORDER &&
                        member.status === TeamMemberModel.status.ACTIVE && (
                          <button
                            className={styles.removeUserBtnOutline}
                            onClick={() => {
                              setSelectedMember(member);
                              setRevokeModalOpen(true);
                            }}
                          >
                            Revoke User
                          </button>
                        )}
                      {(member.status === TeamMemberModel.status.DECLINED ||
                        member.status === TeamMemberModel.status.INV_CANCELLED ||
                        member.status === TeamMemberModel.status.REVOKED) && (
                        <button
                          className={styles.deleteUserBtnOutline}
                          onClick={() => {
                            setSelectedMember(member);
                            setDeleteModalOpen(true);
                          }}
                        >
                          Delete User
                        </button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.line}></div>
      <div className={`${styles.titleNoBorder} ${styles.mb1}`}>Team Info</div>
      <div className={styles.flexBox}>
        <div>
          <div className={styles.subtitle}>Team Name:</div>
          <input
            value={teamName}
            onChange={handleTeamNameUpdate}
            className={styles.input}
            readOnly={!isAdmin}
          />
          {nameError && <p className={styles.error}>{nameError}</p>}
          {isAdmin && (
            <button
              className={styles.changeTeamNameBtn}
              onClick={() => setUpdateTeamNameModalOpened(true)}
              disabled={!teamNameUpdated || !!nameError}
            >
              Change Team Name
            </button>
          )}
        </div>
        <div className={styles.chipSection}>
          <div className={styles.titleNoWeight}>
            Team ID: {ventoUser?.teamMemberships?.[0]?.teamId}
          </div>
        </div>
      </div>
      <div className={styles.line}></div>

      <UpdateTeamNameModal
        opened={updateTeamNameModalOpened}
        newName={teamName}
        loading={false}
        onClose={() => setUpdateTeamNameModalOpened(false)}
        onConfirm={onSubmitTeamName}
      />

      {resendModalOpen && selectedMember && (
        <InviteUsersGenralModel opened={resendModalOpen} onClose={() => setResendModalOpen(false)}>
          <ResendInviteUser
            onClose={() => setResendModalOpen(false)}
            email={selectedMember?.user?.email || selectedMember?.user?.name}
            updateMember={updateMember}
            teamId={ventoUser?.teamMemberships?.[0]?.teamId}
          />
        </InviteUsersGenralModel>
      )}

      {revokeModalOpen && selectedMember && (
        <InviteUsersGenralModel opened={revokeModalOpen} onClose={() => setRevokeModalOpen(false)}>
          <RevokeTeamMember
            onClose={() => setRevokeModalOpen(false)}
            email={selectedMember?.user?.email || selectedMember?.user?.name}
            teamId={ventoUser?.teamMemberships?.[0]?.teamId}
            updateMember={updateMember}
            removeMember={removeMember}
            isDeclined={false}
            isPremium={selectedMember?.billingPlan === TeamMemberModel.billingPlan.PREMIUM}
          />
        </InviteUsersGenralModel>
      )}

      {deleteModalOpen && selectedMember && (
        <InviteUsersGenralModel opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
          <DeleteTeamMember
            onClose={() => setDeleteModalOpen(false)}
            email={selectedMember?.user?.email || selectedMember?.user?.name}
            teamId={ventoUser?.teamMemberships?.[0]?.teamId}
            removeMember={removeMember}
            status={selectedMember.status}
          />
        </InviteUsersGenralModel>
      )}

      {cancelModalOpen && selectedMember && (
        <InviteUsersGenralModel opened={cancelModalOpen} onClose={() => setCancelModalOpen(false)}>
          <CancelInvitation
            onClose={() => setCancelModalOpen(false)}
            email={selectedMember?.user?.email || selectedMember?.user?.name}
            teamId={ventoUser?.teamMemberships?.[0]?.teamId}
            invitationId={selectedMember.id}
            updateMember={updateMember}
          />
        </InviteUsersGenralModel>
      )}
    </>
  );
}
