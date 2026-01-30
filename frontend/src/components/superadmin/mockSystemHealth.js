// Mock data for System Health & Backup

export const serverHealth = {
    status: 'healthy', // healthy, warning, critical
    uptime: '45 days, 12 hours',
    lastRestart: '2025-12-13T08:00:00',
    cpuUsage: 34,
    memoryUsage: 58,
    diskUsage: 42,
    responseTime: 145, // ms
    activeConnections: 156,
    requestsPerMinute: 423
};

export const databaseHealth = {
    status: 'healthy',
    connectionPool: { active: 18, idle: 32, max: 100 },
    queryResponseTime: 12, // ms
    replicationLag: 0, // seconds
    lastOptimization: '2026-01-25T02:00:00',
    tableCount: 48,
    totalRecords: 156789,
    databaseSize: '2.4 GB'
};

export const errorMetrics = {
    last24h: {
        total: 23,
        critical: 2,
        warning: 8,
        info: 13
    },
    last7days: {
        total: 156,
        critical: 8,
        warning: 52,
        info: 96
    },
    errorRate: 0.05, // percentage
    topErrors: [
        { code: 'AUTH_001', message: 'Invalid token', count: 8, lastOccurred: '2026-01-27T14:30:00' },
        { code: 'DB_TIMEOUT', message: 'Query timeout', count: 5, lastOccurred: '2026-01-27T10:15:00' },
        { code: 'FILE_404', message: 'File not found', count: 4, lastOccurred: '2026-01-27T12:00:00' },
        { code: 'RATE_LIMIT', message: 'Rate limit exceeded', count: 3, lastOccurred: '2026-01-27T09:45:00' }
    ]
};

export const backupHistory = [
    { id: 'bkp1', type: 'automated', scope: 'full', status: 'completed', size: '2.3 GB', startTime: '2026-01-27T02:00:00', endTime: '2026-01-27T02:12:00', retention: '30 days' },
    { id: 'bkp2', type: 'automated', scope: 'full', status: 'completed', size: '2.2 GB', startTime: '2026-01-26T02:00:00', endTime: '2026-01-26T02:11:00', retention: '30 days' },
    { id: 'bkp3', type: 'manual', scope: 'school', schoolName: 'Little Steps - Downtown', status: 'completed', size: '450 MB', startTime: '2026-01-25T15:30:00', endTime: '2026-01-25T15:33:00', retention: '90 days', createdBy: 'Lokesh Reddy' },
    { id: 'bkp4', type: 'automated', scope: 'full', status: 'completed', size: '2.2 GB', startTime: '2026-01-25T02:00:00', endTime: '2026-01-25T02:10:00', retention: '30 days' },
    { id: 'bkp5', type: 'automated', scope: 'full', status: 'completed', size: '2.1 GB', startTime: '2026-01-24T02:00:00', endTime: '2026-01-24T02:09:00', retention: '30 days' },
    { id: 'bkp6', type: 'manual', scope: 'full', status: 'completed', size: '2.1 GB', startTime: '2026-01-20T10:00:00', endTime: '2026-01-20T10:12:00', retention: '90 days', createdBy: 'Lokesh Reddy' },
    { id: 'bkp7', type: 'automated', scope: 'full', status: 'failed', size: '-', startTime: '2026-01-15T02:00:00', endTime: '2026-01-15T02:05:00', retention: '-', error: 'Disk space low' }
];

export const backupSettings = {
    autoBackupEnabled: true,
    backupTime: '02:00',
    retentionDays: 30,
    backupLocation: 'AWS S3 - ap-south-1',
    encryptionEnabled: true,
    compressionEnabled: true,
    notifyOnFailure: true,
    notifyEmail: 'admin@littlesteps.com'
};

export const schoolsList = [
    'Little Steps - Downtown',
    'Tiny Tots Academy',
    'Happy Kids Playschool',
    'Sunshine Preschool',
    'Rainbow Kids',
    'Little Stars Academy',
    'Kidz Zone',
    'Bright Minds Playschool'
];

export const systemServices = [
    { name: 'API Server', status: 'running', uptime: '45d 12h', port: 8080 },
    { name: 'Database (Primary)', status: 'running', uptime: '45d 12h', port: 5432 },
    { name: 'Database (Replica)', status: 'running', uptime: '45d 11h', port: 5433 },
    { name: 'Redis Cache', status: 'running', uptime: '45d 12h', port: 6379 },
    { name: 'File Storage', status: 'running', uptime: '45d 12h', port: 9000 },
    { name: 'Email Service', status: 'running', uptime: '30d 8h', port: 587 },
    { name: 'SMS Gateway', status: 'warning', uptime: '2d 4h', port: 443, message: 'High latency detected' }
];
