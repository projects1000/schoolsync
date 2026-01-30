// Mock data for Admin Management

export const mockAdminsData = [
    {
        id: 'a1',
        name: 'Priya Sharma',
        email: 'priya@littlesteps.com',
        phone: '+91 98765 43210',
        status: 'active',
        schoolId: 's1',
        schoolName: 'Little Steps - Downtown',
        lastLogin: '2026-01-27T09:30:00',
        createdAt: '2024-01-15',
        activityLogs: [
            { id: 1, action: 'Logged in', timestamp: '2026-01-27T09:30:00', ip: '192.168.1.100' },
            { id: 2, action: 'Updated student record', timestamp: '2026-01-27T09:45:00', details: 'Student: Rahul Kumar' },
            { id: 3, action: 'Sent announcement', timestamp: '2026-01-26T14:20:00', details: 'Holiday notice' },
            { id: 4, action: 'Marked attendance', timestamp: '2026-01-26T10:00:00', details: 'Class: Nursery A' },
            { id: 5, action: 'Logged out', timestamp: '2026-01-25T18:30:00', ip: '192.168.1.100' }
        ]
    },
    {
        id: 'a2',
        name: 'Rahul Verma',
        email: 'rahul@tinytots.com',
        phone: '+91 87654 32109',
        status: 'active',
        schoolId: 's2',
        schoolName: 'Tiny Tots Academy',
        lastLogin: '2026-01-27T08:15:00',
        createdAt: '2024-03-22',
        activityLogs: [
            { id: 1, action: 'Logged in', timestamp: '2026-01-27T08:15:00', ip: '10.0.0.50' },
            { id: 2, action: 'Generated fee report', timestamp: '2026-01-27T08:30:00', details: 'Monthly report - Jan 2026' },
            { id: 3, action: 'Updated teacher profile', timestamp: '2026-01-26T16:00:00', details: 'Teacher: Meera Joshi' }
        ]
    },
    {
        id: 'a3',
        name: 'Anita Reddy',
        email: 'anita@happykids.com',
        phone: '+91 76543 21098',
        status: 'active',
        schoolId: 's3',
        schoolName: 'Happy Kids Playschool',
        lastLogin: '2026-01-26T17:45:00',
        createdAt: '2024-06-10',
        activityLogs: [
            { id: 1, action: 'Logged in', timestamp: '2026-01-26T09:00:00', ip: '172.16.0.25' },
            { id: 2, action: 'Added new student', timestamp: '2026-01-26T11:30:00', details: 'Student: Arun Patel' },
            { id: 3, action: 'Logged out', timestamp: '2026-01-26T17:45:00', ip: '172.16.0.25' }
        ]
    },
    {
        id: 'a4',
        name: 'Kumar S.',
        email: 'kumar@sunshinepreschool.com',
        phone: '+91 65432 10987',
        status: 'blocked',
        schoolId: 's4',
        schoolName: 'Sunshine Preschool',
        lastLogin: '2026-01-20T14:00:00',
        createdAt: '2024-08-05',
        blockedReason: 'Multiple failed login attempts',
        blockedAt: '2026-01-21T10:00:00',
        activityLogs: [
            { id: 1, action: 'Failed login attempt', timestamp: '2026-01-21T09:55:00', ip: '203.0.113.50' },
            { id: 2, action: 'Failed login attempt', timestamp: '2026-01-21T09:56:00', ip: '203.0.113.50' },
            { id: 3, action: 'Account blocked', timestamp: '2026-01-21T10:00:00', details: 'Security: Multiple failed attempts' },
            { id: 4, action: 'Logged in', timestamp: '2026-01-20T14:00:00', ip: '192.168.5.10' }
        ]
    },
    {
        id: 'a5',
        name: 'Meera Joshi',
        email: 'meera@rainbowkids.com',
        phone: '+91 54321 09876',
        status: 'active',
        schoolId: 's5',
        schoolName: 'Rainbow Kids',
        lastLogin: '2026-01-27T07:00:00',
        createdAt: '2023-11-20',
        activityLogs: [
            { id: 1, action: 'Logged in', timestamp: '2026-01-27T07:00:00', ip: '192.168.10.5' },
            { id: 2, action: 'Updated timetable', timestamp: '2026-01-27T07:30:00', details: 'Weekly schedule update' }
        ]
    },
    {
        id: 'a6',
        name: 'Vijay Kumar',
        email: 'vijay@littlestars.com',
        phone: '+91 43210 98765',
        status: 'active',
        schoolId: 's6',
        schoolName: 'Little Stars Academy',
        lastLogin: '2026-01-26T16:30:00',
        createdAt: '2024-10-01',
        activityLogs: [
            { id: 1, action: 'Logged in', timestamp: '2026-01-26T09:15:00', ip: '10.10.10.100' },
            { id: 2, action: 'Processed fee payment', timestamp: '2026-01-26T10:45:00', details: '₹15,000 - Student: Neha Gupta' },
            { id: 3, action: 'Logged out', timestamp: '2026-01-26T16:30:00', ip: '10.10.10.100' }
        ]
    },
    {
        id: 'a8',
        name: 'Neha Patel',
        email: 'neha@kidzzone.com',
        phone: '+91 32109 87654',
        status: 'active',
        schoolId: 's8',
        schoolName: 'Kidz Zone',
        lastLogin: '2026-01-27T10:00:00',
        createdAt: '2024-12-15',
        activityLogs: [
            { id: 1, action: 'Logged in', timestamp: '2026-01-27T10:00:00', ip: '192.168.20.55' },
            { id: 2, action: 'Viewed dashboard', timestamp: '2026-01-27T10:05:00' }
        ]
    }
];

// Schools without admins (available for assignment)
export const unassignedSchools = [
    { id: 's7', name: 'Bright Minds Playschool', city: 'Kolkata' }
];

export const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};
