import React from 'react';
import StatusBadge from './StatusBadge';

const RecordCard = ({ record, role = 'patient' }) => {
    const isDoctor = role === 'doctor';

    return (
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
                <span className="text-xs text-slate-500 font-medium">
                    {new Date(record.timestamp * 1000).toLocaleString()}
                </span>
                {isDoctor && <StatusBadge status={record.integrity} />}
            </div>
            <div className="text-sm text-slate-700 space-y-2">
                <p>
                    <span className="font-semibold text-slate-800">Diagnosis:</span><br />
                    {record.data?.diagnosis}
                </p>

                {isDoctor && (
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <p><span className="font-semibold text-slate-800">Age:</span> {record.data?.demographics?.age}</p>
                        <p><span className="font-semibold text-slate-800">Gender:</span> {record.data?.demographics?.gender}</p>
                        <p><span className="font-semibold text-slate-800">Height:</span> {record.data?.demographics?.height} cm</p>
                        <p><span className="font-semibold text-slate-800">Weight:</span> {record.data?.demographics?.weight} kg</p>
                        <p className="col-span-2"><span className="font-semibold text-slate-800">Symptoms:</span> {record.data?.symptoms || 'None'}</p>
                    </div>
                )}

                <p>
                    <span className="font-semibold text-slate-800">Medications:</span><br />
                    {record.data?.medications?.join(', ')}
                </p>

                {isDoctor && record.data?.clinical_notes && (
                    <p className="text-xs">
                        <span className="font-semibold text-slate-800">Clinical Notes:</span> {record.data?.clinical_notes}
                    </p>
                )}

                {record.data?.billing && (
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
                        <p><span className="font-semibold text-slate-800">Consultation Fee:</span> ₹{record.data.billing.consultation || "Not specified"}</p>
                        <p><span className="font-semibold text-slate-800">Test Cost:</span> ₹{record.data.billing.tests || "Not specified"}</p>
                    </div>
                )}

                {record.data?.ai_guidance && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <span className="font-semibold text-slate-800 text-xs flex items-center gap-1 mb-1">
                            ✨ AI Lifestyle Guidance
                        </span>
                        <div className="text-xs text-slate-700 whitespace-pre-line">
                            {record.data.ai_guidance}
                        </div>
                    </div>
                )}

                {record.data?.followup_date && (
                    <p className="text-xs mt-2 text-indigo-700 font-medium">
                        <span className="font-semibold text-slate-800">Next Follow-Up:</span> {record.data.followup_date}
                    </p>
                )}

                {isDoctor && record.blockchain_hash && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1">
                        <span className="font-semibold text-[10px] text-slate-400 uppercase tracking-widest">Secured via Ledger Hash</span>
                        <span className="font-mono text-[10px] text-blue-600 break-all bg-blue-50/50 p-1.5 rounded border border-blue-100/50">
                            {record.blockchain_hash}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecordCard;
