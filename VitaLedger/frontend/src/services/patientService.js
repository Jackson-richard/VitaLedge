import api from './api';

export const fetchPatientByABHA = async (abhaId) => {
    return api.get(`/api/patients/${abhaId}`);
};
