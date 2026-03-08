
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import ParentStudentProfile from '@/components/parent/ParentStudentProfile';
import { ParentProvider } from '@/context/ParentContext';
import { NotificationProvider } from '@/context/NotificationContext';

import ParentManagement from '@/components/parents/ParentManagement';
import ParentRegistrationManagement from '@/components/admin/ParentRegistrationManagement';
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
import SecurityAuditLogs from '@/components/superadmin/SecurityAuditLogs';
import SystemHealthBackup from '@/components/superadmin/SystemHealthBackup';
import TrashManagement from '@/components/superadmin/TrashManagement';
import SchoolProfile from '@/components/admin/SchoolProfile';
import AcademicsManagement from '@/components/admin/AcademicsManagement';
import NotificationManagement from '@/components/admin/NotificationManagement';
import ClassManagement from '@/components/classes/ClassManagement';
import { getDefaultPath, PATH_TO_MODULE } from '@/routeConfig';
import AdminTrashManagement from '@/components/admin/AdminTrashManagement';
// Animated page wrapper to preserve the existing page transition effect
const AnimatedPage = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Layout wrapper that provides Sidebar + Header + Providers (replaces the old authenticated JSX)
const AuthenticatedLayout = ({ currentUser, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const location = useLocation();

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

  // Derive activeModule from URL for the sidebar highlight
  const activeModule = PATH_TO_MODULE[location.pathname] || '';

  return (
    <NotificationProvider currentUser={currentUser}>
      <ParentProvider currentUser={currentUser}>
        <div className="flex h-screen bg-gray-50 overflow-hidden">
          {/* Sidebar with AnimatePresence for mobile transitions */}
          <AnimatePresence mode="wait">
            {(sidebarOpen || (window.innerWidth >= 1024)) && (
              <Sidebar
                activeModule={activeModule}
                currentUser={currentUser}
                sidebarOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onLogout={onLogout}
              />
            )}
          </AnimatePresence>

          <div className="flex-1 flex flex-col overflow-hidden w-full">
            <Header
              currentUser={currentUser}
              onLogout={onLogout}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              sidebarOpen={sidebarOpen}
            />

            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 pb-20 sm:pb-6">
              <AnimatedPage>
                <Routes>
                  {/* Super Admin Routes */}
                  <Route path="/superadmin" element={<SuperAdminDashboard currentUser={currentUser} />} />
                  <Route path="/superadmin/admins" element={<AdminManagement currentUser={currentUser} />} />
                  <Route path="/superadmin/schools" element={<SchoolManagement currentUser={currentUser} />} />
                  <Route path="/superadmin/academics" element={<GlobalAcademicSettings currentUser={currentUser} />} />
                  <Route path="/superadmin/fees" element={<GlobalFeeSettings currentUser={currentUser} />} />
                  <Route path="/superadmin/security" element={<SecurityAuditLogs currentUser={currentUser} />} />
                  <Route path="/superadmin/system-health" element={<SystemHealthBackup currentUser={currentUser} />} />
                  <Route path="/superadmin/trash" element={<TrashManagement currentUser={currentUser} />} />

                  {/* Admin Routes */}
                  <Route path="/dashboard" element={<Dashboard currentUser={currentUser} />} />
                  <Route path="/students" element={<StudentManagement currentUser={currentUser} />} />
                  <Route path="/teachers" element={<TeacherManagement currentUser={currentUser} />} />
                  <Route path="/parents" element={<ParentManagement currentUser={currentUser} />} />
                  <Route path="/parent-registrations" element={<ParentRegistrationManagement currentUser={currentUser} />} />
                  <Route path="/attendance" element={<AttendanceManagement currentUser={currentUser} />} />
                  <Route path="/fees" element={<FeesManagement currentUser={currentUser} />} />
                  <Route path="/notifications" element={<NotificationManagement currentUser={currentUser} />} />
                  <Route path="/communications" element={<Communications currentUser={currentUser} />} />
                  <Route path="/timetable" element={<TimetableManagement currentUser={currentUser} />} />
                  <Route path="/school-profile" element={<SchoolProfile />} />
                  <Route path="/classes" element={<ClassManagement />} />
                  <Route path="/academics" element={<AcademicsManagement />} />
                  <Route path="/trash" element={<AdminTrashManagement currentUser={currentUser} />} />

                  {/* Teacher Routes */}
                  <Route path="/teacher" element={<TeacherDashboard />} />
                  <Route path="/teacher/classes" element={<MyClasses />} />
                  <Route path="/teacher/course-handouts" element={<TeacherCourseHandouts currentUser={currentUser} />} />
                  <Route path="/teacher/create-handout" element={<CreateCourseHandout currentUser={currentUser} />} />
                  <Route path="/teacher/resources" element={<LearningResources />} />
                  <Route path="/teacher/assignments" element={<Assignments currentUser={currentUser} />} />
                  <Route path="/teacher/communications" element={<TeacherCommunications currentUser={currentUser} />} />
                  <Route path="/teacher/profile" element={<TeacherProfile />} />
                  <Route path="/teacher/promotions" element={<StudentPromotions />} />

                  {/* Parent Routes */}
                  <Route path="/parent" element={<ParentOverview currentUser={currentUser} />} />
                  <Route path="/parent/profile" element={<ParentStudentProfile currentUser={currentUser} />} />
                  <Route path="/parent/academics" element={<ParentAcademicDetails currentUser={currentUser} />} />
                  <Route path="/parent/attendance" element={<ParentAttendance currentUser={currentUser} />} />
                  <Route path="/parent/messages" element={<ParentMessages currentUser={currentUser} />} />
                  <Route path="/parent/assignments" element={<ParentAssignments currentUser={currentUser} />} />
                  <Route path="/parent/study-materials" element={<ParentStudyMaterials currentUser={currentUser} />} />
                  <Route path="/parent/course-handouts" element={<ParentCourseHandouts currentUser={currentUser} />} />
                  <Route path="/parent/fees" element={<ParentFees currentUser={currentUser} />} />

                  {/* Catch-all: redirect to role-specific default */}
                  <Route path="*" element={<Navigate to={getDefaultPath(currentUser?.role)} replace />} />
                </Routes>
              </AnimatedPage>
            </main>
          </div>
        </div>
      </ParentProvider>
    </NotificationProvider>
  );
};

function AppInner() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
      // Decode JWT to check if it's expired (without needing a backend call)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          return; // Stay on login page
        }
        setIsAuthenticated(true);
        setCurrentUser(JSON.parse(user));
      } catch (e) {
        // Invalid token format — clear and show login
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
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
    navigate(getDefaultPath(userData.role));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    toast({
      title: "Logged out successfully",
      description: "See you soon!",
    });
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={
          <>
            <Helmet>
              <title>Login - SchoolSync</title>
              <meta name="description" content="Secure login to your playschool management dashboard" />
            </Helmet>
            <LoginPage onLogin={handleLogin} />
          </>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Helmet>
        <title>SchoolSync</title>
        <meta name="description" content="Complete playschool management solution for administrators, teachers, and parents" />
      </Helmet>
      <AuthenticatedLayout currentUser={currentUser} onLogout={handleLogout} />
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppInner />
        <Toaster />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
