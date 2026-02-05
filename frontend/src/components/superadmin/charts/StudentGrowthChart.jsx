import React from 'react';
import { motion } from 'framer-motion';

const StudentGrowthChart = ({ data }) => {
    // Handle empty or invalid data
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Student Growth</h3>
                        <p className="text-sm text-gray-500">Year-over-year trend</p>
                    </div>
                </div>
                <div className="h-44 flex items-center justify-center text-gray-400">
                    No data available
                </div>
            </div>
        );
    }

    const maxStudents = Math.max(...data.map(d => d.students || 0));
    const minStudents = Math.min(...data.map(d => d.students || 0));
    // Prevent division by zero when all values are the same or only one data point
    const range = maxStudents - minStudents || 1;
    const chartHeight = 140;
    const chartWidth = 100;

    // Calculate points for the line
    const points = data.map((item, index) => {
        // Handle single data point case - center it
        const x = data.length === 1 ? chartWidth / 2 : (index / (data.length - 1)) * chartWidth;
        const y = chartHeight - ((((item.students || 0) - minStudents) / range) * chartHeight);
        return { x: isNaN(x) ? 0 : x, y: isNaN(y) ? chartHeight / 2 : y, ...item };
    });

    // Create SVG path
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Student Growth</h3>
                    <p className="text-sm text-gray-500">Year-over-year trend</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                    <span className="text-xs text-gray-500">Total Students</span>
                </div>
            </div>

            <div className="relative h-44">
                <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                >
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((percent) => (
                        <line
                            key={percent}
                            x1="0"
                            y1={chartHeight - (percent / 100) * chartHeight}
                            x2={chartWidth}
                            y2={chartHeight - (percent / 100) * chartHeight}
                            stroke="#f1f5f9"
                            strokeWidth="0.5"
                        />
                    ))}

                    {/* Area fill */}
                    <motion.path
                        d={areaPath}
                        fill="url(#areaGradient)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    />

                    {/* Line */}
                    <motion.path
                        d={linePath}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {/* Data points */}
                    {points.map((point, index) => (
                        <motion.circle
                            key={index}
                            cx={point.x}
                            cy={point.y}
                            r="2.5"
                            fill="white"
                            stroke="#10b981"
                            strokeWidth="2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                        />
                    ))}

                    {/* Gradients */}
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#14b8a6" />
                        </linearGradient>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                    {data.map((item) => (
                        <span key={item.year} className="text-xs text-gray-500">{item.year}</span>
                    ))}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Growth: <span className="font-semibold text-emerald-600">
                        {data.length >= 2 && (data[0]?.students || 0) > 0
                            ? `+${Math.round((((data[data.length - 1]?.students || 0) - (data[0]?.students || 0)) / (data[0]?.students || 1)) * 100)}%`
                            : 'N/A'}
                    </span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                    Current: {(data[data.length - 1]?.students || 0).toLocaleString()} students
                </span>
            </div>
        </div>
    );
};

export default StudentGrowthChart;
