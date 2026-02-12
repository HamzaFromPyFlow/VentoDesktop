import { useEffect, useState } from 'react';
import { useAuth } from '../../stores/authStore';
import webAPI from '../../lib/webapi';
import ShowMessageModal from '../../components/overlays/modals/ShowMessageModal';
import styles from '../../styles/modules/Auth.module.scss';

export default function AuthVerifyPage() {
  const { ventoUser } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const fetchCount = async () => {
      if (!ventoUser?.id) return;
      try {
        const res = await webAPI.user.userGetVerificationResendCount(ventoUser.id);
        if (typeof res?.count === 'number') setResendCount(res.count);
      } catch (err) {
        console.error('Failed to fetch resend count:', err);
      }
    };
    fetchCount();
  }, [ventoUser?.id]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!ventoUser?.email || isResending || resendCount >= 3 || countdown > 0) return;
    try {
      setIsResending(true);
      await webAPI.user.userSendVerificationEmail({
        email: ventoUser.email,
        isEmailChanged: !!ventoUser.isEmailChanged,
      });
            setModalMessage(`An new activation email has been sent to: ${ventoUser.email}`);
      setModalOpen(true);
      setCountdown(60);
      if (ventoUser?.id) {
        const res = await webAPI.user.userUpdateVerificationResendCount(ventoUser.id, {
          increment: true,
        });
        if (typeof res?.count === 'number') setResendCount(res.count);
        else setResendCount((c) => c + 1);
      } else {
        setResendCount((c) => c + 1);
      }
    } catch (e) {
      setModalMessage('Unable to send the email. Please contact support!');
      setModalOpen(true);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.contentWrapper}>
        <div className={styles.logo}>
          <img
            className={styles.image}
            src="/assets/vento-logo.png"
            alt="vento logo"
            width={147}
          />
        </div>
        {ventoUser?.isEmailChanged ? (
          <h1>Check your email to verify your new account</h1>
        ) : (
          <h1>Check your email to activate your account</h1>
        )}
        <p>
          We've sent an email with an activation link to <b>{ventoUser?.email}.</b>
        </p>
        <div className={styles.accounts}>
          <div
            className={styles.gmail}
            onClick={() => window.open('https://mail.google.com/mail')}
          >
            <img src="/assets/gmail-icon.png" alt="gmail icon" />
            <span>Open Gmail</span>
          </div>
          <div
            className={styles.outlook}
            onClick={() => window.open('https://outlook.live.com/mail')}
          >
            <img src="/assets/outlook-icon.png" alt="outlook-icon" />
            <span>Open Outlook</span>
          </div>
        </div>
        <p className={styles.tip}>
          {resendCount >= 3 ? (
            <>Can't find the email? Check your spam folder or contact support.</>
          ) : countdown > 0 ? (
            <>Can't find the email? Check your spam folder or resend in {countdown} seconds</>
          ) : (
            <>
              Can't find the email? Check your spam folder or click to{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleResend();
                }}
                aria-disabled={isResending}
                style={{
                  pointerEvents: isResending ? 'none' : 'auto',
                  color: '#68E997',
                  textDecoration: 'none',
                }}
              >
                {isResending ? 'resending...' : 'resend'}
              </a>
            </>
          )}
        </p>
      </div>
      <ShowMessageModal opened={modalOpen} message={modalMessage} onClose={() => setModalOpen(false)} />
    </main>
  );
}
