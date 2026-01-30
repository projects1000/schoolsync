import api from './api';

const SuperAdminService = {
    getDashboardData: () => api.get('/superadmin/dashboard'),

    // Schools
    getAllSchools: () => api.get('/superadmin/schools'),
    getSchool: (id) => api.get(`/superadmin/schools/${id}`),
    createSchool: (data) => api.post('/superadmin/schools', data),
    updateSchool: (id, data) => api.put(`/superadmin/schools/${id}`, data),
    deleteSchool: (id) => api.delete(`/superadmin/schools/${id}`),

    // Admins
    getAllAdmins: () => api.get('/superadmin/admins'),
    createAdmin: (data) => api.post('/superadmin/admins', data),
    updateAdminStatus: (id, status) => api.put(`/superadmin/admins/${id}/status`, { status }),
    resetAdminPassword: (id, password) => api.post(`/superadmin/admins/${id}/reset-password`, { password }),

    // Academic Master
    getAllClassTemplates: () => api.get('/superadmin/academic/templates'),
    createClassTemplate: (data) => api.post('/superadmin/academic/templates', data),
    getAllAcademicYears: () => api.get('/superadmin/academic/years'),
    createAcademicYear: (data) => api.post('/superadmin/academic/years', data),

    // System
    performBackup: () => api.post('/superadmin/backup'),
};

export default SuperAdminService;
