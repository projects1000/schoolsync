import React, { useState, useEffect } from 'react';
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
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState('ALL');

    useEffect(() => {
        if (selectedChild) {
            fetchStudyMaterials();
        }
    }, [selectedChild]);

    const fetchStudyMaterials = async () => {
        if (!selectedChild) return;

        try {
            setIsLoading(true);
            const response = await api.get(`/parent/study-materials/${selectedChild.id}`);
            setMaterials(response.data || []);
        } catch (error) {
            console.error('Error fetching study materials:', error);
            toast({
                title: "Error",
                description: "Failed to load study materials",
                variant: "destructive"
            });
            setMaterials([]);
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
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
                        className={filterType === 'ALL' ? 'bg-purple-600 hover:bg-purple-700' : ''}
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
                                            className="flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
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
