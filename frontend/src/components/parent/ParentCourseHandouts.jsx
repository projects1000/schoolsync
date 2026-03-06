import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, CheckCircle2, Circle, Calendar, Filter, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useParent } from '@/context/ParentContext';
import api from '@/services/api';

const ParentCourseHandouts = ({ currentUser, onBack }) => {
    const { selectedChild } = useParent();
    const [handouts, setHandouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedHandout, setExpandedHandout] = useState(null);
    const [filterSubject, setFilterSubject] = useState('');
    const { toast } = useToast();

    // Get unique subjects for filter dropdown
    const uniqueSubjects = [...new Set(handouts.map(h => h.subject))];

    useEffect(() => {
        if (selectedChild) {
            fetchHandouts();
        }
    }, [selectedChild]);

    const fetchHandouts = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/parent/course-handouts/${selectedChild.id}`);
            setHandouts(response.data);
        } catch (error) {
            console.error('Error fetching handouts:', error);
            toast({ title: 'Failed to load course handouts', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 50) return 'bg-yellow-500';
        if (percentage >= 25) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getProgressTextColor = (percentage) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 50) return 'text-yellow-600';
        if (percentage >= 25) return 'text-orange-600';
        return 'text-red-600';
    };

    const filteredHandouts = filterSubject
        ? handouts.filter(h => h.subject === filterSubject)
        : handouts;

    if (!selectedChild) {
        return null; // ParentProvider handles selection screen
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <Button variant="ghost" size="sm" onClick={onBack}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Course Handouts</h2>
                            <p className="text-gray-500">View {selectedChild?.name}'s syllabus and progress</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Filter by Subject:</span>
                    </div>
                    <select
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                        <option value="">All Subjects</option>
                        {uniqueSubjects.map(subj => (
                            <option key={subj} value={subj}>{subj}</option>
                        ))}
                    </select>
                    {filterSubject && (
                        <Button variant="ghost" size="sm" onClick={() => setFilterSubject('')}>
                            Clear Filter
                        </Button>
                    )}
                </div>
            </div>

            {/* Handouts List */}
            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-5 bg-gray-200 rounded w-28" />
                                        <div className="h-5 bg-gray-100 rounded-full w-20" />
                                        <div className="h-5 bg-gray-100 rounded-full w-16" />
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex justify-between mb-1">
                                            <div className="h-3 bg-gray-100 rounded w-16" />
                                            <div className="h-3 bg-gray-200 rounded w-32" />
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="bg-gray-300 h-3 rounded-full w-2/5" />
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-4 flex items-center gap-2">
                                    <div className="h-4 bg-gray-200 rounded w-20" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredHandouts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <BookOpen className="mx-auto w-12 h-12 text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium text-gray-800">No Course Handouts</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {filterSubject
                            ? `No handouts found for ${filterSubject}`
                            : "No course handouts available for your child's class yet."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredHandouts.map(handout => (
                        <motion.div
                            key={handout.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                        >
                            {/* Handout Header - Clickable */}
                            <div
                                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setExpandedHandout(expandedHandout === handout.id ? null : handout.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="font-semibold text-gray-800 text-lg">{handout.subject}</h3>
                                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                                                {handout.section ? `Section ${handout.section}` : 'All Sections'}
                                            </span>
                                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                                {handout.academicYear}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Progress</span>
                                                <span className={`font-semibold ${getProgressTextColor(handout.progressPercentage)}`}>
                                                    {handout.completedTopics}/{handout.totalTopics} topics ({Math.round(handout.progressPercentage)}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(handout.progressPercentage)}`}
                                                    style={{ width: `${handout.progressPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ml-4 flex items-center gap-2">
                                        <span className="text-sm text-gray-500">
                                            {expandedHandout === handout.id ? 'Hide' : 'View'} Topics
                                        </span>
                                        {expandedHandout === handout.id ? (
                                            <ChevronUp className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Topics List - Expandable (Read Only) */}
                            <AnimatePresence>
                                {expandedHandout === handout.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border-t border-gray-200 bg-gray-50"
                                    >
                                        <div className="p-5 space-y-3">
                                            <h4 className="font-medium text-gray-700 mb-3">Topics Overview</h4>
                                            {handout.topics?.map((topic, index) => (
                                                <div
                                                    key={topic.id || index}
                                                    className={`p-4 rounded-lg border ${topic.completed
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-white border-gray-200'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-0.5 flex-shrink-0">
                                                            {topic.completed ? (
                                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                            ) : (
                                                                <Circle className="w-5 h-5 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
                                                                <h5 className={`font-medium ${topic.completed ? 'text-green-800' : 'text-gray-800'}`}>
                                                                    {topic.title}
                                                                </h5>
                                                            </div>
                                                            {topic.description && (
                                                                <p className={`text-sm mt-1 ${topic.completed ? 'text-green-600' : 'text-gray-500'}`}>
                                                                    {topic.description}
                                                                </p>
                                                            )}
                                                            {topic.completed && topic.completedOn && (
                                                                <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                                                    <Calendar className="w-3 h-3" />
                                                                    <span>
                                                                        Completed on {new Date(topic.completedOn).toLocaleDateString('en-US', {
                                                                            year: 'numeric', month: 'short', day: 'numeric'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ParentCourseHandouts;
