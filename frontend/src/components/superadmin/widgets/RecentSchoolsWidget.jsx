import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, Users, Calendar } from 'lucide-react';

const RecentSchoolsWidget = ({ schools }) => {
    const navigate = useNavigate();
    // Get 5 most recently added schools
    const recentSchools = [...schools]
        .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
        .slice(0, 5);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700';
            case 'suspended': return 'bg-rose-100 text-rose-700';
            case 'inactive': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Recent Schools</h3>
                        <p className="text-xs text-gray-500">Newly onboarded</p>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-50">
                {recentSchools.map((school, index) => (
                    <motion.div
                        key={school.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{school.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="flex items-center text-xs text-gray-500">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {school.city}
                                    </span>
                                    <span className="flex items-center text-xs text-gray-500">
                                        <Users className="w-3 h-3 mr-1" />
                                        {school.students}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getStatusColor(school.status)}`}>
                                    {school.status}
                                </span>
                                <span className="flex items-center text-xs text-gray-400">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {formatDate(school.joinDate)}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100">
                <button
                    onClick={() => navigate('/superadmin/schools')}
                    className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    View All Schools →
                </button>
            </div>
        </div>
    );
};

export default RecentSchoolsWidget;
