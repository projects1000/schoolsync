import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, ChevronRight } from 'lucide-react';
import api from '@/services/api';

const CourseProgressWidget = ({ studentId, onViewAll }) => {
    const [progress, setProgress] = useState([]);

    const progressQuery = useQuery({
        queryKey: ['parent', 'course-progress', studentId],
        queryFn: () => api.get(`/parent/course-progress/${studentId}`),
        enabled: Boolean(studentId),
        staleTime: 1000 * 60,
    });

    useEffect(() => {
        if (!progressQuery.data) return;
        setProgress(progressQuery.data.data || []);
    }, [progressQuery.data]);

    useEffect(() => {
        if (!progressQuery.error) return;
        console.error('Error fetching course progress:', progressQuery.error);
    }, [progressQuery.error]);

    const loading = progressQuery.isLoading || progressQuery.isFetching;

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 50) return 'bg-yellow-500';
        if (percentage >= 25) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getProgressBgColor = (percentage) => {
        if (percentage >= 80) return 'from-green-50 to-green-100';
        if (percentage >= 50) return 'from-yellow-50 to-yellow-100';
        if (percentage >= 25) return 'from-orange-50 to-orange-100';
        return 'from-red-50 to-red-100';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                </div>
            </div>
        );
    }

    if (progress.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-semibold text-gray-800">Course Progress</h3>
                </div>
                <p className="text-gray-500 text-sm text-center py-4">No course handouts available yet.</p>
            </div>
        );
    }

    // Calculate overall progress
    const totalTopics = progress.reduce((sum, p) => sum + p.totalTopics, 0);
    const completedTopics = progress.reduce((sum, p) => sum + p.completedTopics, 0);
    const overallPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Course Progress</h3>
                        <p className="text-xs text-gray-500">{completedTopics}/{totalTopics} topics completed</p>
                    </div>
                </div>
                {onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                        View All <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Overall Progress */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-semibold text-gray-800">{overallPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(overallPercentage)}`}
                        style={{ width: `${overallPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Subject-wise Progress */}
            <div className="space-y-3">
                {progress.slice(0, 4).map((item) => (
                    <div
                        key={item.handoutId}
                        className={`p-3 rounded-lg bg-gradient-to-r ${getProgressBgColor(item.progressPercentage)}`}
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-800">{item.subject}</span>
                            <span className="text-sm font-semibold text-gray-600">
                                {item.completedTopics}/{item.totalTopics}
                            </span>
                        </div>
                        <div className="mt-2 w-full bg-white/50 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(item.progressPercentage)}`}
                                style={{ width: `${item.progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            {progress.length > 4 && (
                <p className="text-center text-sm text-gray-500 mt-3">
                    +{progress.length - 4} more subjects
                </p>
            )}
        </motion.div>
    );
};

export default CourseProgressWidget;
