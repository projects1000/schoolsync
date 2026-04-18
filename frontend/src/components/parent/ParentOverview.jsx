
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, MessageSquare, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useParent } from '@/context/ParentContext';
import { MODULE_TO_PATH } from '@/routeConfig';
import api from '@/services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CourseProgressWidget from './CourseProgressWidget';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const ParentOverview = ({ currentUser }) => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { selectedChild } = useParent();
    const [attendance, setAttendance] = useState([]);
    const [messages, setMessages] = useState([]);
    const [attendancePercentage, setAttendancePercentage] = useState(100);
    const [showProfileReminder, setShowProfileReminder] = useState(false);

    // Show profile reminder popup if child's profile is incomplete
    useEffect(() => {
        if (selectedChild && !selectedChild.profileCompleted) {
            setShowProfileReminder(true);
        } else {
            setShowProfileReminder(false);
        }
    }, [selectedChild]);

    const attendanceQuery = useQuery({
        queryKey: ['parent', 'overview', 'attendance', selectedChild?.id],
        queryFn: () => api.get(`/parent/children/${selectedChild.id}/attendance`),
        enabled: Boolean(selectedChild?.id),
        staleTime: 1000 * 60,
    });

    const messagesQuery = useQuery({
        queryKey: ['parent', 'overview', 'messages', selectedChild?.id],
        queryFn: () => api.get(`/parent/messages/${selectedChild.id}`),
        enabled: Boolean(selectedChild?.id),
        staleTime: 1000 * 60,
    });

    useEffect(() => {
        if (!attendanceQuery.data) return;
        const attendanceData = attendanceQuery.data.data || [];
        setAttendance(attendanceData);

        if (attendanceData.length > 0) {
            const presentCount = attendanceData.filter(
                a => a.status === 'PRESENT' || a.status === 'present'
            ).length;
            const percentage = Math.round((presentCount / attendanceData.length) * 100);
            setAttendancePercentage(percentage);
        } else {
            setAttendancePercentage(100);
        }
    }, [attendanceQuery.data]);

    useEffect(() => {
        if (!messagesQuery.data) return;
        setMessages(messagesQuery.data.data || []);
    }, [messagesQuery.data]);

    useEffect(() => {
        if (!attendanceQuery.error && !messagesQuery.error) return;
        console.error('Error fetching child data:', attendanceQuery.error || messagesQuery.error);
    }, [attendanceQuery.error, messagesQuery.error]);

    const isLoading = attendanceQuery.isLoading || attendanceQuery.isFetching || messagesQuery.isLoading || messagesQuery.isFetching;

    const handleDownloadReport = () => {
        if (!selectedChild) return;

        const doc = new jsPDF();
        doc.text(`Progress Report - ${selectedChild.name}`, 20, 20);
        doc.text(`Roll No: ${selectedChild.rollNo || 'N/A'}`, 20, 30);
        doc.text(`Class: ${selectedChild.className || 'N/A'}`, 20, 40);

        const attendanceData = attendance.slice(0, 10).map(a => [
            a.date || new Date(a.attendanceDate).toLocaleDateString(),
            a.status,
            a.time || 'N/A'
        ]);

        doc.autoTable({
            head: [['Date', 'Status', 'Time']],
            body: attendanceData,
            startY: 50,
        });

        doc.save(`${selectedChild.name}_report.pdf`);

        toast({
            title: "Report Downloaded",
            description: `Progress report for ${selectedChild.name} has been downloaded.`,
        });
    };

    if (!selectedChild) {
        return null; // ParentProvider handles selection screen
    }

    return (
        <div className="space-y-6">
            {/* Profile Reminder Popup */}
            <Dialog open={showProfileReminder} onOpenChange={setShowProfileReminder}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Profile Incomplete
                        </DialogTitle>
                        <DialogDescription>
                            {selectedChild?.name}'s profile is not yet complete. Please update the profile with important details like date of birth, blood group, and more.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowProfileReminder(false)}
                        >
                            Later
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => {
                                setShowProfileReminder(false);
                                navigate(MODULE_TO_PATH['parent-student-profile']);
                            }}
                        >
                            Go to Student Profile
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600 mt-1">Track {selectedChild.name}'s progress and activities in {selectedChild.className || 'N/A'}</p>
            </motion.div>

            {isLoading ? (
                <div className="space-y-6 animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="h-4 bg-gray-200 rounded w-24" />
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                                </div>
                                <div className="h-8 bg-gray-300 rounded w-16 mb-1" />
                                <div className="h-3 bg-gray-100 rounded w-32" />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="h-5 bg-gray-200 rounded w-36 mb-4" />
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex gap-3 items-start">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full" />
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                                            <div className="h-3 bg-gray-100 rounded w-72" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <motion.div
                        key={selectedChild?.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-600 text-sm font-medium">Child Name</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedChild?.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs font-semibold px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full uppercase">
                                            {selectedChild?.className || 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-500">Roll No: {selectedChild?.rollNo || 'N/A'}</p>
                                    </div>
                                </div>
                                <User className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        <div
                            className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(MODULE_TO_PATH['parent-attendance'])}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-600 text-sm font-medium">Attendance</p>
                                    <p className="text-2xl font-bold text-gray-900">{attendancePercentage}%</p>
                                    <p className="text-xs text-gray-500 mt-1">Current Academic Year</p>
                                </div>
                                <Calendar className="w-8 h-8 text-green-600" />
                            </div>
                        </div>

                        <div
                            className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(MODULE_TO_PATH['parent-messages'])}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-600 text-sm font-medium">Messages</p>
                                    <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
                                    <p className="text-xs text-gray-500 mt-1">Total Messages</p>
                                </div>
                                <MessageSquare className="w-8 h-8 text-emerald-600" />
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleDownloadReport}
                            className="bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 flex items-center space-x-2"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download Report for {selectedChild?.name}</span>
                        </Button>
                    </div>

                    {/* Course Progress Widget */}
                    {selectedChild && (
                        <motion.div
                            key={`progress-${selectedChild.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <CourseProgressWidget
                                studentId={selectedChild.id}
                                onViewAll={() => navigate(MODULE_TO_PATH['parent-course-handouts'])}
                            />
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
};

export default ParentOverview;
