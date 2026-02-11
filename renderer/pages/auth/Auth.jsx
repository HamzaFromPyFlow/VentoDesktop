import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader, PasswordInput, TextInput } from '@mantine/core';
import Header from '../../components/common/Header';
import styles from '../../styles/modules/Auth.module.scss';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/login' || location.pathname === '/auth/login';
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formTitleContent, setFormTitleContent] = useState("Welcome to Vento");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (value) => {
    if (value === '') {
      return 'Please enter email to signup';
    } else if (!(value.includes('@'))) {
      return 'An email address must contain a single @';
    } else if (!(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value))) {
      return 'The domain portion of the email address is invalid';
    } else if (!(/^\S+@\S+$/.test(value))) {
      return 'Invalid Email';
    } else {
      return null;
    }
  };

  const validatePassword = (value) => {
    if (value === '') {
      return 'Please enter password to signup';
    } else {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    
    setEmailError(emailErr || '');
    setPasswordError(passwordErr || '');
    
    if (emailErr || passwordErr) {
      return;
    }
    
    setIsSubmitting(true);
    
    // TODO: Implement actual authentication logic
    // For now, just simulate a delay
    setTimeout(() => {
      console.log('Form submitted:', { email, password });
      setIsSubmitting(false);
      // Navigate to home after successful auth
      // navigate('/');
    }, 1000);
  };


  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleProviderSignIn = async (provider) => {
    console.log(`Sign in with ${provider}`);
    // TODO: Implement OAuth provider sign-in
  };

  return (
    <main className={styles.main}>
      <Header pricing={false} startRecording={false} login={false} signup={false} />

      <div className={styles.contentWrapper}>
        <>
          <h1 className={styles.title}>{formTitleContent}</h1>
          <p className={styles.sub}>
            {isLogin ? (
              <>Need a Vento account? <span onClick={handleSignup}>Signup</span></>
            ) : (
              <>Create a free account or <span onClick={handleLogin}>login</span></>
            )}
          </p>
        </>

        <div className={styles.btnContainer}>
          <button
            onClick={() => handleProviderSignIn("google")}
            className={styles.signInBtn}
          >
            Sign in with Google
            <img src="/assets/auth/google-icon.png" alt="google" onError={(e) => e.target.style.display = 'none'} />
          </button>
          <button
            onClick={() => handleProviderSignIn("microsoft")}
            className={styles.signInBtn}
          >
            Sign in with Microsoft
            <img src="/assets/auth/microsoft-icon.png" alt="microsoft" onError={(e) => e.target.style.display = 'none'} />
          </button>
        </div>
        
        <div className={styles.separator}>
          <h2>or</h2>
          <div className={styles.line}></div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <TextInput
            withAsterisk
            size="lg"
            placeholder="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            error={emailError}
            styles={{
              error: {
                marginBottom: '0.75rem'
              },
              input: {
                '&:focus-within': {
                  borderColor: '#68E996',
                }
              }
            }}
          />
          <PasswordInput
            placeholder="password"
            size="lg"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError('');
            }}
            error={passwordError}
            styles={{
              input: {
                '&:focus-within': {
                  borderColor: '#68E996',
                }
              }
            }}
          />
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={styles.submitButton}
          >
            {isSubmitting ? <Loader size={30} /> : isLogin ? 'Login' : 'Sign up'}
          </button>
          {isLogin ? (
            <p className={styles.sub}>
              Forgot your password? <span><a href="#/reset-password">Reset</a></span>
            </p>
          ) : (
            <>
              <p className={styles.sub}>
                By signing up, you agree to our <span>
                  <a href="#/policy?content=terms-of-service" target="_blank">Terms</a>
                </span> and our <span><a href="#/policy?content=privacy-policy" target="_blank">Privacy Policy</a></span>
              </p>
            </>
          )}
        </form>
      </div>
    </main>
  );
}
