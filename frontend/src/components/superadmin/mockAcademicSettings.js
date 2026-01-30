// Mock data for Global Academic Master Settings

export const classTemplates = [
    {
        id: 'playgroup',
        name: 'Playgroup',
        shortCode: 'PG',
        order: 1,
        minAge: 1.5,
        maxAge: 2.5,
        description: 'Entry-level class for toddlers',
        maxCapacity: 15,
        teacherRatio: '1:5'
    },
    {
        id: 'nursery',
        name: 'Nursery',
        shortCode: 'NUR',
        order: 2,
        minAge: 2.5,
        maxAge: 3.5,
        description: 'Basic curriculum introduction',
        maxCapacity: 20,
        teacherRatio: '1:8'
    },
    {
        id: 'lkg',
        name: 'LKG (Lower Kindergarten)',
        shortCode: 'LKG',
        order: 3,
        minAge: 3.5,
        maxAge: 4.5,
        description: 'Foundational learning stage',
        maxCapacity: 25,
        teacherRatio: '1:10'
    },
    {
        id: 'ukg',
        name: 'UKG (Upper Kindergarten)',
        shortCode: 'UKG',
        order: 4,
        minAge: 4.5,
        maxAge: 5.5,
        description: 'Pre-primary preparation',
        maxCapacity: 25,
        teacherRatio: '1:10'
    }
];

export const ageMappings = [
    { ageRange: '1.5 - 2.5 years', class: 'Playgroup', cutoffMonth: 'March' },
    { ageRange: '2.5 - 3.5 years', class: 'Nursery', cutoffMonth: 'March' },
    { ageRange: '3.5 - 4.5 years', class: 'LKG', cutoffMonth: 'March' },
    { ageRange: '4.5 - 5.5 years', class: 'UKG', cutoffMonth: 'March' }
];

export const academicYearTemplate = {
    startMonth: 'April',
    endMonth: 'March',
    terms: [
        { name: 'Term 1', startMonth: 'April', endMonth: 'August' },
        { name: 'Term 2', startMonth: 'September', endMonth: 'December' },
        { name: 'Term 3', startMonth: 'January', endMonth: 'March' }
    ],
    admissionWindow: { start: 'January', end: 'April' },
    examWeeks: ['July', 'November', 'February']
};

export const holidayMasterTemplate = [
    { name: 'Republic Day', date: 'January 26', type: 'National', mandatory: true },
    { name: 'Holi', date: 'March (varies)', type: 'Festival', mandatory: true },
    { name: 'Good Friday', date: 'April (varies)', type: 'Religious', mandatory: false },
    { name: 'May Day', date: 'May 1', type: 'National', mandatory: true },
    { name: 'Independence Day', date: 'August 15', type: 'National', mandatory: true },
    { name: 'Ganesh Chaturthi', date: 'August/September (varies)', type: 'Festival', mandatory: true },
    { name: 'Gandhi Jayanti', date: 'October 2', type: 'National', mandatory: true },
    { name: 'Dussehra', date: 'October (varies)', type: 'Festival', mandatory: true },
    { name: 'Diwali', date: 'October/November (varies)', type: 'Festival', mandatory: true },
    { name: 'Christmas', date: 'December 25', type: 'Festival', mandatory: true },
    { name: 'Summer Vacation', date: 'May 1 - June 15', type: 'Vacation', mandatory: true },
    { name: 'Winter Break', date: 'December 24 - January 1', type: 'Vacation', mandatory: true }
];

export const promotionRules = [
    {
        id: 1,
        rule: 'Minimum Attendance Requirement',
        value: '75%',
        description: 'Student must have at least 75% attendance to be promoted'
    },
    {
        id: 2,
        rule: 'Age-Based Automatic Promotion',
        value: 'Enabled',
        description: 'Students meeting age criteria are automatically considered for promotion'
    },
    {
        id: 3,
        rule: 'Parent Consent for Retention',
        value: 'Required',
        description: 'Parents must consent if a child is to be retained in the same class'
    },
    {
        id: 4,
        rule: 'Assessment Requirement',
        value: 'Optional',
        description: 'Formal assessment is not mandatory for promotion at this level'
    },
    {
        id: 5,
        rule: 'Maximum Retention Period',
        value: '1 Year',
        description: 'A student can be retained in the same class for maximum 1 year'
    }
];

export const versionHistory = [
    {
        id: 1,
        version: 'v2.3',
        date: '2026-01-15',
        changedBy: 'Super Admin',
        changes: ['Updated holiday template for 2026', 'Added Ganesh Chaturthi to mandatory holidays']
    },
    {
        id: 2,
        version: 'v2.2',
        date: '2025-12-01',
        changedBy: 'Super Admin',
        changes: ['Modified teacher ratio for LKG and UKG classes']
    },
    {
        id: 3,
        version: 'v2.1',
        date: '2025-08-20',
        changedBy: 'Super Admin',
        changes: ['Added Term 3 to academic year template', 'Updated promotion rules']
    },
    {
        id: 4,
        version: 'v2.0',
        date: '2025-04-01',
        changedBy: 'Super Admin',
        changes: ['Major revision of class templates', 'Added age mapping feature', 'Restructured academic year']
    },
    {
        id: 5,
        version: 'v1.0',
        date: '2024-04-01',
        changedBy: 'System',
        changes: ['Initial system configuration']
    }
];

export const currentVersion = 'v2.3';
export const lastUpdated = '2026-01-15T10:30:00';
