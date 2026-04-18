import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Server,
    Database,
    HardDrive,
    Activity,
    AlertTriangle,
    Check,
    X,
    RefreshCcw,
    Download,
    Upload,
    Clock,
    Cpu,
    MemoryStick,
    Wifi,
    Zap,
    Shield,
    PlayCircle,
    PauseCircle,
    Settings,
    Calendar,
    Building2,
    Archive,
    RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
    serverHealth,
    databaseHealth,
    errorMetrics,
    backupHistory as initialBackups,
    backupSettings,
    schoolsList,
    systemServices
} from './mockSystemHealth';

const SystemHealthBackup = ({ currentUser }) => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('health');
    const [backups, setBackups] = useState(initialBackups);
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [backupScope, setBackupScope] = useState('full');
    const [selectedSchool, setSelectedSchool] = useState('');
    const [restoreConfirmText, setRestoreConfirmText] = useState('');
    const [isBackingUp, setIsBackingUp] = useState(false);

    const getStatusColor = (status) => {
        const colors = {
            healthy: 'text-emerald-500',
            running: 'text-emerald-500',
            warning: 'text-amber-500',
            critical: 'text-orange-500',
            failed: 'text-orange-500',
            completed: 'text-emerald-500'
        };
        return colors[status] || 'text-gray-500';
    };

    const getStatusBg = (status) => {
        const colors = {
            healthy: 'bg-emerald-100',
            running: 'bg-emerald-100',
            warning: 'bg-amber-100',
            critical: 'bg-orange-100',
            failed: 'bg-orange-100',
            completed: 'bg-emerald-100'
        };
        return colors[status] || 'bg-gray-100';
    };

    const handleManualBackup = () => {
        if (backupScope === 'school' && !selectedSchool) {
            toast({ title: 'Error', description: 'Please select a school', variant: 'destructive' });
            return;
        }

        setIsBackingUp(true);
        setTimeout(() => {
            const newBackup = {
                id: `bkp${Date.now()}`,
                type: 'manual',
                scope: backupScope,
                schoolName: backupScope === 'school' ? selectedSchool : undefined,
                status: 'completed',
                size: backupScope === 'full' ? '2.4 GB' : '450 MB',
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 10 * 60000).toISOString(),
                retention: '90 days',
                createdBy: currentUser?.name || 'Super Admin'
            };
            setBackups([newBackup, ...backups]);
            setIsBackingUp(false);
            setShowBackupModal(false);
            toast({ title: 'Backup Complete', description: `${backupScope === 'full' ? 'Full system' : selectedSchool} backup created successfully.` });
        }, 2000);
    };

    const handleRestore = () => {
        if (restoreConfirmText !== 'RESTORE') {
            toast({ title: 'Error', description: 'Please type RESTORE to confirm', variant: 'destructive' });
            return;
        }

        toast({
            title: 'Restore Initiated',
            description: `Restoring from backup ${selectedBackup.id}. This may take several minutes.`
        });
        setShowRestoreModal(false);
        setRestoreConfirmText('');
        setSelectedBackup(null);
    };

    const HealthGauge = ({ value, label, max = 100, warning = 70, critical = 90 }) => {
        const status = value >= critical ? 'critical' : value >= warning ? 'warning' : 'healthy';
        const color = status === 'critical' ? 'bg-orange-500' : status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';

        return (
            <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className={`font-bold ${getStatusColor(status)}`}>{value}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${color} transition-all`} style={{ width: `${value}%` }} />
                </div>
            </div>
        );
    };

    const StatusIndicator = ({ status }) => {
        const iconClass = `w-4 h-4 ${getStatusColor(status)}`;
        return (
            <div className={`p-2 rounded-full ${getStatusBg(status)}`}>
                {status === 'healthy' || status === 'running' || status === 'completed' ? (
                    <Check className={iconClass} />
                ) : status === 'warning' ? (
                    <AlertTriangle className={iconClass} />
                ) : (
                    <X className={iconClass} />
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-600 to-blue-700 rounded-xl shadow-lg p-6 text-white"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Server className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">System Health & Backup</h1>
                            <p className="text-green-100 text-sm mt-1">
                                Monitor infrastructure and manage backups
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setShowBackupModal(true)}
                            className="bg-white text-green-700 hover:bg-green-50"
                        >
                            <Archive className="w-4 h-4 mr-2" />
                            Create Backup
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/20">
                    <div className="text-center p-2 bg-white/5 rounded-lg md:bg-transparent">
                        <div className="flex items-center justify-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${serverHealth.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            <p className="text-lg font-bold capitalize">{serverHealth.status}</p>
                        </div>
                        <p className="text-sm text-green-100">Server Status</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg md:bg-transparent">
                        <p className="text-lg font-bold">{serverHealth.uptime}</p>
                        <p className="text-sm text-green-100">Uptime</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg md:bg-transparent">
                        <p className="text-lg font-bold">{serverHealth.responseTime}ms</p>
                        <p className="text-sm text-green-100">Response Time</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg md:bg-transparent">
                        <p className="text-lg font-bold">{errorMetrics.errorRate}%</p>
                        <p className="text-sm text-green-100">Error Rate</p>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
                {[
                    { id: 'health', label: 'System Health', icon: Activity },
                    { id: 'backups', label: 'Backup & Restore', icon: Archive },
                    { id: 'services', label: 'Services', icon: Server }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? 'border-green-600 text-green-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Health Tab */}
            {activeTab === 'health' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {/* Server Health */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Server className="w-5 h-5 text-green-600" />
                                Server Health
                            </h3>
                            <StatusIndicator status={serverHealth.status} />
                        </div>
                        <div className="space-y-4">
                            <HealthGauge value={serverHealth.cpuUsage} label="CPU Usage" />
                            <HealthGauge value={serverHealth.memoryUsage} label="Memory Usage" />
                            <HealthGauge value={serverHealth.diskUsage} label="Disk Usage" warning={60} critical={80} />
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-800">{serverHealth.activeConnections}</p>
                                    <p className="text-xs text-gray-500">Active Connections</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-800">{serverHealth.requestsPerMinute}</p>
                                    <p className="text-xs text-gray-500">Requests/min</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Database Health */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Database className="w-5 h-5 text-emerald-600" />
                                Database Health
                            </h3>
                            <StatusIndicator status={databaseHealth.status} />
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                                    <p className="text-lg font-bold text-emerald-600">{databaseHealth.connectionPool.active}</p>
                                    <p className="text-xs text-gray-500">Active</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-lg font-bold text-gray-600">{databaseHealth.connectionPool.idle}</p>
                                    <p className="text-xs text-gray-500">Idle</p>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <p className="text-lg font-bold text-blue-600">{databaseHealth.connectionPool.max}</p>
                                    <p className="text-xs text-gray-500">Max</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Query Response</p>
                                    <p className="text-xl font-bold text-gray-800">{databaseHealth.queryResponseTime}ms</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Replication Lag</p>
                                    <p className="text-xl font-bold text-emerald-600">{databaseHealth.replicationLag}s</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Database Size</p>
                                    <p className="text-xl font-bold text-gray-800">{databaseHealth.databaseSize}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Total Records</p>
                                    <p className="text-xl font-bold text-gray-800">{databaseHealth.totalRecords.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Monitoring */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Error Monitoring
                            </h3>
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-orange-600">{errorMetrics.last24h.critical}</p>
                                    <p className="text-xs text-gray-500">Critical (24h)</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-amber-600">{errorMetrics.last24h.warning}</p>
                                    <p className="text-xs text-gray-500">Warnings (24h)</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-600">{errorMetrics.last24h.total}</p>
                                    <p className="text-xs text-gray-500">Total (24h)</p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Error Code</th>
                                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Message</th>
                                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Count</th>
                                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Last Occurred</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {errorMetrics.topErrors.map((err, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-mono text-sm text-orange-600">{err.code}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{err.message}</td>
                                            <td className="px-4 py-3 font-bold text-gray-800">{err.count}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{new Date(err.lastOccurred).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Backups Tab */}
            {activeTab === 'backups' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Backup Settings Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>Daily at {backupSettings.backupTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>Retention: {backupSettings.retentionDays} days</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-gray-400" />
                                <span>{backupSettings.backupLocation}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-emerald-500" />
                                <span className="text-emerald-600">Encrypted</span>
                            </div>
                        </div>
                    </div>

                    {/* Backup History Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">Backup History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Type</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Scope</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Size</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Time</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {backups.map((backup) => (
                                        <tr key={backup.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded ${backup.type === 'automated' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                    {backup.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <span className="font-medium text-gray-800 capitalize">{backup.scope}</span>
                                                    {backup.schoolName && (
                                                        <p className="text-xs text-gray-500">{backup.schoolName}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-sm text-gray-600">{backup.size}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(backup.startTime).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBg(backup.status)} ${getStatusColor(backup.status)}`}>
                                                    {backup.status}
                                                </span>
                                                {backup.error && (
                                                    <p className="text-xs text-orange-500 mt-1">{backup.error}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    {backup.status === 'completed' && (
                                                        <>
                                                            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                                                                <Download className="w-4 h-4 text-gray-500" />
                                                            </button>
                                                            <button
                                                                onClick={() => { setSelectedBackup(backup); setShowRestoreModal(true); }}
                                                                className="p-2 hover:bg-amber-100 rounded-lg"
                                                                title="Restore"
                                                            >
                                                                <RotateCcw className="w-4 h-4 text-amber-600" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Service</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Uptime</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Port</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {systemServices.map((service, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-800">{service.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusBg(service.status)} ${getStatusColor(service.status)}`}>
                                                {service.status === 'running' ? <PlayCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                                {service.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{service.uptime}</td>
                                        <td className="px-4 py-3 font-mono text-sm text-gray-600">{service.port}</td>
                                        <td className="px-4 py-3 text-sm text-amber-600">{service.message || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Create Backup Modal */}
            <AnimatePresence>
                {showBackupModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowBackupModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Create Manual Backup</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Backup Scope</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="scope"
                                                checked={backupScope === 'full'}
                                                onChange={() => setBackupScope('full')}
                                                className="text-green-600"
                                            />
                                            Full System
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="scope"
                                                checked={backupScope === 'school'}
                                                onChange={() => setBackupScope('school')}
                                                className="text-green-600"
                                            />
                                            Single School
                                        </label>
                                    </div>
                                </div>

                                {backupScope === 'school' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select School</label>
                                        <select
                                            value={selectedSchool}
                                            onChange={(e) => setSelectedSchool(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                        >
                                            <option value="">Choose a school...</option>
                                            {schoolsList.map(school => (
                                                <option key={school} value={school}>{school}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                                    Estimated size: {backupScope === 'full' ? '~2.4 GB' : '~400-500 MB'}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button onClick={() => setShowBackupModal(false)} variant="outline" className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleManualBackup} disabled={isBackingUp} className="flex-1 bg-green-600 hover:bg-green-700">
                                    {isBackingUp ? (
                                        <>
                                            <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                                            Backing Up...
                                        </>
                                    ) : (
                                        <>
                                            <Archive className="w-4 h-4 mr-2" />
                                            Start Backup
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Restore Confirmation Modal */}
            <AnimatePresence>
                {showRestoreModal && selectedBackup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => { setShowRestoreModal(false); setRestoreConfirmText(''); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">⚠️ Destructive Action</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    You are about to restore from backup <strong>{selectedBackup.id}</strong> created on {new Date(selectedBackup.startTime).toLocaleString()}.
                                </p>
                            </div>

                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                                <p className="text-sm text-orange-700">
                                    <strong>Warning:</strong> This will overwrite current data. This action cannot be undone. All changes made after this backup will be lost.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type <strong>RESTORE</strong> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={restoreConfirmText}
                                    onChange={(e) => setRestoreConfirmText(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                    placeholder="RESTORE"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button onClick={() => { setShowRestoreModal(false); setRestoreConfirmText(''); }} variant="outline" className="flex-1">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleRestore}
                                    disabled={restoreConfirmText !== 'RESTORE'}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Restore Now
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SystemHealthBackup;
