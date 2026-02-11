import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    GraduationCap,
    Calendar,
    Users,
    ArrowUpRight,
    Clock,
    Lock,
    History,
    Save,
    X,
    AlertTriangle,
    Check,
    ChevronDown,
    ChevronUp,
    Edit2,
    Plus,
    Trash2,
    BookOpen,
    Baby,
    CalendarDays,
    PartyPopper,
    TrendingUp,
    Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
    classTemplates as initialClassTemplates,
    ageMappings as initialAgeMappings,
    academicYearTemplate as initialAcademicYear,
    holidayMasterTemplate as initialHolidays,
    promotionRules as initialPromotionRules,
    versionHistory,
    currentVersion,
    lastUpdated
} from './mockAcademicSettings';

const GlobalAcademicSettings = ({ currentUser }) => {
    const { toast } = useToast();
    const isSuperAdmin = currentUser?.role === 'superadmin';

    // State for settings
    const [classTemplates, setClassTemplates] = useState(initialClassTemplates);
    const [ageMappings, setAgeMappings] = useState(initialAgeMappings);
    const [academicYear, setAcademicYear] = useState(initialAcademicYear);
    const [holidays, setHolidays] = useState(initialHolidays);
    const [promotionRules, setPromotionRules] = useState(initialPromotionRules);

    // UI state
    const [expandedSections, setExpandedSections] = useState({
        classes: true,
        ageMapping: false,
        academicYear: false,
        holidays: false,
        promotions: false
    });
    const [showHistoryPanel, setShowHistoryPanel] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [editingClass, setEditingClass] = useState(null);

    const toggleSection = (section) => {
        setExpandedSections({ ...expandedSections, [section]: !expandedSections[section] });
    };

    const handleSaveSettings = () => {
        toast({ title: 'Settings Saved', description: 'Global academic settings have been updated. Changes will apply to all schools.' });
        setShowConfirmModal(false);
        setHasChanges(false);
    };

    const SectionHeader = ({ title, icon: Icon, section, description }) => (
        <button
            onClick={() => toggleSection(section)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{title}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {!isSuperAdmin && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        <Lock className="w-3 h-3" />
                        Read Only
                    </span>
                )}
                {expandedSections[section] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </div>
        </button>
    );

    // Access denied for non-superadmin view (showing read-only)
    const LockedBadge = () => (
        <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            <Shield className="w-3 h-3" />
            System Controlled
        </span>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Settings className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Global Academic Settings</h1>
                            <p className="text-indigo-100 text-sm mt-1">
                                Configure academic standards across all schools
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowHistoryPanel(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        >
                            <History className="w-4 h-4" />
                            Version History
                        </button>
                        {isSuperAdmin && hasChanges && (
                            <Button
                                onClick={() => setShowConfirmModal(true)}
                                className="bg-white text-indigo-600 hover:bg-indigo-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        )}
                    </div>
                </div>

                {/* Version Info */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20 text-sm text-indigo-100">
                    <span>Current Version: <strong className="text-white">{currentVersion}</strong></span>
                    <span className="text-white/50">•</span>
                    <span>Last Updated: {new Date(lastUpdated).toLocaleDateString()}</span>
                    {!isSuperAdmin && (
                        <>
                            <span className="text-white/50">•</span>
                            <span className="flex items-center gap-1 text-amber-200">
                                <Lock className="w-3 h-3" />
                                Changes by Super Admin only
                            </span>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Settings Sections */}
            <div className="space-y-4">
                {/* Class Templates */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <SectionHeader
                        title="Class Templates"
                        icon={GraduationCap}
                        section="classes"
                        description="Define standard class structures"
                    />
                    <AnimatePresence>
                        {expandedSections.classes && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-100"
                            >
                                <div className="p-4">
                                    <div className="grid gap-3">
                                        {classTemplates.map((cls, index) => (
                                            <div
                                                key={cls.id}
                                                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 gap-4"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                                                        <span className="font-bold text-indigo-600">{cls.shortCode}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-800">{cls.name}</h4>
                                                        <p className="text-sm text-gray-500">{cls.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
                                                    <div className="text-center bg-white px-3 py-1 rounded-md border border-gray-100 shadow-sm w-[45%] md:w-auto">
                                                        <p className="text-gray-400 text-xs">Age Range</p>
                                                        <p className="font-medium text-gray-700">{cls.minAge} - {cls.maxAge} yrs</p>
                                                    </div>
                                                    <div className="text-center bg-white px-3 py-1 rounded-md border border-gray-100 shadow-sm w-[45%] md:w-auto">
                                                        <p className="text-gray-400 text-xs">Max Capacity</p>
                                                        <p className="font-medium text-gray-700">{cls.maxCapacity}</p>
                                                    </div>
                                                    <div className="text-center bg-white px-3 py-1 rounded-md border border-gray-100 shadow-sm w-[45%] md:w-auto">
                                                        <p className="text-gray-400 text-xs">Teacher Ratio</p>
                                                        <p className="font-medium text-gray-700">{cls.teacherRatio}</p>
                                                    </div>
                                                    <div className="w-[45%] md:w-auto flex justify-center">
                                                        <LockedBadge />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Age → Class Mapping */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <SectionHeader
                        title="Age → Class Mapping"
                        icon={Baby}
                        section="ageMapping"
                        description="Define age criteria for class placement"
                    />
                    <AnimatePresence>
                        {expandedSections.ageMapping && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-100"
                            >
                                <div className="p-4">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-sm text-gray-500">
                                                <th className="pb-3 font-medium">Age Range</th>
                                                <th className="pb-3 font-medium">Assigned Class</th>
                                                <th className="pb-3 font-medium">Age Cutoff Month</th>
                                                <th className="pb-3 font-medium"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {ageMappings.map((mapping, index) => (
                                                <tr key={index} className="text-gray-700">
                                                    <td className="py-3 font-medium">{mapping.ageRange}</td>
                                                    <td className="py-3">
                                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                                            {mapping.class}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">{mapping.cutoffMonth}</td>
                                                    <td className="py-3 text-right">
                                                        <LockedBadge />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Academic Year Template */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <SectionHeader
                        title="Academic Year Template"
                        icon={CalendarDays}
                        section="academicYear"
                        description="Define academic calendar structure"
                    />
                    <AnimatePresence>
                        {expandedSections.academicYear && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-100"
                            >
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-sm text-blue-600 mb-1">Academic Year Start</p>
                                            <p className="font-semibold text-blue-800">{academicYear.startMonth}</p>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-sm text-blue-600 mb-1">Academic Year End</p>
                                            <p className="font-semibold text-blue-800">{academicYear.endMonth}</p>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                            <p className="text-sm text-green-600 mb-1">Admission Window</p>
                                            <p className="font-semibold text-green-800">
                                                {academicYear.admissionWindow.start} - {academicYear.admissionWindow.end}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                            <p className="text-sm text-purple-600 mb-1">Exam Months</p>
                                            <p className="font-semibold text-purple-800">
                                                {academicYear.examWeeks.join(', ')}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Term Structure
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {academicYear.terms.map((term, index) => (
                                                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                                                    <p className="font-medium text-gray-800">{term.name}</p>
                                                    <p className="text-sm text-gray-500">{term.startMonth} - {term.endMonth}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Holiday Master Template */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <SectionHeader
                        title="Holiday Master Template"
                        icon={PartyPopper}
                        section="holidays"
                        description="Define standard holidays for all schools"
                    />
                    <AnimatePresence>
                        {expandedSections.holidays && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-100"
                            >
                                <div className="p-4">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-sm text-gray-500 border-b">
                                                    <th className="pb-3 font-medium">Holiday Name</th>
                                                    <th className="pb-3 font-medium">Date</th>
                                                    <th className="pb-3 font-medium">Type</th>
                                                    <th className="pb-3 font-medium">Mandatory</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {holidays.map((holiday, index) => (
                                                    <tr key={index} className="text-gray-700">
                                                        <td className="py-3 font-medium">{holiday.name}</td>
                                                        <td className="py-3 text-gray-500">{holiday.date}</td>
                                                        <td className="py-3">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${holiday.type === 'National' ? 'bg-blue-100 text-blue-700' :
                                                                holiday.type === 'Festival' ? 'bg-orange-100 text-orange-700' :
                                                                    holiday.type === 'Vacation' ? 'bg-green-100 text-green-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {holiday.type}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            {holiday.mandatory ? (
                                                                <span className="flex items-center gap-1 text-emerald-600">
                                                                    <Check className="w-4 h-4" /> Yes
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">Optional</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Promotion Rules */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <SectionHeader
                        title="Promotion Rules"
                        icon={TrendingUp}
                        section="promotions"
                        description="Define student promotion criteria"
                    />
                    <AnimatePresence>
                        {expandedSections.promotions && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-100"
                            >
                                <div className="p-4">
                                    <div className="space-y-3">
                                        {promotionRules.map((rule) => (
                                            <div
                                                key={rule.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-medium text-gray-800">{rule.rule}</h4>
                                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${rule.value === 'Enabled' || rule.value === 'Required'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : rule.value === 'Optional' || rule.value === 'Disabled'
                                                                ? 'bg-gray-100 text-gray-600'
                                                                : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {rule.value}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                                                </div>
                                                <LockedBadge />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Version History Panel */}
            <AnimatePresence>
                {showHistoryPanel && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/30 z-40"
                            onClick={() => setShowHistoryPanel(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50"
                        >
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800">Version History</h2>
                                        <p className="text-sm text-gray-500">Change log for academic settings</p>
                                    </div>
                                    <button onClick={() => setShowHistoryPanel(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
                                <div className="space-y-6">
                                    {versionHistory.map((entry, index) => (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="relative pl-6 border-l-2 border-indigo-200"
                                        >
                                            <div className="absolute -left-2 top-0 w-4 h-4 bg-indigo-500 rounded-full" />
                                            <div className="mb-1 flex items-center gap-2">
                                                <span className="font-bold text-indigo-600">{entry.version}</span>
                                                <span className="text-sm text-gray-400">•</span>
                                                <span className="text-sm text-gray-500">{entry.date}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">Changed by: {entry.changedBy}</p>
                                            <ul className="space-y-1">
                                                {entry.changes.map((change, i) => (
                                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                        <span className="text-indigo-400 mt-1">•</span>
                                                        {change}
                                                    </li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowConfirmModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Global Changes</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    These changes will affect <strong>all schools</strong> on the platform.
                                    Admins will see the updated settings as read-only. This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <Button onClick={() => setShowConfirmModal(false)} className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSaveSettings} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                                        <Check className="w-4 h-4 mr-1" />
                                        Confirm & Save
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GlobalAcademicSettings;
