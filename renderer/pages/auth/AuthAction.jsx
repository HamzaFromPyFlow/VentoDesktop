import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader } from '@mantine/core';
import { generateUrl } from '@lib/helper-pure';
import { isUserFreePlan } from '@lib/payment-helper';
import webAPI from '@lib/webapi';
import { getAuth, applyActionCode } from 'firebase/auth';
import styles from '../../styles/modules/Auth.module.scss';

export default function AuthActionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');
  const inviteToken = searchParams.get('invite-token');

  useEffect(() => {
    if (mode === 'verifyEmail' && oobCode) {
      const auth = getAuth();
      applyActionCode(auth, oobCode)
        .then(async () => {
          const authUser = auth.currentUser;
          await authUser?.reload();
          setIsVerified(true);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Verification error:', error);
          setIsLoading(false);
          setIsVerified(false);
        });
    } else if (mode === 'resetPassword' && oobCode) {
      navigate(`/auth/reset-password?mode=resetPassword&oobCode=${oobCode}`);
    } else {
      setIsLoading(false);
    }
  }, [mode, oobCode, navigate]);

  useEffect(() => {
    const acceptInvitation = async () => {
      if (inviteToken) {
        try {
          await webAPI.team.teamAcceptInvitation(inviteToken);
          localStorage.setItem('invite-accepted', 'true');
        } catch (err) {
          console.error('Failed to accept invitation:', err);
        }
      }
    };
    if (isVerified) {
      acceptInvitation();
    }
  }, [isVerified, inviteToken]);

  return (
    <main className={styles.main}>
      <div className={styles.contentWrapper}>
        {isLoading ? (
          <Loader size={40} />
        ) : (
          <>
            <div className={styles.logo}>
              <img
                className={styles.image}
                src="/assets/vento-logo.png"
                alt="vento logo"
                width={147}
              />
            </div>
            <h1
              dangerouslySetInnerHTML={{
                __html: isVerified
                  ? 'Your account has been verified!'
                  : 'This activation link has expired.<br />Please check your inbox for a new link or contact support.',
              }}
            />
            {isVerified && (
              <a
                href={generateUrl('/recordings')}
                className={styles.recordNow}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/recordings');
                }}
              >
                Get Started
              </a>
            )}
          </>
        )}
      </div>
    </main>
  );
}
