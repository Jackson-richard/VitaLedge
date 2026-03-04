import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import BlockchainStatus from './pages/BlockchainStatus';
import AIPredictions from './pages/AIPredictions';
import AdminPanel from './pages/AdminPanel';
import DoctorPatients from './pages/DoctorPatients';
import PatientRequests from './pages/PatientRequests';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/records" element={<Records />} />
        <Route path="/blockchain" element={<BlockchainStatus />} />
        <Route path="/ai" element={<AIPredictions />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/patients" element={<DoctorPatients />} />
        <Route path="/requests" element={<PatientRequests />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
