import React, { useState } from 'react';
import { Autocomplete, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

/**
 * Smart search autocomplete with fuzzy matching
 * Supports two modes:
 * 1. Partial match (Enter key) - filters results by typed text
 * 2. Exact match (dropdown selection) - shows only selected item
 * Fuzzy matching (e.g., "kart" matches "kant") for both modes
 */
const SmartSearchAutocomplete = ({
  options = [],
  label,
  value,
  onChange,
  placeholder = 'พิมพ์เพื่อค้นหา...',
  onPartialMatch, // New callback for Enter key partial matching
}) => {
  const [inputValue, setInputValue] = useState('');
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

  // Handle Enter key for partial match search
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && inputValue && onPartialMatch) {
      // Trigger partial match search with current input value
      onPartialMatch(inputValue);
      // Don't select first option, just filter
      event.defaultMuiPrevented = true;
    }
  };

  return (
    <Autocomplete
      options={options}
      value={selectedOption}
      inputValue={inputValue}
      onInputChange={(event, newInputValue, reason) => {
        // Update input value for both typing and clearing
        if (reason === 'input' || reason === 'clear') {
          setInputValue(newInputValue);
        }
        // Clear partial match when input is cleared
        if (reason === 'clear' && onPartialMatch) {
          onPartialMatch('');
        }
      }}
      onChange={(event, newValue) => {
        // Exact match selection from dropdown
        onChange(newValue ? newValue.value : '');
        setInputValue(''); // Clear input after selection
      }}
      getOptionLabel={(option) => option.label || ''}
      filterOptions={filterOptions}
      freeSolo={false} // Keep dropdown required for cleaner UX
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          variant="outlined"
          size="small"
          onKeyDown={handleKeyDown}
          sx={{
            backgroundColor: "#f0f4fa",
            borderRadius: "8px",
            "& .MuiOutlinedInput-notchedOutline": { border: 0 },
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      noOptionsText="ไม่พบข้อมูล (กด Enter เพื่อค้นหา)"
      fullWidth
    />
  );
};

export default SmartSearchAutocomplete;
