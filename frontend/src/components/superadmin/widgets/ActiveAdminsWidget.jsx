import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Clock } from 'lucide-react';

const ActiveAdminsWidget = ({ admins }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Active Admins</h3>
                        <p className="text-xs text-gray-500">Recently active principals</p>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-50">
                {admins.map((admin, index) => (
                    <motion.div
                        key={admin.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-semibold">{admin.avatar}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{admin.name}</p>
                                <p className="text-xs text-gray-500 truncate">{admin.school}</p>
                            </div>
                            <div className="flex items-center text-xs text-gray-400">
                                <Clock className="w-3 h-3 mr-1" />
                                {admin.lastActive}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100">
                <button className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    View All Admins →
                </button>
            </div>
        </div>
    );
};

export default ActiveAdminsWidget;
