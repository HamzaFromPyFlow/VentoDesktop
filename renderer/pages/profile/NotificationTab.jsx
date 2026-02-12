import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../stores/authStore';
import { debounce } from 'lodash';
import webAPI from '../../lib/webapi';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import ConfirmEmailModal from '../../components/overlays/modals/ConfirmEmailModal';
import ShowMessageModal from '../../components/overlays/modals/ShowMessageModal';
import { NOTIFICATION_EMAIL_CONFIRMATION_MESSAGE, NOTIFICATION_EMAIL_INFO_MESSAGE } from '@lib/constants';
import styles from '../../styles/modules/Profile.module.scss';

const eventMapping = {
  viewsFirstTime: 'someone views my video for first time',
  autoArchived: 'my video is auto archived',
};

const availableNotificationMedium = ['email'];

export default function NotificationTab() {
  const { ventoUser, setVentoUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(ventoUser?.notificationEmail || '');
  const [emailError, setEmailError] = useState(null);
  const [emailValueUpdated, setEmailValueUpdated] = useState(false);
  const [confirmEmailModalOpened, setConfirmEmailModalOpened] = useState(false);
  const [messageModalOpened, setMessageModalOpened] = useState(false);
  const [message, setMessage] = useState(NOTIFICATION_EMAIL_INFO_MESSAGE);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (email === ventoUser?.notificationEmail) {
      setEmailValueUpdated(false);
    }
  }, [ventoUser, ventoUser?.notificationEmail, email]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!ventoUser) return;
      try {
        const response = await webAPI.user.userGetUserSettings(ventoUser.id);
        setSettings(response.notificationSettings);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, [ventoUser]);

  const validate = {
    email: (value) => {
      if (value === '') {
        return 'Email cannot be empty';
      } else if (!value.includes('@')) {
        return 'An email address must contain a single @';
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
        return 'The domain portion of the email address is invalid';
      } else if (!/^\S+@\S+$/.test(value)) {
        return 'Invalid Email';
      }
      return null;
    },
  };

  const handleToggle = (category, action) => {
    if (!ventoUser || !settings) return;
    const updatedSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [action]: !settings[category][action],
      },
    };
    setSettings(updatedSettings);
    updateSettingsinDB(updatedSettings);
  };

  const handleInfoClick = () => {
    setMessage(NOTIFICATION_EMAIL_INFO_MESSAGE);
    setMessageModalOpened(true);
  };

  const handleNotificationEmailUpdate = (e) => {
    const emailValue = e.target.value;
    const validationError = validate.email(emailValue);
    setEmailError(validationError);
    setEmailValueUpdated(emailValue !== ventoUser?.notificationEmail);
    setEmail(emailValue);
  };

  const updateSettingsinDB = useRef(
    debounce((updatedSettings) => {
      if (!ventoUser) return;
      webAPI.user.userUpdateNotificationSettings(ventoUser.id, {
        userNotificationSettings: {
          notificationSettings: updatedSettings,
        },
      });
    }, 600)
  ).current;

  return (
    <>
      <div className={`${styles.titleNoBorder} ${styles.titleNoBorderSmall}`}>
        My activity notifications are sent to:
      </div>
      <span className={styles.notificationEmailinputWrapper}>
        <input
          value={email}
          onChange={handleNotificationEmailUpdate}
          autoFocus={true}
          className={`${styles.inputEmail} ${styles.notificationInputEmail}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.defaultPrevented && emailValueUpdated && !emailError) {
              setConfirmEmailModalOpened(true);
            }
          }}
        />
        <button className={styles.notificationEmailInfo} onClick={handleInfoClick}>
          <IoMdInformationCircleOutline size={20} color="#616161" />
        </button>
      </span>
      {emailError && <p className={styles.error}>{emailError}</p>}
      <button
        className={`${styles.changeNotificationEmailBtn} ${styles.changeEmailBtn}`}
        onClick={() => setConfirmEmailModalOpened(true)}
        disabled={!emailValueUpdated || !!emailError}
      >
        Change Email
      </button>
      <div className={styles.line}></div>
      <div className={styles.titleNoBorder}>When...</div>
      <div className={styles.notificationSettingsContainer}>
        <div className={styles.notificationSetting}>
          <div className={styles.event}></div>
          <div className={styles.notificationAction}>Send Email</div>
          <div className={styles.notificationAction}>Send desktop notification</div>
          <div className={styles.notificationAction}>Send SMS notification</div>
        </div>
        {settings ? (
          <>
            {Object.entries(settings).map(([category, actions]) => (
              <div key={category} className={styles.notificationSetting}>
                <div className={styles.event}>
                  {eventMapping[category] || category}
                </div>
                {Object.entries(actions).map(([action, value]) => (
                  <div key={action} className={styles.notificationActionToggle}>
                    {availableNotificationMedium.includes(action) && (
                      <label className={styles.switch} data-label={`Send ${action} notification`}>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleToggle(category, action)}
                        />
                        <span className={`${styles.slider} ${styles.round}`}></span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </>
        ) : (
          <div className={styles.bouncingLoader} style={{ marginTop: '50px' }}>
            <div className={styles.dot} />
            <div className={styles.dot} />
            <div className={styles.dot} />
          </div>
        )}
      </div>

      <ConfirmEmailModal
        opened={confirmEmailModalOpened}
        newEmail={email}
        loading={loading}
        isNotificationEmail={true}
        onClose={() => setConfirmEmailModalOpened(false)}
        onConfirm={async () => {
          if (!ventoUser || !email || emailError || !emailValueUpdated) {
            return;
          }
          setLoading(true);
          try {
            await webAPI.user.userUpdate(ventoUser.id, { notificationEmail: email });
            setVentoUser({ ...ventoUser, notificationEmail: email });
            setLoading(false);
            setConfirmEmailModalOpened(false);
            setMessage(NOTIFICATION_EMAIL_CONFIRMATION_MESSAGE(email));
            setMessageModalOpened(true);
          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
            setConfirmEmailModalOpened(false);
          }
        }}
      />
      <ShowMessageModal
        opened={messageModalOpened}
        message={message}
        onClose={() => setMessageModalOpened(false)}
      />
    </>
  );
}
