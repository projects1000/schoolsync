import React from 'react';
import { motion } from 'framer-motion';

const AttendanceTrendChart = ({ data }) => {
    // Handle empty or invalid data
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Attendance Trend</h3>
                        <p className="text-sm text-gray-500">Platform-wide average</p>
                    </div>
                </div>
                <div className="h-36 flex items-center justify-center text-gray-400">
                    No data available
                </div>
            </div>
        );
    }

    const maxPercentage = 100;
    const chartHeight = 120;
    const avgPercentage = Math.round(data.reduce((sum, d) => sum + (d.percentage || 0), 0) / data.length);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Attendance Trend</h3>
                    <p className="text-sm text-gray-500">Platform-wide average</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
                        <span className="text-xs text-gray-500">Attendance %</span>
                    </div>
                    <div className="px-2 py-1 bg-emerald-50 rounded-full">
                        <span className="text-xs font-semibold text-emerald-600">
                            Avg: {avgPercentage}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-end justify-between h-36 gap-3">
                {data.map((item, index) => (
                    <motion.div
                        key={item.day || index}
                        className="flex-1 flex flex-col items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                    >
                        <div className="relative w-full flex justify-center mb-1">
                            <span className="text-xs font-semibold text-gray-600">{item.percentage || 0}%</span>
                        </div>
                        <div className="relative w-full flex justify-center">
                            <motion.div
                                className="w-full max-w-12 rounded-lg relative overflow-hidden"
                                style={{ backgroundColor: '#fef3c7' }}
                                initial={{ height: 0 }}
                                animate={{ height: `${chartHeight}px` }}
                                transition={{ delay: index * 0.08, duration: 0.4 }}
                            >
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500 to-orange-400 rounded-lg"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${((item.percentage || 0) / maxPercentage) * 100}%` }}
                                    transition={{ delay: index * 0.08 + 0.3, duration: 0.6, ease: "easeOut" }}
                                />
                            </motion.div>
                        </div>
                        <div className="mt-2 text-xs font-medium text-gray-500 text-center">{item.day}</div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Last 6 weeks</span>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Target:</span>
                    <span className="text-sm font-semibold text-amber-600">90%</span>
                </div>
            </div>
        </div>
    );
};

export default AttendanceTrendChart;
