import React, { useState } from 'react';
import { Autocomplete, TextField, InputAdornment, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SmartSearchAutocomplete = ({
                                     options = [],
                                     label,
                                     value,
                                     onChange,
                                     placeholder = 'พิมพ์เพื่อค้นหา...',
                                     onPartialMatch,
                                     sx,
                                     ...props
                                 }) => {
    const [inputValue, setInputValue] = useState('');

    const fuzzyMatch = (text, searchTerm) => {
        if (!text || !searchTerm) return true;
        const textLower = text.toString().toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        if (textLower.includes(searchLower)) return true;

        let searchIndex = 0;
        for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
            if (textLower[i] === searchLower[searchIndex]) {
                searchIndex++;
            }
        }
        return searchIndex === searchLower.length;
    };

    const filterOptions = (options, { inputValue }) => {
        if (!inputValue) return options;
        return options.filter(option => {
            const searchText = option.searchText || option.label || '';
            return fuzzyMatch(searchText, inputValue);
        });
    };

    const selectedOption = options.find(opt => opt.value === value) || null;

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && inputValue && onPartialMatch) {
            onPartialMatch(inputValue);
            event.defaultMuiPrevented = true;
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Autocomplete
                {...props}
                options={options}
                value={selectedOption}
                inputValue={inputValue}
                onInputChange={(event, newInputValue, reason) => {
                    if (reason === 'input' || reason === 'clear') setInputValue(newInputValue);
                    if (reason === 'clear' && onPartialMatch) onPartialMatch('');
                }}
                onChange={(event, newValue) => {
                    onChange(newValue ? newValue.value : '');
                    setInputValue('');
                }}
                getOptionLabel={(option) => option.label || ''}
                filterOptions={filterOptions}
                freeSolo={false}
                fullWidth={true}

                sx={{
                    width: '100%',
                    display: 'flex',
                    ...(sx || {})
                }}

                renderOption={(props, option) => {
                    return (
                        <li
                            {...props}
                            // Creates a selector like: [data-cy="smart-search-option-52"]
                            data-cy={`smart-search-option-${option.value}`}
                        >
                            {option.label}
                        </li>
                    );
                }}

                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={label}
                        placeholder={placeholder}
                        variant="outlined"
                        size="small"
                        fullWidth={true}
                        onKeyDown={handleKeyDown}
                        sx={{
                            width: '100%',
                            backgroundColor: "#f0f4fa",
                            borderRadius: "8px",
                            "& .MuiOutlinedInput-notchedOutline": { border: 0 },
                            "& .MuiInputBase-root": {
                                paddingRight: "39px !important",
                                width: '100%'
                            }
                        }}
                        data-cy="smart-search-input-field"
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <>
                                    <InputAdornment position="start">
                                        <SearchIcon data-cy="smart-search-search-icon" color="action" />
                                    </InputAdornment>
                                    {params.InputProps.startAdornment}
                                </>
                            ),
                        }}
                    />
                )}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                noOptionsText="ไม่พบข้อมูล (กด Enter เพื่อค้นหา)"
            />
        </Box>
    );
};

export default SmartSearchAutocomplete;