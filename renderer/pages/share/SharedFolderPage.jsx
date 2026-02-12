import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from '@mantine/core';
import Header from '../../components/common/Header';
import RecordingItem from '../../components/recordings-page/RecordingItem';
import { useAuth } from '../../stores/authStore';
import webAPI from '../../lib/webapi';
import { useInView } from '../../lib/hooks';
import { formatDateSince } from '@lib/misc';
import { convertToRecordingModalItem } from '@lib/misc';
import styles from '../../styles/modules/RecordingsPage.module.scss';

export default function SharedFolderPage() {
  const { folderId } = useParams();
  const { ventoUser } = useAuth();
  const { observe, unobserve, inView } = useInView();
  const loader = useRef(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState(null);
  const [userRecordings, setUserRecordings] = useState([]);
  const [recordingViewCount, setRecordingViewCount] = useState([]);

  useEffect(() => {
    const fetchSharedFolder = async () => {
      if (!folderId) return;
      try {
        setLoading(true);
        const isShared = await webAPI.folder.folderGetSharedStatus(folderId);
        if (isShared) {
          const response = await webAPI.folder.folderGetFolder(folderId);
          if (response?.data) {
            setFolder(response.data);
            const recordings = response.data.recordings.map((recording) =>
              convertToRecordingModalItem(recording, ventoUser)
            );
            setUserRecordings(recordings);
          }
        } else {
          setFolder(null);
        }
      } catch (error) {
        console.error('Failed to fetch shared folder:', error);
        setFolder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSharedFolder();
  }, [folderId, ventoUser]);

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
        <Header hideNewRecordingButton />
        <div className={styles.main}>
          <Loader size="lg" />
        </div>
      </>
    );
  }

  if (!folder) {
    return (
      <>
        <Header hideNewRecordingButton />
        <div className={styles.main}>
          <p>Shared folder not found or is no longer shared.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header hideNewRecordingButton />
      <main className={styles.main}>
        <div className={styles.heading}>
          <h1>
            | <span className={styles.headingLink}>{folder.name}</span>
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
              hideActions={recording.userId !== ventoUser?.id}
            />
          ))}
        </div>

        <div ref={loader} style={{ height: '20px' }} />
      </main>
    </>
  );
}
