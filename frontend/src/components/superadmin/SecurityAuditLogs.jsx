import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Lock,
    LogIn,
    Activity,
    Database,
    Search,
    Filter,
    Download,
    Calendar,
    ChevronDown,
    X,
    AlertTriangle,
    Check,
    RefreshCcw,
    LogOut,
    Eye,
    Settings,
    Clock,
    MapPin,
    Monitor,
    Smartphone,
    Globe,
    UserX,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
    loginHistory as initialLoginHistory,
    activityLogs,
    dataChangeLogs,
    passwordRules as initialPasswordRules,
    securityStats
} from './mockSecurityData';

const SecurityAuditLogs = ({ currentUser }) => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('logins');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [loginHistory, setLoginHistory] = useState(initialLoginHistory);
    const [showLogDetail, setShowLogDetail] = useState(null);
    const [showPasswordRules, setShowPasswordRules] = useState(false);
    const [passwordRules, setPasswordRules] = useState(initialPasswordRules);

    // Filter login history
    const filteredLogins = useMemo(() => {
        return loginHistory.filter(log => {
            const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.ip.includes(searchQuery);
            const matchesRole = roleFilter === 'all' || log.role === roleFilter;
            const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [loginHistory, searchQuery, roleFilter, statusFilter]);

    // Filter activity logs
    const filteredActivity = useMemo(() => {
        return activityLogs.filter(log => {
            const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.target.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'all' || log.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [searchQuery, roleFilter]);

    // Filter data change logs
    const filteredDataChanges = useMemo(() => {
        return dataChangeLogs.filter(log => {
            const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.field.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [searchQuery]);

    const handleForceLogout = (sessionId, userName) => {
        setLoginHistory(loginHistory.map(log =>
            log.id === sessionId ? { ...log, sessionActive: false } : log
        ));
        toast({
            title: 'Session Terminated',
            description: `${userName}'s session has been forcefully ended.`
        });
    };

    const handleExport = (format) => {
        toast({
            title: `Exporting as ${format.toUpperCase()}`,
            description: 'Your download will start shortly...'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            success: 'bg-emerald-100 text-emerald-700',
            failed: 'bg-rose-100 text-rose-700',
            blocked: 'bg-gray-100 text-gray-700'
        };
        return colors[status] || colors.success;
    };

    const getRoleBadge = (role) => {
        const colors = {
            superadmin: 'bg-purple-100 text-purple-700',
            admin: 'bg-blue-100 text-blue-700',
            teacher: 'bg-amber-100 text-amber-700',
            parent: 'bg-green-100 text-green-700',
            unknown: 'bg-gray-100 text-gray-600'
        };
        return colors[role] || colors.unknown;
    };

    const tabs = [
        { id: 'logins', label: 'Login History', icon: LogIn, count: loginHistory.length },
        { id: 'activity', label: 'Activity Logs', icon: Activity, count: activityLogs.length },
        { id: 'changes', label: 'Data Changes', icon: Database, count: dataChangeLogs.length }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl shadow-lg p-6 text-white"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Security & Audit Logs</h1>
                            <p className="text-slate-300 text-sm mt-1">
                                Monitor system access and activity
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setShowPasswordRules(true)}
                            variant="outline"
                            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                        >
                            <Lock className="w-4 h-4 mr-2" />
                            Password Rules
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-5 gap-4 mt-6 pt-4 border-t border-white/20">
                    <div className="text-center">
                        <p className="text-2xl font-bold">{securityStats.totalLogins24h}</p>
                        <p className="text-sm text-slate-300">Logins (24h)</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-rose-400">{securityStats.failedLogins24h}</p>
                        <p className="text-sm text-slate-300">Failed (24h)</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-400">{securityStats.activeSessions}</p>
                        <p className="text-sm text-slate-300">Active Sessions</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-amber-400">{securityStats.blockedIPs}</p>
                        <p className="text-sm text-slate-300">Blocked IPs</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium">{securityStats.lastSecurityAudit}</p>
                        <p className="text-sm text-slate-300">Last Audit</p>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-slate-700 text-slate-800'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
            >
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                        <option value="all">All Roles</option>
                        <option value="superadmin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="teacher">Teacher</option>
                        <option value="parent">Parent</option>
                    </select>
                    {activeTab === 'logins' && (
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    )}
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            placeholder="From"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            placeholder="To"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" /> CSV
                        </Button>
                        <Button onClick={() => handleExport('pdf')} variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-1" /> PDF
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Login History Tab */}
            {activeTab === 'logins' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">IP / Device</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredLogins.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-gray-800">{log.user}</p>
                                                <p className="text-xs text-gray-500">{log.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getRoleBadge(log.role)}`}>
                                                {log.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm">
                                                <p className="text-gray-800 font-mono">{log.ip}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Monitor className="w-3 h-3" />
                                                    {log.device}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {log.location}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(log.status)}`}>
                                                    {log.status}
                                                </span>
                                                {log.sessionActive && (
                                                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setShowLogDetail(log)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4 text-gray-500" />
                                                </button>
                                                {log.sessionActive && log.user !== currentUser?.name && (
                                                    <button
                                                        onClick={() => handleForceLogout(log.id, log.user)}
                                                        className="p-2 hover:bg-rose-100 rounded-lg"
                                                        title="Force Logout"
                                                    >
                                                        <LogOut className="w-4 h-4 text-rose-500" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Activity Logs Tab */}
            {activeTab === 'activity' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Target</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Module</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredActivity.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-800">{log.user}</span>
                                                <span className={`px-1.5 py-0.5 text-xs rounded ${getRoleBadge(log.role)}`}>
                                                    {log.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-gray-800">{log.action}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600">{log.target}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                                                {log.module}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-500">{log.details}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Data Changes Tab */}
            {activeTab === 'changes' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Entity</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Field</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Old Value</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">New Value</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredDataChanges.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800">{log.user}</td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <span className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded">{log.entity}</span>
                                                <p className="text-xs text-gray-400 mt-1">{log.entityId}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm text-gray-600">{log.field}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 text-sm bg-rose-50 text-rose-700 rounded line-through">
                                                {log.oldValue}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 text-sm bg-emerald-50 text-emerald-700 rounded">
                                                {log.newValue}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Log Detail Modal */}
            <AnimatePresence>
                {showLogDetail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowLogDetail(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-800">Login Details</h3>
                                <button onClick={() => setShowLogDetail(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">User</p>
                                        <p className="font-medium">{showLogDetail.user}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="font-medium">{showLogDetail.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">IP Address</p>
                                        <p className="font-mono">{showLogDetail.ip}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Device</p>
                                        <p className="text-sm">{showLogDetail.device}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Location</p>
                                        <p className="text-sm">{showLogDetail.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Status</p>
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(showLogDetail.status)}`}>
                                            {showLogDetail.status}
                                        </span>
                                    </div>
                                </div>
                                {showLogDetail.reason && (
                                    <div className="p-3 bg-rose-50 rounded-lg">
                                        <p className="text-sm text-rose-700">
                                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                                            {showLogDetail.reason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Password Rules Modal */}
            <AnimatePresence>
                {showPasswordRules && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowPasswordRules(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl max-w-lg w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b flex items-center justify-between">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-slate-600" />
                                    Password & Security Rules
                                </h3>
                                <button onClick={() => setShowPasswordRules(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500">Minimum Length</p>
                                        <p className="font-bold text-lg">{passwordRules.minLength} characters</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500">Password Expiry</p>
                                        <p className="font-bold text-lg">{passwordRules.expiryDays} days</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500">Max Failed Attempts</p>
                                        <p className="font-bold text-lg">{passwordRules.maxFailedAttempts}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500">Lockout Duration</p>
                                        <p className="font-bold text-lg">{passwordRules.lockoutDurationMinutes} min</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {[
                                        { label: 'Require Uppercase', value: passwordRules.requireUppercase },
                                        { label: 'Require Lowercase', value: passwordRules.requireLowercase },
                                        { label: 'Require Number', value: passwordRules.requireNumber },
                                        { label: 'Require Special Character', value: passwordRules.requireSpecialChar },
                                        { label: 'Two-Factor Authentication', value: passwordRules.requireMFA }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm text-gray-600">{item.label}</span>
                                            <span className={`px-2 py-1 text-xs rounded ${item.value ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {item.value ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        <Clock className="w-4 h-4 inline mr-1" />
                                        Session timeout after {passwordRules.sessionTimeoutMinutes / 60} hours of inactivity
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SecurityAuditLogs;
