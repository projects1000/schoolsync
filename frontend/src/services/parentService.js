import api from './api';

const parentService = {
    getMyProfile: async () => {
        try {
            const response = await api.get('/parent/me');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getMyChildren: async () => {
        try {
            const response = await api.get('/parent/children');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default parentService;
