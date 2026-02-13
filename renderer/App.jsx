import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
// TODO: Install @mantine/notifications package
// import { Notifications } from '@mantine/notifications';
import Pricing from './pages/pricing/Pricing';
import AppSumoRedeem from './pages/pricing/AppSumoRedeem';
import Landing from './pages/landing/Landing';
import Auth from './pages/auth/Auth';
import AuthAction from './pages/auth/AuthAction';
import AuthVerify from './pages/auth/AuthVerify';
import ResetPassword from './pages/auth/ResetPassword';
import InvitationExpired from './pages/auth/InvitationExpired';
import BetaNoAccess from './pages/auth/BetaNoAccess';
import RecordPage from './pages/record/Record';
import PolicyPage from './pages/policy/Policy';
import RecordingsPage from './pages/recordings/Recordings';
import FolderPage from './pages/recordings/FolderPage';
import SharedFolderPage from './pages/share/SharedFolderPage';
import ViewRecording from './pages/view/ViewRecording';
import EmbedRecording from './pages/view/EmbedRecording';
import DownloadRecording from './pages/view/DownloadRecording';
import EditorPage from './pages/editor/Editor';
import ProfilePage from './pages/profile/Profile';
import { useAuth } from './stores/authStore';
import { auth } from './lib/firebase';

// Component to handle initial auth redirect
function AuthRedirectHandler() {
  const { ventoUser, loadingUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for auth to finish loading
    if (loadingUser === 'loading') {
      console.log('[App] Auth still loading, waiting...');
      return;
    }

    // For HashRouter, pathname is usually empty, so we check hash
    const hashPath = location.hash.replace('#', '') || location.pathname || '/';
    const currentPath = hashPath || '/';
    const isOnLandingPage = currentPath === '/' || currentPath === '';
    const isOnAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || currentPath.includes('/auth/');
    const isPublicPage = currentPath.includes('/pricing') || currentPath.includes('/policy');

    console.log('[App] AuthRedirectHandler check:', {
      loadingUser,
      hasVentoUser: !!ventoUser,
      currentPath,
      isOnLandingPage,
      isOnAuthPage,
      isPublicPage
    });

    // Case 1: User is logged in and on landing/auth page -> redirect to recordings
    if (loadingUser === 'hasUser' && ventoUser && (isOnLandingPage || isOnAuthPage)) {
      console.log('[App] User is logged in, redirecting from', currentPath, 'to /recordings');
      navigate('/recordings', { replace: true });
    }
    // Case 2: User is not logged in and on protected page -> redirect to landing
    else if (loadingUser === 'noUser' && !isOnLandingPage && !isOnAuthPage && !isPublicPage) {
      console.log('[App] User is not logged in, redirecting from', currentPath, 'to /');
      navigate('/', { replace: true });
    }
  }, [loadingUser, ventoUser, navigate, location]);

  return null;
}

function App() {
  const { initializeAuth } = useAuth();

  useEffect(() => {
    // Initialize Firebase auth listener
    const cleanup = initializeAuth();
    return cleanup;
  }, [initializeAuth]);

  return (
    <MantineProvider withGlobalStyles>
      {/* <Notifications /> */}
      <HashRouter>
        <div className="flex flex-col h-screen bg-white overflow-hidden">
          <AuthRedirectHandler />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Auth login />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="/auth/action" element={<AuthAction />} />
              <Route path="/auth/verify" element={<AuthVerify />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/auth/invitation-expired" element={<InvitationExpired />} />
              <Route path="/auth/beta/no-access" element={<BetaNoAccess />} />
              <Route path="/record" element={<RecordPage />} />
              <Route path="/record/:id" element={<RecordPage />} />
              <Route path="/record/:id/edit" element={<EditorPage />} />
              <Route path="/policy" element={<PolicyPage />} />
              <Route path="/recordings" element={<RecordingsPage />} />
              <Route path="/recordings/folder/:folderId" element={<FolderPage />} />
              <Route path="/share/folder/:folderId" element={<SharedFolderPage />} />
              <Route path="/view/:recordingId" element={<ViewRecording />} />
              <Route path="/view/:recordingId/embed" element={<EmbedRecording />} />
              <Route path="/view/:recordingId/download" element={<DownloadRecording />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/pricing/appsumo-redeem" element={<AppSumoRedeem />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </MantineProvider>
  );
}

export default App;
