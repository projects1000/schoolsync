import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const dashboardQuery = useQuery({
        queryKey: ['superadmin', 'dashboard'],
        queryFn: async () => {
            const response = await SuperAdminService.getDashboardData();
            const data = response.data || {};

            const schoolDistArray = data.studentDistribution
                ? Object.entries(data.studentDistribution).map(([name, count], index) => ({
                    id: index,
                    name: name,
                    students: count,
                    status: 'active'
                }))
                : [];

            const studentGrowthData = data.studentGrowth
                ? data.studentGrowth.map(g => ({
                    year: g.year,
                    students: g.totalStudents
                }))
                : [];

            const recentSchoolsData = data.recentSchools
                ? data.recentSchools.map(s => ({
                    ...s,
                    joinDate: s.date
                }))
                : [];

            return {
                totalSchools: data.totalSchools || 0,
                activeSchools: data.activeSchools || 0,
                suspendedSchools: data.inactiveSchools || 0,
                totalStudents: data.totalStudents || 0,
                totalTeachers: data.totalTeachers || 0,
                onboardingData: data.schoolGrowth || [],
                studentGrowthData: studentGrowthData.length > 0 ? studentGrowthData : [{ year: new Date().getFullYear(), students: 0 }],
                attendanceTrend: data.attendanceTrend || [],
                schoolDistribution: schoolDistArray,
                recentSchools: recentSchoolsData,
                activeAdmins: data.activeAdmins || [],
                systemAlerts: data.systemAlerts || [],
                pendingActions: data.pendingActions || []
            };
        },
        staleTime: 1000 * 60,
    });

    useEffect(() => {
        if (!dashboardQuery.data && !dashboardQuery.error) return;
        setLastUpdated(new Date());
    }, [dashboardQuery.data, dashboardQuery.error]);

    const isLoading = dashboardQuery.isLoading || dashboardQuery.isFetching;
    const stats = dashboardQuery.data;
    const error = dashboardQuery.error?.message || null;

    const handleRefresh = () => {
        dashboardQuery.refetch();
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl p-6 h-28" />

                {/* KPI Cards Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                                <div className="w-12 h-4 bg-gray-100 rounded" />
                            </div>
                            <div className="h-7 bg-gray-200 rounded w-1/2 mb-2" />
                            <div className="h-3 bg-gray-100 rounded w-2/3" />
                        </div>
                    ))}
                </div>

                {/* Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
                            <div className="h-48 bg-gray-100 rounded-lg" />
                        </div>
                    ))}
                </div>

                {/* Widgets Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <div className="h-5 bg-gray-200 rounded w-1/2 mb-4" />
                            <div className="space-y-3">
                                {[1, 2, 3].map(j => (
                                    <div key={j} className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full" />
                                        <div className="flex-1">
                                            <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
                                            <div className="h-2 bg-gray-100 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const kpiCards = [
        {
            title: 'Total Schools',
            value: stats.totalSchools,
            change: '+2', // You might want to calculate this from historical data if available
            trend: 'up',
            icon: Building2,
            color: 'from-emerald-500 to-emerald-600',
            subtitle: 'Registered on platform'
        },
        {
            title: 'Active Schools',
            value: stats.activeSchools,
            change: '+1',
            trend: 'up',
            icon: School,
            color: 'from-emerald-500 to-emerald-500',
            subtitle: 'Currently operational'
        },
        {
            title: 'Inactive/Suspended',
            value: stats.suspendedSchools,
            change: '-1',
            trend: 'down',
            icon: AlertTriangle,
            color: 'from-orange-500 to-orange-500',
            subtitle: 'Require attention'
        },
        {
            title: 'Total Students',
            value: stats.totalStudents.toLocaleString(),
            change: '+12%',
            trend: 'up',
            icon: Users,
            color: 'from-blue-500 to-green-500',
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
                className="bg-gradient-to-r from-slate-800 via-slate-900 to-emerald-900 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
            >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
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
