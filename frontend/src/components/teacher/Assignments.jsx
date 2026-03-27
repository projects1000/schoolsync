import React, { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, Download, Trash2, Paperclip } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';

const Assignments = ({ currentUser }) => {
    const { toast } = useToast();
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Create Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        classId: '',
        file: null
    });

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId && selectedClassId !== 'all') {
            fetchAssignments();
        } else {
            setAssignments([]);
        }
    }, [selectedClassId]);

    const fetchClasses = async () => {
        try {
            // Use /teacher/classes which returns ALL assigned classes (subject teacher + class teacher)
            // instead of /teacher/attendance/classes which only returns class teacher classes
            const res = await api.get('/teacher/classes');
            setClasses(res.data);
            if (res.data.length > 0) {
                setSelectedClassId(res.data[0].id);
                // Pre-select first class for create form too if needed, but we handle that in modal
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/teacher/assignments/class/${selectedClassId}`);
            const data = res.data;
            const items = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
            setAssignments(items);
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Failed to fetch assignments", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleCreateSubmit = async () => {
        if (!formData.title || !formData.dueDate || !formData.classId) {
            toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('dueDate', formData.dueDate);
        data.append('classId', formData.classId);
        if (formData.file) {
            data.append('file', formData.file);
        }

        try {
            await api.post('/teacher/assignments', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast({ title: "Success", description: "Assignment created" });
            setIsCreateOpen(false);
            setFormData({ title: '', description: '', dueDate: '', classId: '', file: null });
            if (selectedClassId === formData.classId) {
                fetchAssignments();
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Failed to create assignment", variant: "destructive" });
        }
    };

    const openCreateModal = () => {
        setFormData({
            title: '',
            description: '',
            dueDate: '',
            classId: selectedClassId || (classes.length > 0 ? classes[0].id : ''),
            file: null
        });
        setIsCreateOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
                    <p className="text-gray-500">Manage class assignments and homework</p>
                </div>
                <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> Create Assignment
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
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

            {/* Assignment List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="h-5 bg-gray-200 rounded w-40 mb-2" />
                                            <div className="h-3 bg-gray-100 rounded w-28" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-100 rounded w-full" />
                                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : assignments.length === 0 ? (
                    <div className="col-span-full text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No assignments found for this class.</p>
                    </div>
                ) : (
                    assignments.map((assignment) => (
                        <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-1" title={assignment.title}>
                                            {assignment.title}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1 text-xs">
                                            <Calendar className="w-3 h-3" /> Due: {assignment.dueDate}
                                        </CardDescription>
                                    </div>
                                    {/* Future: Add status badge or actions */}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-gray-600 line-clamp-3 min-h-[60px]">
                                    {assignment.description || "No description provided."}
                                </p>
                                {assignment.attachmentUrl && (
                                    <div className="pt-2 border-t border-gray-100">
                                        <a
                                            href={`${api.defaults.baseURL.replace('/api', '')}${assignment.attachmentUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                        >
                                            <Paperclip className="w-3 h-3" /> View Attachment
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Assignment</DialogTitle>
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
                                placeholder="Assignment Title"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Due Date <span className="text-red-500">*</span></Label>
                            <Input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Instructions..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Attachment (Optional)</Label>
                            <Input type="file" onChange={handleFileChange} />
                            <p className="text-xs text-gray-500">Supported formats: PDF, Images, Doc</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateSubmit}>Create Assignment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Assignments;
