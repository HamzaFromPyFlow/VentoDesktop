import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader, PasswordInput, TextInput, Popover, Progress, Text, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import Header from '../../components/common/Header';
import { obscureFormatEmail, getStrength } from '@lib/helper-pure';
import webAPI from '../../lib/webapi';
import { confirmPasswordReset, fetchSignInMethodsForEmail, getAuth, verifyPasswordResetCode } from 'firebase/auth';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { MdOutlineCancel } from 'react-icons/md';
import styles from '../../styles/modules/Auth.module.scss';

const requirements = [{ re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' }];

function PasswordRequirement({ meets, label }) {
  return (
    <Text
      c={meets ? 'teal' : 'red'}
      style={{ display: 'flex', alignItems: 'center' }}
      mt={7}
      size="sm"
    >
      {meets ? (
        <FaCheck style={{ width: '14px', height: '14px' }} fill="#67E997" />
      ) : (
        <FaTimes style={{ width: '14px', height: '14px' }} fill="red" />
      )}{' '}
      <Box ml={10} style={{ color: meets ? '#67E997' : 'red' }}>
        {label}
      </Box>
    </Text>
  );
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [isResetDone, setIsResetDone] = useState(false);
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');
  const isResetPassword = mode === 'resetPassword' && oobCode;

  const form = useForm({
    initialValues: { email: '' },
    validate: {
      email: (value) => {
        if (value === '') return 'Please enter email to reset your password';
        if (!value.includes('@')) return 'An email address must contain a single @';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          return 'The domain portion of the email address is invalid';
        }
        if (!/^\S+@\S+$/.test(value)) return 'Invalid Email';
        return null;
      },
    },
  });

  const resetForm = useForm({
    initialValues: { password: '', confirmPassword: '' },
    validate: {
      password: (value) => {
        if (value === '') return 'Please enter password';
        if (getStrength(value) !== 100) return 'Password Strength is Low';
        return null;
      },
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const auth = getAuth();
      const signInMethods = await fetchSignInMethodsForEmail(auth, values.email);
      if (signInMethods.length) {
        await webAPI.user.userSendPasswordResetEmail({ email: values.email });
        setIsEmailSent(true);
      } else {
        form.setErrors({ email: 'A user with this email does not exist' });
      }
    } catch (error) {
      console.error('Error:', error);
      form.setErrors({ email: 'We ran into an issue. Please contact support: FB02' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (values) => {
    setIsSubmitting(true);
    const auth = getAuth();
    try {
      if (mode === 'resetPassword' && oobCode) {
        await verifyPasswordResetCode(auth, oobCode);
        await confirmPasswordReset(auth, oobCode, values.password);
        setIsResetDone(true);
        localStorage.removeItem('vento-token');
      }
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(resetForm.values.password)}
    />
  ));

  const strength = getStrength(resetForm.values.password);
  const color = strength === 100 ? 'teal' : 'red';

  useEffect(() => {
    if (strength === 100) {
      setPopoverOpened(false);
    } else {
      if (!popoverOpened && resetForm.values.password) {
        setPopoverOpened(true);
      }
    }
  }, [strength, popoverOpened, resetForm.values.password]);

  return (
    <main className={styles.main}>
      <Header hideSignInButton />
      {isResetDone ? (
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Success!</h1>
          <p>Your password has been updated!</p>
          <a
            href="#/auth/login"
            className={styles.LoginBtn}
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            Return to Login
          </a>
        </div>
      ) : !isResetPassword ? (
        !isEmailSent ? (
          <div className={styles.contentWrapper}>
            <h1 className={styles.title}>Reset your password</h1>
            <p>We'll email you instructions to reset your password.</p>
            <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
              <TextInput
                withAsterisk
                size="lg"
                placeholder="email"
                styles={{
                  error: { marginBottom: '0.75rem' },
                }}
                {...form.getInputProps('email')}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? <Loader size={30} /> : 'Reset Password'}
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.contentWrapper}>
            <h1 className={styles.title}>Success!</h1>
            <p style={{ textAlign: 'left' }}>
              {`We sent an email to ${obscureFormatEmail(form.values.email)}. Please check your email for instructions.`}{' '}
              <br />
              <br />
              <br />
              If you don't see your email soon, check your spam folder.
            </p>
          </div>
        )
      ) : (
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Reset your password</h1>
          <form onSubmit={resetForm.onSubmit((values) => handleResetPassword(values))}>
            <Popover opened={popoverOpened} position="bottom" width="target" transition="pop">
              <Popover.Target>
                <div
                  onFocusCapture={() => setPopoverOpened(true)}
                  onBlurCapture={() => setPopoverOpened(false)}
                >
                  <PasswordInput
                    label="New password"
                    placeholder="new password"
                    size="lg"
                    style={{ marginBottom: '1rem' }}
                    {...resetForm.getInputProps('password')}
                  />
                </div>
              </Popover.Target>
              <Popover.Dropdown>
                <Progress color={color} value={strength} size={5} mb="xs" />
                <PasswordRequirement
                  label="Includes at least 8 characters"
                  meets={resetForm.values.password.length > 7}
                />
                {checks}
              </Popover.Dropdown>
            </Popover>
            <PasswordInput
              size="lg"
              label="Confirm new password"
              placeholder="Confirm new password"
              {...resetForm.getInputProps('confirmPassword')}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? <Loader size={30} /> : 'Reset Password'}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
