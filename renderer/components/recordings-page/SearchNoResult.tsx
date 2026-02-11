import React from 'react';
import styles from '../../styles/modules/Header.module.scss';

export const SearchNoResult = () => {
  return (
    <div className={styles.noResultContainer}>
      <h3>No results found</h3>
      <p>Try a different keyword or look for typos in your search</p>
    </div>
  );
};

export default SearchNoResult;
