import api from './api';

export const recordService = {
    uploadRecord: async (patientId, diagnosticData) => {
        const res = await api.post('/records/upload', {
            patient_id: patientId,
            ...diagnosticData
        });
        return res.data;
    },
    getPatientRecords: async (patientId) => {
        const res = await api.get(`/records/patient/${patientId}`);
        return res.data;
    },
    getProfile: async (patientAbha) => {
        const res = await api.get(`/profile/patient/${patientAbha}`);
        return res.data;
    },
    updateProfile: async (profileData) => {
        const res = await api.post('/profile/patient', profileData);
        return res.data;
    },
    getPatientNotifications: async (patientAbha) => {
        const res = await api.get(`/notifications/patient/${patientAbha}`);
        return res.data;
    },
    getDoctorRecords: async (doctorId) => {
        const res = await api.get(`/records/doctor/${doctorId}`);
        return res.data;
    },
    requestConsent: async (abhaId) => {
        const res = await api.post('/consent/request', { abha_id: abhaId });
        return res.data;
    },
    updateConsent: async (consentId, status) => {
        const res = await api.put(`/consent/${consentId}/update`, { status });
        return res.data;
    },
    getMyConsentRequests: async () => {
        const res = await api.get('/consent/my-requests');
        return res.data;
    },
    getAuditLogs: async () => {
        const res = await api.get('/admin/audit-logs');
        return res.data;
    },
    verifyChain: async () => {
        const res = await api.get('/admin/verify-chain');
        return res.data;
    },
    tamperRecord: async () => {
        const res = await api.post('/admin/tamper-record', {});
        return res.data;
    }
};
