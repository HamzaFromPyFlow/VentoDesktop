import React, { useEffect, useRef } from 'react';
import { FaPlay } from 'react-icons/fa';
import { HiOutlineFolder } from 'react-icons/hi';
import { MdOutlineArchive } from 'react-icons/md';
import { SearchResultType } from '../../lib/types';
import { formatDuration, formatDateSince, generateUrl } from '../../lib/utils';
import styles from '../../styles/modules/Header.module.scss';

interface SearchResultProps {
  searchResults: SearchResultType[];
}

export const SearchResult = ({ searchResults }: SearchResultProps) => {
  const searchResultListRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const disablePageScroll = () => {
      document.body.style.overflow = 'hidden';
    };

    const enablePageScroll = () => {
      document.body.style.overflow = '';
    };

    const handleMouseEnter = () => disablePageScroll();
    const handleMouseLeave = () => enablePageScroll();

    const searchList = searchResultListRef.current;

    if (searchList) {
      searchList.addEventListener('mouseenter', handleMouseEnter);
      searchList.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (searchList) {
        searchList.removeEventListener('mouseenter', handleMouseEnter);
        searchList.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div className={styles.searchResultList} ref={searchResultListRef}>
      {searchResults.map((result, index) => (
        <a
          href={
            result.type == 'video'
              ? generateUrl(`/view/${result.data.id}`)
              : generateUrl(`/recordings/folder/${result.data.id}`)
          }
          key={index}
          className={styles.searchResultItem}
        >
          {result.type === 'folder' ? (
            <div className={styles.folderResult}>
              <div className={styles.resultIcon}>
                {result.data.isArchived ? (
                  <div className={styles.iconContainer}>
                    <HiOutlineFolder size={38} className={styles.folderIcon} />
                    <MdOutlineArchive size={16} className={styles.archiveIcon} />
                  </div>
                ) : (
                  <HiOutlineFolder size={38} />
                )}
              </div>
              <div className={styles.folderData}>
                <h3 className={styles.title}>{result.data.name}</h3>
                <p className={styles.metaInfo}>
                  Folder · {result.data.owner} · {result.data.videoCount} video
                  {result.data.videoCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.videoResult}>
              <div className={styles.resultIcon}>
                <FaPlay size={20} />
              </div>
              <div className={styles.recordingData}>
                <h3 className={styles.title}>{result.data.name}</h3>
                <p className={styles.metaInfo}>
                  {result.data.owner} · {formatDateSince(new Date(result.data.date))} ·{' '}
                  {formatDuration(parseFloat(result.data.duration ?? '0'))}{' '}
                  {result.data.isArchived && (
                    <MdOutlineArchive size={20} className={styles.archiveIcon} />
                  )}
                </p>
              </div>
              <div className={styles.inTranscriptContainer}>
                {result.data.matchedTranscript && (
                  <p className={styles.matchedTranscript}>In Transcript</p>
                )}
              </div>
            </div>
          )}
        </a>
      ))}
    </div>
  );
};

export default SearchResult;
