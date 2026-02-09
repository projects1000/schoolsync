import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Lock, Users, Box, ChevronDown, ChevronRight } from 'lucide-react';
import adminService from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const ClassManagement = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentClass, setCurrentClass] = useState(null);
    const [selectedGradeForSection, setSelectedGradeForSection] = useState('');
    const [expandedGrades, setExpandedGrades] = useState({});

    // Form State
    const [formData, setFormData] = useState({
        grade: '',
        section: '',
        capacity: 30,
        room: '',
        locked: false
    });

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const data = await adminService.getClasses();
            setClasses(data || []);
            // Auto-expand all grades on initial load
            const grades = [...new Set((data || []).map(c => c.grade || c.name))];
            const expanded = {};
            grades.forEach(g => expanded[g] = true);
            setExpandedGrades(expanded);
        } catch (error) {
            console.error("Failed to fetch classes", error);
            toast({
                title: "Error",
                description: "Failed to load classes.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    // Group classes by grade
    const groupedClasses = useMemo(() => {
        const groups = {};
        const filtered = classes.filter(cls =>
            (cls.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cls.grade || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cls.section || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cls.room || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        filtered.forEach(cls => {
            const grade = cls.grade || cls.name;
            if (!groups[grade]) {
                groups[grade] = [];
            }
            groups[grade].push(cls);
        });
        // Sort sections within each grade
        Object.keys(groups).forEach(grade => {
            groups[grade].sort((a, b) => (a.section || '').localeCompare(b.section || ''));
        });
        return groups;
    }, [classes, searchTerm]);

    const sortedGrades = useMemo(() => {
        return Object.keys(groupedClasses).sort();
    }, [groupedClasses]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSwitchChange = (checked) => {
        setFormData(prev => ({
            ...prev,
            locked: checked
        }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminService.createClass(formData);
            toast({ title: "Success", description: "Class/Section created successfully" });
            setIsAddModalOpen(false);
            fetchClasses();
            setFormData({ grade: '', section: '', capacity: 30, room: '', locked: false });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: error.response?.data || "Failed to create class", variant: "destructive" });
        }
    };

    const handleAddSectionClick = (grade) => {
        setSelectedGradeForSection(grade);
        setFormData({ grade: grade, section: '', capacity: 30, room: '', locked: false });
        setIsAddSectionModalOpen(true);
    };

    const handleAddSectionSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminService.createClass(formData);
            toast({ title: "Success", description: `Section "${formData.section}" added to ${formData.grade}` });
            setIsAddSectionModalOpen(false);
            fetchClasses();
            setFormData({ grade: '', section: '', capacity: 30, room: '', locked: false });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: error.response?.data || "Failed to add section", variant: "destructive" });
        }
    };

    const handleEditClick = (cls) => {
        setCurrentClass(cls);
        setFormData({
            grade: cls.grade || cls.name || '',
            section: cls.section || '',
            capacity: cls.capacity || 30,
            room: cls.room || '',
            locked: cls.locked || false
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminService.updateClass(currentClass.id, formData);
            toast({ title: "Success", description: "Section updated successfully" });
            setIsEditModalOpen(false);
            fetchClasses();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: error.response?.data || "Failed to update section", variant: "destructive" });
        }
    };

    const handleDelete = async (cls) => {
        if (!window.confirm(`Are you sure you want to delete section "${cls.section}" from ${cls.grade}?`)) return;
        try {
            await adminService.deleteClass(cls.id);
            toast({ title: "Success", description: "Section deleted successfully" });
            fetchClasses();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: error.response?.data || "Failed to delete section", variant: "destructive" });
        }
    };

    const toggleGrade = (grade) => {
        setExpandedGrades(prev => ({ ...prev, [grade]: !prev[grade] }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
                    <p className="text-gray-500">Manage grades and sections</p>
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Grade & Section
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Grade & Section</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="grade">Grade</Label>
                                    <Input id="grade" name="grade" value={formData.grade} onChange={handleInputChange} placeholder="e.g. Grade 1" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="section">Section</Label>
                                    <Input id="section" name="section" value={formData.section} onChange={handleInputChange} placeholder="e.g. A" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Capacity</Label>
                                    <Input id="capacity" name="capacity" type="number" min="1" value={formData.capacity} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="room">Room Number</Label>
                                    <Input id="room" name="room" value={formData.room} onChange={handleInputChange} placeholder="e.g. 101" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Create</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search grades or sections..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Box className="w-4 h-4" />
                        <span>{sortedGrades.length} Grades, {classes.length} Sections</span>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading classes...</div>
                ) : sortedGrades.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No classes found. Add your first class!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {sortedGrades.map(grade => (
                            <div key={grade}>
                                {/* Grade Header */}
                                <div
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-white hover:from-purple-100 cursor-pointer transition-colors"
                                    onClick={() => toggleGrade(grade)}
                                >
                                    <div className="flex items-center gap-3">
                                        {expandedGrades[grade] ? <ChevronDown className="w-5 h-5 text-purple-600" /> : <ChevronRight className="w-5 h-5 text-purple-600" />}
                                        <span className="text-lg font-semibold text-purple-800">{grade}</span>
                                        <span className="text-sm text-gray-500">({groupedClasses[grade].length} sections)</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-purple-300 text-purple-600 hover:bg-purple-100"
                                        onClick={(e) => { e.stopPropagation(); handleAddSectionClick(grade); }}
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Section
                                    </Button>
                                </div>
                                {/* Sections */}
                                {expandedGrades[grade] && (
                                    <div className="bg-gray-50">
                                        {groupedClasses[grade].map((cls) => (
                                            <div key={cls.id} className="flex items-center justify-between px-6 py-3 border-t border-gray-200 hover:bg-white transition-colors">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16">
                                                        <span className="font-bold text-gray-800 text-lg">{cls.section || '-'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center">
                                                            <Users className="w-4 h-4 mr-1 text-gray-400" />
                                                            <span>{cls.capacity}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">Room: </span>
                                                            <span>{cls.room || '-'}</span>
                                                        </div>
                                                    </div>
                                                    {cls.locked && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            <Lock className="w-3 h-3 mr-1" /> Locked
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditClick(cls)}
                                                        disabled={cls.locked}
                                                        title="Edit Section"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-gray-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(cls)}
                                                        disabled={cls.locked}
                                                        title="Delete Section"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Section Modal */}
            <Dialog open={isAddSectionModalOpen} onOpenChange={setIsAddSectionModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Section to {selectedGradeForSection}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddSectionSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="add-section">Section Name</Label>
                            <Input id="add-section" name="section" value={formData.section} onChange={handleInputChange} placeholder="e.g. B, Rose" required autoFocus />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="add-capacity">Capacity</Label>
                                <Input id="add-capacity" name="capacity" type="number" min="1" value={formData.capacity} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-room">Room Number</Label>
                                <Input id="add-room" name="room" value={formData.room} onChange={handleInputChange} placeholder="e.g. 102" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddSectionModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Add Section</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Section Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Section</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-grade">Grade</Label>
                                <Input id="edit-grade" name="grade" value={formData.grade} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-section">Section</Label>
                                <Input id="edit-section" name="section" value={formData.section} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-capacity">Capacity</Label>
                                <Input id="edit-capacity" name="capacity" type="number" min="1" value={formData.capacity} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-room">Room Number</Label>
                                <Input id="edit-room" name="room" value={formData.room} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Switch
                                id="locked"
                                checked={formData.locked}
                                onCheckedChange={handleSwitchChange}
                            />
                            <Label htmlFor="locked">Lock Section (Prevent further edits)</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ClassManagement;
