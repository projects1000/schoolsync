import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Download, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useParent } from '@/context/ParentContext';
import api from '@/services/api';

const ParentStudyMaterials = ({ currentUser }) => {
    const { toast } = useToast();
    const { selectedChild } = useParent();
    const [materials, setMaterials] = useState([]);
    const [filterType, setFilterType] = useState('ALL');

    const materialsQuery = useQuery({
        queryKey: ['parent', 'study-materials', selectedChild?.id],
        queryFn: () => api.get(`/parent/study-materials/${selectedChild.id}`),
        enabled: Boolean(selectedChild?.id),
        staleTime: 1000 * 60,
    });

    useEffect(() => {
        if (!materialsQuery.data) return;
        setMaterials(materialsQuery.data.data || []);
    }, [materialsQuery.data]);

    useEffect(() => {
        if (!materialsQuery.error) return;
        console.error('Error fetching study materials:', materialsQuery.error);
        toast({
            title: 'Error',
            description: 'Failed to load study materials',
            variant: 'destructive'
        });
        setMaterials([]);
    }, [materialsQuery.error, toast]);

    const isLoading = materialsQuery.isLoading || materialsQuery.isFetching;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getFileIcon = (fileUrl) => {
        return FileText;
    };

    const filteredMaterials = filterType === 'ALL'
        ? materials
        : materials.filter(m => m.type === filterType);

    const materialCount = materials.filter(m => m.type === 'MATERIAL').length;
    const handoutCount = materials.filter(m => m.type === 'HANDOUT').length;

    if (!selectedChild) {
        return null; // ParentProvider handles selection screen
    }

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="h-7 bg-gray-200 rounded w-44 mb-2" />
                            <div className="h-4 bg-gray-100 rounded w-64" />
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-center">
                                <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
                                <div className="h-7 bg-gray-300 rounded w-8" />
                            </div>
                            <div className="text-center">
                                <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
                                <div className="h-7 bg-gray-300 rounded w-8" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 flex gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-9 bg-gray-200 rounded w-24" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                                <div className="h-5 bg-gray-200 rounded-full w-16" />
                            </div>
                            <div className="h-5 bg-gray-200 rounded w-36 mb-2" />
                            <div className="h-8 bg-gray-50 rounded mb-4" />
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="h-3 bg-gray-100 rounded w-24" />
                                <div className="h-4 bg-gray-200 rounded w-20" />
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
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Study Materials</h1>
                        <p className="text-gray-600 mt-1">Access learning resources for {selectedChild?.name}'s class</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Materials</p>
                            <p className="text-2xl font-bold text-blue-600">{materialCount}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Handouts</p>
                            <p className="text-2xl font-bold text-green-600">{handoutCount}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
            >
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={() => setFilterType('ALL')}
                        variant={filterType === 'ALL' ? 'default' : 'outline'}
                        className={filterType === 'ALL' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                    >
                        All ({materials.length})
                    </Button>
                    <Button
                        onClick={() => setFilterType('MATERIAL')}
                        variant={filterType === 'MATERIAL' ? 'default' : 'outline'}
                        className={filterType === 'MATERIAL' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                        Materials ({materialCount})
                    </Button>
                    <Button
                        onClick={() => setFilterType('HANDOUT')}
                        variant={filterType === 'HANDOUT' ? 'default' : 'outline'}
                        className={filterType === 'HANDOUT' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                        Handouts ({handoutCount})
                    </Button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
                {filteredMaterials.length === 0 ? (
                    <div className="col-span-full text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
                        <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-gray-500">No study materials found</p>
                    </div>
                ) : (
                    filteredMaterials.map((material) => {
                        const Icon = getFileIcon(material.fileUrl);
                        const isMaterial = material.type === 'MATERIAL';

                        return (
                            <div
                                key={material.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isMaterial ? 'bg-blue-100' : 'bg-green-100'
                                        }`}>
                                        <Icon className={`w-6 h-6 ${isMaterial ? 'text-blue-600' : 'text-green-600'}`} />
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${isMaterial
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-green-100 text-green-700'
                                        }`}>
                                        {material.type}
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{material.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{material.description}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        <span>{formatDate(material.createdAt)}</span>
                                    </div>
                                    {material.fileUrl && (
                                        <a
                                            href={material.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            Download
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

export default ParentStudyMaterials;
