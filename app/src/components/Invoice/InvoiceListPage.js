import React, { useEffect, useMemo, useState } from 'react';
import { listInvoices, openInvoice, computeDisplayStatus } from '../../api/invoice';

function fmt(n) {
    if (n == null) return '-';
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InvoiceListPage() {
    const now = useMemo(() => new Date(), []);
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [q, setQ] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        try {
            const data = await listInvoices({ year, month });
            setItems(data);
        } finally { setLoading(false); }
    }
    useEffect(() => { load(); /* eslint-disable-next-line */ }, [year, month]);

    const filtered = items.filter(i => {
        if (!q) return true;
        const hay = `${i.id} ${i.room?.number ?? ''} ${i.tenant?.name ?? ''}`.toLowerCase();
        return hay.includes(q.toLowerCase());
    });

    return (
        <div style={{padding:'12px 0'}} data-cy="invoice-list-page-container">
            <div
                style={{display:'flex', gap:8, alignItems:'center', marginBottom:12}}
                data-cy="invoice-list-filters-container"
            >
                <input
                    style={{width:100}}
                    value={year}
                    onChange={e=>setYear(e.target.value)}
                    data-cy="invoice-list-year-input"
                />
                <input
                    style={{width:60}}
                    value={month}
                    onChange={e=>setMonth(e.target.value)}
                    data-cy="invoice-list-month-input"
                />
                <input
                    placeholder="Search…"
                    value={q}
                    onChange={e=>setQ(e.target.value)}
                    style={{flex:1, maxWidth:320}}
                    data-cy="invoice-list-search-input"
                />
            </div>

            <table className="table" data-cy="invoice-list-table">
                <thead data-cy="invoice-list-table-header">
                <tr>
                    <th>Room No.</th>
                    <th>Invoice ID No.</th>
                    <th>Date of Payment</th>
                    <th>Payment Amount</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody data-cy="invoice-list-table-body">
                {loading ? (
                    <tr data-cy="invoice-list-loading-state">
                        <td colSpan="6">Loading…</td>
                    </tr>
                ) : filtered.length === 0 ? (
                    <tr data-cy="invoice-list-no-data-state">
                        <td colSpan="6">No data</td>
                    </tr>
                ) : filtered.map(inv => (
                    <tr key={inv.id} data-cy={`invoice-list-row-${inv.id}`}>
                        <td data-cy={`invoice-list-row-room-${inv.id}`}>{inv.room?.number ?? '-'}</td>
                        <td data-cy={`invoice-list-row-id-${inv.id}`}>{inv.id}</td>
                        <td data-cy={`invoice-list-row-paid-date-${inv.id}`}>{inv.paidDate ?? '-'}</td>
                        <td data-cy={`invoice-list-row-total-${inv.id}`}>{fmt(inv.totalBaht)}</td>
                        <td data-cy={`invoice-list-row-status-${inv.id}`}>{computeDisplayStatus(inv)}</td>
                        <td data-cy={`invoice-list-row-actions-${inv.id}`}>
                            <button
                                onClick={()=>openInvoice(inv.id,'print')}
                                data-cy={`invoice-list-row-print-button-${inv.id}`}
                            >
                                🖨️
                            </button>
                            <button
                                onClick={()=>openInvoice(inv.id,'pdf')}
                                style={{marginLeft:6}}
                                data-cy={`invoice-list-row-pdf-button-${inv.id}`}
                            >
                                PDF
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}