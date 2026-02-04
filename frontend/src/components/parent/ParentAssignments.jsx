import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Paperclip, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import parentService from '@/services/parentService';
import api from '@/services/api';

const ParentAssignments = ({ currentUser }) => {
    const { toast } = useToast();
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            fetchAssignments();
        }
    }, [selectedChild]);

    const fetchChildren = async () => {
        try {
            setIsLoading(true);
            const data = await parentService.getMyChildren();
            setChildren(data);
            if (data.length > 0) {
                setSelectedChild(data[0]);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load children data",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

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

    if (isLoading && children.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (children.length === 0) {
        return (
            <div className="text-center p-10 bg-white rounded-lg shadow-sm">
                No child assigned to this parent account. Please contact administration.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
                        <p className="text-gray-600 mt-1">View assignments for {selectedChild?.name}'s class</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Total Assignments</p>
                        <p className="text-3xl font-bold text-purple-600">{assignments.length}</p>
                    </div>
                </div>
            </motion.div>

            {children.length > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
                >
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Select Child</label>
                    <select
                        value={selectedChild?.id || ''}
                        onChange={(e) => {
                            const child = children.find(c => c.id === e.target.value);
                            setSelectedChild(child);
                        }}
                        className="w-full md:w-64 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        {children.map(child => (
                            <option key={child.id} value={child.id}>{child.name}</option>
                        ))}
                    </select>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
            >
                {isLoading ? (
                    <div className="flex justify-center items-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-gray-500">No assignments found</p>
                    </div>
                ) : (
                    assignments.map((assignment) => {
                        const daysUntil = getDaysUntilDue(assignment.dueDate);
                        const overdue = isOverdue(assignment.dueDate);

                        return (
                            <div
                                key={assignment.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start space-x-3 flex-1">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                                            <p className="text-gray-600 text-sm mt-1">{assignment.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        {overdue ? (
                                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                                Overdue
                                            </span>
                                        ) : daysUntil === 0 ? (
                                            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                                Due Today
                                            </span>
                                        ) : daysUntil <= 3 ? (
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                                Due in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                Upcoming
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>Due: {formatDate(assignment.dueDate)}</span>
                                    </div>
                                    {assignment.attachmentUrl && (
                                        <a
                                            href={assignment.attachmentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-sm text-purple-600 hover:text-purple-700"
                                        >
                                            <Paperclip className="w-4 h-4 mr-2" />
                                            <span>View Attachment</span>
                                            <Download className="w-3 h-3 ml-1" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </motion.div>
        </div>
    );
};

export default ParentAssignments;
