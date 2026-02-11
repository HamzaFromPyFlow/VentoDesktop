import React, { useRef, useState, useEffect } from 'react';
import { Loader, Tooltip } from '@mantine/core';
import { BiChevronsDown } from 'react-icons/bi';
import { RxCross2 } from 'react-icons/rx';
import InviteUserMessage from './InviteUserMessage';
import styles from '../../styles/modules/InviteUsers.module.scss';
// TODO: Import these when available
// import { useAuth } from '../../stores/authStore';
// import { toTitleCase, validate } from '../../lib/utils';
// import webAPI from '../../lib/webapi';
// import { CancelablePromise } from '../../lib/types';

type Role = 'Premium' | 'Free';

enum Tabs {
  INVITE = "INVITE",
}

const EMAIL_SELECTION_KEYS = [
  'Enter',
  'Tab',
  ' '
];

interface InviteUsersProps {
  onClose: () => void;
  fetchMembers?: () => Promise<void>;
}

const MAX_TAG_LENGTH = 35;

// TODO: Implement these utility functions
const toTitleCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
const validate = {
  email: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(email);
  }
};

export default function InviteUsers({ onClose, fetchMembers }: InviteUsersProps) {
  const [activeTab, setActiveTab] = useState(Tabs.INVITE);
  const [email, setEmail] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [role, setRole] = useState<Role>('Premium');
  const roleRef = useRef(role);
  const [message, setMessage] = useState('Hey! Come join me on Vento so we can create videos and collaborate!');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tooltipLabel, setTooltipLabel] = useState("");
  const [disabledInvite, setDisabledInvite] = useState(false);
  const [loading, setLoading] = useState(false);
  // TODO: Get from auth store
  // const { ventoUser } = useAuth();
  const ventoUser: any = null;
  const [modalOpen, setModalOpen] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState('');
  const [inviteSuccessful, setInviteSuccessful] = useState(false);
  const [billingInfo, setBillingInfo] = useState<{ fcpu: number, pcpu: number, totalAmountBilled: number, nextBillingDate: string, planFrequency: string } | null>(null);
  const [spinner, setSpinner] = useState<boolean>(false);
  const billingPromiseRef = useRef<any>(null);
  const checkInvitePromiseRef = useRef<any>(null);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  const handleAddEmail = async () => {
    if (!inputEmail) {
      return;
    }
    setEmail(inputEmail);
    setSpinner(false);
    setDisabledInvite(false);
    setInputEmail('');

    // First validate the email format
    if (validate.email(inputEmail)) {
      setTooltipLabel('Invalid email address');
      setBillingInfo(null);
      return;
    }

    // Then check if it's the current user's email
    if (ventoUser?.email === inputEmail) {
      setTooltipLabel('Cannot invite yourself');
      setBillingInfo(null);
      return;
    }

    setDisabledInvite(true);

    try {
      // TODO: Implement API call
      // checkInvitePromiseRef.current = webAPI.team.teamCheckIfUserCanBeInvited({ email: inputEmail });
      // const response = await checkInvitePromiseRef.current;
      // if (!response?.canInvite) {
      //   setTooltipLabel('User is already on existing team');
      //   setDisabledInvite(false);
      //   setBillingInfo(null);
      //   return;
      // }
      await getBillingInfo(roleRef.current);
    } catch (error) {
      console.error('Error:', error);
      setBillingInfo(null);
    } finally {
      setDisabledInvite(false);
      setSpinner(false);
    }
  };

  const handleInputBlur = () => {
    if (inputEmail) {
      handleAddEmail();
    }
  };

  const handleInvite = async () => {
    // Check if button should be disabled
    if (!!tooltipLabel || !email || disabledInvite || (role === 'Premium' && !billingInfo)) {
      return;
    }

    const teamId = ventoUser?.teamMemberships?.[0]?.teamId;
    if (teamId && email) {
      setLoading(true);
      try {
        // TODO: Implement API call
        // const response = await webAPI.team.teamCreateInvitation(teamId, { email: email, billingPlan: role.toUpperCase(), inviteMsg: message });
        setInviteSuccessful(true);
        await fetchMembers?.();
      } catch (err) {
        setInviteSuccessful(false);
      }
      setLoading(false);
      setInvitedEmail(email);
      setModalOpen(true);
    }
  };

  const getBillingInfo = async (role: Role) => {
    if (billingPromiseRef.current) {
      return;
    }
    if (role === 'Premium') {
      setSpinner(true);
      setDisabledInvite(true);
      try {
        // TODO: Implement API call
        // billingPromiseRef.current = webAPI.team.teamGetBillingInfo();
        // const billingResponse = await billingPromiseRef.current;
        // billingPromiseRef.current = null;
        // setBillingInfo({
        //   fcpu: billingResponse.fcpu,
        //   pcpu: billingResponse.pcpu,
        //   totalAmountBilled: billingResponse.totalAmountBilled,
        //   nextBillingDate: billingResponse.nextBillingDate,
        //   planFrequency: billingResponse.planFrequency,
        // });
      } catch (error) {
        console.error('Failed to get billing info:', error);
        billingPromiseRef.current = null;
      } finally {
        setSpinner(false);
        setDisabledInvite(false);
      }
    }
  };

  const cancelCheckInviteApi = () => {
    if (checkInvitePromiseRef.current) {
      // TODO: Implement cancel
      // checkInvitePromiseRef.current.cancel();
      checkInvitePromiseRef.current = null;
    }
  };

  const cancelBillingApi = () => {
    if (billingInfo == null && billingPromiseRef.current) {
      // TODO: Implement cancel
      // billingPromiseRef.current.cancel();
      billingPromiseRef.current = null;
    }
  };

  const handleRemoveEmail = () => {
    cancelCheckInviteApi();
    cancelBillingApi();
    setInputEmail('');
    setDisabledInvite(false);
    setSpinner(false);
    setBillingInfo(null);
    setTooltipLabel('');
    setEmail('');
  };

  const toggleRole = async (value: 'Premium' | 'Free') => {
    setRole(value);
    setDropdownOpen(false);
    if (value === 'Free') {
      cancelBillingApi();
      setBillingInfo(null);
      setSpinner(false);
      setDisabledInvite(false);
    } else if (!tooltipLabel && !validate.email(email)) {
      try {
        await getBillingInfo(value);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setSpinner(false);
        setDisabledInvite(false);
      }
    }
  };

  const otherOption = role === 'Premium' ? 'Free' : 'Premium';

  const isNotice = () => {
    return email && billingInfo && !tooltipLabel && role === 'Premium';
  };

  return (
    <>
      {modalOpen ? (
        <InviteUserMessage
          email={invitedEmail}
          onClose={onClose}
          check={inviteSuccessful}
        />
      ) : (
        <>
          <div className={styles.headerTitle}>
            {Object.values(Tabs).map((tab) =>
              <div key={tab} className={`${styles.title} ${activeTab === tab && styles.activeBtn}`}>
                <button onClick={() => setActiveTab(tab)}>{toTitleCase(tab)}</button>
              </div>
            )}
          </div>
          <div className={styles.line}></div>
          <div className={styles.container}>
            <div className={styles.inviteTag}>Enter email address below and press return or tab</div>
            <div className={`${styles.groupedInput} ${((!spinner && !billingInfo)) && styles.mb}`}>
              <div className={styles.inputRow}>
                {email ? (
                  <div className={styles.emailTagContainer}>
                    {tooltipLabel ? (
                      <Tooltip label={tooltipLabel}>
                        <span className={styles.emailTag}>
                          <img style={{ marginRight: '5px' }} src="/assets/red-circle.svg" alt="error" />
                          {email.length > MAX_TAG_LENGTH ? email.slice(0, MAX_TAG_LENGTH - 3) + '...' : email}
                          <RxCross2 size={28} style={{ cursor: 'pointer' }} onClick={() => handleRemoveEmail()} />
                        </span>
                      </Tooltip>
                    ) : (
                      <span className={styles.emailTag}>
                        {email.length > MAX_TAG_LENGTH ? email.slice(0, MAX_TAG_LENGTH - 3) + '...' : email}
                        <RxCross2 size={28} style={{ cursor: 'pointer' }} onClick={() => handleRemoveEmail()} />
                      </span>
                    )}
                  </div>
                ) :
                  <input
                    className={styles.emailInput}
                    type="email"
                    placeholder="email address"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (EMAIL_SELECTION_KEYS.includes(e.key)) {
                        e.preventDefault();
                        handleAddEmail();
                      }
                    }}
                    onBlur={handleInputBlur}
                  />
                }
                <div className={styles.dropdownContainer}>
                  <div className={styles.dropdownSelected} onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <button className={styles.dropdownToggle}>
                      {role}
                    </button>
                    <BiChevronsDown size={24} className={styles.dropdownArrow} />
                  </div>
                  {dropdownOpen && (
                    <div className={styles.dropdownOptions}>
                      <div className={styles.dropdownOption} onClick={() => toggleRole(otherOption as 'Premium' | 'Free')}>
                        {otherOption}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <textarea
                className={styles.messageBox}
                maxLength={500}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            {spinner ? (
              <div className={styles.spinloader + ' ' + styles.notice}>
                <Loader color="dark" size="md" />
              </div>
            ) : (
              isNotice() && billingInfo && !tooltipLabel && (
                <div className={styles.notice}>
                  <div className={styles.noticeHeader}>💳 You won&apos;t be charged until user accepts invite</div>
                  <div className={styles.highlightBox}>
                    Estimated charge: <strong>up to ${billingInfo.fcpu.toFixed(2)}</strong>
                    <br />
                    <small>Based on your billing cycle. You&apos;ll get an email with exact amount once they accept.</small>
                  </div>
                </div>
              )
            )}
            <div className={styles.line}></div>
            <button
              className={`${styles.inviteBtn} ${styles.modal} ${(!!tooltipLabel || !email || disabledInvite || (role === 'Premium' && !billingInfo)) ? styles.btnDisabled : ''}`}
              onClick={handleInvite}
            >
              {loading ?
                <Loader color="dark" size={'sm'} /> :
                "Invite"
              }
            </button>
          </div>
        </>
      )}
    </>
  );
}
