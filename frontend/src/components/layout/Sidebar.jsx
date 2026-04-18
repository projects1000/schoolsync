
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  UserCheck,

  School,
  Heart,
  MessageSquare,
  FileText,
  X,
  LogOut,
  BookOpen,
  UserPlus,
  Crown,
  Shield,
  Activity,
  UserCog,
  Database,
  Building,
  Box,
  User,
  TrendingUp,
  Bell,
  ArrowUpCircle,
  Trash2
} from 'lucide-react';
import { MODULE_TO_PATH } from '@/routeConfig';

const Sidebar = ({ activeModule, currentUser, onClose, sidebarOpen, onLogout }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'super-admin-dashboard', label: 'Command Center', icon: Crown, roles: ['superadmin'] },
    { id: 'school-management', label: 'School Management', icon: School, roles: ['superadmin'] },
    { id: 'super-admin', label: 'Admin Management', icon: Users, roles: ['superadmin'] },
    { id: 'academic-settings', label: 'Academic Settings', icon: BookOpen, roles: ['superadmin'] },
    { id: 'fee-settings', label: 'Fee Settings', icon: CreditCard, roles: ['superadmin'] },
    { id: 'security-logs', label: 'Security & Logs', icon: Shield, roles: ['superadmin'] },
    { id: 'system-health', label: 'System Health', icon: Activity, roles: ['superadmin'] },
    { id: 'superadmin-trash', label: 'Trash', icon: Trash2, roles: ['superadmin'] },
    { id: 'superadmin-communications', label: 'Communication', icon: MessageSquare, roles: ['superadmin'] },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { id: 'teacher-dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['teacher'] },
    { id: 'teacher-classes', label: 'My Classes', icon: GraduationCap, roles: ['teacher'] },
    { id: 'attendance', label: 'Attendance', icon: Calendar, roles: ['admin', 'teacher'] },
    { id: 'teacher-assignments', label: 'Assignments', icon: FileText, roles: ['teacher'] },
    { id: 'teacher-communications', label: 'Messages', icon: MessageSquare, roles: ['teacher'] },

    { id: 'teacher-course-handouts', label: 'Course Handouts', icon: FileText, roles: ['teacher'] },
    { id: 'teacher-resources', label: 'Resources', icon: BookOpen, roles: ['teacher'] },
    { id: 'teacher-promotions', label: 'Promotions', icon: ArrowUpCircle, roles: ['teacher'] },
    { id: 'teachers', label: 'Teachers', icon: UserCheck, roles: ['admin'] },
    { id: 'students', label: 'Students', icon: GraduationCap, roles: ['admin'] },
    { id: 'communications', label: 'Communication', icon: MessageSquare, roles: ['admin'] },
    { id: 'parents', label: 'Parents', icon: Heart, roles: ['admin'] },

    { id: 'school-profile', label: 'School Profile', icon: Building, roles: ['admin'] },
    { id: 'classes', label: 'Class Management', icon: Box, roles: ['admin'] },
    { id: 'academics', label: 'Academics', icon: GraduationCap, roles: ['admin'] },
    { id: 'fees', label: 'Fees & Billing', icon: CreditCard, roles: ['superadmin', 'admin'] },
    { id: 'timetable', label: 'Timetable', icon: BookOpen, roles: ['admin', 'teacher'] },
    { id: 'notification-management', label: 'Notifications', icon: Bell, roles: ['superadmin', 'admin'] },
    { id: 'admin-trash', label: 'Trash', icon: Trash2, roles: ['admin'] },
    { id: 'parent-overview', label: 'Dashboard', icon: LayoutDashboard, roles: ['parent'] },
    { id: 'parent-student-profile', label: 'Student Profile', icon: User, roles: ['parent'] },
    { id: 'parent-academics', label: 'Academic Details', icon: GraduationCap, roles: ['parent'] },
    { id: 'parent-attendance', label: 'Attendance', icon: Calendar, roles: ['parent'] },
    { id: 'parent-messages', label: 'Messages', icon: MessageSquare, roles: ['parent'] },
    { id: 'parent-assignments', label: 'Assignments', icon: FileText, roles: ['parent'] },
    { id: 'parent-study-materials', label: 'Study Materials', icon: BookOpen, roles: ['parent'] },
    { id: 'parent-course-handouts', label: 'Course Progress', icon: TrendingUp, roles: ['parent'] },
    { id: 'parent-fees', label: 'Fees', icon: CreditCard, roles: ['parent'] },
    { id: 'teacher-profile', label: 'My Profile', icon: User, roles: ['teacher'] }
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(currentUser?.role)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        exit={{ x: -300 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 flex flex-col h-full transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">SchoolSync</h2>
                <p className="text-white/80 text-xs">Playschool</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {currentUser?.name?.charAt(0)}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-gray-800 text-sm truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  navigate(MODULE_TO_PATH[item.id]);
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span className="font-medium truncate">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
          {/* Logout button for mobile sidebar */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="lg:hidden w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}
          <div className="text-center">
            <p className="text-xs text-gray-500">© 2026 SchoolSync</p>
            <p className="text-xs text-gray-400">Management System v1.0</p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
