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
    <div style={{padding:'12px 0'}}>
      <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:12}}>
        <input style={{width:100}} value={year} onChange={e=>setYear(e.target.value)} />
        <input style={{width:60}}  value={month} onChange={e=>setMonth(e.target.value)} />
        <input placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)}
               style={{flex:1, maxWidth:320}}/>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Room No.</th>
            <th>Invoice ID No.</th>
            <th>Date of Payment</th>
            <th>Payment Amount</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {loading ? (
          <tr><td colSpan="6">Loading…</td></tr>
        ) : filtered.length === 0 ? (
          <tr><td colSpan="6">No data</td></tr>
        ) : filtered.map(inv => (
          <tr key={inv.id}>
            <td>{inv.room?.number ?? '-'}</td>
            <td>{inv.id}</td>
            <td>{inv.paidDate ?? '-'}</td>
            <td>{fmt(inv.totalBaht)}</td>
            <td>{computeDisplayStatus(inv)}</td>
            <td>
              <button onClick={()=>openInvoice(inv.id,'print')}>🖨️</button>
              <button onClick={()=>openInvoice(inv.id,'pdf')} style={{marginLeft:6}}>PDF</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}