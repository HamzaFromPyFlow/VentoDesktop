import React from 'react';
import styles from '../../styles/modules/Header.module.scss';

export const SearchInitialResult = () => {
  return (
    <div className={styles.initialResultContainer}>
      <img
        src="/assets/vento-logo-rounded.png"
        alt="vento logo"
        width={75}
      />
      <p>Start typing and we&apos;ll search through your videos, folders, users and workspaces to find what you need</p>
    </div>
  );
};

export default SearchInitialResult;
