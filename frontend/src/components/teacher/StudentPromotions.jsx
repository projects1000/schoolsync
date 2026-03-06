import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowUpCircle, Users, CheckSquare, Square, AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import api from '@/services/api';

const StudentPromotions = () => {
    const [loading, setLoading] = useState(true);
    const [promoting, setPromoting] = useState(false);
    const [error, setError] = useState(null);
    const [students, setStudents] = useState([]);
    const [currentClass, setCurrentClass] = useState(null);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [targetClassId, setTargetClassId] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const { toast } = useToast();

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/teacher/promotion/students');
            setStudents(response.data.students || []);
            setCurrentClass(response.data.currentClass || null);
            setAvailableClasses(response.data.availableClasses || []);
            setSelectedStudents(new Set());
            setTargetClassId('');
        } catch (err) {
            console.error('Error fetching promotion data:', err);
            const msg = err.response?.data?.message || err.response?.data?.error || err.message;
            setError(msg || 'Failed to load promotion data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleStudent = (studentId) => {
        setSelectedStudents(prev => {
            const next = new Set(prev);
            if (next.has(studentId)) {
                next.delete(studentId);
            } else {
                next.add(studentId);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedStudents.size === students.length) {
            setSelectedStudents(new Set());
        } else {
            setSelectedStudents(new Set(students.map(s => s.id)));
        }
    };

    const allSelected = students.length > 0 && selectedStudents.size === students.length;

    const handlePromote = async () => {
        if (selectedStudents.size === 0) {
            toast({ title: 'No students selected', description: 'Please select at least one student to promote.', variant: 'destructive' });
            return;
        }
        if (!targetClassId) {
            toast({ title: 'No target class', description: 'Please select the class to promote students to.', variant: 'destructive' });
            return;
        }
        setShowConfirm(true);
    };

    const confirmPromote = async () => {
        setShowConfirm(false);
        setPromoting(true);
        try {
            const response = await api.post('/teacher/promotion/promote', {
                studentIds: Array.from(selectedStudents),
                targetClassId
            });
            toast({
                title: '✅ Promotion Successful',
                description: response.data.message || `${response.data.promotedCount} student(s) promoted.`,
            });
            // Refresh data
            await fetchData();
        } catch (err) {
            console.error('Promotion failed:', err);
            const msg = err.response?.data?.message || err.response?.data?.error || err.message;
            toast({ title: 'Promotion Failed', description: msg, variant: 'destructive' });
        } finally {
            setPromoting(false);
        }
    };

    const targetClassName = availableClasses.find(c => c.id === targetClassId)?.name || '';

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="bg-gray-100 rounded-xl p-6 border border-gray-200">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-72" />
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex justify-between items-center">
                        <div className="h-9 bg-gray-200 rounded w-40" />
                        <div className="flex gap-3">
                            <div className="h-9 bg-gray-200 rounded w-52" />
                            <div className="h-9 bg-gray-200 rounded w-24" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-3 bg-gray-200 rounded w-16" />
                        ))}
                    </div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="px-4 py-4 border-t border-gray-100 flex items-center gap-6">
                            <div className="w-5 h-5 bg-gray-200 rounded" />
                            <div className="h-4 bg-gray-200 rounded w-10" />
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                                <div className="h-4 bg-gray-200 rounded w-28" />
                            </div>
                            <div className="h-4 bg-gray-100 rounded w-20" />
                            <div className="h-4 bg-gray-100 rounded w-16" />
                            <div className="h-5 bg-gray-200 rounded-full w-14" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 text-center">
                <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-red-400" />
                <p className="font-semibold text-lg">Unable to Load Promotions</p>
                <p className="mt-1 text-sm">{error}</p>
                <Button onClick={fetchData} className="mt-4" variant="outline">Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <ArrowUpCircle className="w-6 h-6 text-indigo-600" />
                            Student Promotions
                        </h2>
                        <p className="text-gray-500 mt-1 text-sm">
                            Promote students from <span className="font-semibold text-indigo-700">{currentClass?.name}</span> to another class
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm">
                            <Users className="w-4 h-4 inline mr-1 text-gray-500" />
                            <span className="font-semibold">{students.length}</span> Students
                        </span>
                        <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium">
                            {selectedStudents.size} Selected
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Button
                        variant={allSelected ? "default" : "outline"}
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2"
                        disabled={students.length === 0}
                    >
                        {allSelected ? (
                            <CheckSquare className="w-4 h-4" />
                        ) : (
                            <Square className="w-4 h-4" />
                        )}
                        {allSelected ? 'Deselect All' : 'Select All Students'}
                    </Button>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Promote to:</label>
                        <select
                            value={targetClassId}
                            onChange={(e) => setTargetClassId(e.target.value)}
                            className="flex-1 sm:w-64 p-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        >
                            <option value="">Select target class...</option>
                            {availableClasses.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} ({cls.grade} - Section {cls.section})
                                </option>
                            ))}
                        </select>
                        <Button
                            onClick={handlePromote}
                            disabled={selectedStudents.size === 0 || !targetClassId || promoting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                        >
                            {promoting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                            Promote
                        </Button>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            {students.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-700">No Students Found</h3>
                    <p className="text-sm text-gray-500 mt-1">There are no students in your class to promote.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-3 text-left w-12">
                                        <button onClick={toggleSelectAll} className="hover:opacity-70 transition-opacity">
                                            {allSelected ? (
                                                <CheckSquare className="w-5 h-5 text-indigo-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll No</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Admission No</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Guardian</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students.map((student, index) => {
                                    const isSelected = selectedStudents.has(student.id);
                                    return (
                                        <motion.tr
                                            key={student.id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => toggleStudent(student.id)}
                                            className={`cursor-pointer transition-all ${isSelected
                                                ? 'bg-indigo-50 hover:bg-indigo-100'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <td className="px-4 py-3">
                                                {isSelected ? (
                                                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-gray-300" />
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                                {student.rollNo || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                        {student.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-800">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{student.admissionNo || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{student.guardian || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {student.status || 'ACTIVE'}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
                        >
                            <div className="text-center">
                                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ArrowUpCircle className="w-7 h-7 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Promotion</h3>
                                <p className="text-sm text-gray-600">
                                    Are you sure you want to promote <span className="font-semibold text-indigo-700">{selectedStudents.size} student(s)</span> from{' '}
                                    <span className="font-semibold">{currentClass?.name}</span> to{' '}
                                    <span className="font-semibold text-indigo-700">{targetClassName}</span>?
                                </p>
                                <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-2 rounded-lg">
                                    ⚠️ This action cannot be easily undone.
                                </p>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowConfirm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                                    onClick={confirmPromote}
                                >
                                    Yes, Promote
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentPromotions;
