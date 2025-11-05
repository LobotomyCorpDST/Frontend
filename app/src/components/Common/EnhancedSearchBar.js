import React, { useState } from 'react';
import { Box } from '@mui/material';
import SmartSearchAutocomplete from './SmartSearchAutocomplete';

/**
 * Unified Search Bar Component
 * Single search bar with dual-mode functionality:
 * 1. Partial match: Type text + press Enter (filters multiple results)
 * 2. Exact match: Select from dropdown (shows single result)
 *
 * @param {Function} onSearch - Unified callback for both modes: ({ type: 'partial'|'exact', value }) => void
 * @param {Array} searchOptions - Options for autocomplete dropdown
 * @param {string} searchLabel - Label for search bar
 * @param {string} searchPlaceholder - Placeholder text
 */
const EnhancedSearchBar = ({
  onSearch,
  searchOptions = [],
  searchLabel = 'ค้นหา',
  searchPlaceholder = 'พิมพ์เพื่อค้นหา หรือเลือกจากรายการ...',
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleExactMatch = (value) => {
    setSearchValue(value);
    if (onSearch) {
      onSearch({ type: 'exact', value });
    }
  };

  const handlePartialMatch = (text) => {
    if (onSearch) {
      onSearch({ type: 'partial', value: text });
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <SmartSearchAutocomplete
        options={searchOptions}
        label={searchLabel}
        value={searchValue}
        onChange={handleExactMatch}
        onPartialMatch={handlePartialMatch}
        placeholder={searchPlaceholder}
      />
    </Box>
  );
};

export default EnhancedSearchBar;
