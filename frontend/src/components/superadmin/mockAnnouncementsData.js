// Mock data for Announcements & Communication

export const mockAnnouncements = [
    {
        id: 'ann1',
        title: 'Academic Calendar 2026-27 Released',
        content: 'The academic calendar for the upcoming session 2026-27 has been released. Please review and plan accordingly. Key dates include admission window (Jan-Apr), session start (Apr 1), and term breaks.',
        type: 'announcement',
        priority: 'normal',
        target: 'all',
        targetSchools: [],
        channels: ['email', 'app'],
        status: 'published',
        publishedAt: '2026-01-25T10:00:00',
        scheduledAt: null,
        createdBy: 'Super Admin',
        views: 2340,
        engagement: 78
    },
    {
        id: 'ann2',
        title: 'System Maintenance - Jan 30',
        content: 'The platform will undergo scheduled maintenance on January 30, 2026 from 2:00 AM to 6:00 AM IST. During this time, access may be intermittent. Please save your work beforehand.',
        type: 'maintenance',
        priority: 'high',
        target: 'all',
        targetSchools: [],
        channels: ['email', 'sms', 'app'],
        status: 'scheduled',
        publishedAt: null,
        scheduledAt: '2026-01-28T09:00:00',
        createdBy: 'Super Admin',
        views: 0,
        engagement: 0
    },
    {
        id: 'ann3',
        title: 'New Fee Payment Gateway',
        content: 'We have integrated a new payment gateway for fee collection. Parents can now pay using UPI, Credit/Debit cards, and Net Banking. The old gateway will be deprecated by March 2026.',
        type: 'announcement',
        priority: 'normal',
        target: 'specific',
        targetSchools: ['Little Steps - Downtown', 'Tiny Tots Academy', 'Happy Kids Playschool'],
        channels: ['email', 'app'],
        status: 'published',
        publishedAt: '2026-01-20T14:30:00',
        scheduledAt: null,
        createdBy: 'Super Admin',
        views: 1567,
        engagement: 62
    },
    {
        id: 'ann4',
        title: '🚨 Weather Alert - Heavy Rainfall',
        content: 'Due to heavy rainfall forecast, all schools in Mumbai region are advised to operate on half-day schedule tomorrow (Jan 28). Parents will receive separate communication from individual schools.',
        type: 'emergency',
        priority: 'critical',
        target: 'specific',
        targetSchools: ['Little Steps - Downtown', 'Rainbow Kids'],
        channels: ['email', 'sms', 'app', 'whatsapp'],
        status: 'published',
        publishedAt: '2026-01-27T08:00:00',
        scheduledAt: null,
        createdBy: 'Super Admin',
        views: 890,
        engagement: 95
    },
    {
        id: 'ann5',
        title: 'Teacher Training Program',
        content: 'A mandatory online training program for all teachers will be conducted on Feb 15-16, 2026. Topics include child safety, digital learning tools, and communication best practices.',
        type: 'announcement',
        priority: 'normal',
        target: 'all',
        targetSchools: [],
        channels: ['email'],
        status: 'draft',
        publishedAt: null,
        scheduledAt: null,
        createdBy: 'Super Admin',
        views: 0,
        engagement: 0
    }
];

export const announcementTypes = [
    { id: 'announcement', label: 'General Announcement', icon: '📢', color: 'blue' },
    { id: 'emergency', label: 'Emergency Alert', icon: '🚨', color: 'red' },
    { id: 'maintenance', label: 'Maintenance Notice', icon: '🔧', color: 'amber' },
    { id: 'update', label: 'Platform Update', icon: '✨', color: 'teal' }
];

export const communicationChannels = [
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'sms', label: 'SMS', icon: '💬' },
    { id: 'app', label: 'In-App', icon: '📱' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💚' }
];

export const emailTemplates = [
    {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to Little Steps Playschool',
        description: 'Sent to new parents upon registration',
        lastModified: '2025-12-15'
    },
    {
        id: 'fee-reminder',
        name: 'Fee Reminder',
        subject: 'Fee Payment Reminder - {{month}}',
        description: 'Monthly fee reminder to parents',
        lastModified: '2026-01-10'
    },
    {
        id: 'attendance-alert',
        name: 'Attendance Alert',
        subject: 'Attendance Alert for {{student_name}}',
        description: 'Sent when student is absent',
        lastModified: '2025-11-20'
    },
    {
        id: 'event-invite',
        name: 'Event Invitation',
        subject: 'You are invited: {{event_name}}',
        description: 'Event invitation template',
        lastModified: '2026-01-05'
    }
];

export const smsTemplates = [
    {
        id: 'otp',
        name: 'OTP Verification',
        content: 'Your OTP for Little Steps is {{otp}}. Valid for 10 minutes.',
        lastModified: '2025-10-01'
    },
    {
        id: 'fee-due',
        name: 'Fee Due Reminder',
        content: 'Dear Parent, fee of Rs.{{amount}} for {{student}} is due on {{date}}. Pay now to avoid late fee.',
        lastModified: '2025-12-20'
    },
    {
        id: 'pickup-alert',
        name: 'Pickup Alert',
        content: '{{student}} has been picked up from school at {{time}}.',
        lastModified: '2025-11-15'
    }
];

export const allSchoolsList = [
    'Little Steps - Downtown',
    'Tiny Tots Academy',
    'Happy Kids Playschool',
    'Sunshine Preschool',
    'Rainbow Kids',
    'Little Stars Academy',
    'Kidz Zone',
    'Bright Minds Playschool'
];
