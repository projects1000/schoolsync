import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const GlobalKPICard = ({ title, value, change, trend, icon: Icon, color, subtitle }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 relative overflow-hidden"
        >
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-full`} />

            <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>

                    {subtitle && (
                        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                    )}

                    {change && (
                        <div className="flex items-center mt-2">
                            {trend === 'up' ? (
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                            ) : (
                                <TrendingDown className="w-3.5 h-3.5 text-rose-500 mr-1" />
                            )}
                            <span className={`text-xs font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                                }`}>
                                {change}
                            </span>
                            <span className="text-xs text-gray-400 ml-1">vs last month</span>
                        </div>
                    )}
                </div>

                <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
        </motion.div>
    );
};

export default GlobalKPICard;
