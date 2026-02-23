
import React, { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import LoginPage from '@/components/auth/LoginPage';
import Dashboard from '@/components/dashboard/Dashboard';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StudentManagement from '@/components/students/StudentManagement';
import TeacherManagement from '@/components/teachers/TeacherManagement';
import AttendanceManagement from '@/components/attendance/AttendanceManagement';
import FeesManagement from '@/components/fees/FeesManagement';
import ParentOverview from '@/components/parent/ParentOverview';
import ParentAttendance from '@/components/parent/ParentAttendance';
import ParentFees from '@/components/parent/ParentFees';
import ParentMessages from '@/components/parent/ParentMessages';
import ParentAssignments from '@/components/parent/ParentAssignments';
import ParentStudyMaterials from '@/components/parent/ParentStudyMaterials';
import ParentCourseHandouts from '@/components/parent/ParentCourseHandouts';
import ParentAcademicDetails from '@/components/parent/ParentAcademicDetails';
import { ParentProvider } from '@/context/ParentContext';
import { NotificationProvider } from '@/context/NotificationContext';

import ParentManagement from '@/components/parents/ParentManagement';
import ParentRegistrationManagement from '@/components/admin/ParentRegistrationManagement';
import AnnouncementManagement from '@/components/announcements/AnnouncementManagement';
import Communications from '@/components/communications/Communications';
import TimetableManagement from '@/components/timetable/TimetableManagement';
import TeacherDashboard from '@/components/teacher/TeacherDashboard';
import MyClasses from '@/components/teacher/MyClasses';
import TeacherCourseHandouts from '@/components/teacher/TeacherCourseHandouts';
import CreateCourseHandout from '@/components/teacher/CreateCourseHandout';
import LearningResources from '@/components/teacher/LearningResources';
import Assignments from '@/components/teacher/Assignments';
import TeacherCommunications from '@/components/teacher/TeacherCommunications';
import TeacherProfile from '@/components/teacher/TeacherProfile';
import StudentPromotions from '@/components/teacher/StudentPromotions';
import AdminManagement from '@/components/superadmin/AdminManagement';
import SuperAdminDashboard from '@/components/superadmin/SuperAdminDashboard';
import SchoolManagement from '@/components/superadmin/SchoolManagement';
import GlobalAcademicSettings from '@/components/superadmin/GlobalAcademicSettings';
import GlobalFeeSettings from '@/components/superadmin/GlobalFeeSettings';
import SuperAdminAnnouncements from '@/components/superadmin/SuperAdminAnnouncements';
import SecurityAuditLogs from '@/components/superadmin/SecurityAuditLogs';
import SystemHealthBackup from '@/components/superadmin/SystemHealthBackup';
import SchoolProfile from '@/components/admin/SchoolProfile';
import AcademicsManagement from '@/components/admin/AcademicsManagement';
import NotificationManagement from '@/components/admin/NotificationManagement';
import ClassManagement from '@/components/classes/ClassManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const { toast } = useToast();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
      setIsAuthenticated(true);
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);
      if (parsedUser.role === 'teacher') {
        setActiveModule('teacher-dashboard');
      } else if (parsedUser.role === 'parent') {
        setActiveModule('parent-overview');
      } else if (parsedUser.role === 'superadmin') {
        setActiveModule('super-admin-dashboard');
      } else {
        setActiveModule('dashboard');
      }
    }
  }, []);

  // Idle Timer Implementation (30 minutes)
  useEffect(() => {
    let idleTimer;
    const TIMEOUT = 30 * 60 * 1000; // 30 minutes

    const resetTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (isAuthenticated) {
        idleTimer = setTimeout(() => {
          handleLogout();
          toast({
            variant: "destructive",
            title: "Session Expired",
            description: "You have been logged out due to inactivity for 30 minutes.",
          });
        }, TIMEOUT);
      }
    };

    // Events to track user activity
    const events = [
      'mousedown', 'mousemove', 'keypress',
      'scroll', 'touchstart', 'click'
    ];

    if (isAuthenticated) {
      events.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer(); // Start timer on initial auth
    }

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated]);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    toast({
      title: "Welcome back! 🎉",
      description: `Logged in as ${userData.name}`,
    });
    if (userData.role === 'teacher') {
      setActiveModule('teacher-dashboard');
    } else if (userData.role === 'parent') {
      setActiveModule('parent-overview');
    } else if (userData.role === 'superadmin') {
      setActiveModule('super-admin-dashboard');
    } else {
      setActiveModule('dashboard');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveModule('dashboard');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    toast({
      title: "Logged out successfully",
      description: "See you soon!",
    });
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} setActiveModule={setActiveModule} />;
      case 'super-admin-dashboard':
        return <SuperAdminDashboard currentUser={currentUser} />;
      case 'super-admin':
        return <AdminManagement currentUser={currentUser} />;
      case 'school-management':
        return <SchoolManagement currentUser={currentUser} />;
      case 'academic-settings':
        return <GlobalAcademicSettings currentUser={currentUser} />;
      case 'fee-settings':
        return <GlobalFeeSettings currentUser={currentUser} />;
      case 'super-announcements':
        return <SuperAdminAnnouncements currentUser={currentUser} />;
      case 'security-logs':
        return <SecurityAuditLogs currentUser={currentUser} />;
      case 'system-health':
        return <SystemHealthBackup currentUser={currentUser} />;
      case 'students':
        return <StudentManagement currentUser={currentUser} />;
      case 'teachers':
        return <TeacherManagement currentUser={currentUser} />;
      case 'parents':
        return <ParentManagement currentUser={currentUser} />;
      case 'parent-registrations':
        return <ParentRegistrationManagement currentUser={currentUser} />;
      case 'attendance':
        return <AttendanceManagement currentUser={currentUser} />;
      case 'fees':
        return <FeesManagement currentUser={currentUser} />;
      case 'announcements':
        return <AnnouncementManagement currentUser={currentUser} />;
      case 'notification-management':
        return <NotificationManagement currentUser={currentUser} />;
      case 'communications':
        return <Communications currentUser={currentUser} />;
      case 'timetable':
        return <TimetableManagement currentUser={currentUser} />;

      case 'school-profile':
        return <SchoolProfile />;
      case 'classes':
        return <ClassManagement />;
      case 'academics':
        return <AcademicsManagement />;
      case 'teacher-dashboard':
        return <TeacherDashboard setActiveTab={setActiveModule} />;
      case 'teacher-classes':
        return <MyClasses setActiveTab={setActiveModule} />;
      case 'teacher-course-handouts':
        return <TeacherCourseHandouts currentUser={currentUser} onCreateNew={() => setActiveModule('teacher-create-handout')} />;
      case 'teacher-create-handout':
        return <CreateCourseHandout currentUser={currentUser} onBack={() => setActiveModule('teacher-course-handouts')} onSuccess={() => setActiveModule('teacher-course-handouts')} />;
      case 'teacher-resources':
        return <LearningResources />;
      case 'teacher-assignments':
        return <Assignments currentUser={currentUser} />;
      case 'teacher-communications':
        return <TeacherCommunications currentUser={currentUser} />;
      case 'teacher-profile':
        return <TeacherProfile />;
      case 'teacher-promotions':
        return <StudentPromotions />;
      case 'parent-overview':
        return <ParentOverview currentUser={currentUser} setActiveTab={setActiveModule} />;
      case 'parent-attendance':
        return <ParentAttendance currentUser={currentUser} />;
      case 'parent-fees':
        return <ParentFees currentUser={currentUser} />;
      case 'parent-messages':
        return <ParentMessages currentUser={currentUser} />;
      case 'parent-assignments':
        return <ParentAssignments currentUser={currentUser} />;
      case 'parent-study-materials':
        return <ParentStudyMaterials currentUser={currentUser} />;
      case 'parent-course-handouts':
        return <ParentCourseHandouts currentUser={currentUser} />;
      case 'parent-academics':
        return <ParentAcademicDetails currentUser={currentUser} />;
      default:
        return <Dashboard currentUser={currentUser} setActiveModule={setActiveModule} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <HelmetProvider>
        <Helmet>
          <title>Login - SchoolSync</title>
          <meta name="description" content="Secure login to your playschool management dashboard" />
        </Helmet>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <Helmet>
        <title>SchoolSync</title>
        <meta name="description" content="Complete playschool management solution for administrators, teachers, and parents" />
      </Helmet>

      <NotificationProvider currentUser={currentUser}>
        <ParentProvider currentUser={currentUser}>
          <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar with AnimatePresence for mobile transitions */}
            <AnimatePresence mode="wait">
              {(sidebarOpen || (window.innerWidth >= 1024)) && (
                <Sidebar
                  activeModule={activeModule}
                  setActiveModule={setActiveModule}
                  currentUser={currentUser}
                  sidebarOpen={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                  onLogout={handleLogout}
                />
              )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col overflow-hidden w-full">
              <Header
                currentUser={currentUser}
                onLogout={handleLogout}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                sidebarOpen={sidebarOpen}
              />

              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 pb-20 sm:pb-6">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderActiveModule()}
                </motion.div>
              </main>
            </div>
          </div>
        </ParentProvider>
      </NotificationProvider>

      <Toaster />
    </HelmetProvider>
  );
}

export default App;
