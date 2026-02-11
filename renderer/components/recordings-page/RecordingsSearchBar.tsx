import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader, TextInput } from '@mantine/core';
import { IoSearchSharp } from 'react-icons/io5';
import { SearchResultType } from '../../lib/types';
import { debounce } from '../../lib/utils';
import SearchNoResult from './SearchNoResult';
import SearchInitialResult from './SearchInitialResult';
import SearchResult from './SearchResult';
import styles from '../../styles/modules/Header.module.scss';
// TODO: Import when available
// import webAPI from '../../lib/webapi';

export default function RecordingsSearchBar() {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchBarActive, setIsSearchBarActive] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [searchResults, setSearchResults] = useState<SearchResultType[]>([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchQuery = useCallback(
    debounce(async (currentValue: string) => {
      if (currentValue.length > 2) {
        setLoading(true);
        try {
          // TODO: Implement API call
          // const result = await webAPI.search.searchSearch(currentValue);
          // if (searchInputRef.current && searchInputRef.current.value.length > 2) {
          //   setSearchResults(result);
          // }
          setSearchResults([]);
        } catch (error) {
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400),
    []
  );

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchBarActive(false);
        setSearchValue('');
        setSearchResults([]);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <>
      {isSearchBarActive && <div className={styles.overlay}></div>}
      <div className={styles.searchContainer} ref={searchContainerRef}>
        <TextInput
          leftSection={<IoSearchSharp size={20} />}
          ref={searchInputRef}
          w="90%"
          size="md"
          m="auto"
          placeholder="Search for folders, videos, workspaces, and people"
          value={searchValue}
          onClick={() => setIsSearchBarActive(true)}
          onChange={(e) => {
            setSearchValue(e.currentTarget.value);
            searchQuery(e.currentTarget.value);
          }}
          styles={{
            input: {
              outline: 'none',
              '&:focus': {
                borderColor: 'transparent',
                boxShadow: 'none',
              },
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              borderBottomLeftRadius: isSearchBarActive ? '0px' : '8px',
              borderBottomRightRadius: isSearchBarActive ? '0px' : '8px',
            },
          }}
        />
        <div
          className={`${styles.searchResultContainer} ${
            isSearchBarActive ? styles.active : ''
          }`}
        >
          {loading ? (
            <div className={styles.loaderContainer}>
              <Loader size="lg" />
            </div>
          ) : searchResults.length > 0 ? (
            <SearchResult searchResults={searchResults} />
          ) : searchValue.length > 0 ? (
            <SearchNoResult />
          ) : (
            <SearchInitialResult />
          )}
        </div>
      </div>
    </>
  );
}
