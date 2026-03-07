import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { UserPlus, Database, ShieldCheck, ActivitySquare, BrainCircuit, ShieldAlert, Activity, FileText, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

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


    const [logs, setLogs] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const [vitals, setVitals] = useState({ age: '', bmi: '', blood_pressure: '', glucose_level: '' });
    const [aiResult, setAiResult] = useState(null);

    const [patientProfile, setPatientProfile] = useState({
        name: '', age: '', gender: 'Male', address: '', phone: '', height: '', weight: '', symptoms: '', visit_date: ''
    });

    const [chainStatus, setChainStatus] = useState(null);
    const [doctorStats, setDoctorStats] = useState({ totalPatients: 0, approved: 0, pending: 0 });

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
    const abhaId = localStorage.getItem('abha_id');

    useEffect(() => {
        if (!role) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                if (role === 'admin') {
                    const adminLogs = await recordService.getAuditLogs();
                    setLogs(adminLogs || []);
                } else if (role === 'patient') {
                    if (!userId) {
                        navigate('/login');
                        return;
                    }
                    try {
                        const notifs = await recordService.getPatientNotifications(abhaId);
                        setNotifications(notifs);
                        const pProfile = await recordService.getProfile(abhaId);
                        if (pProfile) {
                            setPatientProfile(pProfile);
                        }
                    } catch (err) {
                        console.error("Error fetching notifications or profile", err);
                    }
                } else if (role === 'doctor') {
                    if (!userId) {
                        navigate('/login');
                        return;
                    }
                    try {
                        // Fetch records handled by this doctor instead of requests
                        const records = await recordService.getDoctorRecords(userId);
                        const safeRecords = records || [];

                        // Count unique patients seen by this doctor
                        const patientIds = new Set(safeRecords.map(r => r.patient_id));

                        setDoctorStats({
                            totalPatients: patientIds.size,
                            approved: patientIds.size, // Records returned here imply approved consent
                            pending: 0 // Pending requests must be checked per patient, default 0 for now as per instructions to only read existing arrays
                        });
                    } catch (err) {
                        console.error("Error fetching doctor requests data", err);
                    }
                }
            } catch (err) {
                console.error("Error connecting to node network", err);
            }
        };
        fetchData();
    }, [navigate, userId, role, abhaId]);


    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };


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

            if (role === 'admin') {
                const adminLogs = await recordService.getAuditLogs();
                setLogs(adminLogs || []);
            }
        } catch {
            alert("Error tampering or no records exist yet.");
        }
    };




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
            await recordService.updateProfile({
                abha_id: abhaId,
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

    const renderDoctorView = () => {
        // Safe UI computation variables
        const totalPatients = doctorStats?.totalPatients || 0;
        const approvedRequests = doctorStats?.approved || 0;
        const pendingRequests = doctorStats?.pending || 0;

        // Simple mock trend data based on current counts
        const trendData = [
            { label: "Start", patients: Math.max(0, totalPatients - 2), approved: Math.max(0, approvedRequests - 1), pending: Math.max(0, pendingRequests - 1) },
            { label: "Mid", patients: Math.max(0, totalPatients - 1), approved: Math.max(0, approvedRequests), pending: Math.max(0, pendingRequests) },
            { label: "Now", patients: totalPatients, approved: approvedRequests, pending: pendingRequests }
        ];

        // Basic SVG Path generator
        const maxY = Math.max(3, ...trendData.map(d => Math.max(d.patients, d.approved, d.pending)));
        const getPoints = (dataKey) => trendData.map((d, i) => `${(i / (trendData.length - 1)) * 100},${100 - (d[dataKey] / maxY * 100)}`).join(' L ');

        return (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 ease-out fade-in">
                {/* 1. Dashboard Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                            <Users size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Patients</p>
                            <p className="text-3xl font-extrabold text-slate-800">{totalPatients}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="p-4 bg-green-50 text-green-600 rounded-xl">
                            <CheckCircle size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Approved Requests</p>
                            <p className="text-3xl font-extrabold text-slate-800">{approvedRequests}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="p-4 bg-orange-50 text-orange-600 rounded-xl">
                            <Clock size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Requests</p>
                            <p className="text-3xl font-extrabold text-slate-800">{pendingRequests}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Line Chart */}
                <Card title="Weekly Activity Trends" icon={TrendingUp}>
                    <div className="w-full h-64 relative mt-4">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {/* Grid Lines */}
                            {[0, 25, 50, 75, 100].map(line => (
                                <line key={line} x1="0" y1={line} x2="100" y2={line} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2 2" />
                            ))}

                            {/* Lines */}
                            <path d={`M ${getPoints('patients')}`} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm" />
                            <path d={`M ${getPoints('approved')}`} fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm" />
                            <path d={`M ${getPoints('pending')}`} fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm" />

                            {/* Data points */}
                            {trendData.map((d, i) => {
                                const x = (i / (trendData.length - 1)) * 100;
                                return (
                                    <g key={i}>
                                        <circle cx={x} cy={100 - (d.patients / maxY * 100)} r="1.5" fill="#2563eb" className="hover:r-2 transition-all cursor-pointer" />
                                        <circle cx={x} cy={100 - (d.approved / maxY * 100)} r="1.5" fill="#16a34a" className="hover:r-2 transition-all cursor-pointer" />
                                        <circle cx={x} cy={100 - (d.pending / maxY * 100)} r="1.5" fill="#ea580c" className="hover:r-2 transition-all cursor-pointer" />
                                    </g>
                                );
                            })}
                        </svg>

                        {/* X-Axis Labels */}
                        <div className="flex justify-between mt-4 text-xs font-semibold text-slate-400">
                            {trendData.map(d => <span key={d.label}>{d.label}</span>)}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex gap-6 justify-center mt-6">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><span className="w-3 h-3 rounded-full bg-blue-600"></span> Total Patients</div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><span className="w-3 h-3 rounded-full bg-green-600"></span> Approved</div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><span className="w-3 h-3 rounded-full bg-orange-600"></span> Pending</div>
                    </div>
                </Card>

                {/* Existing Welcome Base */}
                <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <ShieldCheck size={48} className="text-blue-500 mb-4" />
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Welcome to your Dashboard</h3>
                    <p className="text-slate-500 text-center max-w-md">Navigate to the Patients section to search for patients, request access, and record real-time diagnoses directly to the blockchain ledger.</p>
                </div>
            </div>
        );
    };

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
