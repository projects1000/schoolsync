import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign,
    CreditCard,
    Clock,
    Percent,
    RotateCcw,
    FileText,
    Settings,
    ChevronDown,
    ChevronUp,
    Lock,
    Shield,
    History,
    Save,
    X,
    AlertTriangle,
    Check,
    Eye,
    Printer,
    Plus,
    Trash2,
    Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
    feeCategories as initialCategories,
    lateFeeRules as initialLateFees,
    discountRules as initialDiscounts,
    refundRules as initialRefunds,
    invoiceTemplate as initialInvoice,
    feeSettingsVersion
} from './mockFeeSettings';

const GlobalFeeSettings = ({ currentUser }) => {
    const { toast } = useToast();
    const isSuperAdmin = currentUser?.role === 'superadmin';

    // State
    const [feeCategories, setFeeCategories] = useState(initialCategories);
    const [lateFeeRules, setLateFeeRules] = useState(initialLateFees);
    const [discountRules, setDiscountRules] = useState(initialDiscounts);
    const [refundRules, setRefundRules] = useState(initialRefunds);
    const [invoiceTemplate, setInvoiceTemplate] = useState(initialInvoice);

    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        lateFees: false,
        discounts: false,
        refunds: false,
        invoice: false
    });
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showHistoryPanel, setShowHistoryPanel] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const toggleSection = (section) => {
        setExpandedSections({ ...expandedSections, [section]: !expandedSections[section] });
    };

    const handlePublishChanges = () => {
        toast({
            title: 'Fee Settings Published',
            description: 'All schools will now use the updated fee configuration.'
        });
        setShowConfirmModal(false);
        setHasChanges(false);
    };

    const SectionHeader = ({ title, icon: Icon, section, description, badge }) => (
        <button
            onClick={() => toggleSection(section)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                    <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{title}</h3>
                        {badge && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {!isSuperAdmin && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        <Lock className="w-3 h-3" />
                        Apply Only
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

    const LockedBadge = () => (
        <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            <Shield className="w-3 h-3" />
            System Controlled
        </span>
    );

    const RuleCard = ({ rule, type }) => (
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800">{rule.name}</h4>
                    {type === 'discount' && (
                        <span className={`px-2 py-0.5 text-xs rounded ${rule.autoApply ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {rule.autoApply ? 'Auto Apply' : 'Manual'}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-500">{rule.description}</p>
                {type === 'discount' && rule.applicableTo && (
                    <div className="flex gap-1 mt-2">
                        {rule.applicableTo.map((cat, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">
                                {cat}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                <div className="text-right">
                    <span className={`text-lg font-bold ${type === 'late' ? 'text-orange-600' :
                        type === 'discount' ? 'text-emerald-600' : 'text-blue-600'
                        }`}>
                        {rule.value}{rule.type === 'Percentage' || type === 'refund' ? '%' : rule.unit ? ` ${rule.unit}` : ''}
                    </span>
                </div>
                <LockedBadge />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-emerald-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <DollarSign className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Global Fee & Financial Settings</h1>
                            <p className="text-emerald-100 text-sm mt-1">
                                Configure fee structure and billing rules for all schools
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
                                className="bg-white text-emerald-600 hover:bg-emerald-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Publish Changes
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4 pt-4 border-t border-white/20 text-sm text-emerald-100">
                    <div className="flex items-center gap-2">
                        <span>Current Version: <strong className="text-white">{feeSettingsVersion.current}</strong></span>
                        <span className="hidden md:inline text-white/50">•</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Last Updated: {new Date(feeSettingsVersion.lastUpdated).toLocaleDateString()}</span>
                    </div>
                    {!isSuperAdmin && (
                        <>
                            <span className="hidden md:inline text-white/50">•</span>
                            <span className="flex items-center gap-1 text-amber-200">
                                <Lock className="w-3 h-3" />
                                Admins can apply, not modify
                            </span>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Settings Sections */}
            <div className="space-y-4">
                {/* Fee Categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <SectionHeader
                        title="Fee Categories"
                        icon={CreditCard}
                        section="categories"
                        description="Define fee types and billing frequency"
                        badge={`${feeCategories.length} categories`}
                    />
                    <AnimatePresence>
                        {expandedSections.categories && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-100"
                            >
                                <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {feeCategories.map((cat) => (
                                            <div
                                                key={cat.id}
                                                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{cat.icon}</span>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">{cat.name}</h4>
                                                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                                                                {cat.code}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <LockedBadge />
                                                </div>
                                                <p className="text-sm text-gray-500 mb-3">{cat.description}</p>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="text-gray-600">{cat.frequency}</span>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded text-xs ${cat.mandatory
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {cat.mandatory ? 'Mandatory' : 'Optional'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Late Fee Rules */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <SectionHeader
                        title="Late Fee Rules"
                        icon={Clock}
                        section="lateFees"
                        description="Configure penalty rules for overdue payments"
                        badge={`${lateFeeRules.length} rules`}
                    />
                    <AnimatePresence>
                        {expandedSections.lateFees && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-100"
                            >
                                <div className="p-4 space-y-3">
                                    {lateFeeRules.map((rule) => (
                                        <RuleCard key={rule.id} rule={rule} type="late" />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Discount Rules */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <SectionHeader
                        title="Discount Rules"
                        icon={Percent}
                        section="discounts"
                        description="Configure automatic and manual discount eligibility"
                        badge={`${discountRules.length} rules`}
                    />
                    <AnimatePresence>
                        {expandedSections.discounts && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-100"
                            >
                                <div className="p-4 space-y-3">
                                    {discountRules.map((rule) => (
                                        <RuleCard key={rule.id} rule={rule} type="discount" />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Refund Rules */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <SectionHeader
                        title="Refund Rules"
                        icon={RotateCcw}
                        section="refunds"
                        description="Configure refund policies by fee category"
                        badge={`${refundRules.length} policies`}
                    />
                    <AnimatePresence>
                        {expandedSections.refunds && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-100"
                            >
                                <div className="p-4 overflow-x-auto">
                                    <table className="w-full min-w-[500px]">
                                        <thead>
                                            <tr className="text-left text-sm text-gray-500 border-b">
                                                <th className="pb-3 font-medium">Category</th>
                                                <th className="pb-3 font-medium">Condition</th>
                                                <th className="pb-3 font-medium">Refund %</th>
                                                <th className="pb-3 font-medium">Deduction</th>
                                                <th className="pb-3 font-medium"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {refundRules.map((rule) => (
                                                <tr key={rule.id} className="text-gray-700">
                                                    <td className="py-3 font-medium">{rule.category}</td>
                                                    <td className="py-3 text-gray-500">{rule.condition}</td>
                                                    <td className="py-3">
                                                        <span className={`font-semibold ${rule.refundPercent === 100 ? 'text-emerald-600' :
                                                            rule.refundPercent === 0 ? 'text-orange-600' : 'text-blue-600'
                                                            }`}>
                                                            {rule.refundPercent}%
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-gray-500">{rule.deduction}</td>
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

                {/* Invoice Template */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <SectionHeader
                        title="Invoice Template"
                        icon={FileText}
                        section="invoice"
                        description="Configure invoice layout and content"
                    />
                    <AnimatePresence>
                        {expandedSections.invoice && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-100"
                            >
                                <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        {[
                                            { label: 'School Logo', value: invoiceTemplate.headerLogo },
                                            { label: 'School Address', value: invoiceTemplate.showSchoolAddress },
                                            { label: 'Parent Details', value: invoiceTemplate.showParentDetails },
                                            { label: 'Due Date', value: invoiceTemplate.showDueDate },
                                            { label: 'Late Fee Warning', value: invoiceTemplate.showLateFeeWarning },
                                            { label: 'Student Photo', value: invoiceTemplate.showStudentPhoto },
                                            { label: 'GST Number', value: invoiceTemplate.showGSTNumber }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="text-sm text-gray-600">{item.label}</span>
                                                <span className={`w-5 h-5 rounded-full flex items-center justify-center ${item.value ? 'bg-emerald-500' : 'bg-gray-300'
                                                    }`}>
                                                    {item.value && <Check className="w-3 h-3 text-white" />}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-500 mb-1">Invoice Number Format</p>
                                            <p className="font-mono text-gray-800">{invoiceTemplate.invoiceNumberFormat}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-500 mb-1">Payment Methods</p>
                                            <div className="flex flex-wrap gap-1">
                                                {invoiceTemplate.paymentMethods.map((method, i) => (
                                                    <span key={i} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                                        {method}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-gray-50 rounded-lg mb-4">
                                        <p className="text-sm text-gray-500 mb-2">Footer Text</p>
                                        <p className="text-sm text-gray-700">{invoiceTemplate.footerText}</p>
                                    </div>

                                    <Button
                                        onClick={() => setShowInvoicePreview(true)}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Preview Invoice
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Invoice Preview Modal */}
            <AnimatePresence>
                {showInvoicePreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowInvoicePreview(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800">Invoice Preview</h2>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Printer className="w-4 h-4 mr-1" /> Print
                                    </Button>
                                    <button onClick={() => setShowInvoicePreview(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50">
                                <div className="bg-white p-6 rounded-lg border shadow-sm">
                                    {/* Invoice Header */}
                                    <div className="flex justify-between items-start mb-6 pb-4 border-b">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold text-xl">LS</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800">Little Steps Playschool</h3>
                                                <p className="text-xs text-gray-500">123 Education Lane, Mumbai</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-800">INVOICE</p>
                                            <p className="text-sm text-gray-500">INV-2026-0042</p>
                                        </div>
                                    </div>

                                    {/* Bill To */}
                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase mb-1">Bill To</p>
                                            <p className="font-medium text-gray-800">Mr. Rajesh Kumar</p>
                                            <p className="text-sm text-gray-600">Parent of: Aarav Kumar</p>
                                            <p className="text-sm text-gray-600">Class: Nursery A</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="mb-2">
                                                <p className="text-xs text-gray-500">Invoice Date</p>
                                                <p className="text-sm text-gray-800">January 15, 2026</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Due Date</p>
                                                <p className="text-sm font-medium text-orange-600">January 25, 2026</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fee Items */}
                                    <table className="w-full mb-6">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">Description</th>
                                                <th className="py-2 px-3 text-right text-xs font-medium text-gray-500">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            <tr>
                                                <td className="py-3 px-3 text-sm">Tuition Fee - January 2026</td>
                                                <td className="py-3 px-3 text-sm text-right">₹5,000</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-3 text-sm">Transport Fee - January 2026</td>
                                                <td className="py-3 px-3 text-sm text-right">₹1,500</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-3 text-sm text-emerald-600">Sibling Discount (10%)</td>
                                                <td className="py-3 px-3 text-sm text-right text-emerald-600">-₹500</td>
                                            </tr>
                                        </tbody>
                                        <tfoot className="border-t-2">
                                            <tr>
                                                <td className="py-3 px-3 font-bold text-gray-800">Total Amount</td>
                                                <td className="py-3 px-3 text-right font-bold text-lg text-gray-800">₹6,000</td>
                                            </tr>
                                        </tfoot>
                                    </table>

                                    {/* Payment Methods */}
                                    <div className="p-3 bg-blue-50 rounded-lg mb-4">
                                        <p className="text-xs text-blue-600 font-medium mb-1">Payment Methods Accepted</p>
                                        <p className="text-sm text-blue-800">Cash, UPI, Bank Transfer, Cheque</p>
                                    </div>

                                    {/* Late Fee Warning */}
                                    <div className="p-3 bg-amber-50 rounded-lg mb-4">
                                        <p className="text-xs text-amber-700">
                                            ⚠️ Late payment will attract ₹100 flat fee after 7 days, plus ₹10/day after 15 days.
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="text-center text-sm text-gray-500 pt-4 border-t">
                                        {invoiceTemplate.footerText}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                        <p className="text-sm text-gray-500">Fee settings change log</p>
                                    </div>
                                    <button onClick={() => setShowHistoryPanel(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
                                <div className="space-y-6">
                                    {feeSettingsVersion.history.map((entry, index) => (
                                        <motion.div
                                            key={entry.version}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="relative pl-6 border-l-2 border-emerald-200"
                                        >
                                            <div className="absolute -left-2 top-0 w-4 h-4 bg-emerald-500 rounded-full" />
                                            <div className="mb-1 flex items-center gap-2">
                                                <span className="font-bold text-emerald-600">{entry.version}</span>
                                                <span className="text-sm text-gray-400">•</span>
                                                <span className="text-sm text-gray-500">{entry.date}</span>
                                            </div>
                                            <ul className="space-y-1">
                                                {entry.changes.map((change, i) => (
                                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                        <span className="text-emerald-400 mt-1">•</span>
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
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Publish Fee Settings?</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    These changes will affect fee calculations for <strong>all schools</strong>.
                                    Existing invoices will not be affected, but new invoices will use the updated rules.
                                </p>
                                <div className="flex gap-3">
                                    <Button onClick={() => setShowConfirmModal(false)} className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200">
                                        Cancel
                                    </Button>
                                    <Button onClick={handlePublishChanges} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                                        <Check className="w-4 h-4 mr-1" />
                                        Publish Changes
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

export default GlobalFeeSettings;
