import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Megaphone,
    Plus,
    Search,
    Filter,
    Send,
    Clock,
    Eye,
    Edit2,
    Trash2,
    X,
    Check,
    AlertTriangle,
    Calendar,
    Users,
    Building2,
    Mail,
    MessageSquare,
    Smartphone,
    ChevronDown,
    FileText,
    Zap,
    Target,
    BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
    mockAnnouncements,
    announcementTypes,
    communicationChannels,
    emailTemplates,
    smsTemplates,
    allSchoolsList
} from './mockAnnouncementsData';

const SuperAdminAnnouncements = ({ currentUser }) => {
    const { toast } = useToast();
    const isSuperAdmin = currentUser?.role === 'superadmin';

    const [announcements, setAnnouncements] = useState(mockAnnouncements);
    const [activeTab, setActiveTab] = useState('announcements');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    // Composer state
    const [showComposer, setShowComposer] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [composerData, setComposerData] = useState({
        title: '',
        content: '',
        type: 'announcement',
        priority: 'normal',
        target: 'all',
        targetSchools: [],
        channels: ['email', 'app'],
        scheduleDate: '',
        scheduleTime: ''
    });

    // Filter announcements
    const filteredAnnouncements = useMemo(() => {
        return announcements.filter(ann => {
            const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ann.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || ann.status === statusFilter;
            const matchesType = typeFilter === 'all' || ann.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [announcements, searchQuery, statusFilter, typeFilter]);

    const handlePublish = () => {
        if (!composerData.title || !composerData.content) {
            toast({ title: 'Error', description: 'Title and content are required', variant: 'destructive' });
            return;
        }

        const newAnn = {
            id: `ann${Date.now()}`,
            ...composerData,
            status: 'published',
            publishedAt: new Date().toISOString(),
            createdBy: currentUser?.name || 'Super Admin',
            views: 0,
            engagement: 0
        };

        setAnnouncements([newAnn, ...announcements]);
        toast({ title: 'Published!', description: 'Announcement has been sent to all recipients.' });
        setShowComposer(false);
        setShowPreview(false);
        resetComposer();
    };

    const handleSchedule = () => {
        if (!composerData.title || !composerData.content || !composerData.scheduleDate) {
            toast({ title: 'Error', description: 'Title, content, and schedule date are required', variant: 'destructive' });
            return;
        }

        const scheduledAt = `${composerData.scheduleDate}T${composerData.scheduleTime || '09:00'}:00`;
        const newAnn = {
            id: `ann${Date.now()}`,
            ...composerData,
            status: 'scheduled',
            scheduledAt,
            createdBy: currentUser?.name || 'Super Admin',
            views: 0,
            engagement: 0
        };

        setAnnouncements([newAnn, ...announcements]);
        toast({ title: 'Scheduled!', description: `Announcement will be sent on ${new Date(scheduledAt).toLocaleString()}` });
        setShowComposer(false);
        resetComposer();
    };

    const handleSaveDraft = () => {
        const newAnn = {
            id: `ann${Date.now()}`,
            ...composerData,
            status: 'draft',
            createdBy: currentUser?.name || 'Super Admin',
            views: 0,
            engagement: 0
        };
        setAnnouncements([newAnn, ...announcements]);
        toast({ title: 'Draft Saved', description: 'You can continue editing later.' });
        setShowComposer(false);
        resetComposer();
    };

    const resetComposer = () => {
        setComposerData({
            title: '', content: '', type: 'announcement', priority: 'normal',
            target: 'all', targetSchools: [], channels: ['email', 'app'],
            scheduleDate: '', scheduleTime: ''
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            published: 'bg-emerald-100 text-emerald-700',
            scheduled: 'bg-blue-100 text-blue-700',
            draft: 'bg-gray-100 text-gray-600'
        };
        return styles[status] || styles.draft;
    };

    const getTypeBadge = (type) => {
        const typeObj = announcementTypes.find(t => t.id === type);
        const colors = {
            blue: 'bg-blue-100 text-blue-700',
            red: 'bg-rose-100 text-rose-700',
            amber: 'bg-amber-100 text-amber-700',
            purple: 'bg-purple-100 text-purple-700'
        };
        return { style: colors[typeObj?.color] || colors.blue, icon: typeObj?.icon || '📢' };
    };

    const toggleSchool = (school) => {
        if (composerData.targetSchools.includes(school)) {
            setComposerData({ ...composerData, targetSchools: composerData.targetSchools.filter(s => s !== school) });
        } else {
            setComposerData({ ...composerData, targetSchools: [...composerData.targetSchools, school] });
        }
    };

    const toggleChannel = (channelId) => {
        if (composerData.channels.includes(channelId)) {
            setComposerData({ ...composerData, channels: composerData.channels.filter(c => c !== channelId) });
        } else {
            setComposerData({ ...composerData, channels: [...composerData.channels, channelId] });
        }
    };

    // Access check
    if (!isSuperAdmin && currentUser?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">Access Denied</h2>
                    <p className="text-gray-500">Only Super Admin can publish announcements</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-xl shadow-lg p-6 text-white"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Megaphone className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Announcements & Communications</h1>
                            <p className="text-orange-100 text-sm mt-1">
                                Platform-wide notifications and messaging
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowComposer(true)}
                        className="bg-white text-orange-600 hover:bg-orange-50"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Announcement
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/20">
                    <div className="text-center">
                        <p className="text-2xl font-bold">{announcements.filter(a => a.status === 'published').length}</p>
                        <p className="text-sm text-orange-100">Published</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold">{announcements.filter(a => a.status === 'scheduled').length}</p>
                        <p className="text-sm text-orange-100">Scheduled</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold">{announcements.filter(a => a.status === 'draft').length}</p>
                        <p className="text-sm text-orange-100">Drafts</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold">{announcements.reduce((sum, a) => sum + a.views, 0).toLocaleString()}</p>
                        <p className="text-sm text-orange-100">Total Views</p>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {[
                    { id: 'announcements', label: 'Announcements', icon: Megaphone },
                    { id: 'templates', label: 'Templates', icon: FileText }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'announcements' && (
                <>
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
                                    placeholder="Search announcements..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="published">Published</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="draft">Draft</option>
                            </select>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            >
                                <option value="all">All Types</option>
                                {announcementTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                    </motion.div>

                    {/* Announcements Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Announcement</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Target</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Engagement</th>
                                        <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAnnouncements.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">No announcements found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAnnouncements.map((ann) => {
                                            const typeInfo = getTypeBadge(ann.type);
                                            return (
                                                <tr key={ann.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="max-w-md">
                                                            <p className="font-medium text-gray-800 truncate">{ann.title}</p>
                                                            <p className="text-sm text-gray-500 truncate">{ann.content.substring(0, 60)}...</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${typeInfo.style}`}>
                                                            <span>{typeInfo.icon}</span>
                                                            {announcementTypes.find(t => t.id === ann.type)?.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            {ann.target === 'all' ? (
                                                                <>
                                                                    <Users className="w-4 h-4" />
                                                                    <span>All Schools</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Building2 className="w-4 h-4" />
                                                                    <span>{ann.targetSchools?.length} Schools</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(ann.status)}`}>
                                                            {ann.status}
                                                        </span>
                                                        {ann.status === 'scheduled' && ann.scheduledAt && (
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {new Date(ann.scheduledAt).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {ann.status === 'published' ? (
                                                            <div className="flex items-center gap-4 text-sm">
                                                                <div className="flex items-center gap-1">
                                                                    <Eye className="w-4 h-4 text-gray-400" />
                                                                    <span>{ann.views.toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <BarChart3 className="w-4 h-4 text-gray-400" />
                                                                    <span>{ann.engagement}%</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button className="p-2 hover:bg-gray-100 rounded-lg" title="View">
                                                                <Eye className="w-4 h-4 text-gray-500" />
                                                            </button>
                                                            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
                                                                <Edit2 className="w-4 h-4 text-gray-500" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </>
            )}

            {activeTab === 'templates' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Email Templates */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                            <Mail className="w-5 h-5 text-blue-500" />
                            Email Templates
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {emailTemplates.map(template => (
                                <div key={template.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-800">{template.name}</h4>
                                            <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                                            <p className="text-xs text-gray-400 mt-2">Subject: {template.subject}</p>
                                        </div>
                                        <button className="p-2 hover:bg-gray-200 rounded-lg">
                                            <Edit2 className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SMS Templates */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                            <MessageSquare className="w-5 h-5 text-green-500" />
                            SMS Templates
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {smsTemplates.map(template => (
                                <div key={template.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-800">{template.name}</h4>
                                            <p className="text-sm text-gray-600 mt-2 font-mono bg-white p-2 rounded border">
                                                {template.content}
                                            </p>
                                        </div>
                                        <button className="p-2 hover:bg-gray-200 rounded-lg">
                                            <Edit2 className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Composer Modal */}
            <AnimatePresence>
                {showComposer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowComposer(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">New Announcement</h2>
                                <button onClick={() => setShowComposer(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Announcement Type</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {announcementTypes.map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setComposerData({ ...composerData, type: type.id })}
                                                className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${composerData.type === type.id
                                                        ? 'bg-orange-100 border-orange-300 text-orange-700'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span>{type.icon}</span>
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        value={composerData.title}
                                        onChange={(e) => setComposerData({ ...composerData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        placeholder="Enter announcement title"
                                    />
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                                    <textarea
                                        value={composerData.content}
                                        onChange={(e) => setComposerData({ ...composerData, content: e.target.value })}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        placeholder="Write your announcement content..."
                                    />
                                </div>

                                {/* Target */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                                    <div className="flex gap-4 mb-3">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="target"
                                                checked={composerData.target === 'all'}
                                                onChange={() => setComposerData({ ...composerData, target: 'all', targetSchools: [] })}
                                                className="text-orange-500"
                                            />
                                            <Users className="w-4 h-4" />
                                            All Schools
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="target"
                                                checked={composerData.target === 'specific'}
                                                onChange={() => setComposerData({ ...composerData, target: 'specific' })}
                                                className="text-orange-500"
                                            />
                                            <Building2 className="w-4 h-4" />
                                            Specific Schools
                                        </label>
                                    </div>
                                    {composerData.target === 'specific' && (
                                        <div className="p-3 bg-gray-50 rounded-lg border max-h-40 overflow-y-auto">
                                            <div className="grid grid-cols-2 gap-2">
                                                {allSchoolsList.map(school => (
                                                    <label key={school} className="flex items-center gap-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={composerData.targetSchools.includes(school)}
                                                            onChange={() => toggleSchool(school)}
                                                            className="text-orange-500 rounded"
                                                        />
                                                        {school}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Channels */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Communication Channels</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {communicationChannels.map(ch => (
                                            <button
                                                key={ch.id}
                                                onClick={() => toggleChannel(ch.id)}
                                                className={`px-3 py-2 rounded-lg border flex items-center gap-2 transition-colors ${composerData.channels.includes(ch.id)
                                                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span>{ch.icon}</span>
                                                {ch.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Optional)</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="date"
                                            value={composerData.scheduleDate}
                                            onChange={(e) => setComposerData({ ...composerData, scheduleDate: e.target.value })}
                                            className="px-3 py-2 border border-gray-200 rounded-lg"
                                        />
                                        <input
                                            type="time"
                                            value={composerData.scheduleTime}
                                            onChange={(e) => setComposerData({ ...composerData, scheduleTime: e.target.value })}
                                            className="px-3 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-6 border-t bg-gray-50 flex justify-between">
                                <Button onClick={handleSaveDraft} variant="outline">
                                    Save as Draft
                                </Button>
                                <div className="flex gap-3">
                                    <Button onClick={() => setShowPreview(true)} variant="outline">
                                        <Eye className="w-4 h-4 mr-2" />
                                        Preview
                                    </Button>
                                    {composerData.scheduleDate ? (
                                        <Button onClick={handleSchedule} className="bg-blue-600 hover:bg-blue-700">
                                            <Clock className="w-4 h-4 mr-2" />
                                            Schedule
                                        </Button>
                                    ) : (
                                        <Button onClick={handlePublish} className="bg-orange-600 hover:bg-orange-700">
                                            <Send className="w-4 h-4 mr-2" />
                                            Publish Now
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowPreview(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl max-w-lg w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b flex items-center justify-between">
                                <h2 className="font-bold text-gray-800">Preview</h2>
                                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className={`p-4 rounded-lg border-l-4 ${composerData.type === 'emergency' ? 'bg-rose-50 border-rose-500' :
                                        composerData.type === 'maintenance' ? 'bg-amber-50 border-amber-500' :
                                            'bg-blue-50 border-blue-500'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">
                                            {announcementTypes.find(t => t.id === composerData.type)?.icon}
                                        </span>
                                        <h3 className="font-bold text-gray-800">{composerData.title || 'Untitled'}</h3>
                                    </div>
                                    <p className="text-gray-700">
                                        {composerData.content || 'No content provided'}
                                    </p>
                                    <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Target className="w-4 h-4" />
                                            {composerData.target === 'all' ? 'All Schools' : `${composerData.targetSchools.length} Schools`}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            {composerData.channels.map(ch =>
                                                communicationChannels.find(c => c.id === ch)?.icon
                                            ).join(' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                                <Button onClick={() => setShowPreview(false)} variant="outline">
                                    Back to Edit
                                </Button>
                                <Button onClick={handlePublish} className="bg-orange-600 hover:bg-orange-700">
                                    <Send className="w-4 h-4 mr-2" />
                                    Publish Now
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SuperAdminAnnouncements;
