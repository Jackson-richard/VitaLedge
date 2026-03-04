import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import { ShieldCheck } from 'lucide-react';

const BlockchainStatus = () => {
    const navigate = useNavigate();
    const [role] = useState(() => localStorage.getItem('role') || '');

    useEffect(() => {
        if (!role) {
            navigate('/login');
        }
    }, [navigate, role]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!role) return null;

    return (
        <PageLayout role={role} onLogout={handleLogout} title="Blockchain Status" subtitle="Monitor the integrity of the distributed node network.">
            <Card title="Network Inspector" icon={ShieldCheck}>
                <p className="text-slate-600 font-medium my-4">Advanced blockchain verification and metrics panel is being assembled.</p>
                <div className="h-32 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex items-center justify-center">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Under Construction</span>
                </div>
            </Card>
        </PageLayout>
    );
};

export default BlockchainStatus;
