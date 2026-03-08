import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Grid3X3,
    List,
    Building2,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    UserPlus,
    Eye,
    PauseCircle,
    PlayCircle,
    Power,
    MapPin,
    Users,
    GraduationCap,
    Phone,
    Mail,
    Calendar,
    AlertTriangle,
    X,
    Check,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { schoolTypes, cities, statusOptions } from './mockSchoolData';
import AddEditSchoolForm from './AddEditSchoolForm';

import SuperAdminService from '../../services/superAdminService';

const SchoolManagement = ({ currentUser }) => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [schools, setSchools] = useState([]);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ city: '', status: '', dateFrom: '', dateTo: '' });
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Modal states
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [showAssignAdminModal, setShowAssignAdminModal] = useState(false);
    const [availableAdmins, setAvailableAdmins] = useState([]); // List of admins for assignment
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmationInput, setConfirmationInput] = useState('');

    // Fetch schools
    const fetchSchools = async () => {
        setIsLoading(true);
        try {
            const response = await SuperAdminService.getAllSchools();
            setSchools(response.data || []);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to fetch schools', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // console.log('SchoolManagement mounted, fetching schools...');
        fetchSchools();
    }, []);

    // Filter schools
    const filteredSchools = useMemo(() => {
        return schools.filter(school => {
            const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (school.city && school.city.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCity = !filters.city || school.city === filters.city;
            const matchesStatus = !filters.status || filters.status === 'all' || school.status === filters.status;
            return matchesSearch && matchesCity && matchesStatus;
        });
    }, [schools, searchQuery, filters]);

    // Action handlers
    const handleAddSchool = () => {
        setSelectedSchool(null);
        setShowAddEditModal(true);
    };

    const handleEditSchool = (school) => {
        setSelectedSchool(school);
        setShowAddEditModal(true);
    };

    const handleViewDetails = (school) => {
        navigate(`/superadmin/schools/${school.id}`);
    };

    const handleAssignAdmin = async (school) => {
        setSelectedSchool(school);
        setShowAssignAdminModal(true);
        try {
            // Filter out admins who already have a school assigned
            const allAdmins = response.data || [];
            const unassignedAdmins = allAdmins.filter(admin => !admin.schoolId);
            setAvailableAdmins(unassignedAdmins);
        } catch (error) {
            console.error("Failed to fetch admins", error);
            toast({ title: 'Error', description: 'Failed to fetch admins', variant: 'destructive' });
        }
    };

    const handleConfirmAction = (school, action) => {
        setSelectedSchool(school);
        setConfirmAction(action);
        setConfirmationInput(''); // Reset input
        setShowConfirmModal(true);
    };

    const executeConfirmAction = async () => {
        if (!selectedSchool || !confirmAction) return;

        try {
            switch (confirmAction) {
                case 'suspend':
                case 'activate':
                case 'deactivate':
                    // Map UI action to typical Status enum if needed, or updateSchoolStatus API
                    // Assuming API status matches lowercase or mapped
                    let apiStatus = confirmAction === 'suspend' ? 'SUSPENDED' :
                        confirmAction === 'activate' ? 'ACTIVE' : 'INACTIVE';

                    // Backend expects Update object or specific endpoint? 
                    // We implemented updateSchoolStatus logic in Service but controller exposes full update?
                    // Actually we added update functionalities. Let's assume we update the school object.

                    // Alternatively if we didn't expose specific status endpoint, we use updateSchool.
                    // But in Step 156 we added updateAdminStatus but for School we added updateSchool.
                    // Wait, SchoolService has updateSchoolStatus but SuperAdminController calls updateSchool.
                    // Let's use updateSchool to change status.

                    const updatedSchool = { ...selectedSchool, status: apiStatus };
                    await SuperAdminService.updateSchool(selectedSchool.id, updatedSchool);

                    toast({ title: 'Success', description: `School status updated to ${apiStatus}` });
                    break;

                case 'softDelete': // Mapping softDelete to standard delete for now, or status update
                    // If backend supports soft delete via status
                    await SuperAdminService.deleteSchool(selectedSchool.id);
                    toast({ title: 'School Deleted', description: 'School has been deleted.' });
                    break;

                case 'hardDelete':
                    await SuperAdminService.deleteSchool(selectedSchool.id);
                    toast({ title: 'School Deleted', description: 'School has been permanently deleted.' });
                    break;
            }
            fetchSchools(); // Refresh list
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Operation failed', variant: 'destructive' });
        }
        setShowConfirmModal(false);
    };

    const handleSaveSchool = async (schoolData) => {
        try {
            if (selectedSchool) {
                // Update
                await SuperAdminService.updateSchool(selectedSchool.id, schoolData);
                toast({ title: 'Success', description: 'School updated successfully' });
            } else {
                // Create
                await SuperAdminService.createSchool(schoolData);
                toast({ title: 'Success', description: 'School created successfully' });
            }
            fetchSchools();
            setShowAddEditModal(false);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to save school', variant: 'destructive' });
        }
    };

    const handleAssignAdminSubmit = async (admin) => {
        try {
            await SuperAdminService.assignAdminToSchool(selectedSchool.id, admin.id);
            toast({ title: 'Success', description: `Admin ${admin.name} assigned to school.` });
            fetchSchools();
            setShowAssignAdminModal(false);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to assign admin', variant: 'destructive' });
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            INACTIVE: 'bg-gray-100 text-gray-600 border-gray-200',
            SUSPENDED: 'bg-rose-100 text-rose-700 border-rose-200',
            TRIAL: 'bg-blue-100 text-blue-700 border-blue-200',
            DELETED: 'bg-slate-100 text-slate-500 border-slate-200'
        };
        return styles[status] || styles.INACTIVE;
    };

    // Check super admin access
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
                            <Building2 className="w-7 h-7 text-indigo-600" />
                            School Management
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Manage all schools on the platform</p>
                    </div>
                    <Button onClick={handleAddSchool} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add School
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
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search schools..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Quick Filters */}
                    <div className="flex gap-2">
                        <select
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                            <option value="">All Cities</option>
                            {cities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>

                        {/* View Toggle */}
                        <div className="hidden md:flex border border-gray-200 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('card')}
                                className={`p-2 ${viewMode === 'card' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* School List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {isLoading ? (
                    /* Loading State Skeleton */
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        <div className="h-3 bg-gray-100 rounded w-1/6"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 bg-gray-100 rounded"></div>
                                        <div className="w-8 h-8 bg-gray-100 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredSchools.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Schools Found</h3>
                        <p className="text-gray-400 mb-6">Get started by adding your first school</p>
                        <Button onClick={handleAddSchool} className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="w-4 h-4 mr-2" /> Add School
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Table View - Desktop Only if viewMode is table */}
                        {viewMode === 'table' && (
                            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">School</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">City</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Admin</th>
                                                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Students</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredSchools.map((school) => (
                                                <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-800">{school.name}</div>
                                                        <div className="text-xs text-gray-500">{school.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">{school.city}</td>
                                                    <td className="px-6 py-4 text-gray-600">{school.type}</td>
                                                    <td className="px-6 py-4">
                                                        {school.admin ? (
                                                            <div>
                                                                <div className="text-gray-800 text-sm">{school.admin.name}</div>
                                                                <div className="text-xs text-gray-400">{school.admin.email}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm italic">Not assigned</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="font-semibold text-gray-800">{school.students}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${getStatusBadge(school.status)}`}>
                                                            {school.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-1">
                                                            <button onClick={() => handleViewDetails(school)} className="p-2 hover:bg-gray-100 rounded-lg" title="View">
                                                                <Eye className="w-4 h-4 text-gray-500" />
                                                            </button>
                                                            <button onClick={() => handleEditSchool(school)} className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
                                                                <Edit className="w-4 h-4 text-blue-500" />
                                                            </button>
                                                            <button
                                                                onClick={() => !school.admin && handleAssignAdmin(school)}
                                                                disabled={!!school.admin}
                                                                className={`p-2 rounded-lg ${school.admin ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'}`}
                                                                title={school.admin ? "Admin already assigned" : "Assign Admin"}
                                                            >
                                                                <UserPlus className={`w-4 h-4 ${school.admin ? 'text-gray-400' : 'text-purple-500'}`} />
                                                            </button>
                                                            {school.status === 'active' && (
                                                                <button onClick={() => handleConfirmAction(school, 'suspend')} className="p-2 hover:bg-gray-100 rounded-lg" title="Suspend">
                                                                    <PauseCircle className="w-4 h-4 text-amber-500" />
                                                                </button>
                                                            )}
                                                            {school.status !== 'active' && (
                                                                <button onClick={() => handleConfirmAction(school, 'activate')} className="p-2 hover:bg-gray-100 rounded-lg" title="Activate">
                                                                    <PlayCircle className="w-4 h-4 text-emerald-500" />
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleConfirmAction(school, 'softDelete')} className="p-2 hover:bg-gray-100 rounded-lg" title="Delete">
                                                                <Trash2 className="w-4 h-4 text-rose-500" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Card View - Visible on Mobile OR if viewMode is card */}
                        <div className={`${viewMode === 'table' ? 'md:hidden' : 'block'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredSchools.map((school, index) => (
                                    <motion.div
                                        key={school.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{school.name}</h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                    <MapPin className="w-3 h-3" /> {school.city}
                                                </p>
                                            </div>
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${getStatusBadge(school.status)}`}>
                                                {school.status}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Users className="w-4 h-4 text-blue-500" />
                                                <span>{school.students} students</span>
                                                <span className="text-gray-300">•</span>
                                                <GraduationCap className="w-4 h-4 text-green-500" />
                                                <span>{school.teachers} teachers</span>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                <span className="font-medium">Admin:</span> {school.admin?.name || 'Not assigned'}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                                            <button onClick={() => handleViewDetails(school)} className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                                View
                                            </button>
                                            <button onClick={() => handleEditSchool(school)} className="flex-1 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => !school.admin && handleAssignAdmin(school)}
                                                disabled={!!school.admin}
                                                className={`flex-1 py-2 text-sm rounded-lg transition-colors ${school.admin ? 'text-gray-400 cursor-not-allowed' : 'text-purple-600 hover:bg-purple-50'}`}
                                            >
                                                {school.admin ? 'Assigned' : 'Admin'}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </motion.div>

            {/* Add/Edit School Form */}
            <AddEditSchoolForm
                isOpen={showAddEditModal}
                onClose={() => setShowAddEditModal(false)}
                onSave={handleSaveSchool}
                editSchool={selectedSchool}
                existingSchools={schools}
            />


            {/* Assign Admin Modal */}
            <AnimatePresence>
                {showAssignAdminModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowAssignAdminModal(false)}
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
                                    <h2 className="text-xl font-bold text-gray-800">Assign Admin</h2>
                                    <p className="text-sm text-gray-500">{selectedSchool?.name}</p>
                                </div>
                                <button onClick={() => setShowAssignAdminModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {selectedSchool?.admin && (
                                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm text-amber-700">
                                        <strong>Current Admin:</strong> {selectedSchool.admin.name}
                                    </p>
                                    <p className="text-xs text-amber-600">Selecting a new admin will replace the current one.</p>
                                </div>
                            )}

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {availableAdmins.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500">
                                        <p>No unassigned admins available.</p>
                                        <p className="text-xs mt-1">Create a new admin in Admin Management.</p>
                                    </div>
                                ) : (
                                    availableAdmins.map(admin => (
                                        <button
                                            key={admin.id}
                                            onClick={() => handleAssignAdminSubmit(admin)}
                                            className="w-full p-3 flex items-center gap-3 hover:bg-indigo-50 rounded-lg border border-gray-200 transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                <span className="font-semibold text-indigo-600">{admin.name.charAt(0)}</span>
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="font-medium text-gray-800">{admin.name}</p>
                                                <p className="text-xs text-gray-500">{admin.email}</p>
                                            </div>
                                            <UserPlus className="w-4 h-4 text-gray-400" />
                                        </button>
                                    ))
                                )}
                            </div>
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
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${confirmAction === 'hardDelete' ? 'bg-rose-100' :
                                    confirmAction === 'suspend' ? 'bg-amber-100' : 'bg-blue-100'
                                    }`}>
                                    {confirmAction === 'hardDelete' ? <Trash2 className="w-8 h-8 text-rose-600" /> :
                                        confirmAction === 'suspend' ? <PauseCircle className="w-8 h-8 text-amber-600" /> :
                                            confirmAction === 'activate' ? <PlayCircle className="w-8 h-8 text-emerald-600" /> :
                                                <Power className="w-8 h-8 text-blue-600" />}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {confirmAction === 'suspend' && 'Suspend School?'}
                                    {confirmAction === 'activate' && 'Activate School?'}
                                    {confirmAction === 'deactivate' && 'Deactivate School?'}
                                    {confirmAction === 'softDelete' && 'Delete School?'}
                                    {confirmAction === 'hardDelete' && 'Permanently Delete?'}
                                </h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    {confirmAction === 'hardDelete'
                                        ? `This will permanently remove ${selectedSchool?.name}. This action cannot be undone.`
                                        : `Are you sure you want to ${confirmAction} ${selectedSchool?.name}?`
                                    }
                                </p>
                                {
                                    (confirmAction === 'softDelete' || confirmAction === 'hardDelete') && (
                                        <div className="mb-4">
                                            <label className="block text-sm text-gray-700 mb-1">
                                                Type <strong>delete</strong> to confirm:
                                            </label>
                                            <input
                                                type="text"
                                                value={confirmationInput}
                                                onChange={(e) => setConfirmationInput(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                                placeholder="delete"
                                            />
                                        </div>
                                    )
                                }
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={() => setShowConfirmModal(false)} className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={executeConfirmAction}
                                    disabled={(confirmAction === 'softDelete' || confirmAction === 'hardDelete') && confirmationInput !== 'delete'}
                                    className={`flex-1 ${(confirmAction === 'hardDelete' || confirmAction === 'softDelete') ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                >
                                    Confirm
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Details Modal */}
            <AnimatePresence>
                {showDetailsModal && selectedSchool && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDetailsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800">School Details</h2>
                                <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <Building2 className="w-7 h-7 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800 text-lg">{selectedSchool.name}</h3>
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${getStatusBadge(selectedSchool.status)}`}>
                                            {selectedSchool.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{selectedSchool.city}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{selectedSchool.createdAt}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{selectedSchool.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{selectedSchool.email}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-500 mb-1">Address</p>
                                    <p className="text-gray-800">{selectedSchool.address}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                                        <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                        <p className="text-2xl font-bold text-blue-600">{selectedSchool.students}</p>
                                        <p className="text-xs text-blue-500">Students</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3 text-center">
                                        <GraduationCap className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                        <p className="text-2xl font-bold text-green-600">{selectedSchool.teachers}</p>
                                        <p className="text-xs text-green-500">Teachers</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-500 mb-2">School Admin</p>
                                    {selectedSchool.admin ? (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                <span className="font-semibold text-purple-600">{selectedSchool.admin.name.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{selectedSchool.admin.name}</p>
                                                <p className="text-xs text-gray-500">{selectedSchool.admin.email}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 italic">No admin assigned</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6">
                                <Button onClick={() => setShowDetailsModal(false)} className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200">
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default SchoolManagement;
