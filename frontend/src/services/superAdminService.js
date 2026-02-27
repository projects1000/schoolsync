import api from './api';

const SuperAdminService = {
    // School Management
    getAllSchools: () => api.get('/superadmin/schools'),
    createSchool: (data) => api.post('/superadmin/schools', data),
    updateSchool: (id, data) => api.put(`/superadmin/schools/${id}`, data),
    deleteSchool: (id) => api.delete(`/superadmin/schools/${id}`),
    getDeletedSchools: () => api.get('/superadmin/schools/trash'),
    restoreSchool: (id) => api.put(`/superadmin/schools/${id}/restore`),

    // Admin Management
    getAllAdmins: () => api.get('/superadmin/admins'),
    createAdmin: (data) => api.post('/superadmin/admins', data), // Ideally remove schoolId from here if generic
    createAdminForSchool: (schoolId, data) => api.post(`/superadmin/schools/${schoolId}/admin`, data),
    assignAdminToSchool: (schoolId, adminId) => api.put(`/superadmin/schools/${schoolId}/assign-admin/${adminId}`),

    // Admin Actions
    // Admin Actions
    reassignAdmin: (oldAdminId, newAdminId) => api.put(`/superadmin/admins/${oldAdminId}/reassign`, { newAdminId }),
    updateAdminStatus: (id, status) => api.patch(`/superadmin/admins/${id}/status`, { status }),
    resetAdminPassword: (id) => api.post(`/superadmin/admins/${id}/reset-password`),
    getDashboardData: () => api.get('/superadmin/dashboard'),
};

export default SuperAdminService;
