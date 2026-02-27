
import React, { useState, useEffect } from 'react';
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
    const [isLoading, setIsLoading] = useState(true);
    const [showProfileReminder, setShowProfileReminder] = useState(false);

    // Show profile reminder popup if child's profile is incomplete
    useEffect(() => {
        if (selectedChild && !selectedChild.profileCompleted) {
            setShowProfileReminder(true);
        } else {
            setShowProfileReminder(false);
        }
    }, [selectedChild]);

    useEffect(() => {
        if (selectedChild) {
            fetchChildData(selectedChild.id);
        }
    }, [selectedChild]);

    const fetchChildData = async (childId) => {
        try {
            setIsLoading(true);
            // Fetch attendance
            const attendanceResponse = await api.get(`/parent/children/${childId}/attendance`);
            const attendanceData = attendanceResponse.data || [];
            setAttendance(attendanceData);

            // Calculate attendance percentage
            if (attendanceData.length > 0) {
                const presentCount = attendanceData.filter(
                    a => a.status === 'PRESENT' || a.status === 'present'
                ).length;
                const percentage = Math.round((presentCount / attendanceData.length) * 100);
                setAttendancePercentage(percentage);
            } else {
                setAttendancePercentage(100);
            }

            // Fetch messages for specific child
            const messagesResponse = await api.get(`/parent/messages/${childId}`);
            setMessages(messagesResponse.data || []);

        } catch (error) {
            console.error('Error fetching child data:', error);
        } finally {
            setIsLoading(false);
        }
    };

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
                            className="bg-purple-600 hover:bg-purple-700"
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
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
                            className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(MODULE_TO_PATH['parent-messages'])}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-600 text-sm font-medium">Messages</p>
                                    <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
                                    <p className="text-xs text-gray-500 mt-1">Total Messages</p>
                                </div>
                                <MessageSquare className="w-8 h-8 text-purple-600" />
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleDownloadReport}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center space-x-2"
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
