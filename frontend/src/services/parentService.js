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
    },

    updateChildProfile: async (studentId, profileData) => {
        try {
            const response = await api.put(`/parent/children/${studentId}/profile`, profileData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default parentService;
