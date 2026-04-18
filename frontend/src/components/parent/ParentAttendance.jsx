import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useParent } from '@/context/ParentContext';
import api from '@/services/api';

const ParentAttendance = ({ currentUser }) => {
    const { toast } = useToast();
    const { selectedChild } = useParent();
    const [attendance, setAttendance] = useState([]);

    const attendanceQuery = useQuery({
        queryKey: ['parent', 'attendance', selectedChild?.id],
        queryFn: () => api.get(`/parent/children/${selectedChild.id}/attendance`),
        enabled: Boolean(selectedChild?.id),
        staleTime: 1000 * 60,
    });

    useEffect(() => {
        if (!attendanceQuery.data) return;
        setAttendance(attendanceQuery.data.data || []);
    }, [attendanceQuery.data]);

    useEffect(() => {
        if (!attendanceQuery.error) return;
        console.error('Error fetching attendance:', attendanceQuery.error);
        toast({
            title: 'Error',
            description: 'Failed to load attendance data',
            variant: 'destructive'
        });
        setAttendance([]);
    }, [attendanceQuery.error, toast]);

    const isLoading = attendanceQuery.isLoading || attendanceQuery.isFetching;

    const attendancePercentage = attendance.length > 0
        ? Math.round((attendance.filter(a => a.status === 'PRESENT' || a.status === 'present').length / attendance.length) * 100)
        : 0;

    if (!selectedChild) {
        return null; // ParentProvider handles selection screen
    }

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
                            <div className="h-4 bg-gray-100 rounded w-64" />
                        </div>
                        <div className="text-right">
                            <div className="h-3 bg-gray-200 rounded w-28 mb-2" />
                            <div className="h-9 bg-gray-300 rounded w-16" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 flex gap-16">
                        <div className="h-3 bg-gray-200 rounded w-12" />
                        <div className="h-3 bg-gray-200 rounded w-14" />
                        <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="px-6 py-4 border-t border-gray-100 flex gap-16">
                            <div className="h-4 bg-gray-200 rounded w-24" />
                            <div className="h-5 bg-gray-200 rounded-full w-16" />
                            <div className="h-4 bg-gray-100 rounded w-12" />
                        </div>
                    ))}
                </div>
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
