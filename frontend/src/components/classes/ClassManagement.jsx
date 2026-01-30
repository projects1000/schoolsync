import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Lock, Unlock, Users, Box, Layers } from 'lucide-react';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

const ClassManagement = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentClass, setCurrentClass] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        capacity: 30,
        room: '',
        locked: false
    });

    // Section State
    const [sections, setSections] = useState([]);
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [sectionFormData, setSectionFormData] = useState({ name: '' });
    const [selectedClassForSections, setSelectedClassForSections] = useState(null);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const data = await adminService.getClasses();
            setClasses(data);
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
    }, [toast]);

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
            toast({ title: "Success", description: "Class created successfully" });
            setIsAddModalOpen(false);
            fetchClasses();
            setFormData({ name: '', capacity: 30, room: '', locked: false });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: error.response?.data || "Failed to create class", variant: "destructive" });
        }
    };

    const handleEditClick = (cls) => {
        setCurrentClass(cls);
        setFormData({
            name: cls.name,
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
            toast({ title: "Success", description: "Class updated successfully" });
            setIsEditModalOpen(false);
            fetchClasses();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: error.response?.data || "Failed to update class", variant: "destructive" });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this class?")) return;
        try {
            await adminService.deleteClass(id);
            toast({ title: "Success", description: "Class deleted successfully" });
            fetchClasses();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: error.response?.data || "Failed to delete class", variant: "destructive" });
        }
    };

    // Section Handlers
    const handleSectionsClick = async (cls) => {
        setSelectedClassForSections(cls);
        setSectionFormData({ name: '' });
        setIsSectionModalOpen(true);
        fetchSections(cls.id);
    };

    const fetchSections = async (classId) => {
        try {
            const data = await adminService.getSections(classId);
            setSections(data);
        } catch (error) {
            console.error("Failed to fetch sections", error);
            toast({ title: "Error", description: "Failed to load sections", variant: "destructive" });
        }
    };

    const handleCreateSection = async (e) => {
        e.preventDefault();
        try {
            await adminService.createSection({
                classId: selectedClassForSections.id,
                name: sectionFormData.name
            });
            toast({ title: "Success", description: "Section created successfully" });
            setSectionFormData({ name: '' });
            fetchSections(selectedClassForSections.id);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: error.response?.data || "Failed to create section", variant: "destructive" });
        }
    };

    const handleDeleteSection = async (sectionId) => {
        if (!window.confirm("Delete this section?")) return;
        try {
            await adminService.deleteSection(sectionId);
            toast({ title: "Success", description: "Section deleted" });
            fetchSections(selectedClassForSections.id);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to delete section", variant: "destructive" });
        }
    };

    const filteredClasses = classes.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cls.room && cls.room.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
                    <p className="text-gray-500">Manage school classes and capacities</p>
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Class
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Class</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Class Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Grade 1" required />
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
                                <Button type="submit">Create Class</Button>
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
                            placeholder="Search classes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Box className="w-4 h-4" />
                        <span>Total: {classes.length}</span>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading classes...</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Class Name</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClasses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        No classes found. Add your first class!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredClasses.map((cls) => (
                                    <TableRow key={cls.id}>
                                        <TableCell className="font-medium">{cls.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-gray-600">
                                                <Users className="w-3 h-3 mr-1" />
                                                {cls.capacity}
                                            </div>
                                        </TableCell>
                                        <TableCell>{cls.room || '-'}</TableCell>
                                        <TableCell>
                                            {cls.locked ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <Lock className="w-3 h-3 mr-1" /> Locked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <Unlock className="w-3 h-3 mr-1" /> Active
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleSectionsClick(cls)}
                                                    title="Manage Sections"
                                                >
                                                    <Layers className="w-4 h-4 text-blue-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditClick(cls)}
                                                    disabled={cls.locked}
                                                    title={cls.locked ? "Class is locked" : "Edit Class"}
                                                >
                                                    <Edit2 className="w-4 h-4 text-gray-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(cls.id)}
                                                    disabled={cls.locked}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Class</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Class Name</Label>
                            <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} required />
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
                            <Label htmlFor="locked">Lock Class (Prevent further edits)</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Sections Modal */}
            <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Manage Sections - {selectedClassForSections?.name}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Add Section Form */}
                        <form onSubmit={handleCreateSection} className="flex items-end gap-4 p-4 bg-gray-50 rounded-lg border">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="section-name">New Section Name</Label>
                                <Input
                                    id="section-name"
                                    value={sectionFormData.name}
                                    onChange={(e) => setSectionFormData({ name: e.target.value })}
                                    placeholder="e.g. A, B, Rose"
                                    required
                                />
                            </div>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add
                            </Button>
                        </form>

                        {/* Sections List */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Section Name</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sections.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                                                No sections created yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sections.map((section) => (
                                            <TableRow key={section.id}>
                                                <TableCell className="font-medium">{section.name}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteSection(section.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ClassManagement;
