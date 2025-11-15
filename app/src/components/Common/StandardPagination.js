import React from 'react';
import { TablePagination } from '@mui/material';

/**
 * Standardized Table Pagination Component
 * Provides consistent pagination UI across all tables
 *
 * @param {number} count - Total number of rows
 * @param {number} page - Current page (0-indexed)
 * @param {number} rowsPerPage - Number of rows per page
 * @param {Function} onPageChange - Callback when page changes: (event, newPage) => void
 * @param {Function} onRowsPerPageChange - Callback when rows per page changes: (event) => void
 * @param {Array} rowsPerPageOptions - Options for rows per page (default: [10, 25, 50, 100])
 */
const StandardPagination = ({
                                count,
                                page,
                                rowsPerPage,
                                onPageChange,
                                onRowsPerPageChange,
                                rowsPerPageOptions = [10, 25, 50, 100],
                                ...props
                            }) => {
    return (
        <TablePagination
            {...props}
            rowsPerPageOptions={rowsPerPageOptions}
            component="div"
            count={count}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            labelRowsPerPage="แถวต่อหน้า:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`}
            sx={{
                borderTop: '1px solid #e0e6eb',
                '.MuiTablePagination-toolbar': {
                    minHeight: '52px',
                },
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                    marginBottom: 0,
                },
            }}
            // --- Internal data-cy tags ---
            SelectProps={{
                inputProps: {
                    'data-cy': 'standard-pagination-rows-per-page-select'
                },
                MenuProps: {
                    'data-cy': 'standard-pagination-rows-per-page-menu'
                }
            }}
            nextIconButtonProps={{
                'data-cy': 'standard-pagination-next-page-button'
            }}
            backIconButtonProps={{
                'data-cy': 'standard-pagination-prev-page-button'
            }}
        />
    );
};

export default StandardPagination;