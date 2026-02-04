import React, { useState } from 'react';
import Header from '../../components/Header';
import { BsStars } from 'react-icons/bs';
import { IoCloseSharp } from 'react-icons/io5';
import { MdDone } from 'react-icons/md';
import { TiTick } from 'react-icons/ti';
import styles from './Pricing.module.css';

const MONTHLY_PRICE = 8;

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

function Pricing() {
  const [isLtd, setIsLtd] = useState(false);
  const [utmCampaign, setUtmCampaign] = useState(null);

  // Check for UTM campaign in URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const campaign = params.get('utm_campaign');
    setUtmCampaign(campaign);
    setIsLtd(
      campaign === "ltd" ||
      campaign === "ltdhunt" ||
      campaign === "lifetimo" ||
      campaign === "appsumo"
    );
  }, []);

  const getLtdPrice = () => {
    if (utmCampaign === "ltdhunt" || utmCampaign === "lifetimo") {
      return "$55";
    } else if (utmCampaign === "appsumo") {
      return "$96";
    }
    return "$48";
  };

  return (
    <>
      <main className={styles.main}>
        <Header pricing={false} />
        <h1>Don&apos;t worry, you can cancel or switch plans at any time</h1>
        <div className={styles.table}>
          <div className={`${styles.tableColumn} ${styles.featureNameColumn}`}>
            <div className={styles.tableHeader}>
              <h4 className={`${styles.title} ${styles.ubuntuTitle}`}>Need Help?</h4>
              <p className={styles.description}>
                Click the chat button in the bottom right corner of the page to chat with someone
              </p>
            </div>
            <div className={styles.mobileHideWrapper}>
              <ul className={`${styles.featureList} ${styles.featureNames}`}>
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
              <h4 className={`${styles.title} ${styles.ubuntuTitle}`}>Vento Lifetime</h4>
              <p className={styles.description}>
                Special Lifetime Deal 👀. This is for you special people out
                there.
              </p>
              <div className={styles.priceContainer}>
                <span className={styles.price}>
                  {getLtdPrice()}
                </span>
                <span className={styles.interval}>
                  one <br /> time
                </span>

                <span className={styles.savings}>
                  DEAL <BsStars />
                </span>
              </div>
              <a
                href="#/subscribe"
                className={styles.ctaBtn}
              >
                Subscribe
              </a>
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
                  <h4 className={`${styles.title} ${styles.ubuntuTitle}`}>Vento Premium</h4>
                  <p className={styles.description}>
                    Get access to 1080p, longer recordings, unlimited hosted videos, and more.
                  </p>
                  <div className={styles.priceContainer}>
                    <span className={`${styles.price} ${styles.ubuntuTitle}`}  >{MONTHLY_PRICE}</span>
                    <span className={styles.interval}>
                      /month/user
                    </span>
                  </div>
                  <a
                    href="#/subscribe"
                    className={styles.ctaBtn}
                  >
                    Buy Now
                  </a>
                </div>
                <ul className={`${styles.featureList} ${styles.mobileHideWrapper}`}>
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
                <div className={`${styles.tableHeader} ${styles.borderBottom}`}>
                  <h4 className={`${styles.title} ${styles.ubuntuTitle}`}>Free</h4>
                  <p className={styles.description}>
                    Get started with Vento.
                  </p>
                  <div className={styles.priceContainer}>
                    <span className={`${styles.price} ${styles.ubuntuTitle}`}>0</span>
                    <span className={styles.interval}>
                      /month
                    </span>
                  </div>
                  <button
                    className={styles.ctaBtn}
                  >
                    Sign Up
                  </button>
                </div>
                <ul className={`${styles.featureList} ${styles.mobileHideWrapper}`}>
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

              <div className={styles.laptopHideWrapper}>
                <ul className={`${styles.featureList} ${styles.tableBorder}`}>
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
    </>
  );
}

export default Pricing;
