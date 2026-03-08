import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    Plus,
    MoreVertical,
    Key,
    UserX,
    UserCheck,
    LogOut,
    History,
    Building2,
    ArrowRightLeft,
    Clock,
    X,
    Shield,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import SuperAdminService from '../../services/superAdminService';
import CreateAdminModal from './CreateAdminModal';
import Pagination from '../common/Pagination';

const AdminManagement = ({ currentUser }) => {
    const { toast } = useToast();
    const [admins, setAdmins] = useState([]);
    const [schools, setSchools] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Pagination states
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showActivityDrawer, setShowActivityDrawer] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        fetchData();
    }, [page, pageSize]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const params = { page, size: pageSize };
            const [adminsRes, schoolsRes] = await Promise.all([
                SuperAdminService.getAllAdmins(params),
                SuperAdminService.getAllSchools({ page: 0, size: 1000 }) // Get all schools for dropdowns
            ]);
            
            const adminsData = adminsRes.data;
            setAdmins(adminsData.content || []);
            setTotalPages(adminsData.totalPages || 0);
            setTotalElements(adminsData.totalElements || 0);
            
            // For schools, check if it's a page or list
            const schoolsData = schoolsRes.data;
            setSchools(schoolsData.content || schoolsData || []);
        } catch (error) {
            console.error("Failed to load admin data:", error);
            setAdmins([]);
            setSchools([]);
            toast({
                title: 'Error',
                description: 'Failed to load admins and schools',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Get schools without admins (for creating new admin)
    const availableSchools = useMemo(() => {
        // Filter out schools that already have an admin assigned
        return schools.filter(s => !admins.some(a => a.schoolId === s.id));
    }, [schools, admins]);



    // Filter admins
    const filteredAdmins = useMemo(() => {
        return admins.filter(admin => {
            const matchesSearch = (admin.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (admin.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (admin.schoolName?.toLowerCase() || '').includes(searchQuery.toLowerCase());

            // Backend Status matches UpperCase from Enum (ACTIVE, INACTIVE, etc.)
            const matchesStatus = statusFilter === 'all' || admin.status === statusFilter.toUpperCase();
            return matchesSearch && matchesStatus;
        });
    }, [admins, searchQuery, statusFilter]);

    // Action handlers
    const handleCreateAdminSave = async (adminData) => {
        try {
            await SuperAdminService.createAdmin(adminData);
            toast({ title: 'Success', description: `Admin ${adminData.name} created successfully.` });
            setShowCreateModal(false);
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Create admin error:", error);
            const message = error.response?.data?.message || 'Failed to create admin';
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive'
            });
        }
    };

    const handleTransferSchool = (newSchoolId) => {
        // Implement if API supports it, currently backend might not exist for generic update
        // For dynamic implementation, we might need a PUT /admins/{id} endpoint
        toast({ title: 'Info', description: 'School transfer not yet implemented in backend API.' });
        setShowTransferModal(false);
    };

    const handleConfirmAction = (admin, action) => {
        setSelectedAdmin(admin);
        setConfirmAction(action);
        setShowConfirmModal(true);
        setActiveDropdown(null);
    };

    const executeConfirmAction = async () => {
        if (!selectedAdmin || !confirmAction) return;

        try {
            switch (confirmAction) {
                case 'block':
                    await SuperAdminService.updateAdminStatus(selectedAdmin.id, 'BLOCKED');
                    toast({ title: 'Admin Blocked', description: `${selectedAdmin.name} has been blocked` });
                    break;
                case 'unblock':
                    await SuperAdminService.updateAdminStatus(selectedAdmin.id, 'ACTIVE');
                    toast({ title: 'Admin Unblocked', description: `${selectedAdmin.name} is now active` });
                    break;
                case 'resetPassword':
                    await SuperAdminService.resetAdminPassword(selectedAdmin.id);
                    toast({ title: 'Password Reset', description: `Password reset to 'password123' for ${selectedAdmin.email}` });
                    break;
                case 'forceLogout':
                    // If backend supports revocation
                    toast({ title: 'Info', description: 'Force logout logic pending backend implementation' });
                    break;
            }
            fetchData();
        } catch (error) {
            console.error("Action error:", error);
            toast({ title: 'Error', description: 'Action failed', variant: 'destructive' });
        } finally {
            setShowConfirmModal(false);
        }
    };

    const handleViewActivity = (admin) => {
        setSelectedAdmin(admin);
        setShowActivityDrawer(true);
        setActiveDropdown(null);
    };

    const handleOpenTransfer = (admin) => {
        setSelectedAdmin(admin);
        setShowTransferModal(true);
        setActiveDropdown(null);
    };

    const getStatusBadge = (status) => {
        const styles = {
            ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            INACTIVE: 'bg-gray-100 text-gray-600 border-gray-200',
            SUSPENDED: 'bg-rose-100 text-rose-700 border-rose-200',
            BLOCKED: 'bg-rose-100 text-rose-700 border-rose-200' // Handle potential frontend legacy
        };
        return styles[status] || styles.INACTIVE;
    };

    // Helper for relative time (simple version)
    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Super admin check
    if (currentUser?.role !== 'superadmin') {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">Access Denied</h2>
                    <p className="text-gray-500">Super Admin privileges required</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Shield className="w-7 h-7 text-purple-600" />
                            Admin Management
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Manage school admins (Principals)</p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Admin
                    </Button>
                </div>
            </motion.div>

            {/* Search & Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
            >
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search admins by name, email or school..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </motion.div>

            {/* Admin Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Admin Name</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">School Name</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Last Login</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                                    <div>
                                                        <div className="h-4 bg-gray-200 rounded w-28 mb-1" />
                                                        <div className="h-3 bg-gray-100 rounded w-36" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                                            <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-16" /></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-8 ml-auto" /></td>
                                        </tr>
                                    ))}
                                </>
                            ) : filteredAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No admins found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAdmins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <span className="font-semibold text-purple-600">{(admin.name || 'A').charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-800">{admin.name}</div>
                                                    <div className="text-xs text-gray-500">{admin.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-700">{admin.schoolName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${getStatusBadge(admin.status)}`}>
                                                {admin.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {admin.lastLogin ? (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-sm">{formatRelativeTime(admin.lastLogin)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm italic">Never</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end relative">
                                                <button
                                                    onClick={() => setActiveDropdown(activeDropdown === admin.id ? null : admin.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                                >
                                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                                </button>

                                                {/* Action Dropdown */}
                                                <AnimatePresence>
                                                    {activeDropdown === admin.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="absolute right-0 top-10 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48"
                                                        >
                                                            <button
                                                                onClick={() => handleViewActivity(admin)}
                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <History className="w-4 h-4 text-blue-500" />
                                                                View Activity Log
                                                            </button>
                                                            <button
                                                                onClick={() => handleConfirmAction(admin, 'resetPassword')}
                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <Key className="w-4 h-4 text-amber-500" />
                                                                Reset Password
                                                            </button>
                                                            <div className="border-t border-gray-100 my-1" />
                                                            {admin.status === 'ACTIVE' ? (
                                                                <button
                                                                    onClick={() => handleConfirmAction(admin, 'block')}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-rose-50 flex items-center gap-2 text-rose-600"
                                                                >
                                                                    <UserX className="w-4 h-4" />
                                                                    Block Admin
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleConfirmAction(admin, 'unblock')}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-emerald-50 flex items-center gap-2 text-emerald-600"
                                                                >
                                                                    <UserCheck className="w-4 h-4" />
                                                                    Unblock Admin
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                    {isLoading ? (
                        <div className="space-y-4 animate-pulse">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                                            <div className="h-3 bg-gray-100 rounded w-44" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <div className="h-4 bg-gray-200 rounded w-28" />
                                        <div className="h-5 bg-gray-200 rounded-full w-16" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredAdmins.length === 0 ? (
                        <div className="text-center py-10">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No admins found</p>
                        </div>
                    ) : (
                        filteredAdmins.map((admin) => (
                            <div key={admin.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <span className="font-semibold text-purple-600">{(admin.name || 'A').charAt(0)}</span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-800">{admin.name}</div>
                                            <div className="text-xs text-gray-500">{admin.email}</div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === admin.id ? null : admin.id)}
                                            className="p-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            <MoreVertical className="w-4 h-4 text-gray-500" />
                                        </button>
                                        {/* Mobile Dropdown */}
                                        <AnimatePresence>
                                            {activeDropdown === admin.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="absolute right-0 top-10 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48"
                                                >
                                                    <button
                                                        onClick={() => handleViewActivity(admin)}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <History className="w-4 h-4 text-blue-500" />
                                                        View Activity
                                                    </button>
                                                    <button
                                                        onClick={() => handleConfirmAction(admin, 'resetPassword')}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Key className="w-4 h-4 text-amber-500" />
                                                        Reset Password
                                                    </button>
                                                    <div className="border-t border-gray-100 my-1" />
                                                    {admin.status === 'ACTIVE' ? (
                                                        <button
                                                            onClick={() => handleConfirmAction(admin, 'block')}
                                                            className="w-full px-4 py-2 text-left text-sm hover:bg-rose-50 flex items-center gap-2 text-rose-600"
                                                        >
                                                            <UserX className="w-4 h-4" />
                                                            Block Admin
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleConfirmAction(admin, 'unblock')}
                                                            className="w-full px-4 py-2 text-left text-sm hover:bg-emerald-50 flex items-center gap-2 text-emerald-600"
                                                        >
                                                            <UserCheck className="w-4 h-4" />
                                                            Unblock
                                                        </button>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        <span>{admin.schoolName}</span>
                                    </div>
                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${getStatusBadge(admin.status)}`}>
                                        {admin.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(newPage) => setPage(newPage)}
                    totalElements={totalElements}
                    pageSize={pageSize}
                />
            </motion.div>

            {/* Create Admin Modal */}
            <CreateAdminModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSave={handleCreateAdminSave}
                schools={schools}
            />

            {/* Transfer School Modal - Keeping UI but functionality not fully hooked */}
            <AnimatePresence>
                {showTransferModal && selectedAdmin && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowTransferModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Transfer School</h2>
                                    <p className="text-sm text-gray-500">{selectedAdmin.name}</p>
                                </div>
                                <button onClick={() => setShowTransferModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                                <p className="text-sm text-amber-700">
                                    <strong>Current School:</strong> {selectedAdmin.schoolName}
                                </p>
                            </div>
                            <p className="text-gray-500 text-sm text-center">Feature coming soon in backend</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowConfirmModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${confirmAction === 'block' ? 'bg-rose-100' :
                                    confirmAction === 'unblock' ? 'bg-emerald-100' :
                                        confirmAction === 'forceLogout' ? 'bg-orange-100' : 'bg-amber-100'
                                    }`}>
                                    {confirmAction === 'block' && <UserX className="w-8 h-8 text-rose-600" />}
                                    {confirmAction === 'unblock' && <UserCheck className="w-8 h-8 text-emerald-600" />}
                                    {confirmAction === 'resetPassword' && <Key className="w-8 h-8 text-amber-600" />}
                                    {confirmAction === 'forceLogout' && <LogOut className="w-8 h-8 text-orange-600" />}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {confirmAction === 'block' && 'Block Admin?'}
                                    {confirmAction === 'unblock' && 'Unblock Admin?'}
                                    {confirmAction === 'resetPassword' && 'Reset Password?'}
                                    {confirmAction === 'forceLogout' && 'Force Logout?'}
                                </h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    {confirmAction === 'block' && `${selectedAdmin?.name} will not be able to access the system.`}
                                    {confirmAction === 'unblock' && `${selectedAdmin?.name} will regain access to the system.`}
                                    {confirmAction === 'resetPassword' && `Password will be reset to 'password123' for ${selectedAdmin?.email}.`}
                                    {confirmAction === 'forceLogout' && `${selectedAdmin?.name} will be logged out from all devices.`}
                                </p>
                                <div className="flex gap-3">
                                    <Button onClick={() => setShowConfirmModal(false)} className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200">
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={executeConfirmAction}
                                        className={`flex-1 ${confirmAction === 'block' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Activity Log Drawer - Using real log data if available or placeholder */}
            <AnimatePresence>
                {showActivityDrawer && selectedAdmin && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/30 z-40"
                            onClick={() => setShowActivityDrawer(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50"
                        >
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800">Activity Log</h2>
                                        <p className="text-sm text-gray-500">{selectedAdmin.name}</p>
                                    </div>
                                    <button onClick={() => setShowActivityDrawer(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
                                <div className="text-center text-gray-500 mt-10">
                                    <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p>No activity logs found</p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Click outside to close dropdown */}
            {activeDropdown && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setActiveDropdown(null)}
                />
            )}
        </div>
    );
};

export default AdminManagement;
