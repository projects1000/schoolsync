import api from './api';

const SuperAdminService = {
    // School Management
    getAllSchools: (params) => api.get('/superadmin/schools', { params }),
    createSchool: (data) => api.post('/superadmin/schools', data),
    updateSchool: (id, data) => api.put(`/superadmin/schools/${id}`, data),
    deleteSchool: (id) => api.delete(`/superadmin/schools/${id}`),
    getDeletedSchools: () => api.get('/superadmin/schools/trash'),
    restoreSchool: (id) => api.put(`/superadmin/schools/${id}/restore`),
    getSchoolDetails: (id) => api.get(`/superadmin/schools/${id}/details`),

    // Admin Management
    getAllAdmins: (params) => api.get('/superadmin/admins', { params }),
    createAdmin: (data) => api.post('/superadmin/admins', data), // Ideally remove schoolId from here if generic
    createAdminForSchool: (schoolId, data) => api.post(`/superadmin/schools/${schoolId}/admin`, data),
    assignAdminToSchool: (schoolId, adminId) => api.put(`/superadmin/schools/${schoolId}/assign-admin/${adminId}`),

    // Admin Actions
    // Admin Actions
    reassignAdmin: (oldAdminId, newAdminId) => api.put(`/superadmin/admins/${oldAdminId}/reassign`, { newAdminId }),
    updateAdminStatus: (id, status) => api.patch(`/superadmin/admins/${id}/status`, { status }),
    resetAdminPassword: (id) => api.post(`/superadmin/admins/${id}/reset-password`),
    getDashboardData: () => api.get('/superadmin/dashboard'),

    // Communications
    getAdminsForComms: () => api.get('/superadmin/communications/admins'),
    sendDirectMessage: (data) => api.post('/superadmin/communications/direct', data),
    sendBroadcast: (data) => api.post('/superadmin/communications/broadcast', data),
    getCommHistory: () => api.get('/superadmin/communications/history'),
};

export default SuperAdminService;

