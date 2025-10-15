import React, { useState, useEffect, useMemo } from 'react';
import './TenantList.css';
import CreateTenantModal from './CreateTenantModal';
import { listTenants } from '../../api/tenant';

const TenantList = ({ searchTerm, addTenantSignal }) => {
    const [tenants, setTenants] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openCreate, setOpenCreate] = useState(false);

    useEffect(() => {
        if (addTenantSignal) {
            setOpenCreate(true);
        }
    }, [addTenantSignal]);

    const loadTenants = async () => {
        setLoading(true);
        setError('');
        try {
            const tenantData = await listTenants();
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
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
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
                String(tenant.id).toLowerCase().includes(term) || // Added search by ID
                tenant.name.toLowerCase().includes(term) ||
                tenant.phone.includes(term) ||
                (tenant.room?.number && String(tenant.room.number).includes(term))
        );
    }, [sortedTenants, searchTerm]);

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
                        <th onClick={() => handleSort('phone')} className="sortable">Phone Number</th>
                        <th onClick={() => handleSort('email')} className="sortable">Email</th>
                        <th onClick={() => handleSort('room')} className="sortable">Room No.</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredTenants.map((tenant) => (
                        <tr key={tenant.id}>
                            <td>{tenant.id}</td>
                            <td>{tenant.name}</td>
                            <td>{tenant.phone}</td>
                            <td>{tenant.email || '-'}</td>
                            <td>{tenant.room?.number || 'N/A'}</td>
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
        </>
    );
};

export default TenantList;

