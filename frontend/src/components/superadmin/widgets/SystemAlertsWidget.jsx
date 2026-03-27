import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Bell } from 'lucide-react';

const SystemAlertsWidget = ({ alerts }) => {
    const navigate = useNavigate();
    const getAlertConfig = (type) => {
        switch (type) {
            case 'error':
                return {
                    icon: AlertCircle,
                    bg: 'bg-rose-50',
                    border: 'border-rose-200',
                    iconColor: 'text-rose-500',
                    titleColor: 'text-rose-800'
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    bg: 'bg-amber-50',
                    border: 'border-amber-200',
                    iconColor: 'text-amber-500',
                    titleColor: 'text-amber-800'
                };
            case 'success':
                return {
                    icon: CheckCircle,
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-200',
                    iconColor: 'text-emerald-500',
                    titleColor: 'text-emerald-800'
                };
            case 'info':
            default:
                return {
                    icon: Info,
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    iconColor: 'text-blue-500',
                    titleColor: 'text-blue-800'
                };
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-rose-100 rounded-lg">
                            <Bell className="w-4 h-4 text-rose-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">System Alerts</h3>
                            <p className="text-xs text-gray-500">Notifications & warnings</p>
                        </div>
                    </div>
                    <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full">
                        {alerts.filter(a => a.type === 'error' || a.type === 'warning').length}
                    </span>
                </div>
            </div>

            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {alerts.map((alert, index) => {
                    const config = getAlertConfig(alert.type);
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={alert.id || `${alert.title}-${index}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 ${config.bg} border-l-4 ${config.border}`}
                        >
                            <div className="flex gap-3">
                                <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium text-sm ${config.titleColor}`}>{alert.title}</p>
                                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{alert.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100">
                <button
                    onClick={() => navigate('/superadmin/security')}
                    className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    View All Alerts →
                </button>
            </div>
        </div>
    );
};

export default SystemAlertsWidget;
