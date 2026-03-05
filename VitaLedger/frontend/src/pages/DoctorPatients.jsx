import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import ActionButton from '../components/ActionButton';
import RecordCard from '../components/RecordCard';
import StatusBadge from '../components/StatusBadge';
import { Search, ShieldCheck, FileText, Activity, User } from 'lucide-react';
import { recordService } from '../services/recordService';
import { fetchPatientByABHA } from '../services/patientService';
import { toast } from 'react-hot-toast';
import api from '../services/api'; // Use our pre-configured axios instance

const DoctorPatients = () => {
    console.log("DoctorPatients component loaded");
    const navigate = useNavigate();
    const [role] = useState(() => localStorage.getItem('role') || '');
    const [userId] = useState(() => localStorage.getItem('user_id') || '');

    const [searchAbha, setSearchAbha] = useState('');
    const [patientProfile, setPatientProfile] = useState(null);
    const [consentStatus, setConsentStatus] = useState(null); // 'approved', 'pending', 'denied', or null
    const [patientHistory, setPatientHistory] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // Form State
    const [uploadData, setUploadData] = useState({
        diagnosis: '',
        medications: '',
        progress_notes: '',
        billing: { consultation: '', tests: '' },
        followup_date: ''
    });

    useEffect(() => {
        if (!role || role !== 'doctor') {
            navigate('/dashboard');
        }
    }, [navigate, role]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchAbha) return;

        setIsSearching(true);
        setPatientProfile(null);
        setConsentStatus(null);
        setPatientHistory([]);
        setSearchError(null);

        try {
            // Always fetch fresh patient data from backend
            const res = await fetchPatientByABHA(searchAbha);
            const profile = res.data;
            setPatientProfile(profile);
            console.log("Fetched patient profile:", profile);

            // Check consent status
            const statusRes = await recordService.checkConsentStatus(userId, searchAbha);
            const status = statusRes.status;
            setConsentStatus(status);
            console.log("Consent status:", status);
            if (status === 'approved') {
                fetchPatientHistory(searchAbha);
            }
        } catch (err) {
            setSearchError(err.message || "Error fetching patient profile");
            console.error(err);
            toast.error(err.message || "Patient profile not found");
        } finally {
            setIsSearching(false);
        }
    };

    const fetchPatientHistory = async (abhaId) => {
        try {
            // Because doctor roles check check_consent inside getPatientRecords
            const history = await recordService.getPatientRecords(abhaId);
            setPatientHistory(history || []);
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const handleRequestAccess = async () => {
        try {
            await recordService.requestConsent(searchAbha);
            console.log("Consent request sent");
            toast.success("Consent request sent to patient");
            setConsentStatus('pending');
        } catch (err) {
            if (err.response?.data?.detail) {
                toast.error(err.response.data.detail);
            } else {
                toast.error("Failed to request access");
            }
        }
    };

    const handleRefreshStatus = async () => {
        if (!searchAbha) return;
        try {
            const statusRes = await recordService.checkConsentStatus(userId, searchAbha);
            const status = statusRes.status;
            console.log("Consent status:", status);
            setConsentStatus(status);
            if (status === 'approved') {
                fetchPatientHistory(searchAbha);
            }
        } catch (err) {
            toast.error("Failed to refresh status");
        }
    };

    const handleSubmitRecord = async (e) => {
        e.preventDefault(); // prevent form reload
        console.log("Submit button clicked");

        if (consentStatus !== 'approved') {
            toast.error("You need approved consent to submit a diagnosis");
            return;
        }
        if (!patientProfile) {
            toast.error("No patient selected");
            return;
        }

        const medicationsArray = uploadData.medications.split(',').map(m => m.trim()).filter(m => m);
        const payload = {
  patient_id: patientProfile.abha_id || "unknown",

  demographics: {
    age: patientProfile.age,
    gender: patientProfile.gender,
    height: patientProfile.height,
    weight: patientProfile.weight
  },

  symptoms: patientProfile.symptoms || "",

  diagnosis: uploadData.diagnosis || "",

  medications: medicationsArray || [],

  progress_notes: uploadData.progress_notes || "",

  billing: {
    consultation: Number(uploadData.billing.consultation),
    tests: Number(uploadData.billing.tests)
  },

  followup_date: uploadData.followup_date || ""
};
        console.log("Submitting payload:", payload);

        try {
            // Using the api instance which points to 127.0.0.1:8000 and has the Bearer token
            const res = await api.post(
                "/records/upload",
                payload,
                {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
            console.log("Success:", res.data);
            toast.success("Diagnosis submitted and encrypted securely!");
            setUploadData({
                diagnosis: '',
                medications: '',
                progress_notes: '',
                billing: { consultation: '', tests: '' },
                followup_date: ''
            });
            fetchPatientHistory(searchAbha);
        } catch (err) {
            console.error("Submit failed:", err.response?.data || err.message || err);
            toast.error(err.response?.data?.detail || err.message || "Error submitting record");
        }
    }

    if (role !== 'doctor') return null;

    return (
        <PageLayout role={role} onLogout={handleLogout} title="Patient Management" subtitle="Search ABHA ID, request access, and record clinical diagnoses">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-4 duration-500 ease-out fade-in">

                {/* Left Column: Search & Profile */}
                <div className="lg:col-span-5 space-y-6">
                    <Card title="Patient Lookup" icon={Search}>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Enter ABHA-XXXX-XXXX"
                                value={searchAbha}
                                onChange={(e) => setSearchAbha(e.target.value)}
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors"
                            />
                            <ActionButton type="submit" variant="primary" disabled={isSearching}>
                                {isSearching ? '...' : 'Search'}
                            </ActionButton>
                        </form>
                    </Card>

                    {patientProfile && (
                        <Card title="Demographics & Triage" icon={User}>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Patient Name</span>
                                    <span className="font-semibold text-slate-800">{patientProfile.name || 'Unknown'}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Phone</span>
                                    <span className="font-semibold text-slate-800">{patientProfile.phone || 'N/A'}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Age</span>
                                    <span className="font-semibold text-slate-800">{patientProfile.age}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Gender</span>
                                    <span className="font-semibold text-slate-800">{patientProfile.gender}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Height</span>
                                    <span className="font-semibold text-slate-800">{patientProfile.height_cm || patientProfile.height} cm</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Weight</span>
                                    <span className="font-semibold text-slate-800">{patientProfile.weight_kg || patientProfile.weight} kg</span>
                                </div>
                                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 col-span-2">
                                    <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block mb-1">Symptoms</span>
                                    <span className="font-semibold text-slate-800">{patientProfile.current_symptoms || patientProfile.symptoms || 'None reported'}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Authorization Status</p>
                                    {consentStatus ? <StatusBadge status={consentStatus} /> : <span className="text-sm font-semibold text-slate-400">Not Requested</span>}
                                </div>
                                {consentStatus !== 'approved' && consentStatus !== 'pending' && (
                                    <ActionButton onClick={handleRequestAccess} variant="primary" icon={ShieldCheck}>Request Access</ActionButton>
                                )}
                                {consentStatus === 'pending' && (
                                    <ActionButton variant="secondary" onClick={handleRefreshStatus} icon={Activity}>Refresh Status</ActionButton>
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Column: History & Actions (Requires Consent) */}
                <div className="lg:col-span-7 space-y-6">
                    {!patientProfile ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm border-dashed">
                            {searchError ? (
                                <>
                                    <div className="text-red-500 mb-4 bg-red-50 p-3 rounded-full">
                                        <Search size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 mb-1">Patient Not Found</h3>
                                    <p className="text-sm text-red-500 text-center max-w-sm font-medium">{searchError}</p>
                                </>
                            ) : (
                                <>
                                    <Search size={48} className="text-slate-200 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-700 mb-1">Enter ABHA ID</h3>
                                    <p className="text-sm text-slate-500 text-center max-w-sm">Search for a patient to load their demographics and request access to their clinical history.</p>
                                </>
                            )}
                        </div>
                    ) : consentStatus !== 'approved' ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm border-dashed">
                            <ShieldCheck size={48} className="text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700 mb-1">Authorization Required</h3>
                            <p className="text-sm text-slate-500 text-center max-w-md">Patient clinical history and diagnostic functions are encrypted. You must request and receive patient consent to unlock these modules.</p>
                        </div>
                    ) : (
                        <>
                            {/* Medical History */}
                            <Card title="Past Medical History" icon={FileText}>
                                <div className="space-y-4 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                                    {patientHistory.map((r, i) => (
                                        <div key={i} className="p-3 bg-yellow-50/50 border border-yellow-100 rounded-xl">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-yellow-900 text-sm">{r.data.diagnosis}</span>
                                                <span className="text-xs text-yellow-700">{new Date(r.timestamp * 1000).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-yellow-800"><span className="font-semibold">Medications:</span> {r.data.medications?.join(', ') || 'None'}</p>
                                        </div>
                                    ))}
                                    {patientHistory.length === 0 && (
                                        <div className="text-center py-6 text-sm text-slate-500 border border-dashed border-slate-200 rounded">No past medical records found.</div>
                                    )}
                                </div>
                            </Card>

                            {/* New Diagnosis Form */}
                            <Card title="Record New Diagnosis" icon={Activity}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold mb-1 text-slate-500 uppercase tracking-wide">Diagnosis</label>
                                        <input type="text" className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 focus:bg-white"
                                            value={uploadData.diagnosis} onChange={e => setUploadData({ ...uploadData, diagnosis: e.target.value })} required />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold mb-1 text-slate-500 uppercase tracking-wide">Medications (comma separated)</label>
                                        <input type="text" className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 focus:bg-white"
                                            value={uploadData.medications} onChange={e => setUploadData({ ...uploadData, medications: e.target.value })} required />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold mb-1 text-slate-500 uppercase tracking-wide">Clinical Progress Notes</label>
                                        <textarea className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-20 text-sm bg-slate-50 focus:bg-white"
                                            value={uploadData.progress_notes} onChange={e => setUploadData({ ...uploadData, progress_notes: e.target.value })} required />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="number" placeholder="Consult Fee" className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white text-sm"
                                            value={uploadData.billing.consultation} onChange={e => setUploadData({ ...uploadData, billing: { ...uploadData.billing, consultation: e.target.value } })} required />
                                        <input type="number" placeholder="Test Cost" className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white text-sm"
                                            value={uploadData.billing.tests} onChange={e => setUploadData({ ...uploadData, billing: { ...uploadData.billing, tests: e.target.value } })} required />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold mb-1 text-slate-500 uppercase tracking-wide">Optional Follow-up Date</label>
                                        <input type="date" className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 focus:bg-white"
                                            value={uploadData.followup_date} onChange={e => setUploadData({ ...uploadData, followup_date: e.target.value })} />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSubmitRecord}
                                        className="w-full bg-slate-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
                                    >
                                        <ShieldCheck size={20} />
                                        Encrypt & Submit to Ledger
                                    </button>
                                </div>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default DoctorPatients;
