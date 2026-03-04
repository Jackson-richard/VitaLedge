import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import ActionButton from '../components/ActionButton';
import StatusBadge from '../components/StatusBadge';
import { ShieldCheck } from 'lucide-react';
import { recordService } from '../services/recordService';
import { toast } from 'react-hot-toast';

const PatientRequests = () => {
    const navigate = useNavigate();
    const [role] = useState(() => localStorage.getItem('role') || '');
    const [consents, setConsents] = useState([]);

    useEffect(() => {
        if (!role || role !== 'patient') {
            navigate('/dashboard');
            return;
        }
        fetchRequests();
    }, [navigate, role]);

    const fetchRequests = async () => {
        try {
            const data = await recordService.getMyConsentRequests();
            setConsents(data || []);
        } catch (err) {
            console.error("Failed to fetch requests", err);
        }
    };

    const handleUpdateConsent = async (consentId, status) => {
        try {
            await recordService.updateConsent(consentId, status);
            toast.success(`Access request ${status}`);
            fetchRequests();
        } catch (err) {
            toast.error("Failed to update access request");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (role !== 'patient') return null;

    return (
        <PageLayout role={role} onLogout={handleLogout} title="Doctor Requests" subtitle="Manage which doctors have decryption keys to your medical history">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-4 duration-500 ease-out fade-in">
                <div className="lg:col-span-12 space-y-6">
                    <Card title="Cryptographic Access Control" icon={ShieldCheck}>
                        <p className="text-sm text-slate-500 mb-6">Manage data sovereignty. Only authorized nodes with active consent tokens can decrypt ledger entries.</p>
                        <div className="space-y-4 max-h-[600px] overflow-auto pr-2 custom-scrollbar">
                            {consents.map((c, i) => (
                                <div key={i} className="p-5 bg-slate-50 hover:bg-white border border-slate-200 rounded-2xl flex items-center justify-between group transition-all hover:shadow-sm">
                                    <div>
                                        <p className="font-bold text-slate-800 mb-1">Dr. {c.doctor_name}</p>
                                        <StatusBadge status={c.status} />
                                    </div>
                                    <div className="flex gap-2">
                                        {c.status === 'pending' && (
                                            <>
                                                <ActionButton variant="primary" onClick={() => handleUpdateConsent(c._id, 'approved')}>Authorize Node</ActionButton>
                                                <ActionButton variant="secondary" onClick={() => handleUpdateConsent(c._id, 'denied')}>Reject</ActionButton>
                                            </>
                                        )}
                                        {c.status === 'approved' && (
                                            <ActionButton variant="danger" onClick={() => handleUpdateConsent(c._id, 'denied')}>Revoke Decryption Key</ActionButton>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {consents.length === 0 &&
                                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <ShieldCheck className="mx-auto text-slate-300 mb-3" size={32} />
                                    <p className="text-slate-500 font-medium text-sm">No node authorization requests pending.</p>
                                </div>
                            }
                        </div>
                    </Card>
                </div>
            </div>
        </PageLayout>
    );
};

export default PatientRequests;
