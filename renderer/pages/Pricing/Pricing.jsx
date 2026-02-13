import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Loader } from '@mantine/core';
import Header from '../../components/common/Header';
import DowngradePremiumUserModal from '../../components/overlays/modals/DowngradePremiumUserModal';
import { useAuth } from '../../stores/authStore';
import { generateUrl } from '../../lib/utils';
import { logClientEvent } from '../../lib/misc';
import { MONTHLY_PRICE } from '../../lib/constants';
import {
  firePaymentEvent,
  getLtdPaymentLink,
  getMonthlyPaymentLink,
  isUserActiveTeamMember,
  isUserFreePlan,
  isUserTeamAdmin,
} from '../../lib/payment-helper';
import { BsStars } from 'react-icons/bs';
import { IoCloseSharp } from 'react-icons/io5';
import { MdDone } from 'react-icons/md';
import { TiTick } from 'react-icons/ti';
import cx from 'classnames';
import styles from '../../styles/modules/Pricing.module.scss';

const ltdTierFeature = [
  "1 hour Recording Length",
  "1080p Recording Quality",
  "100 Hosted Videos",
  "Zero Processing & Upload Time",
  "Enhanced Audio Transcriptions",
  "Chrome Extension",
];

const allFeatures = [
  "# of hosted videos",
  "Download videos",
  "Transcript generation",
  "Video recording length",
  "Video quality",
  "Transcription accuracy",
  "Transcript downloads",
  "Video Blurring",
  "Upload videos",
  "Invite users",
  "Unarchive archived videos",
  "Add CTA's to videos",
  "Post save Editing",
  "Video Password Protection",
  "Remove Vento CTA from Video",
  "Priority support",
];

const premiumUserFeatureValues = [
  "Unlimited",
  "Unlimited",
  "Unlimited",
  "60 mins/recording",
  "up to 1080p",
  "Enhanced",
  "true",
  "true",
  "true",
  "true",
  "true",
  "true",
  "true",
  "true",
  "true",
  "true",
];

const freeUserFeatureValues = [
  "10 videos",
  "10 total downloads",
  "1 per recording",
  "5 mins/recording",
  "up to 720p",
  "Basic",
  "true",
  "false",
  "false",
  "false",
  "false",
  "false",
  "false",
  "false",
  "false",
  "false",
];

/**
 * @param {Object} props
 * @param {boolean} [props.hideHeader=false] - Whether to hide the header
 */
function Pricing({ hideHeader = false } = {}) {
  const { ventoUser, loadingUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [downgradeModalOpened, setDowngradeModalOpened] = useState(false);
  const onBoarding = searchParams?.get("onBoarding");
  const utmCampaign = searchParams?.get("utm_campaign");
  const isLtd =
    utmCampaign === "ltd" ||
    utmCampaign === "ltdhunt" ||
    utmCampaign === "lifetimo" ||
    utmCampaign === "appsumo";

  useEffect(() => {
    logClientEvent("page.view.pricing");
  }, []);

  useEffect(() => {
    if (isUserActiveTeamMember(ventoUser) && !isUserTeamAdmin(ventoUser)) {
      navigate("/recordings");
    }
  }, [ventoUser, navigate]);

  if (loadingUser === 'loading' || (isUserActiveTeamMember(ventoUser) && !isUserTeamAdmin(ventoUser))) {
    return (
      <div className={styles.loadingOverlay}>
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <>
      {(!hideHeader && !onBoarding) && <Header showPricing={true} />}
      <main className={styles.main} style={hideHeader ? { paddingBottom: '0px' } : {}}>
        <h1 style={!hideHeader ? { fontSize: '2.5rem' } : {}}>Don&apos;t worry, you can cancel or switch plans at any time</h1>
        <div className={styles.table}>
          <div className={cx(styles.tableColumn, styles.featureNameColumn)}>
            <div className={styles.tableHeader}>
              <h4 className={styles.title}>Need Help?</h4>
              <p className={styles.description}>
                Click the chat button in the bottom right corner of the page to chat with someone
              </p>
            </div>
            <div className={styles.mobileHideWrapper}>
              <ul className={cx(styles.featureList, styles.featureNames)}>
                {allFeatures.map((feature, i) => (
                  <li key={i}>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {isLtd ? (
            <div className={styles.tableColumn}>
              <img
                className={styles.image}
                src="/assets/yellow-logo.png"
                alt="vento logo"
              />
              <h4 className={styles.title}>Vento Lifetime</h4>
              <p className={styles.description}>
                Special Lifetime Deal 👀. This is for you special people out
                there.
              </p>
              <div className={styles.priceContainer}>
                <span className={styles.price}>
                  {utmCampaign === "ltdhunt" || utmCampaign === "lifetimo"
                    ? "$55"
                    : utmCampaign === "appsumo"
                      ? "$96"
                      : "$48"}
                </span>
                <span className={styles.interval}>
                  one <br /> time
                </span>

                <span className={styles.savings}>
                  DEAL <BsStars />
                </span>
              </div>
              <Link
                to={generateUrl(getLtdPaymentLink(ventoUser, utmCampaign), searchParams, false)}
                onClick={() => {
                  logClientEvent("click.pricing.ltd");
                }}
                className={styles.ctaBtn}
              >
                Subscribe
              </Link>
              <p>This includes:</p>
              <ul className={styles.featureList}>
                {ltdTierFeature.map((feature, i) => (
                  <li key={i}>
                    <MdDone className={styles.icon} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <div className={styles.tableColumn}>
                <div className={styles.tableHeader}>
                  <h4 className={styles.title}>Vento Premium</h4>
                  <p className={styles.description}>
                    Get access to 1080p, longer recordings, unlimited hosted videos, and more.
                  </p>
                  <div className={styles.priceContainer}>
                    <span className={styles.price}>{MONTHLY_PRICE}</span>
                    <span className={styles.interval}>
                      /month/user
                    </span>
                  </div>
                  <Link
                    to={generateUrl(getMonthlyPaymentLink(ventoUser), searchParams, false)}
                    onClick={() => {
                      firePaymentEvent("monthly");
                      logClientEvent("click.pricing.monthly");
                    }}
                    className={styles.ctaBtn}
                  >
                    Buy Now
                  </Link>
                </div>
                <ul className={cx(styles.featureList, styles.mobileHideWrapper)}>
                  {premiumUserFeatureValues.map((feature, i) => (
                    <li key={i}>
                      {feature === "true" ? (
                        <TiTick className={styles.icon} />
                      ) : feature === "false" ? (
                        <IoCloseSharp className={styles.icon} />
                      ) : (
                        <b>{feature}</b>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.tableColumn}>
                <div className={cx(styles.tableHeader, styles.borderBottom)}>
                  <h4 className={styles.title}>Free</h4>
                  <p className={styles.description}>
                    Get started with Vento.
                  </p>
                  <div className={styles.priceContainer}>
                    <span className={styles.price}>0</span>
                    <span className={styles.interval}>
                      /month
                    </span>
                  </div>
                  <button
                    disabled={!!ventoUser && isUserFreePlan(ventoUser) && !onBoarding}
                    className={cx(styles.ctaBtn, {
                      [styles.disabled]: ventoUser && isUserFreePlan(ventoUser) && !onBoarding,
                    })}
                    onClick={() => {
                      if (ventoUser && !isUserFreePlan(ventoUser)) {
                        setDowngradeModalOpened(true);
                        return;
                      }
                      if (ventoUser && isUserFreePlan(ventoUser) && onBoarding) {
                        navigate(generateUrl("/recordings", searchParams, false));
                        return;
                      }
                      navigate(generateUrl("/login?redirect_to=/new", searchParams, false));
                    }}
                  >
                    {(!ventoUser || onBoarding) ? "Sign Up" : (isUserFreePlan(ventoUser) ? "Current Plan" : "Downgrade To Free")}
                  </button>
                </div>
                <ul className={cx(styles.featureList, styles.mobileHideWrapper)}>
                  {freeUserFeatureValues.map((feature, i) => (
                    <li key={i}>
                      {feature === "true" ? (
                        <TiTick className={styles.icon} />
                      ) : feature === "false" ? (
                        <IoCloseSharp style={{ stroke: "black", strokeWidth: "20" }} className={styles.icon} />
                      ) : (
                        feature
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={cx(styles.laptopHideWrapper)}>
                <ul className={cx(styles.featureList, styles.tableBorder)}>
                  <div className={styles.headerRow}>
                    <div className={styles.headerCol}>Premium</div>
                    <div className={styles.headerCol}>Free</div>
                  </div>
                  {allFeatures.map((feature, i) => (
                    <div key={i} className={styles.featureBlock}>
                      <div className={styles.featureNameRow}>
                        {feature}
                      </div>

                      <div className={styles.featureValueRow}>
                        <div className={styles.col}>
                          {premiumUserFeatureValues[i] === "true" ? <TiTick /> : premiumUserFeatureValues[i] === "false" ? <IoCloseSharp /> : premiumUserFeatureValues[i]}
                        </div>
                        <div className={styles.col}>
                          {freeUserFeatureValues[i] === "true" ? <TiTick /> : freeUserFeatureValues[i] === "false" ? <IoCloseSharp /> : freeUserFeatureValues[i]}
                        </div>
                      </div>
                    </div>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </main>
      <DowngradePremiumUserModal
        opened={downgradeModalOpened}
        onClose={() => setDowngradeModalOpened(false)}
      />
    </>
  );
}

export default Pricing;
