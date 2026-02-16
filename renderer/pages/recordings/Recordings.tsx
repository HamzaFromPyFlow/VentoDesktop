import { useState, useEffect, useReducer, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader, Progress, TextInput } from '@mantine/core';
import { HiOutlineFolder } from 'react-icons/hi';
import { MdOutlineArchive } from 'react-icons/md';
import { IoDiamondOutline } from 'react-icons/io5';
import Header from '../../components/common/Header';
import { generateUrl } from '../../lib/utils';
import styles from '../../styles/modules/RecordingsPage.module.scss';
import RecordingItem from '../../components/recordings-page/RecordingItem';
import RecordingsActionBar from '../../components/recordings-page/RecordingsActionBar';
import DeleteFolderModal from '../../components/overlays/modals/DeleteFolderModal';
import ShareFolderModal from '../../components/overlays/modals/ShareFolderModal';
import SharedFolderModal from '../../components/overlays/modals/SharedFolderModal';
import UploadNewVideoModal from '../../components/overlays/modals/UploadNewVideoModal';
import PricingPageModal from '../../components/overlays/modals/PricingPageModal';
import InviteUsersButton from '../../components/invite-users/InviteUsersButton';
import FolderItemDropdown from '../../components/dropdowns/FolderItemDropdown';
import { useAuth } from '../../stores/authStore';
import webAPI from '../../lib/webapi';
import { useInView } from '../../lib/hooks';
import { convertToRecordingModalItem, logClientEvent } from '../../lib/misc';
import { isUserFreePlan } from '../../lib/payment-helper';
import type { RecordingModalItem } from '../../lib/misc';

const freeRecordingLimit = 10;

type ModalStates = {
  deleteFolderConfirmation: boolean;
  pricingPageModal: boolean;
  shareFolderModal: boolean;
  alreadySharedFolderModal: boolean;
  uploadNewVideoModal: boolean;
};

type RenameStates = {
  renameMode: boolean;
  folderName: string;
};

type FolderViewModel = {
  id: string;
  name: string;
  isArchived?: boolean;
  isShared?: boolean;
  recordingCount?: number;
  archivedRecordingCount?: number;
};

export default function RecordingsPage() {
  const [page, setPage] = useState(0);
  const [archivedPage, setArchivedPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const loader = useRef<HTMLDivElement | null>(null);
  const actionBarRef = useRef<HTMLDivElement | null>(null);
  const recordingsContainerRef = useRef<HTMLDivElement | null>(null);
  const { observe, unobserve, inView } = useInView();
  const { recordingNo, setRecordingNo, ventoUser } = useAuth();
  const [focusedFolderId, setFocusedFolderId] = useState<string | null>(null);
  const [focusedFolderName, setFocusedFolderName] = useState<string | null>(null);
  const [shareableFolderLink, setShareableFolderLink] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedRecordings, setSelectedRecordings] = useState<string[]>([]);
  const [userRecordings, setUserRecordings] = useState<RecordingModalItem[]>([]);
  const [userArchivedRecordings, setUserArchivedRecordings] = useState<RecordingModalItem[]>([]);
  const [userFolders, setUserFolders] = useState<FolderViewModel[]>([]);
  const [userArchivedFolders, setUserArchivedFolders] = useState<FolderViewModel[]>([]);
  const [totalRecordings, setTotalRecordings] = useState(0);
  const [totalArchivedRecordings, setTotalArchivedRecordings] = useState(0);
  const [recordingViewCount] = useState<Array<{ recordingId: string; count: number }>>([]);

  const [renameStates, setRenameStates] = useReducer<
    (prev: RenameStates, cur: Partial<RenameStates>) => RenameStates
  >(
    (prev, cur) => ({ ...prev, ...cur }),
    { renameMode: false, folderName: '' }
  );

  const [modalStates, setModalStates] = useReducer<
    (prev: ModalStates, cur: Partial<ModalStates>) => ModalStates
  >(
    (prev, cur) => ({ ...prev, ...cur }),
    {
      deleteFolderConfirmation: false,
      pricingPageModal: false,
      shareFolderModal: false,
      alreadySharedFolderModal: false,
      uploadNewVideoModal: false,
    }
  );

  const handleCheckboxChange = (id: string, isSelected: boolean) => {
    setSelectedRecordings((prev) =>
      isSelected ? [...prev, id] : prev.filter((recId) => recId !== id)
    );
  };

  const isCheckboxMode = selectedRecordings.length > 0;

  const getProgressColor = () => {
    if (recordingNo >= freeRecordingLimit) return 'red';
    if (freeRecordingLimit - recordingNo === 1) return 'orange';
    return 'gray';
  };

  // Update local folders
  const updateFolderSharingStatus = (folderId: string, isShared: boolean) => {
    const updatedFolders = userFolders.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, isShared };
      }
      return folder;
    });
    setUserFolders(updatedFolders);
  };

  // Data fetching on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          webAPI.recording.recordingGetListofRecordingsByUser(0, 25),
          webAPI.folder.folderGetUserFolders(),
          //getting archived recordings of user
          webAPI.recording.recordingGetListofRecordingsByUser(0, 25, true)
        ]);

        const recordings =
          results[0].status === "fulfilled" ? results[0].value.data : [];

        const total =
          results[0].status === "fulfilled" ? (results[0].value.pagination.count ?? 0) : 0;

        const folders =
          results[1].status === "fulfilled" ? results[1].value : [];

        const archivedRecordings =
          results[2].status === "fulfilled" ? results[2].value.data : [];

        const totalArchivedRecordings =
          results[2].status === "fulfilled" ? (results[2].value.pagination.count ?? 0) : 0;

        // Convert recordings to modal items
        const convertedRecordings = recordings.map((recording: any) =>
          convertToRecordingModalItem(recording, ventoUser ?? undefined)
        );
        const convertedArchivedRecordings = archivedRecordings.map((recording: any) =>
          convertToRecordingModalItem(recording, ventoUser ?? undefined)
        );

        // Separate folders by archived status
        const nonArchivedFolders = folders.filter((folder: FolderViewModel) => !folder.isArchived);
        const archivedFolders = folders.filter((folder: FolderViewModel) => folder.isArchived);

        setUserRecordings(convertedRecordings);
        setUserArchivedRecordings(convertedArchivedRecordings);
        setUserFolders(nonArchivedFolders);
        setUserArchivedFolders(archivedFolders);
        setTotalRecordings(total);
        setTotalArchivedRecordings(totalArchivedRecordings);

        // Sync recordingNo with actual count of completed non-archived recordings
        if (isUserFreePlan(ventoUser)) {
          const completedRecordingsCount = convertedRecordings.filter(
            (recording) => recording.encodingStatus === 'DONE' && !recording.isArchived
          ).length;
          setRecordingNo(completedRecordingsCount);
        }
      } catch (error) {
        console.error('Error fetching recordings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ventoUser]);

  const loadMore = async (pageNum: number) => {
    if (showArchived) {
      setArchivedPage(pageNum);
    } else {
      setPage(pageNum);
    }
    try {
      const res = await webAPI.recording.recordingGetListofRecordingsByUser(
        pageNum,
        25,
        showArchived,
        recordings.length ?? 0
      );
      const newRecordings = res.data?.map((recording: any) =>
        convertToRecordingModalItem(recording, ventoUser ?? undefined)
      ) || [];
      const fullData = [...recordings, ...newRecordings];
      setRecordings(fullData);
    } catch (error) {
      console.error('Error loading more recordings:', error);
    }
  };

  useEffect(() => {
    if (inView && loader.current) {
      const currentPage = showArchived ? archivedPage : page;
      loadMore(currentPage + 1);
    }
  }, [inView]);

  useEffect(() => {
    const updateWidth = () => {
      if (actionBarRef.current && recordingsContainerRef.current) {
        const width = recordingsContainerRef.current.offsetWidth;
        const adjustedWidth = width - 60;
        actionBarRef.current.style.width = `${adjustedWidth}px`;
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  useEffect(() => {
    logClientEvent("page.view.viewRecording");
    return () => {
      if (loader.current) {
        unobserve(loader.current);
        loader.current = null;
      }
      setSelectedRecordings([]);
    };
  }, [showArchived]);

  const addNewFolder = async () => {
    try {
      const newFolder = await webAPI.folder.folderCreateFolder(showArchived);
      if (showArchived) {
        setUserArchivedFolders([newFolder, ...userArchivedFolders]);
      } else {
        setUserFolders([newFolder, ...userFolders]);
      }
      setFocusedFolderId(newFolder.id);
      setRenameStates({
        renameMode: true,
        folderName: newFolder.name,
      });

      setTimeout(() => {
        const input = document.querySelector(
          `a[data-folder-id="${newFolder.id}"] input`
        ) as HTMLInputElement;
        if (input) {
          input.select();
        }
      }, 0);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const onRenameVideo = async () => {
    const folderName = renameStates.folderName.trim();
    const index = folders.findIndex((f) => f.id === focusedFolderId);

    if (index === -1) return;

    if (!folderName) {
      setRenameStates({
        folderName: folders[index].name,
        renameMode: false,
      });
      return;
    }

    // Update folder locally first
    const updatedFolders = [...folders];
    updatedFolders[index].name = folderName;
    
    if (showArchived) {
      setUserArchivedFolders(updatedFolders);
    } else {
      setUserFolders(updatedFolders);
    }

    setRenameStates({
      renameMode: false,
      folderName: "",
    });

    // Update folder name in the backend
    const focusedFolder = folders.find((f) => f.id === focusedFolderId);
    if (!focusedFolder) return;

    try {
      await webAPI.folder.folderUpdateFolder(focusedFolder.id, {
        name: folderName,
      });
    } catch (error) {
      console.error('Error updating folder name:', error);
      // Revert on error
      if (showArchived) {
        setUserArchivedFolders(folders);
      } else {
        setUserFolders(folders);
      }
    }
  };

  const recordings = showArchived ? userArchivedRecordings : userRecordings;
  const folders = showArchived ? userArchivedFolders : userFolders;
  const total = showArchived ? totalArchivedRecordings : totalRecordings;
  const shouldRenderLoader = total > recordings.length && recordingNo > 25;

  // Sync recordingNo whenever recordings change (e.g., when a recording finishes processing)
  useEffect(() => {
    if (isUserFreePlan(ventoUser) && !showArchived) {
      const completedRecordingsCount = userRecordings.filter(
        (recording) => recording.encodingStatus === 'DONE' && !recording.isArchived
      ).length;
      if (completedRecordingsCount !== recordingNo) {
        setRecordingNo(completedRecordingsCount);
      }
    }
  }, [userRecordings, ventoUser, showArchived, recordingNo, setRecordingNo]);

  const setRecordings = (updatedRecordings: RecordingModalItem[]) => {
    if (showArchived) {
      setUserArchivedRecordings(updatedRecordings);
    } else {
      setUserRecordings(updatedRecordings);
    }
  };

  return (
    <>
      <div className={styles.headerWrapper}>
        <Header/>
      </div>
      <main className={styles.main}>
        <div className={styles.heading}>
        <button
          className={!showArchived ? styles.activeBtn : ''}
          onClick={() => setShowArchived(false)}
        >
          Recordings
        </button>
        <button
          className={showArchived ? styles.activeBtn : ''}
          onClick={() => setShowArchived(true)}
        >
          Archive
        </button>

        {isUserFreePlan(ventoUser) && (
          <div className={styles.limitContainer}>
            <div className={styles.progressContainer}>
              <span>
                {recordingNo}/{freeRecordingLimit} free videos
              </span>
              <Progress
                color={getProgressColor()}
                value={(recordingNo / freeRecordingLimit) * 100}
              />
            </div>
            <button
              onClick={() => {
                setModalStates({ pricingPageModal: true });
                logClientEvent("click.pricing.yourRecordings");
              }}
              className={styles.pricingPill}
            >
              <p>
                <u>Upgrade</u> to get unlimited hosted videos&nbsp;
                <IoDiamondOutline className={styles.diamondIcon} style={{ verticalAlign: 'middle' }} />
              </p>
            </button>
          </div>
        )}

        <div className={styles.recordingPageBtnsContainer}>
          <button className={styles.newFolderBtn} onClick={addNewFolder}>
            {showArchived ? 'New Archive Folder' : 'New Folder'}
          </button>
          {!showArchived && (
            <button
              className={styles.uploadVideoBtn}
              onClick={() => {
                if (isUserFreePlan(ventoUser)) {
                  setModalStates({ pricingPageModal: true });
                  logClientEvent("click.pricing.yourRecordings");
                } else {
                  setModalStates({ uploadNewVideoModal: true });
                }
              }}
            >
              Upload Video
            </button>
          )}
          {!showArchived && <InviteUsersButton />}
        </div>
      </div>

      {folders.length > 0 && (
        <>
          <h2 className={styles.subHeading}>Folders</h2>
          <div className={styles.foldersContainer}>
            {folders.map((folder) => (
              <a
                key={folder.id}
                data-folder-id={folder.id}
                href={generateUrl(`/recordings/folder/${folder.id}`, searchParams)}
                className={styles.folderItem}
              >
                {folder.isArchived ? (
                  <div className={styles.iconContainer}>
                    <HiOutlineFolder size={42} className={styles.folderIcon} />
                    <MdOutlineArchive size={18} className={styles.archiveIcon} />
                  </div>
                ) : (
                  <HiOutlineFolder size={40} />
                )}
                <div className={styles.data}>
                  {renameStates.renameMode && focusedFolderId === folder.id ? (
                    <TextInput
                      variant="unstyled"
                      autoFocus
                      size="xs"
                      placeholder="Folder name"
                      value={renameStates.folderName}
                      onChange={(e) => {
                        setRenameStates({ folderName: e.currentTarget.value });
                      }}
                      className={styles.renameInput}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onBlur={onRenameVideo}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onRenameVideo();
                        }
                      }}
                    />
                  ) : (
                    <p className={styles.title}>{folder.name}</p>
                  )}
                  <p>
                    {folder.isShared ? "Public - " : ""}
                    {!showArchived ? folder.recordingCount ?? 0 : folder.archivedRecordingCount ?? 0} video
                    {(showArchived
                      ? (folder.archivedRecordingCount ?? 0) > 1
                      : (folder.recordingCount ?? 0) > 1)
                      ? "s"
                      : ""}
                  </p>
                </div>
                <FolderItemDropdown
                  isShared={folder.isShared}
                  isArchived={folder.isArchived}
                  onDelete={() => {
                    setFocusedFolderId(folder.id);
                    setModalStates({ deleteFolderConfirmation: true });
                  }}
                  onRename={() => {
                    setFocusedFolderId(folder.id);
                    setRenameStates({
                      renameMode: true,
                      folderName: folder.name,
                    });
                    setTimeout(() => {
                      const input = document.querySelector(
                        `a[data-folder-id="${folder.id}"] input`
                      ) as HTMLInputElement;
                      if (input) {
                        input.select();
                      }
                    }, 0);
                  }}
                  onShare={() => {
                    setFocusedFolderId(folder.id);
                    const focusedFolderName = userFolders.find((f) => f.id === folder.id)?.name;
                    setFocusedFolderName(focusedFolderName ?? null);
                    if (!folder.isShared) {
                      setModalStates({ shareFolderModal: true });
                    }
                  }}
                  onUnShare={async () => {
                    if (!folder.id) return;
                    try {
                      await webAPI.folder.folderUpdateFolder(folder.id, { isShared: false });
                      setFocusedFolderId(null);
                      updateFolderSharingStatus(folder.id, false);
                    } catch (error) {
                      console.error('Error unsharing folder:', error);
                    }
                  }}
                  onCopyLink={() => {
                    if (!folder.id) return;
                    setFocusedFolderId(folder.id);
                    const host = window.location.origin;
                    const path = `/share/folder/${folder.id}`;
                    navigator.clipboard.writeText(host + path);
                  }}
                />
              </a>
            ))}
          </div>
        </>
      )}

      <div className={styles.recordingsContainer} ref={recordingsContainerRef}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Loader size="lg" />
          </div>
        ) : recordings.length === 0 ? (
          <div className={styles.noRecordingsWatermark}>
            {showArchived ? 'No Archived Recordings' : 'No Active Recordings'}
          </div>
        ) : (
          <>
            {recordings
              .filter(recording => showArchived ? recording.isArchived : !recording.isArchived)
              .map((recording) => (
                <RecordingItem
                  key={recording.id}
                  recording={recording}
                  isCheckboxMode={isCheckboxMode}
                  isSelected={selectedRecordings.includes(recording.id)}
                  onCheckboxChange={(isSelected) =>
                    handleCheckboxChange(recording.id, isSelected)
                  }
                  folders={folders}
                  viewCount={
                    recordingViewCount.find((r) => r.recordingId === recording.id)?.count
                  }
                  onDeleteConfirm={async () => {
                    try {
                      if (showArchived) {
                        setTotalArchivedRecordings(prevState => prevState - 1);
                      } else {
                        setTotalRecordings(prevState => prevState - 1);
                      }
                      setRecordings(
                        recordings.filter((r) => r.id !== recording.id)
                      );
                      if (recording.encodingStatus === 'DONE') {
                        setRecordingNo(recordingNo - 1);
                      }
                      await webAPI.recording.recordingDeleteRecording(recording.id);
                    } catch (error) {
                      console.error('Error deleting recording:', error);
                    }
                  }}
                  onArchiveConfirm={async () => {
                    try {
                      // Archive/unarchive logic would go here
                      // For now, just update local state
                      const updatedRecording = { ...recording, isArchived: !recording.isArchived };
                      setRecordings(
                        recordings.filter((r) => r.id !== recording.id)
                      );

                      if (updatedRecording.isArchived) {
                        setUserArchivedRecordings(prevState => {
                          const updated = [...prevState, updatedRecording];
                          updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                          return updated;
                        });
                        setTotalArchivedRecordings(prevState => prevState + 1);
                        setTotalRecordings(prevState => prevState - 1);
                      } else {
                        setUserRecordings(prevState => {
                          const updated = [...prevState, updatedRecording];
                          updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                          return updated;
                        });
                        setTotalArchivedRecordings(prevState => prevState - 1);
                        setTotalRecordings(prevState => prevState + 1);
                      }
                    } catch (error) {
                      console.error('Error archiving recording:', error);
                    }
                  }}
                  onMoveConfirm={async (folderId) => {
                    if (!folderId) return;
                    try {
                      setRecordings(
                        recordings.filter((r) => r.id !== recording.id)
                      );
                      const index = folders.findIndex((f) => f.id === folderId);
                      if (index === -1) return;

                      if (showArchived) {
                        const updatedFolders = [...folders];
                        updatedFolders[index].archivedRecordingCount =
                          (updatedFolders[index].archivedRecordingCount ?? 0) + 1;
                        setUserArchivedFolders(updatedFolders);
                        setTotalArchivedRecordings(prevState => prevState - 1);
                      } else {
                        const updatedFolders = [...folders];
                        updatedFolders[index].recordingCount =
                          (updatedFolders[index].recordingCount ?? 0) + 1;
                        setUserFolders(updatedFolders);
                        setTotalRecordings(prevState => prevState - 1);
                      }

                      await webAPI.recording.recordingAddToFolder(recording.id, folderId);
                    } catch (error) {
                      console.error('Error moving recording:', error);
                    }
                  }}
                  onUpdatePassword={async (password) => {
                    try {
                      const updateData: any = {
                        metadata: {
                          ...recording.metadata,
                          password: password || undefined,
                        },
                      };
                      await webAPI.recording.recordingUpdateRecording(recording.id, updateData);
                      setRecordings(
                        recordings.map((r) =>
                          r.id === recording.id
                            ? { ...r, metadata: { ...r.metadata, password } }
                            : r
                        )
                      );
                    } catch (error) {
                      console.error('Error updating password:', error);
                    }
                  }}
                  onUpdateTitle={async (title) => {
                    if (!title) return;
                    try {
                      await webAPI.recording.recordingUpdateTitle(recording.id, title);
                      setRecordings(
                        recordings.map((r) =>
                          r.id === recording.id ? { ...r, title } : r
                        )
                      );
                    } catch (error) {
                      console.error('Error updating title:', error);
                    }
                  }}
                  onTurnOffAutoArchiveConfirm={async () => {
                    try {
                      await webAPI.recording.recordingPatchRecording(recording.id, {
                        autoArchiveDisabled: true,
                      });
                      setRecordings(
                        recordings.map((currRecording) => {
                          if (currRecording.id === recording.id) {
                            return { ...currRecording, autoArchiveDisabled: true };
                          }
                          return currRecording;
                        })
                      );
                    } catch (error) {
                      console.error('Error turning off auto archive:', error);
                    }
                  }}
                  onClick={() => {
                    if (selectedRecordings.includes(recording.id)) {
                      handleCheckboxChange(recording.id, false);
                    } else {
                      handleCheckboxChange(recording.id, true);
                    }
                  }}
                />
              ))}
          </>
        )}
      </div>

      <div className={styles.actionBarContainer} ref={actionBarRef}>
        {isCheckboxMode && (
          <RecordingsActionBar
            selectedRecordings={selectedRecordings}
            folders={folders}
            loading={loading}
            isUserPremium={!isUserFreePlan(ventoUser)}
            isArchivedPage={showArchived}
            onDeleteConfirm={async () => {
              try {
                setLoading(true);
                await webAPI.recording.recordingDeleteMultipleRecordings({ ids: selectedRecordings });
                const recordingsToDelete = recordings.filter((r) =>
                  selectedRecordings.includes(r.id)
                );
                if (showArchived) {
                  setTotalArchivedRecordings(prevState => prevState - recordingsToDelete.length);
                } else {
                  setTotalRecordings(prevState => prevState - recordingsToDelete.length);
                }
                setRecordings(
                  recordings.filter((r) => !selectedRecordings.includes(r.id))
                );
                const completedEncodings = recordingsToDelete.filter(
                  (recording) => recording.encodingStatus === 'DONE'
                ).length;
                setRecordingNo(recordingNo - completedEncodings);
              } catch (error) {
                console.error('Error deleting recordings:', error);
              } finally {
                setLoading(false);
                setSelectedRecordings([]);
              }
            }}
            onArchiveConfirm={async () => {
              setLoading(true);
              try {
                const updatedRecordings: RecordingModalItem[] = [];
                for (const recordingId of selectedRecordings) {
                  const recording = recordings.find((r) => r.id === recordingId);
                  if (!recording) continue;
                  const newRecording = { ...recording, isArchived: !recording.isArchived };
                  updatedRecordings.push(newRecording);
                }
                const updatedRecordingIds = new Set(updatedRecordings.map((recording) => recording.id));
                setRecordings(recordings.filter(
                  (recording) => !updatedRecordingIds.has(recording.id)
                ));

                if (showArchived) {
                  const finalRecordings = [...userRecordings, ...updatedRecordings];
                  setUserRecordings(finalRecordings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                  setTotalArchivedRecordings(prevState => prevState - updatedRecordings.length);
                  setTotalRecordings(prevState => prevState + updatedRecordings.length);
                } else {
                  const finalRecordings = [...userArchivedRecordings, ...updatedRecordings];
                  setUserArchivedRecordings(finalRecordings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                  setTotalArchivedRecordings(prevState => prevState + updatedRecordings.length);
                  setTotalRecordings(prevState => prevState - updatedRecordings.length);
                }
              } catch (error) {
                console.error('Error archiving recordings:', error);
              } finally {
                setSelectedRecordings([]);
                setLoading(false);
              }
            }}
            onMoveConfirm={async (folderId) => {
              try {
                if (!folderId) return;
                setLoading(true);
                setRecordings(
                  recordings.filter((r) => !selectedRecordings.includes(r.id))
                );
                const index = folders.findIndex((f) => f.id === folderId);
                if (index === -1) return;

                if (showArchived) {
                  const updatedFolders = [...folders];
                  updatedFolders[index].archivedRecordingCount =
                    (updatedFolders[index].archivedRecordingCount ?? 0) + selectedRecordings.length;
                  setUserArchivedFolders(updatedFolders);
                  setTotalArchivedRecordings(prevState => prevState - selectedRecordings.length);
                } else {
                  const updatedFolders = [...folders];
                  updatedFolders[index].recordingCount =
                    (updatedFolders[index].recordingCount ?? 0) + selectedRecordings.length;
                  setUserFolders(updatedFolders);
                  setTotalRecordings(prevState => prevState - selectedRecordings.length);
                }

                // Note: This API call may need to be implemented
                for (const recordingId of selectedRecordings) {
                  await webAPI.recording.recordingAddToFolder(recordingId, folderId);
                }
              } catch (error) {
                console.error('Error moving recordings:', error);
              } finally {
                setLoading(false);
                setSelectedRecordings([]);
              }
            }}
            onTurnOffAutoArchiveConfirm={async () => {
              setLoading(true);
              try {
                for (const recordingId of selectedRecordings) {
                  await webAPI.recording.recordingPatchRecording(recordingId, {
                    autoArchiveDisabled: true,
                  });
                }
                setRecordings(
                  recordings.map((recording) => {
                    if (selectedRecordings.includes(recording.id)) {
                      return { ...recording, autoArchiveDisabled: true };
                    }
                    return recording;
                  })
                );
              } catch (error) {
                console.error('Error turning off auto archive:', error);
              } finally {
                setLoading(false);
                setSelectedRecordings([]);
              }
            }}
            onCancelConfirm={() => {
              setSelectedRecordings([]);
            }}
          />
        )}
      </div>

      <ShareFolderModal
        open={modalStates.shareFolderModal}
        folderName={focusedFolderName ?? "Folder"}
        onClose={() => {
          setModalStates({ shareFolderModal: false });
          setFocusedFolderId(null);
        }}
        onConfirm={async () => {
          if (!focusedFolderId) return;
          try {
            await webAPI.folder.folderUpdateFolder(focusedFolderId, { isShared: true });
            const host = window.location.origin;
            const path = `/share/folder/${focusedFolderId}`;
            setShareableFolderLink(host + path);
            setModalStates({ shareFolderModal: false });
            await new Promise(resolve => setTimeout(resolve, 200));
            setModalStates({ alreadySharedFolderModal: true });
            updateFolderSharingStatus(focusedFolderId, true);
          } catch (error) {
            console.error('Error sharing folder:', error);
          }
        }}
      />

      <SharedFolderModal
        open={modalStates.alreadySharedFolderModal}
        folderName={focusedFolderName ?? "Folder"}
        sharedFolderLink={shareableFolderLink ?? ''}
        onClose={() => setModalStates({ alreadySharedFolderModal: false })}
        onUnshare={async () => {
          if (!focusedFolderId) return;
          try {
            await webAPI.folder.folderUpdateFolder(focusedFolderId, { isShared: false });
            setModalStates({ alreadySharedFolderModal: false });
            setFocusedFolderId(null);
            updateFolderSharingStatus(focusedFolderId, false);
          } catch (error) {
            console.error('Error unsharing folder:', error);
          }
        }}
        onConfirm={async () => {
          if (!shareableFolderLink) return;
          navigator.clipboard.writeText(shareableFolderLink);
          setModalStates({ alreadySharedFolderModal: false });
        }}
      />

      <DeleteFolderModal
        open={modalStates.deleteFolderConfirmation}
        onClose={() => {
          setModalStates({ deleteFolderConfirmation: false });
          setFocusedFolderId(null);
        }}
        onConfirm={async () => {
          if (!focusedFolderId) return;
          try {
            if (showArchived) {
              const updatedFolders = userArchivedFolders.filter((f) => f.id !== focusedFolderId);
              setUserArchivedFolders(updatedFolders);
            } else {
              const updatedFolders = userFolders.filter((f) => f.id !== focusedFolderId);
              setUserFolders(updatedFolders);
            }

            setModalStates({ deleteFolderConfirmation: false });

            const deletedFolder = await webAPI.folder.folderDeleteFolder(focusedFolderId);
            if (deletedFolder?.recordings) {
                      const items = (deletedFolder.recordings || []).map((recording: any) =>
                        convertToRecordingModalItem(recording, ventoUser ?? undefined)
                      );
                      setRecordings([...items, ...recordings]);
            }
          } catch (error) {
            console.error('Error deleting folder:', error);
          }
        }}
      />

      {shouldRenderLoader && (
        <div
          ref={(node) => {
            if (!node || loader.current) return;
            loader.current = node;
            observe(node);
          }}
          style={{ textAlign: 'center' }}
        >
          <Loader
            size="md"
            color="black"
            style={{ marginBottom: '10px', marginTop: '20px' }}
          />
        </div>
      )}
      <UploadNewVideoModal
        opened={modalStates.uploadNewVideoModal}
        onClose={() => setModalStates({ uploadNewVideoModal: false })}
      />
      <PricingPageModal
        opened={modalStates.pricingPageModal}
        onClose={() => setModalStates({ pricingPageModal: false })}
      />
      </main>
    </>
  );
}
