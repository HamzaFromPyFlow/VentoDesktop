import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader } from '@mantine/core';
import Header from '../../components/common/Header';
import RecordingItem from '../../components/recordings-page/RecordingItem';
import { useAuth } from '../../stores/authStore';
import webAPI from '../../lib/webapi';
import { useInView } from '../../lib/hooks';
import { formatDateSince } from '@lib/misc';
import { isUserFreePlan } from '@lib/payment-helper';
import { convertToRecordingModalItem } from '@lib/misc';
import styles from '../../styles/modules/RecordingsPage.module.scss';

export default function FolderPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { ventoUser, recordingNo, setRecordingNo } = useAuth();
  const { observe, unobserve, inView } = useInView();
  const loader = useRef(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState(null);
  const [userRecordings, setUserRecordings] = useState([]);
  const [recordingViewCount, setRecordingViewCount] = useState([]);

  useEffect(() => {
    const fetchFolder = async () => {
      if (!folderId) return;
      try {
        setLoading(true);
        const response = await webAPI.folder.folderGetFolder(folderId, 0, 25, 0);
        if (response?.data) {
          setFolder(response.data);
          const recordings = response.data.recordings.map((recording) =>
            convertToRecordingModalItem(recording, ventoUser)
          );
          setUserRecordings(recordings);
        }
      } catch (error) {
        console.error('Failed to fetch folder:', error);
        navigate('/recordings');
      } finally {
        setLoading(false);
      }
    };
    fetchFolder();
  }, [folderId, ventoUser, navigate]);

  useEffect(() => {
    if (loader.current) {
      observe(loader.current);
    }
    return () => {
      if (loader.current) {
        unobserve(loader.current);
      }
    };
  }, [observe, unobserve]);

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.main}>
          <Loader size="lg" />
        </div>
      </>
    );
  }

  if (!folder) {
    return (
      <>
        <Header />
        <div className={styles.main}>
          <p>Folder not found.</p>
        </div>
      </>
    );
  }

  if (ventoUser && folder.userId !== ventoUser.id) {
    return (
      <>
        <Header />
        <div className={styles.main}>
          <p>You don't have access to this folder.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.heading}>
          <h1>
            <a className={styles.headingLink} href="#/recordings" onClick={(e) => {
              e.preventDefault();
              navigate('/recordings');
            }}>
              {folder.isArchived ? 'Archive' : 'Recordings'}
            </a>{' '}
            / {folder.name}
          </h1>
        </div>

        <div className={styles.recordingsContainer}>
          {userRecordings.map((recording) => (
            <RecordingItem
              key={recording.id}
              recording={recording}
              viewCount={
                recordingViewCount.find((r) => r.recordingId === recording.id)?.count
              }
              folders={[]}
              onDeleteConfirm={async () => {
                setUserRecordings(userRecordings.filter((r) => r.id !== recording.id));
                setRecordingNo(recordingNo - 1);
                await webAPI.recording.recordingDeleteRecording(recording.id);
              }}
            />
          ))}
        </div>

        <div ref={loader} style={{ height: '20px' }} />
      </main>
    </>
  );
}
