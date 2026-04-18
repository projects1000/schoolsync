import React from 'react';
import { motion } from 'framer-motion';

const SchoolDistributionChart = ({ schools }) => {
    // Handle empty or invalid data
    if (!schools || schools.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Student Distribution</h3>
                        <p className="text-sm text-gray-500">Students per school</p>
                    </div>
                </div>
                <div className="h-36 flex items-center justify-center text-gray-400">
                    No data available
                </div>
            </div>
        );
    }

    // Sort by students descending and take top schools
    const sortedSchools = [...schools]
        .filter(s => s.status === 'active')
        .sort((a, b) => (b.students || 0) - (a.students || 0));

    // Handle case where no active schools
    if (sortedSchools.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Student Distribution</h3>
                        <p className="text-sm text-gray-500">Students per school</p>
                    </div>
                </div>
                <div className="h-36 flex items-center justify-center text-gray-400">
                    No active schools
                </div>
            </div>
        );
    }

    const maxStudents = Math.max(...sortedSchools.map(s => s.students || 0), 1);
    const totalStudents = sortedSchools.reduce((sum, s) => sum + (s.students || 0), 0);

    const colors = [
        'from-green-500 to-emerald-600',
        'from-blue-500 to-green-500',
        'from-emerald-500 to-emerald-500',
        'from-amber-500 to-orange-500',
        'from-orange-500 to-amber-500',
        'from-emerald-500 to-blue-500',
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Student Distribution</h3>
                    <p className="text-sm text-gray-500">Students per school</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">{totalStudents.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Total Students</p>
                </div>
            </div>

            <div className="space-y-3">
                {sortedSchools.map((school, index) => {
                    const percentage = totalStudents > 0 ? Math.round(((school.students || 0) / totalStudents) * 100) : 0;
                    const barWidth = maxStudents > 0 ? ((school.students || 0) / maxStudents) * 100 : 0;

                    return (
                        <motion.div
                            key={school.id || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="group"
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${colors[index % colors.length]}`} />
                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                                        {school.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-800">{school.students || 0}</span>
                                    <span className="text-xs text-gray-400">({percentage}%)</span>
                                </div>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full rounded-full bg-gradient-to-r ${colors[index % colors.length]}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${barWidth}%` }}
                                    transition={{ delay: index * 0.08 + 0.2, duration: 0.6, ease: "easeOut" }}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{sortedSchools.length} active schools</span>
                    <span className="text-gray-500">Avg: {sortedSchools.length > 0 ? Math.round(totalStudents / sortedSchools.length) : 0} per school</span>
                </div>
            </div>
        </div>
    );
};

export default SchoolDistributionChart;
