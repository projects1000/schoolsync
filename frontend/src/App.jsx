
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
import Settings from '@/components/settings/Settings';
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
import AdminManagement from '@/components/superadmin/AdminManagement';
import SuperAdminDashboard from '@/components/superadmin/SuperAdminDashboard';
import SchoolManagement from '@/components/superadmin/SchoolManagement';
import GlobalAcademicSettings from '@/components/superadmin/GlobalAcademicSettings';
import GlobalFeeSettings from '@/components/superadmin/GlobalFeeSettings';
import SuperAdminAnnouncements from '@/components/superadmin/SuperAdminAnnouncements';
import SecurityAuditLogs from '@/components/superadmin/SecurityAuditLogs';
import SystemHealthBackup from '@/components/superadmin/SystemHealthBackup';
import SchoolProfile from '@/components/admin/SchoolProfile';
import ClassManagement from '@/components/classes/ClassManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();

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
      case 'communications':
        return <Communications currentUser={currentUser} />;
      case 'timetable':
        return <TimetableManagement currentUser={currentUser} />;
      case 'settings':
        return <Settings currentUser={currentUser} />;
      case 'school-profile':
        return <SchoolProfile />;
      case 'classes':
        return <ClassManagement />;
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
      default:
        return <Dashboard currentUser={currentUser} setActiveModule={setActiveModule} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <HelmetProvider>
        <Helmet>
          <title>Login - Little Steps Playschool</title>
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
        <title>Little Steps Playschool</title>
        <meta name="description" content="Complete playschool management solution for administrators, teachers, and parents" />
      </Helmet>

      <div className="flex h-screen bg-gray-50">
        <AnimatePresence>
          {sidebarOpen && (
            <Sidebar
              activeModule={activeModule}
              setActiveModule={setActiveModule}
              currentUser={currentUser}
              onClose={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            currentUser={currentUser}
            onLogout={handleLogout}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
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

      <Toaster />
    </HelmetProvider>
  );
}

export default App;
