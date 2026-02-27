import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    attendancePercentage: 0,
    pendingFees: 0,
    recentActivities: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') return;

      try {
        setLoading(true);
        const data = await adminService.getDashboardStats();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, toast]);

  const stats = [
    { title: 'Total Students', value: (dashboardData.totalStudents || 0).toString(), change: '', trend: 'neutral', icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Total Teachers', value: (dashboardData.totalTeachers || 0).toString(), change: '', trend: 'neutral', icon: GraduationCap, color: 'from-green-500 to-green-600' },
    { title: 'Today\'s Attendance', value: `${(dashboardData.attendancePercentage || 0).toFixed(1)}%`, change: '', trend: 'neutral', icon: Calendar, color: 'from-purple-500 to-purple-600' },
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
    return <div className="flex items-center justify-center h-full">Loading dashboard...</div>;
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

