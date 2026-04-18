import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Human-readable labels for every route path in the application.
 * Nested paths inherit parent segments automatically.
 */
const PATH_LABELS = {
  // Super Admin
  '/superadmin': 'Command Center',
  '/superadmin/schools': 'School Management',
  '/superadmin/admins': 'Admin Management',
  '/superadmin/academics': 'Academic Settings',
  '/superadmin/fees': 'Fee Settings',
  '/superadmin/announcements': 'Announcements',
  '/superadmin/security': 'Security & Logs',
  '/superadmin/system-health': 'System Health',
  '/superadmin/trash': 'Trash',
  '/superadmin/communications': 'Communication',

  // Admin (flat routes under /)
  '/dashboard': 'Dashboard',
  '/students': 'Students',
  '/teachers': 'Teachers',
  '/parents': 'Parents',
  '/parent-registrations': 'Parent Registrations',
  '/attendance': 'Attendance',
  '/fees': 'Fees & Billing',
  '/notifications': 'Notifications',
  '/communications': 'Communication',
  '/timetable': 'Timetable',
  '/school-profile': 'School Profile',
  '/classes': 'Class Management',
  '/academics': 'Academics',
  '/trash': 'Trash',

  // Teacher portal (/teacher and /teacher/*)
  '/teacher': 'Dashboard',
  '/teacher/classes': 'My Classes',
  '/teacher/course-handouts': 'Course Handouts',
  '/teacher/create-handout': 'Create Handout',
  '/teacher/resources': 'Resources',
  '/teacher/assignments': 'Assignments',
  '/teacher/communications': 'Messages',
  '/teacher/profile': 'My Profile',
  '/teacher/promotions': 'Promotions',

  // Parent portal (/parent and /parent/*)
  '/parent': 'Dashboard',
  '/parent/profile': 'Student Profile',
  '/parent/academics': 'Academic Details',
  '/parent/attendance': 'Attendance',
  '/parent/messages': 'Messages',
  '/parent/assignments': 'Assignments',
  '/parent/study-materials': 'Study Materials',
  '/parent/course-handouts': 'Course Progress',
  '/parent/fees': 'Fees',
};

/**
 * Checks whether the pathname belongs to the Teacher portal.
 * Exact match on "/teacher" or starts with "/teacher/".
 * This avoids false positives like "/teachers" (admin route).
 */
function isTeacherPortal(pathname) {
  return pathname === '/teacher' || pathname.startsWith('/teacher/');
}

/**
 * Checks whether the pathname belongs to the Parent portal.
 * Exact match on "/parent" or starts with "/parent/".
 * This avoids false positives like "/parents" or "/parent-registrations".
 */
function isParentPortal(pathname) {
  return pathname === '/parent' || pathname.startsWith('/parent/');
}

/**
 * Checks whether the pathname belongs to the SuperAdmin area.
 */
function isSuperAdminArea(pathname) {
  return pathname.startsWith('/superadmin');
}

/**
 * Returns true if the path is a nested portal route (teacher/parent/superadmin).
 * Admin flat routes like /students, /teachers, /parents return false.
 */
function isNestedPortalRoute(pathname) {
  return isSuperAdminArea(pathname) || isTeacherPortal(pathname) || isParentPortal(pathname);
}

/**
 * Maps the base path segment to the role's home route for the "Home" breadcrumb.
 */
function getRoleHome(pathname) {
  if (isSuperAdminArea(pathname)) return '/superadmin';
  if (isTeacherPortal(pathname)) return '/teacher';
  if (isParentPortal(pathname)) return '/parent';
  return '/dashboard';
}

/**
 * Maps the base path segment to a human-readable role section name.
 */
function getRoleSectionLabel(pathname) {
  if (isSuperAdminArea(pathname)) return 'Super Admin';
  if (isTeacherPortal(pathname)) return 'Teacher Portal';
  if (isParentPortal(pathname)) return 'Parent Portal';
  return 'Admin';
}

/**
 * Builds breadcrumb segments from the current path.
 *
 * For admin flat route like /teachers:
 *   [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Teachers', path: '/teachers', current: true }]
 *
 * For nested portal route like /superadmin/schools:
 *   [{ label: 'Command Center', path: '/superadmin' }, { label: 'School Management', path: '/superadmin/schools', current: true }]
 */
function buildBreadcrumbs(pathname) {
  const crumbs = [];

  // Admin flat routes: /students, /teachers, /parents, /fees, etc.
  if (!isNestedPortalRoute(pathname)) {
    // Always add Dashboard as a parent link (even when on Dashboard itself)
    crumbs.push({
      label: 'Dashboard',
      path: '/dashboard',
      current: pathname === '/dashboard',
    });

    // Add current page if it's not the dashboard
    if (pathname !== '/dashboard') {
      const label = PATH_LABELS[pathname];
      if (label) {
        crumbs.push({ label, path: pathname, current: true });
      } else {
        // Unknown route — show the path segment as fallback
        const segment = pathname.split('/').filter(Boolean).pop();
        if (segment) {
          crumbs.push({
            label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
            path: pathname,
            current: true,
          });
        }
      }
    }
    return crumbs;
  }

  // Nested portal routes: /superadmin/*, /teacher/*, /parent/*
  const segments = pathname.split('/').filter(Boolean);
  let builtPath = '';

  segments.forEach((segment, index) => {
    builtPath += `/${segment}`;
    const label = PATH_LABELS[builtPath];
    if (label) {
      crumbs.push({
        label,
        path: builtPath,
        current: index === segments.length - 1,
      });
    } else {
      // Unmapped segment (e.g., dynamic ID)
      const isId = segment.length > 18 || !isNaN(segment) || /^[0-9a-fA-F-]+$/.test(segment);
      crumbs.push({
        label: isId ? 'Details' : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        path: builtPath,
        current: index === segments.length - 1,
      });
    }
  });

  // If we only got the root portal crumb (e.g. /teacher → Dashboard),
  // still include it so breadcrumbs always appear
  return crumbs;
}

const Breadcrumbs = () => {
  const location = useLocation();
  const crumbs = buildBreadcrumbs(location.pathname);
  const roleSection = getRoleSectionLabel(location.pathname);

  // If no crumbs could be built at all, don't render
  if (crumbs.length === 0) return null;

  return (
    <motion.nav
      key={location.pathname}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.05 }}
      aria-label="Breadcrumb"
      className="bg-white/60 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-2"
    >
      <ol className="flex items-center gap-1 sm:gap-1.5 text-sm overflow-x-auto scrollbar-hide">
        {/* Home icon — always visible */}
        <li className="flex items-center shrink-0">
          <Link
            to={getRoleHome(location.pathname)}
            className="flex items-center gap-1 sm:gap-1.5 text-gray-400 hover:text-emerald-600 transition-colors duration-200 group"
            title={`${roleSection} Home`}
          >
            <Home className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-xs font-medium">{roleSection}</span>
          </Link>
        </li>

        {crumbs.map((crumb) => (
          <li key={crumb.path} className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            {crumb.current ? (
              <span className="text-xs font-semibold text-gray-800 truncate max-w-[180px] sm:max-w-[200px]">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-xs font-medium text-gray-400 hover:text-emerald-600 transition-colors duration-200 truncate max-w-[140px] sm:max-w-[160px]"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </motion.nav>
  );
};

export default Breadcrumbs;
