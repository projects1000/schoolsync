import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Loader2, Users, Calendar, BookOpen, FileText, Shield } from 'lucide-react';
import { MODULE_TO_PATH } from '@/routeConfig';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [roleInfo, setRoleInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem('authToken');
                // Ensure we handle the case where token might be missing or expired
                if (!token) {
                    setError("Not authenticated");
                    setLoading(false);
                    return;
                }

                // Fetch dashboard data and role info in parallel
                const [dashboardResponse, roleInfoResponse] = await Promise.all([
                    api.get('/teacher/dashboard'),
                    api.get('/teacher/role-info')
                ]);
                setDashboardData(dashboardResponse.data);
                setRoleInfo(roleInfoResponse.data);
            } catch (err) {
                console.error("Error fetching dashboard:", err);
                // Fallback for demo if backend is not reachable immediately
                setError("Failed to load dashboard data. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <div className="h-7 bg-gray-200 rounded w-64 mb-2" />
                        <div className="h-4 bg-gray-100 rounded w-40" />
                    </div>
                    <div className="flex gap-3 mt-4 md:mt-0">
                        <div className="h-9 bg-gray-200 rounded-full w-36" />
                        <div className="h-9 bg-gray-200 rounded-full w-36" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="border p-5 rounded-xl flex items-center space-x-4 bg-gray-50">
                        <div className="p-3 bg-gray-200 rounded-full w-12 h-12" />
                        <div>
                            <div className="h-4 bg-gray-200 rounded w-20 mb-1" />
                            <div className="h-5 bg-gray-300 rounded w-16" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="h-5 bg-gray-200 rounded w-44 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                            <div className="h-5 bg-gray-200 rounded w-24 mb-2" />
                            <div className="h-4 bg-gray-100 rounded w-32 mb-2" />
                            <div className="h-4 bg-gray-100 rounded w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
            <p className="font-semibold">Error loading dashboard</p>
            <p>{error}</p>
        </div>
    );

    if (!dashboardData) return null;

    const isClassTeacher = roleInfo?.classTeacher === true;

    return (
        <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Welcome, {dashboardData.teacherName || 'Teacher'}!</h2>
                        <p className="text-gray-500 mt-1">{dashboardData.schoolName || 'Little Steps Playschool'}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                        <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-100">
                            Department: {dashboardData.department || 'General'}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium border border-emerald-100">
                            {dashboardData.assignedClassesCount || 0} Classes Assigned
                        </span>
                        {isClassTeacher && (
                            <span className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium border border-green-100 flex items-center gap-1">
                                <Shield className="w-4 h-4" /> Class Teacher: {roleInfo.classTeacherOfClassName}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats / Links */}
            <div className={`grid grid-cols-1 ${isClassTeacher ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
                <QuickLinkCard
                    icon={Users}
                    title="My Students"
                    count="View All"
                    color="blue"
                    onClick={() => navigate(MODULE_TO_PATH['teacher-classes'])}
                />
                {isClassTeacher && (
                    <QuickLinkCard
                        icon={Calendar}
                        title="Attendance"
                        count="Mark Now"
                        color="green"
                        onClick={() => navigate(MODULE_TO_PATH['attendance'])}
                    />
                )}
                <QuickLinkCard
                    icon={FileText}
                    title="Assignments"
                    count="Manage"
                    color="orange"
                    onClick={() => navigate(MODULE_TO_PATH['teacher-assignments'])}
                />
                <QuickLinkCard
                    icon={BookOpen}
                    title="Communications"
                    count="Inbox"
                    color="teal"
                    onClick={() => navigate(MODULE_TO_PATH['teacher-communications'])}
                />
            </div>

            {/* Assigned Classes List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">My Assigned Classes</h3>
                    <span className="text-sm text-gray-500">{dashboardData.assignedClasses?.length || 0} Total</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardData.assignedClasses && dashboardData.assignedClasses.map((cls, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-2">
                                <p className="font-bold text-gray-800 text-lg">{cls.name}</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${cls.role === 'Class Teacher' ? 'bg-green-100 text-green-700' : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                    {cls.role}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">{cls.grade} • Section {cls.section}</p>
                            {cls.subject && (
                                <p className="text-sm text-emerald-600 mt-1 font-medium">📚 {cls.subject}</p>
                            )}
                        </div>
                    ))}
                    {(!dashboardData.assignedClasses || dashboardData.assignedClasses.length === 0) && (
                        <div className="col-span-full py-8 text-center text-gray-500 italic">
                            No classes currently assigned to you.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const QuickLinkCard = ({ icon: Icon, title, count, color, onClick }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100",
        green: "bg-green-50 text-green-600 border-green-100 hover:bg-green-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100",
        teal: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
    };

    return (
        <div onClick={onClick} className={`${colors[color]} border p-5 rounded-xl cursor-pointer transition-all flex items-center space-x-4`}>
            <div className="p-3 bg-white rounded-full shadow-sm bg-opacity-80">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium opacity-80">{title}</p>
                <p className="text-lg font-bold">{count}</p>
            </div>
        </div>
    );
};

export default TeacherDashboard;
