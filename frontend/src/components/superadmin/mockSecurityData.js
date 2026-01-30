// Mock data for Security & Audit Logs

export const loginHistory = [
    { id: 1, user: 'ch Lokesh Reddy', role: 'superadmin', email: 'lokesh@littlesteps.com', ip: '192.168.1.45', device: 'Chrome - Windows', location: 'Mumbai, India', timestamp: '2026-01-27T15:30:00', status: 'success', sessionActive: true },
    { id: 2, user: 'Priya Sharma', role: 'admin', email: 'priya@littlesteps.com', ip: '192.168.1.102', device: 'Safari - MacOS', location: 'Mumbai, India', timestamp: '2026-01-27T14:45:00', status: 'success', sessionActive: true },
    { id: 3, user: 'Rahul Verma', role: 'admin', email: 'rahul@tinytots.com', ip: '103.42.56.78', device: 'Chrome - Android', location: 'Delhi, India', timestamp: '2026-01-27T14:20:00', status: 'success', sessionActive: false },
    { id: 4, user: 'Unknown', role: 'unknown', email: 'admin@littlesteps.com', ip: '85.214.132.117', device: 'Firefox - Linux', location: 'Frankfurt, Germany', timestamp: '2026-01-27T13:55:00', status: 'failed', sessionActive: false, reason: 'Invalid password (3 attempts)' },
    { id: 5, user: 'Meera Joshi', role: 'teacher', email: 'meera.j@rainbow.edu', ip: '192.168.2.34', device: 'Chrome - Windows', location: 'Pune, India', timestamp: '2026-01-27T12:30:00', status: 'success', sessionActive: true },
    { id: 6, user: 'Rajesh Kumar', role: 'parent', email: 'rajesh.k@gmail.com', ip: '49.36.128.92', device: 'App - iOS', location: 'Mumbai, India', timestamp: '2026-01-27T11:15:00', status: 'success', sessionActive: false },
    { id: 7, user: 'Anita Reddy', role: 'admin', email: 'anita@happykids.com', ip: '103.87.45.12', device: 'Chrome - MacOS', location: 'Bangalore, India', timestamp: '2026-01-27T10:00:00', status: 'success', sessionActive: true },
    { id: 8, user: 'Unknown', role: 'unknown', email: 'test@test.com', ip: '45.33.32.156', device: 'Postman', location: 'San Francisco, USA', timestamp: '2026-01-27T08:30:00', status: 'blocked', sessionActive: false, reason: 'IP blacklisted' },
    { id: 9, user: 'Sunita Patel', role: 'teacher', email: 'sunita.p@sunshine.edu', ip: '192.168.5.67', device: 'Edge - Windows', location: 'Ahmedabad, India', timestamp: '2026-01-26T18:45:00', status: 'success', sessionActive: false },
    { id: 10, user: 'Vijay Kumar', role: 'admin', email: 'vijay@littlestars.com', ip: '117.254.89.34', device: 'Chrome - Windows', location: 'Chennai, India', timestamp: '2026-01-26T16:20:00', status: 'success', sessionActive: false }
];

export const activityLogs = [
    { id: 1, user: 'ch Lokesh Reddy', role: 'superadmin', action: 'Created School', target: 'Bright Minds Playschool', module: 'School Management', timestamp: '2026-01-27T15:25:00', details: 'Added new school with primary admin assignment' },
    { id: 2, user: 'Priya Sharma', role: 'admin', action: 'Updated Student', target: 'Aarav Kumar (STU-2024-0042)', module: 'Students', timestamp: '2026-01-27T14:50:00', details: 'Changed class from Nursery A to Nursery B' },
    { id: 3, user: 'ch Lokesh Reddy', role: 'superadmin', action: 'Published Announcement', target: 'Academic Calendar 2026-27', module: 'Announcements', timestamp: '2026-01-27T14:30:00', details: 'Platform-wide announcement to all schools' },
    { id: 4, user: 'Rahul Verma', role: 'admin', action: 'Generated Invoice', target: 'INV-2026-0156', module: 'Fees & Billing', timestamp: '2026-01-27T13:45:00', details: 'Monthly fee invoice for 45 students' },
    { id: 5, user: 'ch Lokesh Reddy', role: 'superadmin', action: 'Updated Settings', target: 'Late Fee Rules', module: 'Fee Settings', timestamp: '2026-01-27T12:00:00', details: 'Changed grace period from 5 to 7 days' },
    { id: 6, user: 'Anita Reddy', role: 'admin', action: 'Marked Attendance', target: 'Nursery A (25 students)', module: 'Attendance', timestamp: '2026-01-27T10:15:00', details: 'Morning attendance marked' },
    { id: 7, user: 'ch Lokesh Reddy', role: 'superadmin', action: 'Blocked Admin', target: 'Kumar S.', module: 'Admin Management', timestamp: '2026-01-27T09:30:00', details: 'Blocked admin access due to policy violation' },
    { id: 8, user: 'Meera Joshi', role: 'teacher', action: 'Updated Timetable', target: 'LKG A - Monday', module: 'Timetable', timestamp: '2026-01-26T17:00:00', details: 'Rescheduled Art class to 11 AM' },
    { id: 9, user: 'Vijay Kumar', role: 'admin', action: 'Approved Registration', target: 'Parent: Deepak Sharma', module: 'Parent Registrations', timestamp: '2026-01-26T15:30:00', details: 'Approved and linked to student Arjun Sharma' },
    { id: 10, user: 'ch Lokesh Reddy', role: 'superadmin', action: 'Force Logout', target: 'Session ID: 8a4b2c1d', module: 'Security', timestamp: '2026-01-26T14:00:00', details: 'Force logged out suspicious session' }
];

export const dataChangeLogs = [
    { id: 1, user: 'ch Lokesh Reddy', entity: 'School', entityId: 'SCH-008', field: 'name', oldValue: 'Bright Minds', newValue: 'Bright Minds Playschool', timestamp: '2026-01-27T15:26:00' },
    { id: 2, user: 'Priya Sharma', entity: 'Student', entityId: 'STU-2024-0042', field: 'class', oldValue: 'Nursery A', newValue: 'Nursery B', timestamp: '2026-01-27T14:51:00' },
    { id: 3, user: 'ch Lokesh Reddy', entity: 'FeeSettings', entityId: 'FEE-001', field: 'gracePeriod', oldValue: '5 days', newValue: '7 days', timestamp: '2026-01-27T12:01:00' },
    { id: 4, user: 'Rahul Verma', entity: 'Student', entityId: 'STU-2024-0089', field: 'transportOpted', oldValue: 'false', newValue: 'true', timestamp: '2026-01-27T11:30:00' },
    { id: 5, user: 'Anita Reddy', entity: 'Teacher', entityId: 'TCH-015', field: 'assignedClass', oldValue: 'LKG A', newValue: 'LKG B', timestamp: '2026-01-27T10:45:00' },
    { id: 6, user: 'ch Lokesh Reddy', entity: 'Admin', entityId: 'ADM-004', field: 'status', oldValue: 'Active', newValue: 'Blocked', timestamp: '2026-01-27T09:31:00' },
    { id: 7, user: 'Vijay Kumar', entity: 'Parent', entityId: 'PAR-2026-0023', field: 'status', oldValue: 'Pending', newValue: 'Approved', timestamp: '2026-01-26T15:31:00' },
    { id: 8, user: 'Meera Joshi', entity: 'Timetable', entityId: 'TT-LKG-A-MON', field: 'slot_3', oldValue: '10:00 - Math', newValue: '11:00 - Art', timestamp: '2026-01-26T17:01:00' }
];

export const passwordRules = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
    expiryDays: 90,
    preventReuse: 5,
    maxFailedAttempts: 5,
    lockoutDurationMinutes: 30,
    sessionTimeoutMinutes: 480,
    requireMFA: false
};

export const securityStats = {
    totalLogins24h: 156,
    failedLogins24h: 8,
    activeSessions: 42,
    blockedIPs: 3,
    lastSecurityAudit: '2026-01-15'
};
