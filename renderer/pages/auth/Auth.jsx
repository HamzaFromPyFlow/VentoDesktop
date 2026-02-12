import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Box, Loader, PasswordInput, Popover, Progress, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { FaCheck, FaTimes } from 'react-icons/fa';
import Header from '../../components/common/Header';
import InvitedUserEmailMismatch from '../../components/invite-users/InvitedUserEmailMismatch';
import InviteUsersGenralModel from '../../components/overlays/modals/InviteUsersGeneralModal';
import { useAuth } from '../../stores/authStore';
import { getStrength, validate } from '../../lib/helper-pure';
import { logClientEvent } from '../../lib/misc';
import webAPI from '../../lib/webapi';
import { generateUrl } from '../../lib/helper-pure';
import styles from '../../styles/modules/Auth.module.scss';

const requirements = [
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

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
      <Box ml={10} style={{ color: meets ? "#67E997" : "red" }}>{label}</Box>
    </Text>
  );
}

export default function AuthPage({ login = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [isReCaptcha, setIsReCaptcha] = useState(false);
  const [redirectedFromAnymsRec, setRedirectedFromAnymsRec] = useState(false);
  const [teamAdmin, setTeamAdmin] = useState(null);
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const [formTitleContent, setFormTitleContent] = useState("Welcome to Vento");
  const [inviteToken, setInviteToken] = useState("");
  const [isInvitationLoading, setIsInvitationLoading] = useState(false);
  const [invitationEmail, setInvitationEmail] = useState("");
  const isLogin = login ? true : false;

  const [modalStates, setModalStates] = useReducer(
    (prev, cur) => ({ ...prev, ...cur }),
    {
      isInvitedEmailMismatch: false,
    }
  );

  useEffect(() => {
    logClientEvent("page.view.login");
    const query = new URLSearchParams(window.location.search);
    const redirectedfromPlayback = query.get("anyms_video") ?? false;
    if (redirectedfromPlayback) {
      setRedirectedFromAnymsRec(true);
    }
  }, []);

  useEffect(() => {
    if (searchParams.get('email_changed')) {
      setFormTitleContent("Login with your new email!");
    }

    const token = searchParams.get('invite-token');
    if (token) {
      const fetchAdmin = async () => {
        try {
          const admin = await webAPI.team.teamGetAdminByInvitationId(token);
          setTeamAdmin(admin);
          setInviteToken(token);
        } catch (error) {
          console.error('Failed to fetch team admin details:', error);
        }
        setIsTokenChecked(true);
      };

      const fetchInvitation = async () => {
        console.log('fetchInvitation called with token:', token);
        setIsInvitationLoading(true);
        try {
          const invitation = await webAPI.team.teamGetInvitationById(token);
          console.log('Invitation fetched successfully:', invitation);
          setInvitationEmail(invitation.email);
        } catch (err) {
          console.error('=== INVITATION FETCH ERROR ===');
          console.error('Full error:', err);
          console.error('Error message:', err?.message);
          console.error('Error response data:', err?.response?.data);
          console.error('Error response status:', err?.response?.status);
          const errorMessage = err?.response?.data?.message || err?.message || '';
          console.error('Extracted error message:', errorMessage);
          console.error('Redirecting to invitation-expired for any error');
          navigate('/auth/invitation-expired');
          return;
        } finally {
          setIsInvitationLoading(false);
        }
      };

      fetchAdmin();
      fetchInvitation();
    }
  }, [searchParams, navigate]);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => {
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
      },
      password: (value) => {
        if (value === '') {
          return 'Please enter password to signup';
        } else if (!isLogin && getStrength(value) !== 100) {
          return 'Password Strength is Low';
        } else {
          return null;
        }
      }
    },
  });

  const handleSubmit = async (values) => {
    if (invitationEmail && values.email?.toLowerCase() !== invitationEmail.toLowerCase()) {
      setModalStates({ isInvitedEmailMismatch: true });
      return;
    }

    setIsSubmitting(true);
    setIsReCaptcha(true);

    // For desktop, we'll skip reCAPTCHA for now (can be added later if needed)
    // In production, you might want to implement a desktop-friendly CAPTCHA solution
    const verified = true; // Skip reCAPTCHA for desktop

    if (verified) {
      setIsReCaptcha(false);
      const auth = getAuth();

      if (isLogin) {
        signInWithEmailAndPassword(auth, values.email, values.password)
          .then(async (userCredential) => {
            console.log("[Auth] Login successful:", userCredential.user.uid);
            const user = userCredential.user;
            if (!user.emailVerified) {
              console.log("[Auth] User email not verified, fetching user data");
              try {
                const ventoUser = await webAPI.user.userGet(user.uid);
                if (ventoUser.isEmailChanged) {
                  console.log("[Auth] Email changed, sending verification email");
                  webAPI.user.userSendVerificationEmail({ email: ventoUser.email, isEmailChanged: true });
                }
              } catch (err) {
                console.log("[Auth] Error fetching user data:", err);
              }
              // Don't set form error - let authStore handle redirect to verify page
              // The authStore's onIdTokenChanged will detect unverified email and redirect
              setIsSubmitting(false);
              return; // Exit early, authStore will handle redirect
            }
            // Email is verified - authStore will handle navigation
            setIsSubmitting(false);
          })
          .catch((error) => {
            console.log("[Auth] Login error:", error);
            form.setErrors({ password: "Please enter valid credentials" });
            setIsSubmitting(false);
          });
      } else {
        fetchSignInMethodsForEmail(auth, values.email)
          .then((signInMethods) => {
            if (signInMethods.length) {
              form.setErrors({ email: 'A user with this email already exists' });
              setIsSubmitting(false);
            } else {
              createUserWithEmailAndPassword(auth, values.email, values.password)
                .then(() => {
                  console.log("[Auth] User created in Firebase:", auth.currentUser?.uid);
                  if (auth.currentUser?.email) {
                    console.log("[Auth] Sending verification email to:", auth.currentUser.email);
                    // Send verification email - don't wait for response, just navigate
                    // The authStore will handle backend user creation via onIdTokenChanged listener
                    webAPI.user.userSendVerificationEmail({ 
                      email: auth.currentUser.email, 
                      isEmailChanged: false, 
                      ...(inviteToken && { token: inviteToken }) 
                    })
                      .then(() => {
                        console.log("[Auth] Verification email sent successfully");
                      })
                      .catch((emailError) => {
                        console.log("[Auth] Error sending verification email (continuing anyway):", emailError);
                        // Continue even if email send fails - user can resend from verify page
                      })
                      .finally(() => {
                        // Navigate to verify page immediately after Firebase user creation
                        // Backend user creation will happen via authStore's onIdTokenChanged listener
                        navigate(`/auth/verify?email=${auth.currentUser?.email}`);
                        setIsSubmitting(false);
                      });
                  } else {
                    setIsSubmitting(false);
                  }
                })
                .catch((error) => {
                  console.log("error", error);
                  setIsSubmitting(false);
                });
            }
          })
          .catch((error) => {
            console.log("error", error);
            setIsSubmitting(false);
          });
      }
    } else {
      setIsSubmitting(false);
      form.setErrors({ password: `We ran into an issue. Please contact support: FB0${isLogin ? "1" : "3"}` });
    }
  };

  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(form.values.password)} />
  ));

  const strength = getStrength(form.values.password);
  const color = strength === 100 ? 'teal' : 'red';

  useEffect(() => {
    if (strength === 100) {
      setPopoverOpened(false);
    } else {
      if (!popoverOpened && form.values.password) {
        setPopoverOpened(true);
      }
    }
  }, [strength, popoverOpened, form.values.password]);

  const handleLogin = () => {
    navigate('/login?redirect_to=/');
  };

  const handleSignup = () => {
    navigate('/signup?redirect_to=/');
  };

  const handleProviderSignIn = async (provider) => {
    logClientEvent("click.signIn", { provider });
    if (invitationEmail) {
      const result = await signIn(provider, invitationEmail);
      if (!result) {
        setModalStates({ isInvitedEmailMismatch: true });
      }
    } else {
      signIn(provider);
    }
  };

  // Don't render the form if we're still checking invitation
  if (searchParams.get('invite-token') && isInvitationLoading) {
    return (
      <main className={styles.main}>
        <Header hideNewRecordingButton hideSignInButton />
        <div className={styles.contentWrapper}>
          <Loader size={40} />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Header hideNewRecordingButton hideSignInButton />

      <div className={styles.contentWrapper}>
        {!isTokenChecked && searchParams.get('invite-token') ? <></> :
          teamAdmin ? <div className={styles.teamContainer} >
            <img className={styles.teamImg} src={teamAdmin.user.profilePhotoUrl ?? ""} alt={'team admin profile photo'} referrerPolicy="no-referrer" crossOrigin="anonymous" />
            <p className={styles.teamTitle}>{`Sign up below to join ${teamAdmin.team.name}'s team!`}</p>
          </div> :
            <>
              {redirectedFromAnymsRec ?
                <h1 className={styles.titleSaveVideo}>Thanks for trying out Vento! Signup to save your recording!</h1>
                :
                <h1 className={styles.title}>{formTitleContent}</h1>
              }
              <p className={styles.sub}>
                {isLogin ? (
                  <>Need a Vento account? <span onClick={handleSignup}>Signup</span></>
                ) : (
                  <>Create a free account or <span onClick={handleLogin}>login</span></>
                )}
              </p>
            </>
        }

        <div className={styles.btnContainer}>
          <button
            onClick={() => handleProviderSignIn("google")}
            className={styles.signInBtn}
            disabled={isInvitationLoading}
          >
            Sign in with Google
            <img src="/assets/google-icon.png" alt="google" onError={(e) => e.target.style.display = 'none'} />
          </button>
          <button
            onClick={() => handleProviderSignIn("microsoft")}
            className={styles.signInBtn}
            disabled={isInvitationLoading}
          >
            Sign in with Microsoft
            <img src="/assets/microsoft-icon.png" alt="microsoft" onError={(e) => e.target.style.display = 'none'} />
          </button>
        </div>

        <div className={styles.separator}>
          <h2>or</h2>
          <div className={styles.line}></div>
        </div>

        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <TextInput
            withAsterisk
            size="lg"
            placeholder="email"
            styles={{
              error: {
                marginBottom: '0.75rem'
              }
            }}
            {...form.getInputProps('email')}
          />
          <Popover opened={popoverOpened && !isLogin} position="bottom" width="target" transition={'pop'}>
            <Popover.Target>
              <div
                onFocusCapture={() => setPopoverOpened(true)}
                onBlurCapture={() => setPopoverOpened(false)}
              >
                <PasswordInput
                  placeholder="password"
                  size="lg"
                  {...form.getInputProps('password')}
                />
              </div>
            </Popover.Target>
            <Popover.Dropdown>
              <Progress color={color} value={strength} size={5} mb="xs" />
              <PasswordRequirement label="Includes at least 8 characters" meets={form.values.password.length > 7} />
              {checks}
            </Popover.Dropdown>
          </Popover>
          <button 
            type="submit" 
            disabled={isSubmitting || isReCaptcha || isInvitationLoading} 
            className={styles.submitButton}
          >
            {isSubmitting ? <Loader size={30} /> : isLogin ? 'Login' : 'Sign up'}
          </button>
          {isLogin ? (
            <p className={styles.sub}>
              Forgot your password? <span><Link to="/auth/reset-password">Reset</Link></span>
            </p>
          ) : (
            <>
              <p className={styles.sub}>
                By signing up, you agree to our <span>
                  <Link to="/policy?content=terms-of-service" target="_blank">Terms</Link>
                </span> and our <span><Link to="/policy?content=privacy-policy" target="_blank">Privacy Policy</Link></span>
              </p>
            </>
          )}
        </form>
      </div>
      <InviteUsersGenralModel opened={modalStates.isInvitedEmailMismatch} onClose={() => setModalStates({ isInvitedEmailMismatch: false })}>
        <InvitedUserEmailMismatch onClose={() => setModalStates({ isInvitedEmailMismatch: false })} />
      </InviteUsersGenralModel>
    </main>
  );
}
