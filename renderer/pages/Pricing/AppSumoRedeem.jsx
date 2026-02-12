import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, TextInput } from '@mantine/core';
import Header from '../../components/common/Header';
import { useAuth } from '../../stores/authStore';
import { isUserFreePlan } from '@lib/payment-helper';
import webAPI from '../../lib/webapi';
import { ApiError } from '@schema/index';
import styles from '../../styles/modules/Pricing.module.scss';

export default function AppSumoRedeemPage() {
  const navigate = useNavigate();
  const { ventoUser, loadingUser } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ventoUser && !isUserFreePlan(ventoUser)) {
      navigate('/record');
    }
  }, [ventoUser, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError('');

    const code = formData.get('code');

    if (code && ventoUser?.id) {
      setLoading(true);
      try {
        await webAPI.payment.paymentCheckAppsumoCoupon(code.toString(), ventoUser.id);
        navigate('/record');
      } catch (e) {
        const apiError = e;
        setError(apiError.body?.message || e.message || 'Failed to redeem code');
      } finally {
        setLoading(false);
      }
    }
  }

  if (loadingUser === 'loading') {
    return (
      <>
        <Header />
        <div className={styles.main}>
          <Loader size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <form onSubmit={onSubmit} style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
          <h1>Redeem your AppSumo code</h1>
          <TextInput
            required
            name="code"
            placeholder="Enter your AppSumo Code here"
            error={error}
            size="lg"
            style={{ marginBottom: '1rem' }}
          />
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? <Loader size="sm" color="black" /> : 'Submit'}
          </button>
        </form>
      </main>
    </>
  );
}
