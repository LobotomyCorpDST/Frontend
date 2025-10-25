import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

/**
 * Smart search autocomplete with fuzzy matching
 * Supports typing to filter options with flexible matching (e.g., "kart" matches "kant")
 */
const SmartSearchAutocomplete = ({
  options = [],
  label,
  value,
  onChange,
  placeholder = 'พิมพ์เพื่อค้นหา...',
}) => {
  // Fuzzy match function - case insensitive substring matching
  const fuzzyMatch = (text, searchTerm) => {
    if (!text || !searchTerm) return true;

    const textLower = text.toString().toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    // Direct substring match
    if (textLower.includes(searchLower)) {
      return true;
    }

    // Character sequence match (e.g., "krt" matches "ka-r-an-t")
    let searchIndex = 0;
    for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
      if (textLower[i] === searchLower[searchIndex]) {
        searchIndex++;
      }
    }

    return searchIndex === searchLower.length;
  };

  // Custom filter function
  const filterOptions = (options, { inputValue }) => {
    if (!inputValue) return options;

    return options.filter(option => {
      const searchText = option.searchText || option.label || '';
      return fuzzyMatch(searchText, inputValue);
    });
  };

  // Find the selected option object
  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <Autocomplete
      options={options}
      value={selectedOption}
      onChange={(event, newValue) => {
        onChange(newValue ? newValue.value : '');
      }}
      getOptionLabel={(option) => option.label || ''}
      filterOptions={filterOptions}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          variant="outlined"
        />
      )}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      noOptionsText="ไม่พบข้อมูล"
      fullWidth
    />
  );
};

export default SmartSearchAutocomplete;
