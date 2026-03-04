import api from './api';

export const aiService = {
    predictRisk: async (vitals) => {
        const res = await api.post('/ai/predict', vitals);
        return res.data;
    }
};
