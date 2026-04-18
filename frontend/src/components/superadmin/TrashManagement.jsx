import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2,
    RefreshCcw,
    MapPin,
    Building2,
    X,
    Users,
    GraduationCap,
    Calendar,
    Phone,
    Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import SuperAdminService from '../../services/superAdminService';

const TrashManagement = () => {
    const { toast } = useToast();
    const [deletedSchools, setDeletedSchools] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState(null);

    const fetchDeletedSchools = async () => {
        setIsLoading(true);
        try {
            const response = await SuperAdminService.getDeletedSchools();
            setDeletedSchools(response.data || []);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to fetch deleted schools', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDeletedSchools();
    }, []);

    const handleRestoreClick = (school) => {
        setSelectedSchool(school);
        setShowConfirmModal(true);
    };

    const executeRestore = async () => {
        if (!selectedSchool) return;
        try {
            await SuperAdminService.restoreSchool(selectedSchool.id);
            toast({ title: 'Success', description: 'School restored successfully and set to INACTIVE status.' });
            fetchDeletedSchools();
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to restore school', variant: 'destructive' });
        }
        setShowConfirmModal(false);
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Trash2 className="w-7 h-7 text-orange-600" />
                            Deleted Schools (Trash)
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">View and restore soft-deleted schools</p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        <div className="h-3 bg-gray-100 rounded w-1/6"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : deletedSchools.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
                        <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Trash is Empty</h3>
                        <p className="text-gray-400">No deleted schools found.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">School</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">City</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {deletedSchools.map((school) => (
                                        <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800">{school.name}</div>
                                                <div className="text-xs text-gray-500">{school.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{school.city}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 text-xs font-medium rounded-full border bg-slate-100 text-slate-500 border-slate-200 capitalize">
                                                    DELETED
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    onClick={() => handleRestoreClick(school)}
                                                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                                    size="sm"
                                                >
                                                    <RefreshCcw className="w-4 h-4 mr-2" />
                                                    Restore
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </motion.div>

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
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-emerald-100">
                                    <RefreshCcw className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    Restore School?
                                </h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    Are you sure you want to restore <strong>{selectedSchool?.name}</strong>? It will be restored with INACTIVE status and will require admin assignment.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={() => setShowConfirmModal(false)} className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={executeRestore}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    Confirm Restore
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TrashManagement;
