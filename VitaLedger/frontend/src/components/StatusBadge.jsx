import React from 'react';

const StatusBadge = ({ status }) => {
    const normalizedStatus = status?.toLowerCase() || '';
    const isOk = normalizedStatus === 'valid' || normalizedStatus === 'approved' || normalizedStatus === 'verified';
    const isErr = normalizedStatus === 'tampered' || normalizedStatus === 'denied' || normalizedStatus.includes('tampering');
    const isPending = normalizedStatus === 'pending';

    let bg = 'bg-slate-100 text-slate-700 border border-slate-200'; // Default
    if (isOk) bg = 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm';
    else if (isErr) bg = 'bg-red-100 text-red-800 border border-red-300 shadow-sm';
    else if (isPending) bg = 'bg-amber-100 text-amber-800 border border-amber-300 shadow-sm';

    return (
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${bg}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
