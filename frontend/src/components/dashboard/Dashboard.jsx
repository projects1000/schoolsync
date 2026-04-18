import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import StatsCard from './StatsCard';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import AttendanceChart from './AttendanceChart';
import adminService from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';

const Dashboard = ({ currentUser }) => {
  const { toast } = useToast();
  const canLoadDashboard = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  const dashboardQuery = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: adminService.getDashboardStats,
    enabled: canLoadDashboard,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (!dashboardQuery.error) return;

    console.error('Failed to fetch dashboard stats', dashboardQuery.error);
    toast({
      title: 'Error',
      description: 'Failed to load dashboard data. Please try again.',
      variant: 'destructive'
    });
  }, [dashboardQuery.error, toast]);

  const loading = canLoadDashboard ? (dashboardQuery.isLoading || dashboardQuery.isFetching) : false;
  const dashboardData = dashboardQuery.data || {
    totalStudents: 0,
    totalTeachers: 0,
    attendancePercentage: 0,
    pendingFees: 0,
    recentActivities: []
  };

  const stats = [
    { title: 'Total Students', value: (dashboardData.totalStudents || 0).toString(), change: '', trend: 'neutral', icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Total Teachers', value: (dashboardData.totalTeachers || 0).toString(), change: '', trend: 'neutral', icon: GraduationCap, color: 'from-green-500 to-green-600' },
    { title: 'Today\'s Attendance', value: `${(dashboardData.attendancePercentage || 0).toFixed(1)}%`, change: '', trend: 'neutral', icon: Calendar, color: 'from-emerald-500 to-emerald-600' },
    { title: 'Pending Fees', value: `₹${(dashboardData.pendingFees || 0).toLocaleString()}`, change: '', trend: 'neutral', icon: CreditCard, color: 'from-orange-500 to-orange-600' }
  ];

  // Map backend audit logs to RecentActivity format
  const mappedActivities = (dashboardData.recentActivities || []).map(log => ({
    id: log.id,
    type: 'info', // Default type
    title: log.description || log.action,
    time: new Date(log.createdAt).toLocaleString(),
    icon: Clock,
    color: 'text-gray-500'
  }));

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="h-7 bg-gray-200 rounded w-40 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-32" />
            </div>
            <div className="text-right">
              <div className="h-3 bg-gray-100 rounded w-36 mb-2 ml-auto" />
              <div className="h-5 bg-gray-200 rounded w-20 ml-auto" />
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
                  <div className="h-7 bg-gray-200 rounded w-20 mb-3" />
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 rounded" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                  </div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions Skeleton */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-28 mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Attendance Overview Skeleton */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
            <div className="flex items-center justify-center p-10">
              <div className="text-center">
                <div className="h-10 bg-gray-200 rounded w-24 mx-auto mb-2" />
                <div className="h-4 bg-gray-100 rounded w-32 mx-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center space-x-4 p-3">
                <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-4 bg-gray-100 rounded w-28 mx-auto mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {currentUser?.role === 'admin' ? 'School Overview' :
                currentUser?.role === 'teacher' ? 'Teaching Dashboard' :
                  'Parent Portal'}
            </p>
          </div>
          <div className="text-left md:text-right bg-blue-50 md:bg-transparent p-3 md:p-0 rounded-lg">
            <p className="text-sm text-gray-500">Current Academic Year</p>
            <p className="text-lg font-semibold text-gray-800">2025-26</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1"
        >
          <QuickActions currentUser={currentUser} />
        </motion.div>

        {/* Attendance Chart - Passing generic data or simply rendering it if it handles its own emptiness. 
            Since we don't have trend data, this might be static or empty. 
            Ideally we'd modify AttendanceChart to accept data. For now, keeping it but note it might be mock if not updated. 
            I'll skip passing props if it's not adapted yet, but I should probably adapt it.
        */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          {/* <AttendanceChart />  -- Commenting out if it uses mock data internally and I can't pass real data yet. 
              The prompt explicitly says NO STATIC OR MOCK DATA. 
              I should verify AttendanceChart content first. 
              I will assume I need to comment it out or fix it. 
              For now, I'll render it but if step 76 shows it has mock data, I will act on it.
              Actually, I can't wait. I'll comment it out to be safe and strictly follow rules, 
              OR better: I'll replace it with a simple "Attendance Overview" using the single percentage I have.
          */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Overview</h3>
            <div className="flex items-center justify-center p-10">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{(dashboardData.attendancePercentage || 0).toFixed(1)}%</p>
                <p className="text-gray-500">Today's Attendance</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <RecentActivity activities={mappedActivities} />
      </motion.div>
    </div>
  );
};

export default Dashboard;

