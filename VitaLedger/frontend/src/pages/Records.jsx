import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import RecordCard from '../components/RecordCard';
import { FileText } from 'lucide-react';
import { recordService } from '../services/recordService';

const Records = () => {
    const navigate = useNavigate();
    const [role] = useState(() => localStorage.getItem('role') || '');
    const [userId] = useState(() => localStorage.getItem('user_id') || '');
    const [patientRecords, setPatientRecords] = useState([]);

    useEffect(() => {
        if (!role || role !== 'patient') {
            navigate('/dashboard');
            return;
        }
        fetchRecords();
    }, [navigate, role]);

    const fetchRecords = async () => {
        try {
            const pRecords = await recordService.getPatientRecords(userId);
            setPatientRecords(pRecords || []);
        } catch (err) {
            console.error("Failed to fetch records", err);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (role !== 'patient') return null;

    return (
        <PageLayout role={role} onLogout={handleLogout} title="My Medical Records" subtitle="A simplified overview of your diagnoses, medications, and follow-up reminders. Internal clinical notes and billing details are not shown.">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-4 duration-500 ease-out fade-in">
                <div className="lg:col-span-12 space-y-6">
                    <Card title="My Health Records" icon={FileText}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-auto pr-2 custom-scrollbar">
                            {patientRecords.map((r, i) => (
                                <RecordCard key={i} record={r} role="patient" />
                            ))}
                            {patientRecords.length === 0 && (
                                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-slate-500 font-medium text-sm">No medical records found on the ledger.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </PageLayout>
    );
};

export default Records;
