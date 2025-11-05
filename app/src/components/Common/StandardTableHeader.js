import React from 'react';
import {
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Box,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

/**
 * Standardized Table Header Component
 * Matches the InvoiceHistory header styling (#1d3e7d background)
 *
 * @param {Array} columns - Array of column objects: [{ id, label, disableSorting, align, renderHeader }]
 * @param {Object} sortConfig - { key: string, direction: 'asc'|'desc' }
 * @param {Function} onRequestSort - Callback when user clicks sortable column header
 */
const StandardTableHeader = ({ columns, sortConfig, onRequestSort }) => {
  // Standard header cell styling matching InvoiceHistory pattern
  const headerCellStyle = {
    backgroundColor: '#1d3e7d',
    fontWeight: 600,
    color: '#f8f9fa',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '1px solid #e0e6eb',
    cursor: 'pointer',
    '&:hover': { backgroundColor: '#173262' },
  };

  const handleSortClick = (columnId) => {
    if (onRequestSort) {
      onRequestSort(columnId);
    }
  };

  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.id}
            align={column.align || 'left'}
            sx={{
              ...headerCellStyle,
              ...(column.disableSorting && { cursor: 'default' }),
            }}
            sortDirection={sortConfig?.key === column.id ? sortConfig.direction : false}
            onClick={() => !column.disableSorting && handleSortClick(column.id)}
          >
            {/* Custom header rendering (e.g., checkboxes) */}
            {column.renderHeader ? (
              column.renderHeader()
            ) : column.disableSorting ? (
              column.label
            ) : (
              <TableSortLabel
                active={sortConfig?.key === column.id}
                direction={sortConfig?.key === column.id ? sortConfig.direction : 'asc'}
                sx={{
                  color: '#f8f9fa',
                  '&:hover': { color: '#f0f4fa' },
                  '&.Mui-active': {
                    color: '#f8f9fa',
                    '& .MuiTableSortLabel-icon': {
                      transform: sortConfig.direction === 'ascending' ? 'rotate(180deg)' : 'rotate(0deg)',
                    },
                  },
                  '& .MuiTableSortLabel-icon': { color: 'inherit !important' },
                }}
              >
                {column.label}
                {sortConfig?.key === column.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {sortConfig.direction === 'descending' ? 'เรียงจากมากไปน้อย' : 'เรียงจากน้อยไปมาก'}
                  </Box>
                ) : null}
              </TableSortLabel>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default StandardTableHeader;
