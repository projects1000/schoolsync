// Centralized route configuration
// Maps old module IDs to URL paths for React Router integration

export const MODULE_TO_PATH = {
    // Super Admin
    'super-admin-dashboard': '/superadmin',
    'school-management': '/superadmin/schools',
    'super-admin': '/superadmin/admins',
    'academic-settings': '/superadmin/academics',
    'fee-settings': '/superadmin/fees',
    'super-announcements': '/superadmin/announcements',
    'security-logs': '/superadmin/security',
    'system-health': '/superadmin/system-health',
    'superadmin-trash': '/superadmin/trash',
    'superadmin-communications': '/superadmin/communications',

    // Admin
    'dashboard': '/dashboard',
    'students': '/students',
    'teachers': '/teachers',
    'parents': '/parents',
    'parent-registrations': '/parent-registrations',
    'attendance': '/attendance',
    'fees': '/fees',
    'announcements': '/announcements',
    'notification-management': '/notifications',
    'communications': '/communications',
    'timetable': '/timetable',
    'school-profile': '/school-profile',
    'classes': '/classes',
    'academics': '/academics',
    'admin-trash': '/trash',

    // Teacher
    'teacher-dashboard': '/teacher',
    'teacher-classes': '/teacher/classes',
    'teacher-course-handouts': '/teacher/course-handouts',
    'teacher-create-handout': '/teacher/create-handout',
    'teacher-resources': '/teacher/resources',
    'teacher-assignments': '/teacher/assignments',
    'teacher-communications': '/teacher/communications',
    'teacher-profile': '/teacher/profile',
    'teacher-promotions': '/teacher/promotions',

    // Parent
    'parent-overview': '/parent',
    'parent-student-profile': '/parent/profile',
    'parent-academics': '/parent/academics',
    'parent-attendance': '/parent/attendance',
    'parent-messages': '/parent/messages',
    'parent-assignments': '/parent/assignments',
    'parent-study-materials': '/parent/study-materials',
    'parent-course-handouts': '/parent/course-handouts',
    'parent-fees': '/parent/fees',
};

// Reverse mapping: path → module ID
export const PATH_TO_MODULE = Object.fromEntries(
    Object.entries(MODULE_TO_PATH).map(([key, value]) => [value, key])
);

// Returns the default landing path for a given role
export function getDefaultPath(role) {
    switch (role) {
        case 'superadmin':
            return MODULE_TO_PATH['super-admin-dashboard'];
        case 'admin':
            return MODULE_TO_PATH['dashboard'];
        case 'teacher':
            return MODULE_TO_PATH['teacher-dashboard'];
        case 'parent':
            return MODULE_TO_PATH['parent-overview'];
        default:
            return MODULE_TO_PATH['dashboard'];
    }
}
