import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import { Settings } from 'lucide-react';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [role] = useState(() => localStorage.getItem('role') || '');

    useEffect(() => {
        if (!role) {
            navigate('/login');
            return;
        }
        if (role !== 'admin') {
            navigate('/dashboard');
        }
    }, [navigate, role]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!role) return null;

    return (
        <PageLayout role={role} onLogout={handleLogout} title="Admin Panel" subtitle="Manage users, network properties, and system configurations.">
            <Card title="System Administration" icon={Settings}>
                <p className="text-slate-600 font-medium my-4">Administrative controls are currently being configured.</p>
                <div className="h-32 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex items-center justify-center">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Under Construction</span>
                </div>
            </Card>
        </PageLayout>
    );
};

export default AdminPanel;
