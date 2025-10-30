import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './TenantList.css';
import CreateTenantModal from './CreateTenantModal';
import EditTenantModal from '../TenantDetail/EditTenantModal'; // ✅ new import
import { listTenantsWithRooms, deleteTenant } from '../../api/tenant';
import { Button, Stack } from '@mui/material';

const TenantList = ({ searchTerm, addTenantSignal }) => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState(null); // ✅ for edit modal

  useEffect(() => {
    if (addTenantSignal) setOpenCreate(true);
  }, [addTenantSignal]);

  const loadTenants = async () => {
    setLoading(true);
    setError('');
    try {
      const tenantData = await listTenantsWithRooms();
      setTenants(tenantData);
    } catch (e) {
      setError(e.message || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }));
  };

  const sortedTenants = useMemo(() => {
    const list = [...tenants];
    if (!sortConfig.key) return list;
    const dir = sortConfig.direction === 'ascending' ? 1 : -1;
    return list.sort((a, b) => {
      const valA = a[sortConfig.key] || '';
      const valB = b[sortConfig.key] || '';
      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
  }, [tenants, sortConfig]);

  const filteredTenants = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();
    if (!term) return sortedTenants;
    return sortedTenants.filter(
      (tenant) =>
        String(tenant.id).toLowerCase().includes(term) ||
        tenant.name.toLowerCase().includes(term) ||
        tenant.phone.includes(term) ||
        (tenant.roomNumbers && tenant.roomNumbers.some(num => String(num).includes(term)))
    );
  }, [sortedTenants, searchTerm]);

  const handleRowClick = (tenantId) => {
    navigate(`/tenant-details/${tenantId}`);
  };

  const handleEditClick = (tenantId, e) => {
    e.stopPropagation(); // prevent row click navigation
    setSelectedTenantId(tenantId);
  };

  const handleDeleteClick = async (tenantId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;
    try {
      await deleteTenant(tenantId);
      await loadTenants();
    } catch (e) {
      alert(e.message || 'Failed to delete tenant.');
    }
  };

  if (loading) return <div className="tenant-list-container">Loading tenants...</div>;
  if (error) return <div className="tenant-list-container">Error: {error}</div>;

  return (
    <>
      <div className="tenant-list-container">
        <table className="tenant-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className="sortable">Tenant ID</th>
              <th onClick={() => handleSort('name')} className="sortable">Tenant Name</th>
              <th onClick={() => handleSort('phone')} className="sortable">Phone</th>
              <th onClick={() => handleSort('lineId')} className="sortable">LINE ID</th>
              <th>Room No.</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map((tenant) => (
              <tr
                key={tenant.id}
                onClick={() => handleRowClick(tenant.id)}
                style={{ cursor: 'pointer' }}
              >
                <td>{tenant.id}</td>
                <td>{tenant.name}</td>
                <td>{tenant.phone}</td>
                <td>{tenant.lineId || '-'}</td>
                <td style={{ whiteSpace: 'normal', wordWrap: 'break-word', maxWidth: '200px' }}>
                  {tenant.roomNumbers && tenant.roomNumbers.length > 0
                    ? tenant.roomNumbers.map((num) => `ห้อง ${num}`).join(', ')
                    : 'ไม่มีห้อง'}
                </td>
                <td>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => handleEditClick(tenant.id, e)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={(e) => handleDeleteClick(tenant.id, e)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openCreate && (
        <CreateTenantModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onCreated={loadTenants}
        />
      )}

      {selectedTenantId && (
        <EditTenantModal
          open={!!selectedTenantId}
          tenantId={selectedTenantId}
          onClose={() => setSelectedTenantId(null)}
          onUpdated={loadTenants}
        />
      )}
    </>
  );
};

export default TenantList;
