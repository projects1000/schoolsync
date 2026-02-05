import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, MessageSquare, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import parentService from '@/services/parentService';
import api from '@/services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CourseProgressWidget from './CourseProgressWidget';

const ParentOverview = ({ currentUser, setActiveTab }) => {
    const { toast } = useToast();
    const [children, setChildren] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [attendance, setAttendance] = useState([]);
    const [messages, setMessages] = useState([]);
    const [attendancePercentage, setAttendancePercentage] = useState(100);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);

            // Fetch children
            const childrenData = await parentService.getMyChildren();
            setChildren(childrenData);

            if (childrenData.length > 0) {
                const firstChild = childrenData[0];

                // Fetch attendance for first child
                try {
                    const attendanceResponse = await api.get(`/parent/children/${firstChild.id}/attendance`);
                    const attendanceData = attendanceResponse.data || [];
                    setAttendance(attendanceData);

                    // Calculate attendance percentage
                    if (attendanceData.length > 0) {
                        const presentCount = attendanceData.filter(
                            a => a.status === 'PRESENT' || a.status === 'present'
                        ).length;
                        const percentage = Math.round((presentCount / attendanceData.length) * 100);
                        setAttendancePercentage(percentage);
                    }
                } catch (error) {
                    console.error('Error fetching attendance:', error);
                }

                // Fetch messages
                try {
                    const messagesResponse = await api.get('/parent/messages');
                    setMessages(messagesResponse.data || []);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load dashboard data",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const child = children[0];

    const handleDownloadReport = () => {
        const doc = new jsPDF();
        doc.text(`Progress Report - ${child?.name}`, 20, 20);

        const attendanceData = attendance.slice(0, 10).map(a => [
            a.date || new Date(a.attendanceDate).toLocaleDateString(),
            a.status,
            a.time || 'N/A'
        ]);

        doc.autoTable({
            head: [['Date', 'Status', 'Time']],
            body: attendanceData,
            startY: 40,
        });

        doc.save(`${child?.name}_report.pdf`);

        toast({
            title: "Report Downloaded",
            description: `Progress report for ${child?.name} has been downloaded.`,
        });
    };

    if (isLoading) {
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
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                        <p className="text-gray-600 mt-1">Track your child's progress and activities</p>
                    </div>
                    <Button
                        onClick={handleDownloadReport}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center space-x-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Download Report</span>
                    </Button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-600 text-sm font-medium">Child Name</p>
                            <p className="text-2xl font-bold text-gray-900">{child?.name}</p>
                        </div>
                        <User className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div
                    className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setActiveTab && setActiveTab('parent-attendance')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-600 text-sm font-medium">Attendance</p>
                            <p className="text-2xl font-bold text-gray-900">{attendancePercentage}%</p>
                        </div>
                        <Calendar className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div
                    className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setActiveTab && setActiveTab('parent-messages')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-600 text-sm font-medium">Messages</p>
                            <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
                        </div>
                        <MessageSquare className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
            </motion.div>

            {/* Course Progress Widget */}
            {child && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <CourseProgressWidget
                        studentId={child.id}
                        onViewAll={() => setActiveTab && setActiveTab('parent-course-handouts')}
                    />
                </motion.div>
            )}
        </div>
    );
};

export default ParentOverview;
