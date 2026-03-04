import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { UserPlus, Database, ShieldCheck, ActivitySquare, BrainCircuit, ShieldAlert, Activity, FileText } from 'lucide-react';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import ActionButton from '../components/ActionButton';
import BlockchainVerifyButton from '../components/BlockchainVerifyButton';
import RiskPredictionCard from '../components/RiskPredictionCard';

import { recordService } from '../services/recordService';
import { aiService } from '../services/aiService';

const Dashboard = () => {
    const navigate = useNavigate();
    const [role] = useState(() => localStorage.getItem('role') || '');

    // Data State
    const [logs, setLogs] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const [vitals, setVitals] = useState({ age: '', bmi: '', blood_pressure: '', glucose_level: '' });
    const [aiResult, setAiResult] = useState(null);

    const [patientProfile, setPatientProfile] = useState({
        name: '', age: '', gender: 'Male', address: '', phone: '', height: '', weight: '', symptoms: '', visit_date: ''
    });

    const [chainStatus, setChainStatus] = useState(null);

    const getUserIdFromToken = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.user_id;
        } catch {
            return null;
        }
    };

    const userId = getUserIdFromToken();

    useEffect(() => {
        if (!role) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                if (r === 'admin') {
                    const adminLogs = await recordService.getAuditLogs();
                    setLogs(adminLogs || []);
                } else if (r === 'patient') {
                    if (!userId) {
                        navigate('/login');
                        return;
                    }
                    try {
                        const notifs = await recordService.getPatientNotifications(userId);
                        setNotifications(notifs);
                        const pProfile = await recordService.getProfile(userId);
                        if (pProfile) {
                            setPatientProfile(pProfile);
                        }
                    } catch (err) {
                        console.error("Error fetching notifications or profile", err);
                    }
                }
            } catch (err) {
                console.error("Error connecting to node network", err);
            }
        };
        fetchData();
    }, [navigate, userId]);


    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // --- Admin Handlers ---
    const handleVerifyChain = async () => {
        try {
            const data = await recordService.verifyChain();
            setChainStatus(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleTamperDemo = async () => {
        try {
            await recordService.tamperRecord();
            alert("Database tampered! Run verification to detect it.");
            handleVerifyChain();
            // Re-fetch logs for admin view
            if (role === 'admin') {
                const adminLogs = await recordService.getAuditLogs();
                setLogs(adminLogs || []);
            }
        } catch {
            alert("Error tampering or no records exist yet.");
        }
    };



    // --- Patient Handlers ---
    const handlePredictRisk = async (e) => {
        e.preventDefault();
        try {
            const formattedVitals = {
                age: parseFloat(vitals.age),
                bmi: parseFloat(vitals.bmi),
                blood_pressure: parseFloat(vitals.blood_pressure),
                glucose_level: parseFloat(vitals.glucose_level)
            };
            const data = await aiService.predictRisk(formattedVitals);
            setAiResult(data);
        } catch {
            alert("Error predicting risk. Please ensure all inputs are valid numbers.");
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            const userId = getUserIdFromToken();
            await recordService.updateProfile({
                abha_id: userId,
                name: patientProfile.name,
                age: parseInt(patientProfile.age) || 0,
                gender: patientProfile.gender,
                address: patientProfile.address,
                phone: patientProfile.phone,
                height: parseFloat(patientProfile.height) || 0,
                weight: parseFloat(patientProfile.weight) || 0,
                symptoms: patientProfile.symptoms,
                visit_date: patientProfile.visit_date
            });
            alert("Patient profile updated securely.");
        } catch {
            alert("Error updating profile.");
        }
    };

    // --- UI Renderers ---

    const renderAdminView = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500 ease-out fade-in">
            <div className="lg:col-span-1 space-y-6">
                <Card title="Blockchain Cryptography" icon={ShieldCheck}>
                    <div className="mb-6">
                        <BlockchainVerifyButton chainStatus={chainStatus} onVerify={handleVerifyChain} />
                    </div>
                </Card>

                <Card title="Demo Override" icon={ShieldAlert}>
                    <p className="text-sm text-slate-500 mb-4">Simulate a malicious database intrusion to test cryptographic ledger integrity verification routines.</p>
                    <ActionButton variant="demo" className="w-full" icon={Database} onClick={handleTamperDemo}>
                        Simulate Tamper Event
                    </ActionButton>
                </Card>
            </div>

            <div className="lg:col-span-2">
                <Card title="Immutable Audit Trail" icon={ActivitySquare}>
                    <div className="overflow-auto max-h-[600px] pr-2 custom-scrollbar">
                        <div className="space-y-4">
                            {logs.map((log, i) => (
                                <div key={i} className="text-sm p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row gap-4 justify-between group hover:bg-white hover:shadow-sm transition-all hover:border-blue-200">
                                    <div>
                                        <span className="font-mono bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs tracking-wider inline-block mb-2 font-bold">{log.action}</span>
                                        <p className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors">{log.details}</p>
                                    </div>
                                    <div className="text-xs text-slate-400 whitespace-nowrap font-medium flex-shrink-0">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-slate-500 font-medium">No logs recorded in ledger.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );

    const renderDoctorView = () => (
        <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-4 duration-500 ease-out fade-in">
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <ShieldCheck size={48} className="text-blue-500 mb-4" />
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Welcome to your Dashboard</h3>
                <p className="text-slate-500 text-center max-w-md">Navigate to the Patients section to search for patients, request access, and record real-time diagnoses directly to the blockchain ledger.</p>
            </div>
        </div>
    );

    const renderPatientView = () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-4 duration-500 ease-out fade-in">
            <div className="lg:col-span-7 space-y-6">
                <Card title="My Health Profile" icon={UserPlus}>
                    <p className="text-sm text-slate-500 mb-6">Enter your demographic info and current symptoms here. Your doctors will automatically see this when you authorize their node.</p>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="Full Name" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm focus:bg-white transition-colors"
                                value={patientProfile.name} onChange={e => setPatientProfile({ ...patientProfile, name: e.target.value })} required />
                            <input type="number" placeholder="Age" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm focus:bg-white transition-colors"
                                value={patientProfile.age} onChange={e => setPatientProfile({ ...patientProfile, age: e.target.value })} required />
                            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm focus:bg-white transition-colors"
                                value={patientProfile.gender} onChange={e => setPatientProfile({ ...patientProfile, gender: e.target.value })}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Address" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm focus:bg-white transition-colors"
                                value={patientProfile.address} onChange={e => setPatientProfile({ ...patientProfile, address: e.target.value })} required />
                            <input type="text" placeholder="Phone Number" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm focus:bg-white transition-colors"
                                value={patientProfile.phone} onChange={e => setPatientProfile({ ...patientProfile, phone: e.target.value })} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="number" step="0.1" placeholder="Height (cm)" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm focus:bg-white transition-colors"
                                value={patientProfile.height} onChange={e => setPatientProfile({ ...patientProfile, height: e.target.value })} />
                            <input type="number" step="0.1" placeholder="Weight (kg)" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm focus:bg-white transition-colors"
                                value={patientProfile.weight} onChange={e => setPatientProfile({ ...patientProfile, weight: e.target.value })} />
                            <input type="date" placeholder="Date of Visit" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm focus:bg-white transition-colors"
                                value={patientProfile.visit_date} onChange={e => setPatientProfile({ ...patientProfile, visit_date: e.target.value })} required />
                        </div>
                        <textarea placeholder="Current Symptoms / Chief Complaints" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] bg-slate-50 focus:bg-white transition-colors resize-none text-sm"
                            value={patientProfile.symptoms} onChange={e => setPatientProfile({ ...patientProfile, symptoms: e.target.value })} required></textarea>

                        <ActionButton type="submit" variant="demo" className="w-full" icon={ShieldCheck}>Save Encrypted Profile</ActionButton>
                    </form>
                </Card>
            </div>

            <div className="lg:col-span-5 space-y-6">
                <Card title="AI Diagnostic Pipeline" icon={BrainCircuit}>
                    <p className="text-sm text-slate-500 mb-6">Enter baseline demographics and vitals into the Scikit-learn Logistic Regression model for preliminary automated risk stratification.</p>
                    <form onSubmit={handlePredictRisk} className="grid grid-cols-2 gap-5 mb-6">
                        <div>
                            <label className="block text-xs font-bold mb-1.5 text-slate-600 uppercase tracking-wide">Age</label>
                            <input type="number" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" value={vitals.age} onChange={e => setVitals({ ...vitals, age: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1.5 text-slate-600 uppercase tracking-wide">BMI</label>
                            <input type="number" step="0.1" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" value={vitals.bmi} onChange={e => setVitals({ ...vitals, bmi: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1.5 text-slate-600 uppercase tracking-wide">Sys BP (mmHg)</label>
                            <input type="number" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" value={vitals.blood_pressure} onChange={e => setVitals({ ...vitals, blood_pressure: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1.5 text-slate-600 uppercase tracking-wide">Glucose (mg/dL)</label>
                            <input type="number" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" value={vitals.glucose_level} onChange={e => setVitals({ ...vitals, glucose_level: e.target.value })} required />
                        </div>
                        <div className="col-span-2 mt-2">
                            <ActionButton type="submit" className="w-full" icon={Activity}>Compute Risk Factors</ActionButton>
                        </div>
                    </form>

                    {aiResult && <div className="pt-4 border-t border-slate-100"><RiskPredictionCard aiResult={aiResult} /></div>}
                </Card>

                <Card title="Patient Notifications" icon={ActivitySquare}>
                    <p className="text-sm text-slate-500 mb-6">Automated care guidance and follow-up reminders generated by the AI Diagnostic Pipeline.</p>
                    <div className="space-y-4 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                        {notifications.map((n, i) => (
                            <div key={n.id || i} className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
                                <div className="mt-1">
                                    {n.type === 'lifestyle_advice' ? <Activity className="text-blue-500" size={18} /> : <FileText className="text-purple-500" size={18} />}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 mb-1">{n.type === 'lifestyle_advice' ? 'Lifestyle Advice' : 'Follow-up Reminder'}</p>
                                    <p className="text-sm text-slate-700">{n.message}</p>
                                    <p className="text-[10px] text-slate-400 font-mono mt-2">{new Date(n.created_at * 1000).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                        {notifications.length === 0 && (
                            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-500 font-medium text-sm">No new notifications.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );

    return (
        <PageLayout role={role} onLogout={handleLogout} title="Main Dashboard" subtitle={`Welcome back, ${role}. You are connected to the VitaLedger node network.`}>
            {role === 'admin' && renderAdminView()}
            {role === 'doctor' && renderDoctorView()}
            {role === 'patient' && renderPatientView()}
        </PageLayout>
    );
};

export default Dashboard;
