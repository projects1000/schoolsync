
import React from 'react';
import { motion } from 'framer-motion';

const AttendanceChart = () => {
  const weekData = [
    { day: 'Mon', attendance: 85 },
    { day: 'Tue', attendance: 92 },
    { day: 'Wed', attendance: 78 },
    { day: 'Thu', attendance: 89 },
    { day: 'Fri', attendance: 94 },
    { day: 'Sat', attendance: 87 },
    { day: 'Sun', attendance: 0 }
  ];

  const maxAttendance = Math.max(...weekData.map(d => d.attendance));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Weekly Attendance</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Attendance %</span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between h-48 space-x-2">
        {weekData.map((data, index) => (
          <motion.div
            key={data.day}
            className="flex-1 flex flex-col items-center"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <div className="w-full flex flex-col items-center">
              <motion.div
                className="w-full bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg relative"
                initial={{ height: 0 }}
                animate={{ height: `${(data.attendance / maxAttendance) * 160}px` }}
                transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">
                  {data.attendance > 0 ? `${data.attendance}%` : ''}
                </div>
              </motion.div>
              <div className="mt-2 text-sm font-medium text-gray-600">{data.day}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>This Week</span>
        <span>Average: 87.5%</span>
      </div>
    </div>
  );
};

export default AttendanceChart;
