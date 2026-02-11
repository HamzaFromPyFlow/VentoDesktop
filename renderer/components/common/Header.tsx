import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { generateUrl } from '../../lib/utils';
import styles from '../../styles/modules/Header.module.scss';
// TODO: Import these components when they are created
// import ProfileDropdownBtn from '../dropdowns/ProfileDropdownBtn';
// import RecordingsSearchBar from '../recordings-page/RecordingsSearchBar';
import NotificationModal from '../overlays/modals/NotificationModal';
import RecordingsSearchBar from '../recordings-page/RecordingsSearchBar';
// TODO: Import auth hooks when available
// import { useAuth } from '../../stores/authStore';
// import { isUserFreePlan } from '../../lib/payment-helper';
// import { logClientEvent } from '../../lib/misc';

type HeaderProps = {
  hideSignInButton?: boolean;
  hideNewRecordingButton?: boolean;
  showPricing?: boolean;
  leftSlot?: React.ReactNode;
};

// TODO: Implement these helper functions
const isBrowser = () => typeof window !== 'undefined';
const isSupportedBrowser = () => {
  if (!isBrowser()) return false;
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('chrome') || userAgent.includes('edge') || userAgent.includes('brave');
};

// TODO: Implement auth redirect hooks
const useRedirectAuthUrl = () => {
  // TODO: Get from auth store or context
  return '/login';
};

const useSignUpRedirectAuthUrl = () => {
  // TODO: Get from auth store or context
  return '/signup';
};

// TODO: Implement logClientEvent
const logClientEvent = (event: string) => {
  console.log('Event:', event);
  // TODO: Implement analytics tracking
};

// TODO: Implement isUserFreePlan
const isUserFreePlan = (user: any) => {
  // TODO: Check user plan
  return false;
};

export default function Header({
  hideSignInButton,
  hideNewRecordingButton,
  showPricing,
  leftSlot,
}: HeaderProps) {
  // TODO: Get from auth store
  // const { ventoUser } = useAuth();
  // TODO: Get from auth store
  // const { ventoUser } = useAuth();
  const ventoUser: any = null;
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const redirectUrl = useRedirectAuthUrl();
  const signUpRedirectUrl = useSignUpRedirectAuthUrl();
  const homeUrl = ventoUser ? '/recordings' : '/';
  const canRecord = !isBrowser() || isSupportedBrowser();
  // For HashRouter, pathname includes the hash
  const pathname = location.pathname || location.hash.replace('#', '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load Crisp chat widget
  useEffect(() => {
    if (isBrowser()) {
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = '52c60762-bda7-4d9a-94fd-f0a4c0150f55';
      const d = document;
      const s = d.createElement('script');
      s.src = 'https://client.crisp.chat/l.js';
      s.async = true;
      d.getElementsByTagName('head')[0].appendChild(s);
    }
  }, []);

  // Load Google Analytics
  useEffect(() => {
    if (isBrowser()) {
      // Load gtag script
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-EQQD9EBWMV';
      document.head.appendChild(script1);

      // Initialize gtag
      const script2 = document.createElement('script');
      script2.id = 'gtag';
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', 'G-EQQD9EBWMV');
      `;
      document.head.appendChild(script2);
    }
  }, []);

  return (
    <>
      <nav className={styles.header}>
        <div className={styles.leftContainer}>
          <img
            className={styles.image}
            src="/assets/green-logo.png"
            alt="vento logo"
            width={32}
          />
          <a href={generateUrl(homeUrl, searchParams)} className={styles.logo}>
            ento
          </a>
          {leftSlot}
          {showPricing && isUserFreePlan(ventoUser) && (
            <a
              href={generateUrl('/pricing', searchParams)}
              className={styles.pricing}
            >
              Pricing
            </a>
          )}
        </div>
        {(pathname === '/recordings' || pathname === '#/recordings') && (
          <div className={styles.midContainer}>
            <RecordingsSearchBar />
          </div>
        )}
        <div className={styles.rightContainer}>
          {!hideNewRecordingButton && (
            <button
              className={styles.newRecording}
              onClick={() => {
                if (!canRecord) {
                  return setIsModalOpen(true);
                }
                window.location.href = generateUrl('/record/new', searchParams);
              }}
            >
              Start Recording
            </button>
          )}

          {!hideSignInButton && (
            <>
              {!ventoUser ? (
                <div className={styles.authBtn}>
                  <a
                    href={generateUrl(redirectUrl, searchParams)}
                    className={styles.logIn}
                    onClick={() => logClientEvent('click.header.login')}
                  >
                    Login
                  </a>
                  <a
                    href={generateUrl(signUpRedirectUrl, searchParams)}
                    className={styles.signUp}
                    onClick={() => logClientEvent('click.header.signup')}
                  >
                    Sign up
                  </a>
                </div>
              ) : (
                // TODO: Uncomment when ProfileDropdownBtn is created
                // <ProfileDropdownBtn />
                <div>Profile</div>
              )}
            </>
          )}
        </div>
        <NotificationModal
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          modalTitle="Browser not supported"
          modalBody="Vento works best with Chrome, Edge and Brave browsers. Please switch to one of those browsers to begin recording using Vento."
        />
      </nav>
    </>
  );
}

// Extend Window interface for Crisp
declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
    dataLayer: any[];
  }
}
