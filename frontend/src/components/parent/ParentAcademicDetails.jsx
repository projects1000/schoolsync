import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, BookOpen, GraduationCap, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useParent } from '@/context/ParentContext';
import api from '@/services/api';

const ParentAcademicDetails = ({ currentUser }) => {
    const { toast } = useToast();
    const { selectedChild } = useParent();
    const [academicInfo, setAcademicInfo] = useState(null);

    const academicInfoQuery = useQuery({
        queryKey: ['parent', 'academic-info', selectedChild?.id],
        queryFn: () => api.get('/parent/academic-info'),
        enabled: Boolean(selectedChild?.id),
        staleTime: 1000 * 60,
    });

    useEffect(() => {
        if (!academicInfoQuery.data || !selectedChild) return;
        const allInfo = academicInfoQuery.data.data || [];
        const childInfo = allInfo.find(info => info.childId === selectedChild.id);
        setAcademicInfo(childInfo || null);
    }, [academicInfoQuery.data, selectedChild]);

    useEffect(() => {
        if (!academicInfoQuery.error) return;
        console.error('Error fetching academic info:', academicInfoQuery.error);
        toast({
            title: 'Error',
            description: 'Failed to load academic details',
            variant: 'destructive'
        });
    }, [academicInfoQuery.error, toast]);

    const isLoading = academicInfoQuery.isLoading || academicInfoQuery.isFetching;

    if (!selectedChild) {
        return null; // ParentProvider handles selection screen
    }

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-64" />
                </div>
                <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div>
                        <div className="h-5 bg-gray-200 rounded w-32 mb-1" />
                        <div className="h-3 bg-gray-100 rounded w-20" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="h-5 bg-gray-200 rounded w-28 mb-4" />
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full" />
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-28 mb-1" />
                                <div className="h-3 bg-gray-100 rounded w-16" />
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="h-5 bg-gray-200 rounded w-36" />
                        </div>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="p-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                                    <div>
                                        <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                                        <div className="h-3 bg-gray-100 rounded w-14" />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <div className="h-4 bg-gray-200 rounded w-28 mb-1" />
                                        <div className="h-3 bg-gray-100 rounded w-14" />
                                    </div>
                                    <div className="w-8 h-8 bg-gray-100 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!academicInfo) {
        return (
            <div className="text-center p-10 bg-white rounded-lg shadow-sm">
                No academic information available for {selectedChild.name}.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Academic Details</h1>
                    <p className="text-gray-600 mt-1">View teachers and subjects for {selectedChild.name}</p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
            >
                {/* Child Header */}
                <div className="flex items-center space-x-3 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    <div className="bg-emerald-100 p-2 rounded-full">
                        <GraduationCap className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{academicInfo.childName}</h2>
                        <p className="text-sm text-gray-600">
                            Class: <span className="font-medium text-gray-900">{academicInfo.className}</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Class Teacher Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Class Teacher</h3>
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-lg">
                                    {academicInfo.classTeacherName?.charAt(0) || '?'}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{academicInfo.classTeacherName || 'Not Assigned'}</p>
                                <p className="text-xs text-gray-500">Form Tutor</p>
                            </div>
                        </div>
                    </div>

                    {/* Subject Teachers List */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Subject Teachers</h3>
                            <BookOpen className="w-5 h-5 text-green-600" />
                        </div>

                        {academicInfo.subjects && academicInfo.subjects.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {academicInfo.subjects.map((subject, idx) => (
                                    <div key={idx} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <span className="text-gray-600 font-medium text-sm">
                                                    {subject.subjectName?.substring(0, 2).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{subject.subjectName}</p>
                                                <p className="text-sm text-gray-500">Subject</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="text-right">
                                                <p className="font-medium text-gray-900">{subject.teacherName || 'Not Assigned'}</p>
                                                <p className="text-xs text-gray-500">Teacher</p>
                                            </div>
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <Users className="w-4 h-4 text-green-600" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No subjects assigned yet.
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ParentAcademicDetails;
