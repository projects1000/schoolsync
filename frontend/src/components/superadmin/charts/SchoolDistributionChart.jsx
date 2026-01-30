import React from 'react';
import { motion } from 'framer-motion';

const SchoolDistributionChart = ({ schools }) => {
    // Sort by students descending and take top schools
    const sortedSchools = [...schools]
        .filter(s => s.status === 'active')
        .sort((a, b) => b.students - a.students);

    const maxStudents = Math.max(...sortedSchools.map(s => s.students));
    const totalStudents = sortedSchools.reduce((sum, s) => sum + s.students, 0);

    const colors = [
        'from-violet-500 to-purple-600',
        'from-blue-500 to-cyan-500',
        'from-emerald-500 to-teal-500',
        'from-amber-500 to-orange-500',
        'from-rose-500 to-pink-500',
        'from-indigo-500 to-blue-500',
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
                    const percentage = Math.round((school.students / totalStudents) * 100);
                    const barWidth = (school.students / maxStudents) * 100;

                    return (
                        <motion.div
                            key={school.id}
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
                                    <span className="text-sm font-semibold text-gray-800">{school.students}</span>
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
                    <span className="text-gray-500">Avg: {Math.round(totalStudents / sortedSchools.length)} per school</span>
                </div>
            </div>
        </div>
    );
};

export default SchoolDistributionChart;
