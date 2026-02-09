import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Plus, Trash2, BookOpen } from 'lucide-react';
import api from '@/services/api';

const CreateCourseHandout = ({ currentUser, onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        classId: '',
        subject: '',
        academicYear: '',
        topics: [{ title: '', description: '' }]
    });
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingClasses, setFetchingClasses] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchAssignedClasses();
    }, []);

    const fetchAssignedClasses = async () => {
        try {
            // Fetch all assigned classes (subject teacher + class teacher)
            const response = await api.get('/teacher/classes');
            if (response.data) {
                setAssignedClasses(response.data);
            }
        } catch (error) {
            console.error('Error fetching assigned classes:', error);
            toast({ title: 'Failed to load assigned classes', variant: 'destructive' });
        } finally {
            setFetchingClasses(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTopicChange = (index, field, value) => {
        setFormData(prev => {
            const updatedTopics = [...prev.topics];
            updatedTopics[index] = { ...updatedTopics[index], [field]: value };
            return { ...prev, topics: updatedTopics };
        });
    };

    const addTopic = () => {
        setFormData(prev => ({
            ...prev,
            topics: [...prev.topics, { title: '', description: '' }]
        }));
    };

    const removeTopic = (index) => {
        if (formData.topics.length <= 1) {
            toast({ title: 'At least one topic is required', variant: 'destructive' });
            return;
        }
        setFormData(prev => ({
            ...prev,
            topics: prev.topics.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        if (!formData.classId) {
            toast({ title: 'Please select a class', variant: 'destructive' });
            return false;
        }

        if (!formData.subject.trim()) {
            toast({ title: 'Please enter subject', variant: 'destructive' });
            return false;
        }
        if (!formData.academicYear.trim()) {
            toast({ title: 'Please enter academic year', variant: 'destructive' });
            return false;
        }

        const validTopics = formData.topics.filter(t => t.title.trim());
        if (validTopics.length === 0) {
            toast({ title: 'Please add at least one topic with a title', variant: 'destructive' });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);

            // Filter out empty topics
            const validTopics = formData.topics.filter(t => t.title.trim());

            await api.post('/teacher/course-handouts', {
                ...formData,
                topics: validTopics
            });

            toast({ title: 'Course handout created successfully!' });
            onSuccess();
        } catch (error) {
            console.error('Error creating handout:', error);
            const errorMessage = error.response?.data?.error || 'Failed to create course handout';
            toast({ title: errorMessage, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    // Generate academic year options
    const currentYear = new Date().getFullYear();
    const academicYears = [
        `${currentYear - 1}-${currentYear}`,
        `${currentYear}-${currentYear + 1}`,
        `${currentYear + 1}-${currentYear + 2}`
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Create Course Handout</h2>
                        <p className="text-gray-500">Define your course topics and track progress</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Class <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.classId}
                                onChange={(e) => {
                                    const selectedClass = assignedClasses.find(c => c.id === e.target.value);
                                    handleInputChange('classId', e.target.value);
                                    // Auto-fill subject from selected class
                                    handleInputChange('subject', selectedClass?.subject || '');
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={fetchingClasses}
                            >
                                <option value="">Select Class</option>
                                {assignedClasses.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}{cls.subject ? ` - ${cls.subject}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>



                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => handleInputChange('subject', e.target.value)}
                                placeholder="e.g., Mathematics, Science"
                                readOnly={!!assignedClasses.find(c => c.id === formData.classId)?.subject}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${assignedClasses.find(c => c.id === formData.classId)?.subject ? 'bg-gray-100 cursor-not-allowed' : ''
                                    }`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Academic Year <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.academicYear}
                                onChange={(e) => handleInputChange('academicYear', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Academic Year</option>
                                {academicYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Topics */}
                    <div className="border-t pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Topics</h3>
                                <p className="text-sm text-gray-500">Add the topics you'll cover in this course</p>
                            </div>
                            <Button type="button" variant="outline" onClick={addTopic}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Topic
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {formData.topics.map((topic, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <input
                                                type="text"
                                                value={topic.title}
                                                onChange={(e) => handleTopicChange(index, 'title', e.target.value)}
                                                placeholder="Topic Title *"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <textarea
                                                value={topic.description}
                                                onChange={(e) => handleTopicChange(index, 'description', e.target.value)}
                                                placeholder="Topic Description (optional)"
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeTopic(index)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onBack}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Create Handout
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CreateCourseHandout;
