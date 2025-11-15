import React, { useMemo, useState } from 'react';
import { createInvoice, openInvoice } from '../../api/invoice';

function num(v) {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
}

export default function QuickInvoicePanel() {
    const today = useMemo(() => new Date(), []);
    const y = today.getFullYear();
    const m = today.getMonth() + 1;

    const [roomId, setRoomId] = useState(1);
    const [billingYear, setBillingYear] = useState(y);
    const [billingMonth, setBillingMonth] = useState(m);
    const [issueDate, setIssueDate] = useState(today.toISOString().slice(0,10));
    const [dueDate, setDueDate] = useState(new Date(today.getTime()+7*86400000).toISOString().slice(0,10));

    const [electricityUnits, setElectricityUnits] = useState('');
    const [electricityRate, setElectricityRate] = useState('');
    const [waterUnits, setWaterUnits] = useState('');
    const [waterRate, setWaterRate] = useState('');
    const [otherBaht, setOtherBaht] = useState('');

    const [includeCommonFee, setIncludeCommonFee] = useState(true);
    const [includeGarbageFee, setIncludeGarbageFee] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleCreate(view = 'print') {
        setLoading(true);
        setError('');
        try {
            const payload = {
                roomId: num(roomId),
                billingYear: num(billingYear),
                billingMonth: num(billingMonth),
                issueDate,
                dueDate,
                electricityUnits: num(electricityUnits),
                electricityRate: num(electricityRate),
                waterUnits: num(waterUnits),
                waterRate: num(waterRate),
                otherBaht: num(otherBaht),
            };

            Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

            const inv = await createInvoice(payload, { includeCommonFee, includeGarbageFee });

            openInvoice(inv.id, view);
        } catch (e) {
            setError(e.message || 'Create invoice failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{border:'1px solid #ddd', padding:16, borderRadius:8, margin:'12px 0'}}
            data-cy="quick-invoice-panel-container"
        >
            <h3 data-cy="quick-invoice-panel-title">Quick Create Invoice</h3>

            <div
                style={{display:'grid', gridTemplateColumns:'160px 1fr', gap:8, maxWidth:520}}
                data-cy="quick-invoice-panel-form-grid"
            >
                <label>Room ID</label>
                <input
                    value={roomId}
                    onChange={e=>setRoomId(e.target.value)}
                    data-cy="quick-invoice-room-id-input"
                />

                <label>Billing Year / Month</label>
                <div style={{display:'flex', gap:8}}>
                    <input
                        style={{width:120}}
                        value={billingYear}
                        onChange={e=>setBillingYear(e.target.value)}
                        data-cy="quick-invoice-year-input"
                    />
                    <input
                        style={{width:80}}
                        value={billingMonth}
                        onChange={e=>setBillingMonth(e.target.value)}
                        data-cy="quick-invoice-month-input"
                    />
                </div>

                <label>Issue Date</label>
                <input
                    type="date"
                    value={issueDate}
                    onChange={e=>setIssueDate(e.target.value)}
                    data-cy="quick-invoice-issue-date-input"
                />

                <label>Due Date</label>
                <input
                    type="date"
                    value={dueDate}
                    onChange={e=>setDueDate(e.target.value)}
                    data-cy="quick-invoice-due-date-input"
                />

                <label>Electricity</label>
                <div style={{display:'flex', gap:8}}>
                    <input
                        placeholder="units"
                        value={electricityUnits}
                        onChange={e=>setElectricityUnits(e.target.value)}
                        data-cy="quick-invoice-electricity-units-input"
                    />
                    <input
                        placeholder="rate"
                        value={electricityRate}
                        onChange={e=>setElectricityRate(e.target.value)}
                        data-cy="quick-invoice-electricity-rate-input"
                    />
                </div>

                <label>Water</label>
                <div style={{display:'flex', gap:8}}>
                    <input
                        placeholder="units"
                        value={waterUnits}
                        onChange={e=>setWaterUnits(e.target.value)}
                        data-cy="quick-invoice-water-units-input"
                    />
                    <input
                        placeholder="rate"
                        value={waterRate}
                        onChange={e=>setWaterRate(e.target.value)}
                        data-cy="quick-invoice-water-rate-input"
                    />
                </div>

                <label>Other (Baht)</label>
                <input
                    value={otherBaht}
                    onChange={e=>setOtherBaht(e.target.value)}
                    data-cy="quick-invoice-other-baht-input"
                />

                <label>Options</label>
                <div>
                    <label style={{marginRight:12}}>
                        <input
                            type="checkbox"
                            checked={includeCommonFee}
                            onChange={e=>setIncludeCommonFee(e.target.checked)}
                            data-cy="quick-invoice-common-fee-checkbox"
                        />
                        &nbsp;Include Common Fee
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={includeGarbageFee}
                            onChange={e=>setIncludeGarbageFee(e.target.checked)}
                            data-cy="quick-invoice-garbage-fee-checkbox"
                        />
                        &nbsp;Include Garbage Fee
                    </label>
                </div>
            </div>

            {error && (
                <div
                    style={{color:'crimson', marginTop:8}}
                    data-cy="quick-invoice-error-message"
                >
                    {error}
                </div>
            )}

            <div style={{marginTop:12, display:'flex', gap:8}}>
                <button
                    disabled={loading}
                    onClick={()=>handleCreate('print')}
                    data-cy="quick-invoice-create-print-button"
                >
                    Create & Open Print
                </button>
                <button
                    disabled={loading}
                    onClick={()=>handleCreate('pdf')}
                    data-cy="quick-invoice-create-pdf-button"
                >
                    Create & Open PDF
                </button>
            </div>
        </div>
    );
}