import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useParent } from '@/context/ParentContext';
import api from '@/services/api';

const ParentAttendance = ({ currentUser }) => {
    const { toast } = useToast();
    const { selectedChild } = useParent();
    const [attendance, setAttendance] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (selectedChild) {
            fetchAttendance();
        }
    }, [selectedChild]);

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

    if (!selectedChild) {
        return null; // ParentProvider handles selection screen
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
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
            </motion.div>
        </div>
    );
};

export default ParentAttendance;
