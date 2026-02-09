import React, { useState, useEffect } from 'react';
import { Plus, Folder, FileText, Download, Trash2, Paperclip, BookOpen } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';

const LearningResources = () => {
    const { toast } = useToast();
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);

    // Upload Modal State
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'MATERIAL',
        classId: '',
        file: null
    });

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId && selectedClassId !== 'all') {
            fetchMaterials();
        } else {
            setMaterials([]);
        }
    }, [selectedClassId]);

    const fetchClasses = async () => {
        try {
            // Use /teacher/classes which returns ALL assigned classes (subject teacher + class teacher)
            const res = await api.get('/teacher/classes');
            setClasses(res.data);
            if (res.data.length > 0) {
                setSelectedClassId(res.data[0].id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/teacher/study-materials/class/${selectedClassId}`);
            setMaterials(res.data);
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Failed to fetch materials", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleUploadSubmit = async () => {
        if (!formData.title || !formData.file || !formData.classId) {
            toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('type', formData.type);
        data.append('classId', formData.classId);
        data.append('file', formData.file);

        try {
            await api.post('/teacher/study-materials', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast({ title: "Success", description: "Material uploaded successfully" });
            setIsUploadOpen(false);
            setFormData({ title: '', description: '', type: 'MATERIAL', classId: '', file: null });
            if (selectedClassId === formData.classId) {
                fetchMaterials();
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Failed to upload material", variant: "destructive" });
        }
    };

    const openUploadModal = () => {
        setFormData({
            title: '',
            description: '',
            type: 'MATERIAL',
            classId: selectedClassId || (classes.length > 0 ? classes[0].id : ''),
            file: null
        });
        setIsUploadOpen(true);
    };

    const filteredMaterials = materials.filter(m => m.type === 'MATERIAL');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Learning Resources</h1>
                    <p className="text-gray-500">Manage study materials and handouts</p>
                </div>
                <Button onClick={openUploadModal} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> Upload Material
                </Button>
            </div>

            {/* Filter by Class */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 mb-4">
                <span className="text-sm font-medium text-gray-600">Filter by Class:</span>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Study Materials List */}
            <MaterialList materials={filteredMaterials} loading={loading} type="Study Materials" />

            {/* Upload Modal */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Upload New Resource</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Class <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.classId}
                                onValueChange={(val) => setFormData({ ...formData, classId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Title <span className="text-red-500">*</span></Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Resource Title"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Description..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>File <span className="text-red-500">*</span></Label>
                            <Input type="file" onChange={handleFileChange} />
                            <p className="text-xs text-gray-500">PDF, DOC, Images etc.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                        <Button onClick={handleUploadSubmit}>Upload</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const MaterialList = ({ materials, loading, type }) => {
    if (loading) return <p className="text-gray-500 py-10 text-center">Loading resources...</p>;

    if (materials.length === 0) return (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Folder className="mx-auto w-12 h-12 text-gray-300" />
            <p className="text-gray-500 mt-2">No {type} found for this class.</p>
        </div>
    );

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-1" title={item.title}>
                                {item.title}
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Uploaded: {new Date(item.createdAt).toLocaleDateString()}
                            </CardDescription>
                        </div>
                        <div className={`p-2 rounded-lg ${item.type === 'MATERIAL' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                            {item.type === 'MATERIAL' ? <BookOpen className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                            {item.description || "No description."}
                        </p>
                        <div className="pt-2 border-t border-gray-100">
                            <a
                                href={`${api.defaults.baseURL.replace('/api', '')}${item.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium text-gray-700 transition-colors"
                            >
                                <Download className="w-4 h-4" /> Download File
                            </a>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default LearningResources;
