import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Paperclip, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useParent } from '@/context/ParentContext';
import api from '@/services/api';

const ParentAssignments = ({ currentUser }) => {
    const { toast } = useToast();
    const { selectedChild } = useParent();
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (selectedChild) {
            fetchAssignments();
        }
    }, [selectedChild]);

    const fetchAssignments = async () => {
        if (!selectedChild) return;

        try {
            setIsLoading(true);
            const response = await api.get(`/parent/assignments/${selectedChild.id}`);
            setAssignments(response.data || []);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            toast({
                title: "Error",
                description: "Failed to load assignments",
                variant: "destructive"
            });
            setAssignments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
    };

    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (!selectedChild) {
        return null; // ParentProvider handles selection screen
    }

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="h-7 bg-gray-200 rounded w-40 mb-2" />
                        <div className="h-4 bg-gray-100 rounded w-64" />
                    </div>
                    <div className="text-right">
                        <div className="h-3 bg-gray-200 rounded w-28 mb-2" />
                        <div className="h-9 bg-gray-300 rounded w-12" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                                    <div>
                                        <div className="h-5 bg-gray-200 rounded w-44 mb-2" />
                                        <div className="h-3 bg-gray-100 rounded w-72" />
                                    </div>
                                </div>
                                <div className="h-5 bg-gray-200 rounded-full w-24" />
                            </div>
                            <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
                                <div className="h-3 bg-gray-100 rounded w-32" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-start"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
                    <p className="text-gray-600 mt-1">View assignments for {selectedChild.name}'s class</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Total Assignments</p>
                    <p className="text-3xl font-bold text-emerald-600">{assignments.length}</p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
                {assignments.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600">No Assignments</h3>
                        <p className="text-gray-500 mt-2">There are no assignments for {selectedChild.name}'s class yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {assignments.map((assignment, index) => {
                            const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                            const overdue = isOverdue(assignment.dueDate);

                            return (
                                <motion.div
                                    key={assignment.id || index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                                                {assignment.teacherName && (
                                                    <p className="text-xs text-gray-500 mt-1">By: {assignment.teacherName}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            {overdue ? (
                                                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                                    Overdue
                                                </span>
                                            ) : daysUntilDue === 0 ? (
                                                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                                    Due Today
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                    Due in {daysUntilDue} days
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            Due: {formatDate(assignment.dueDate)}
                                        </div>
                                        {assignment.attachmentUrl && (
                                            <a
                                                href={assignment.attachmentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-sm text-emerald-600 hover:text-emerald-700"
                                            >
                                                <Paperclip className="w-4 h-4 mr-1" />
                                                View Attachment
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ParentAssignments;
