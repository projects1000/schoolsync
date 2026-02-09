
import React from 'react';
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
  TrendingUp
} from 'lucide-react';

const Sidebar = ({ activeModule, setActiveModule, currentUser, onClose }) => {
  const menuItems = [
    { id: 'super-admin-dashboard', label: 'Command Center', icon: Crown, roles: ['superadmin'] },
    { id: 'school-management', label: 'School Management', icon: School, roles: ['superadmin'] },
    { id: 'super-admin', label: 'Admin Management', icon: Users, roles: ['superadmin'] },
    { id: 'academic-settings', label: 'Academic Settings', icon: BookOpen, roles: ['superadmin'] },
    { id: 'fee-settings', label: 'Fee Settings', icon: CreditCard, roles: ['superadmin'] },
    { id: 'super-announcements', label: 'Announcements', icon: MessageSquare, roles: ['superadmin'] },
    { id: 'security-logs', label: 'Security & Logs', icon: Shield, roles: ['superadmin'] },
    { id: 'system-health', label: 'System Health', icon: Activity, roles: ['superadmin'] },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { id: 'teacher-dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['teacher'] },
    { id: 'teacher-classes', label: 'My Classes', icon: GraduationCap, roles: ['teacher'] },
    { id: 'attendance', label: 'Attendance', icon: Calendar, roles: ['admin', 'teacher'] },
    { id: 'teacher-assignments', label: 'Assignments', icon: FileText, roles: ['teacher'] },
    { id: 'teacher-communications', label: 'Messages', icon: MessageSquare, roles: ['teacher'] },

    { id: 'teacher-course-handouts', label: 'Course Handouts', icon: FileText, roles: ['teacher'] },
    { id: 'teacher-resources', label: 'Resources', icon: BookOpen, roles: ['teacher'] },
    { id: 'teachers', label: 'Teachers', icon: UserCheck, roles: ['admin'] },
    { id: 'students', label: 'Students', icon: GraduationCap, roles: ['admin'] },
    { id: 'communications', label: 'Communication', icon: MessageSquare, roles: ['superadmin', 'admin'] },
    { id: 'parents', label: 'Parents', icon: Heart, roles: ['admin'] },
    { id: 'parent-registrations', label: 'Parent Registrations', icon: UserPlus, roles: ['admin'] },
    { id: 'school-profile', label: 'School Profile', icon: Building, roles: ['admin'] },
    { id: 'classes', label: 'Class Management', icon: Box, roles: ['admin'] },
    { id: 'academics', label: 'Academics', icon: GraduationCap, roles: ['admin'] },
    { id: 'fees', label: 'Fees & Billing', icon: CreditCard, roles: ['superadmin', 'admin'] },
    { id: 'timetable', label: 'Timetable', icon: BookOpen, roles: ['admin', 'teacher'] },
    { id: 'announcements', label: 'Announcements', icon: MessageSquare, roles: ['superadmin', 'admin'] },
    { id: 'parent-overview', label: 'Dashboard', icon: LayoutDashboard, roles: ['parent'] },
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
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-64 bg-white shadow-xl border-r border-gray-200 flex flex-col h-full relative"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Little Steps</h2>
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
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {currentUser?.name?.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm">{currentUser?.name}</p>
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
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${isActive
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center">
          <p className="text-xs text-gray-500">© 2025 Little Steps Playschool</p>
          <p className="text-xs text-gray-400">Management System v1.0</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
