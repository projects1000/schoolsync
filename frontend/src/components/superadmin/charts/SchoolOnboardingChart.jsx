import React from 'react';
import { motion } from 'framer-motion';

const SchoolOnboardingChart = ({ data }) => {
    const maxSchools = Math.max(...data.map(d => d.schools), 1);
    const barMaxHeight = 120;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">School Onboarding</h3>
                    <p className="text-sm text-gray-500">Monthly growth trend</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                    <span className="text-xs text-gray-500">Schools Added</span>
                </div>
            </div>

            <div className="flex items-end justify-between h-40 gap-1">
                {data.map((item, index) => (
                    <motion.div
                        key={item.month}
                        className="flex-1 flex flex-col items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="relative w-full flex justify-center">
                            <motion.div
                                className="w-8 rounded-t-md bg-gradient-to-t from-indigo-500 to-purple-500 relative"
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max((item.schools / maxSchools) * barMaxHeight, item.schools > 0 ? 20 : 4)}px` }}
                                transition={{ delay: index * 0.05, duration: 0.6, ease: "easeOut" }}
                            >
                                {item.schools > 0 && (
                                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-bold text-indigo-600">
                                        {item.schools}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                        <div className="mt-2 text-xs font-medium text-gray-500">{item.month}</div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Last 12 months</span>
                <span className="text-sm font-semibold text-gray-800">
                    Total: {data.reduce((sum, d) => sum + d.schools, 0)} schools
                </span>
            </div>
        </div>
    );
};

export default SchoolOnboardingChart;
