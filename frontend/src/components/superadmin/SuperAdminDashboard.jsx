import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    School,
    Users,
    GraduationCap,
    AlertTriangle,
    Activity,
    RefreshCw
} from 'lucide-react';

// Components
import GlobalKPICard from './GlobalKPICard';
import SchoolOnboardingChart from './charts/SchoolOnboardingChart';
import StudentGrowthChart from './charts/StudentGrowthChart';
import AttendanceTrendChart from './charts/AttendanceTrendChart';
import SchoolDistributionChart from './charts/SchoolDistributionChart';
import RecentSchoolsWidget from './widgets/RecentSchoolsWidget';
import ActiveAdminsWidget from './widgets/ActiveAdminsWidget';
import SystemAlertsWidget from './widgets/SystemAlertsWidget';
import PendingActionsWidget from './widgets/PendingActionsWidget';

import SuperAdminService from '../../services/superAdminService';

const SuperAdminDashboard = ({ currentUser }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchDashboardData = async () => {
        try {
            const response = await SuperAdminService.getDashboardData();
            if (response.data) {
                const data = response.data;
                console.log("Dashboard API Data:", data);

                // Transform Map to Array for SchoolDistributionChart
                const schoolDistArray = data.studentDistribution
                    ? Object.entries(data.studentDistribution).map(([name, count], index) => ({
                        id: index,
                        name: name,
                        students: count,
                        status: 'active' // Assuming active if they have students
                    }))
                    : [];

                // Transform StudentGrowth for chart (map totalStudents -> students)
                const studentGrowthData = data.studentGrowth
                    ? data.studentGrowth.map(g => ({
                        year: g.year,
                        students: g.totalStudents
                    }))
                    : [];

                // Transform RecentSchools (date -> joinDate)
                const recentSchoolsData = data.recentSchools
                    ? data.recentSchools.map(s => ({
                        ...s,
                        joinDate: s.date
                    }))
                    : [];

                setStats({
                    totalSchools: data.totalSchools || 0,
                    activeSchools: data.activeSchools || 0,
                    suspendedSchools: data.inactiveSchools || 0,
                    totalStudents: data.totalStudents || 0,
                    totalTeachers: data.totalTeachers || 0,

                    // Complex Data Objects
                    onboardingData: data.schoolGrowth || [],
                    studentGrowthData: studentGrowthData.length > 0 ? studentGrowthData : [{ year: new Date().getFullYear(), students: 0 }],
                    attendanceTrend: data.attendanceTrend || [],
                    schoolDistribution: schoolDistArray,

                    recentSchools: recentSchoolsData,
                    activeAdmins: data.activeAdmins || [],
                    systemAlerts: data.systemAlerts || [],
                    pendingActions: data.pendingActions || []
                });
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            // Optional: Set empty state or error state
        }
        setLastUpdated(new Date());
        setIsLoading(false);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleRefresh = () => {
        setIsLoading(true);
        fetchDashboardData();
    };

    if (isLoading || !stats) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const kpiCards = [
        {
            title: 'Total Schools',
            value: stats.totalSchools,
            change: '+2', // You might want to calculate this from historical data if available
            trend: 'up',
            icon: Building2,
            color: 'from-indigo-500 to-purple-600',
            subtitle: 'Registered on platform'
        },
        {
            title: 'Active Schools',
            value: stats.activeSchools,
            change: '+1',
            trend: 'up',
            icon: School,
            color: 'from-emerald-500 to-teal-500',
            subtitle: 'Currently operational'
        },
        {
            title: 'Inactive/Suspended',
            value: stats.suspendedSchools,
            change: '-1',
            trend: 'down',
            icon: AlertTriangle,
            color: 'from-rose-500 to-orange-500',
            subtitle: 'Require attention'
        },
        {
            title: 'Total Students',
            value: stats.totalStudents.toLocaleString(),
            change: '+12%',
            trend: 'up',
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            subtitle: 'Across all schools'
        },
        {
            title: 'Total Teachers',
            value: stats.totalTeachers,
            change: '+8%',
            trend: 'up',
            icon: GraduationCap,
            color: 'from-amber-500 to-yellow-500',
            subtitle: 'Teaching staff'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-900 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
            >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Super Admin Command Center</h1>
                            <p className="text-slate-300 text-sm mt-1">
                                Platform overview • {stats.activeSchools} schools online
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-xs text-slate-400">Last updated</p>
                            <p className="text-sm font-medium">{lastUpdated.toLocaleTimeString()}</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRefresh}
                            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {kpiCards.map((kpi, index) => (
                    <motion.div
                        key={kpi.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <GlobalKPICard {...kpi} />
                    </motion.div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <SchoolOnboardingChart data={stats.onboardingData} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <StudentGrowthChart data={stats.studentGrowthData} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <AttendanceTrendChart data={stats.attendanceTrend} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 }}
                >
                    <SchoolDistributionChart schools={stats.schoolDistribution} />
                </motion.div>
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <RecentSchoolsWidget schools={stats.recentSchools} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                >
                    <ActiveAdminsWidget admins={stats.activeAdmins} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <SystemAlertsWidget alerts={stats.systemAlerts} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                >
                    <PendingActionsWidget actions={stats.pendingActions} />
                </motion.div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
