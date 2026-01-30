import api from './api';

const adminService = {
    getDashboardStats: async () => {
        try {
            const response = await api.get('/admin/dashboard');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getSchoolProfile: async () => {
        try {
            const response = await api.get('/admin/school');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateSchoolProfile: async (data) => {
        try {
            const response = await api.put('/admin/school', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // Class Management APIs
    getClasses: async () => {
        try {
            const response = await api.get('/admin/classes');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    createClass: async (data) => {
        try {
            const response = await api.post('/admin/classes', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateClass: async (id, data) => {
        try {
            const response = await api.put(`/admin/classes/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    deleteClass: async (id) => {
        try {
            await api.delete(`/admin/classes/${id}`);
        } catch (error) {
            throw error;
        }
    },

    // Sections
    getSections: async (classId) => {
        try {
            const response = await api.get(`/admin/sections/${classId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    createSection: async (sectionData) => {
        try {
            const response = await api.post('/admin/sections', sectionData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    deleteSection: async (id) => {
        try {
            const response = await api.delete(`/admin/sections/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // Teacher APIs
    getTeachers: async (params) => {
        try {
            const response = await api.get('/admin/teachers', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getTeacherById: async (id) => {
        try {
            const response = await api.get(`/admin/teachers/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    createTeacher: async (data) => {
        try {
            const response = await api.post('/admin/teachers', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateTeacher: async (id, data) => {
        try {
            const response = await api.put(`/admin/teachers/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    deleteTeacher: async (id) => {
        try {
            const response = await api.delete(`/admin/teachers/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    assignClassesToTeacher: async (id, classIds) => {
        try {
            const response = await api.post(`/admin/teachers/${id}/assign-classes`, { classes: classIds });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // Student APIs
    getStudents: async (params) => {
        try {
            const response = await api.get('/admin/students', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getStudentById: async (id) => {
        try {
            const response = await api.get(`/admin/students/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    createStudent: async (data) => {
        try {
            const response = await api.post('/admin/students', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateStudent: async (id, data) => {
        try {
            const response = await api.put(`/admin/students/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    promoteStudent: async (id, promotionData) => {
        try {
            const response = await api.patch(`/admin/students/${id}/promote`, promotionData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateStudentStatus: async (id, status) => {
        try {
            const response = await api.patch(`/admin/students/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // Parent APIs
    getParents: async () => {
        try {
            const response = await api.get('/admin/parents');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    createParent: async (data) => {
        try {
            const response = await api.post('/admin/parents', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateParent: async (id, data) => {
        try {
            const response = await api.put(`/admin/parents/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    mapStudentToParent: async (parentId, studentId) => {
        try {
            const response = await api.post('/admin/parents/map-student', { parentId, studentId });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // Attendance APIs
    getAttendance: async (date, className) => {
        try {
            const params = { date };
            if (className) params.className = className;
            const response = await api.get('/admin/attendance', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateAttendance: async (id, status, reason) => {
        try {
            const response = await api.put(`/admin/attendance/${id}`, { status, reason });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // Fee APIs
    getFees: async () => {
        try {
            const response = await api.get('/admin/fees');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    createInvoice: async (data) => {
        try {
            const response = await api.post('/admin/fees/invoice', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    markInvoicePaid: async (id, paymentMethod, transactionId) => {
        try {
            const response = await api.post(`/admin/fees/${id}/pay`, { paymentMethod, transactionId });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getFeeReport: async () => {
        try {
            const response = await api.get('/admin/fees/report');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // Announcements APIs
    getAnnouncements: async () => {
        try {
            const response = await api.get('/admin/announcements');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    createAnnouncement: async (data) => {
        try {
            const response = await api.post('/admin/announcements', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    deleteAnnouncement: async (id) => {
        try {
            await api.delete(`/admin/announcements/${id}`);
        } catch (error) {
            throw error;
        }
    },
};

export default adminService;
