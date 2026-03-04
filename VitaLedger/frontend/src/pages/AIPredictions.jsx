import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import { BrainCircuit } from 'lucide-react';

const AIPredictions = () => {
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
        <PageLayout role={role} onLogout={handleLogout} title="AI Predictions" subtitle="Run robust machine learning diagnostic analysis.">
            <Card title="Prediction Models" icon={BrainCircuit}>
                <p className="text-slate-600 font-medium my-4">The dedicated AI analysis interface is pending deployment.</p>
                <div className="h-32 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex items-center justify-center">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Under Construction</span>
                </div>
            </Card>
        </PageLayout>
    );
};

export default AIPredictions;
