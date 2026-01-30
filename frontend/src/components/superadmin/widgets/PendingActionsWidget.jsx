import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, FileCheck, UserPlus, FileText, ChevronRight } from 'lucide-react';

const PendingActionsWidget = ({ actions }) => {
    const getActionConfig = (type) => {
        switch (type) {
            case 'approval':
                return { icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-100' };
            case 'review':
                return { icon: FileCheck, color: 'text-blue-500', bg: 'bg-blue-100' };
            case 'action':
                return { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-100' };
            default:
                return { icon: ClipboardList, color: 'text-gray-500', bg: 'bg-gray-100' };
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'high':
                return 'bg-rose-100 text-rose-700 border border-rose-200';
            case 'medium':
                return 'bg-amber-100 text-amber-700 border border-amber-200';
            case 'low':
                return 'bg-gray-100 text-gray-600 border border-gray-200';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <ClipboardList className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Pending Actions</h3>
                            <p className="text-xs text-gray-500">Requires your attention</p>
                        </div>
                    </div>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                        {actions.length}
                    </span>
                </div>
            </div>

            <div className="divide-y divide-gray-50">
                {actions.map((action, index) => {
                    const config = getActionConfig(action.type);
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={action.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
                                    <Icon className={`w-4 h-4 ${config.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-medium text-gray-800 text-sm">{action.title}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${getPriorityBadge(action.priority)}`}>
                                            {action.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{action.description}</p>
                                    <p className="text-xs text-gray-400 mt-1">{action.date}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 mt-1" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100">
                <button className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    View All Actions →
                </button>
            </div>
        </div>
    );
};

export default PendingActionsWidget;
