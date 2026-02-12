import Header from '../../components/common/Header';
import styles from '../../styles/modules/Auth.module.scss';

export default function InvitationExpiredPage() {
  return (
    <>
      <Header />
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
          <h1>Invitation Expired</h1>
          <p>This invitation link has expired. Please contact your team administrator for a new invitation.</p>
        </div>
      </main>
    </>
  );
}
