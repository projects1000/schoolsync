import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import parentService from '@/services/parentService';
import api from '@/services/api';

const ParentAttendance = ({ currentUser }) => {
    const { toast } = useToast();
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            fetchAttendance();
        }
    }, [selectedChild]);

    const fetchChildren = async () => {
        try {
            setIsLoading(true);
            const data = await parentService.getMyChildren();
            setChildren(data);
            if (data.length > 0) {
                setSelectedChild(data[0]);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load children data",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAttendance = async () => {
        if (!selectedChild) return;

        try {
            setIsLoading(true);
            const response = await api.get(`/parent/children/${selectedChild.id}/attendance`);
            setAttendance(response.data || []);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            toast({
                title: "Error",
                description: "Failed to load attendance data",
                variant: "destructive"
            });
            setAttendance([]);
        } finally {
            setIsLoading(false);
        }
    };

    const attendancePercentage = attendance.length > 0
        ? Math.round((attendance.filter(a => a.status === 'PRESENT' || a.status === 'present').length / attendance.length) * 100)
        : 0;

    if (isLoading && children.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (children.length === 0) {
        return (
            <div className="text-center p-10 bg-white rounded-lg shadow-sm">
                No child assigned to this parent account. Please contact administration.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Attendance Records</h1>
                        <p className="text-gray-600 mt-1">View {selectedChild?.name}'s attendance history</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Overall Attendance</p>
                        <p className="text-3xl font-bold text-green-600">{attendancePercentage}%</p>
                    </div>
                </div>
            </motion.div>

            {children.length > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
                >
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Select Child</label>
                    <select
                        value={selectedChild?.id || ''}
                        onChange={(e) => {
                            const child = children.find(c => c.id === e.target.value);
                            setSelectedChild(child);
                        }}
                        className="w-full md:w-64 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        {children.map(child => (
                            <option key={child.id} value={child.id}>{child.name}</option>
                        ))}
                    </select>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {attendance.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                            <p>No attendance records found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    attendance.map((record, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {record.date || new Date(record.attendanceDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'PRESENT' || record.status === 'present'
                                                        ? 'bg-green-100 text-green-800'
                                                        : record.status === 'ABSENT' || record.status === 'absent'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {record.reason || record.remarks || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ParentAttendance;
