import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import InviteUsersButton from '../../components/invite-users/InviteUsersButton';
import { useAuth } from '../../stores/authStore';
import webAPI from '../../lib/webapi';
import { toTitleCase, validate } from '@lib/helper-pure';
import { isLtd, isUserActiveTeamMember, isUserTeamAdmin } from '@lib/payment-helper';
import styles from '../../styles/modules/Profile.module.scss';
import TeamTab from './TeamTab';
import NotificationTab from './NotificationTab';

const TabsEnum = {
  ACCOUNT: 'ACCOUNT',
  NOTIFICATIONS: 'NOTIFICATIONS',
  TEAM: 'TEAM',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { ventoUser, setVentoUser, signOut } = useAuth();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(
    tabParam && tabParam.toLowerCase() === TabsEnum.TEAM.toLowerCase()
      ? TabsEnum.TEAM
      : TabsEnum.ACCOUNT
  );
  
  const [name, setName] = useState(ventoUser?.displayName || ventoUser?.name || '');
  const [email, setEmail] = useState(ventoUser?.email || '');
  const [emailError, setEmailError] = useState(null);
  const [emailValueUpdated, setEmailValueUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [billingPlan, setBillingPlan] = useState('Free');
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    if (ventoUser) {
      setName(ventoUser.displayName || ventoUser.name || '');
      setEmail(ventoUser.email || '');
      setBillingPlan(
        (isUserActiveTeamMember(ventoUser) && !isUserTeamAdmin(ventoUser))
          ? ventoUser?.teamMemberships?.[0]?.billingPlan
          : ventoUser?.billing?.plan || 'Free'
      );
    }
  }, [ventoUser]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!ventoUser) return;
      try {
        const response = await webAPI.team.teamGetTeamMembers();
        setTeamMembers(response);
      } catch (error) {
        console.error('Failed to fetch team members:', error);
      }
    };
    fetchTeamMembers();
  }, [ventoUser]);

  const handleEmailUpdate = (e) => {
    const emailValue = e.target.value;
    const validationError = validate.email(emailValue);
    setEmailError(validationError);
    setEmailValueUpdated(emailValue !== ventoUser?.email);
    setEmail(emailValue);
  };

  const updateUserName = async (newName) => {
    if (!ventoUser) return;
    try {
      const updatedUser = await webAPI.user.userUpdate(ventoUser.id, { name: newName });
      setVentoUser(updatedUser);
    } catch (error) {
      console.error('Failed to update name:', error);
    }
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    updateUserName(newName);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    navigate(`/profile?tab=${value.toLowerCase()}`);
  };

  if (!ventoUser) {
    return (
      <>
        <Header />
        <div className={styles.main}>
          <p>Please log in to view your profile.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.main}>
        <div className={styles.headerTitle}>
          {Object.values(TabsEnum).map((tab) => {
            if (isLtd(ventoUser) && tab === TabsEnum.TEAM) return null;
            return (
              <div
                key={tab}
                className={`${styles.title} ${activeTab === tab && styles.activeBtn}`}
              >
                <button onClick={() => handleTabChange(tab)}>{toTitleCase(tab)}</button>
              </div>
            );
          })}
          <InviteUsersButton fetchMembers={async () => {
            if (!ventoUser) return;
            try {
              const response = await webAPI.team.teamGetTeamMembers();
              setTeamMembers(response);
            } catch (error) {
              console.error('Failed to fetch team members:', error);
            }
          }} />
        </div>
        <div className={styles.line}></div>

        {activeTab === TabsEnum.NOTIFICATIONS ? (
          <NotificationTab />
        ) : activeTab === TabsEnum.TEAM ? (
          <TeamTab members={teamMembers} setMembers={setTeamMembers} />
        ) : (
          <div>
            <div className={styles.titleNoBorder}>Display Name</div>
            <div className={styles.subtitle}>Changing your name will update your profile</div>
            <input
              value={name}
              onChange={handleNameChange}
              className={styles.input}
              placeholder="Display name"
            />

            <div className={styles.line}></div>

            <div className={styles.titleNoBorder}>Contact Info</div>
            <div className={styles.subtitle2}>Email Address:</div>
            <input
              value={email}
              onChange={handleEmailUpdate}
              className={styles.inputEmail}
              readOnly
            />
            {emailError && <p className={styles.error}>{emailError}</p>}
            <p style={{ fontSize: '12px', marginTop: '10px' }}>
              Email changes are not available in the desktop app yet.
            </p>

            <div className={styles.line}></div>

            <div className={styles.titleNoBorder}>Plan Information</div>
            <div className={styles.subtitle2}>Plan Type:</div>
            <input
              value={billingPlan}
              className={styles.inputEmail}
              readOnly
            />
          </div>
        )}
      </div>
    </>
  );
}
