import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Lock, Users, Box, ChevronDown, ChevronRight, CheckCircle2, User, BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from "@/components/ui/switch";
import ClassProfileModal from './ClassProfileModal';

const ClassManagement = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentClass, setCurrentClass] = useState(null);
    const [selectedGradeForSection, setSelectedGradeForSection] = useState('');
    const [expandedGrades, setExpandedGrades] = useState({});

    // Profile state
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileClass, setProfileClass] = useState(null);
    const [classToDelete, setClassToDelete] = useState(null);

    // Wizard State
    const [wizardStep, setWizardStep] = useState(1);
    const [teachers, setTeachers] = useState([]);
    const [globalSubjects, setGlobalSubjects] = useState([]);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [wizardData, setWizardData] = useState({
        classTeacherId: null,
        selectedSubjects: [] // Array of { id, name, teacherId }
    });

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
            // Initial state: grades are collapsed by default
            setExpandedGrades({});
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
        fetchTeachersAndSubjects();
    }, []);

    const fetchTeachersAndSubjects = async () => {
        try {
            const [teacherData, subjectData] = await Promise.all([
                adminService.getTeachers(),
                adminService.getSubjects()
            ]);
            setTeachers(teacherData || []);
            setGlobalSubjects(subjectData || []);
        } catch (error) {
            console.error("Failed to fetch wizard data", error);
        }
    };

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
        if (e) e.preventDefault();

        try {
            // Step 1: Create the Class/Section
            const createdClass = await adminService.createClass(formData);
            const classId = createdClass.id;

            // Step 2: Assign Class Teacher if selected
            if (wizardData.classTeacherId) {
                await adminService.assignClassTeacher(classId, wizardData.classTeacherId);
            }

            // Step 3: Assign Subjects and their Teachers
            if (wizardData.selectedSubjects.length > 0) {
                const subjectIds = wizardData.selectedSubjects.map(s => s.id);
                await adminService.assignSubjectsToClass(classId, subjectIds);

                // Assign teachers to those subjects
                for (const sub of wizardData.selectedSubjects) {
                    if (sub.teacherId) {
                        await adminService.assignTeacherToSubject(classId, sub.id, sub.teacherId);
                    }
                }
            }

            toast({ title: "Success", description: "Class architecture established successfully!" });
            resetWizard();
            fetchClasses();
        } catch (error) {
            console.error(error);
            toast({
                title: "Wizard Failed",
                description: error.response?.data || "An error occurred during multi-step setup",
                variant: "destructive"
            });
        }
    };

    const resetWizard = () => {
        setIsAddModalOpen(false);
        setWizardStep(1);
        setFormData({ grade: '', section: '', capacity: 30, room: '', locked: false });
        setWizardData({ classTeacherId: null, selectedSubjects: [] });
    };

    const toggleWizardSubject = (subject) => {
        setWizardData(prev => {
            const exists = prev.selectedSubjects.find(s => s.id === subject.id);
            if (exists) {
                return {
                    ...prev,
                    selectedSubjects: prev.selectedSubjects.filter(s => s.id !== subject.id)
                };
            } else {
                return {
                    ...prev,
                    selectedSubjects: [...prev.selectedSubjects, { ...subject, teacherId: null }]
                };
            }
        });
    };

    const setWizardSubjectTeacher = (subjectId, teacherId) => {
        setWizardData(prev => ({
            ...prev,
            selectedSubjects: prev.selectedSubjects.map(s =>
                s.id === subjectId ? { ...s, teacherId: teacherId === 'none' ? null : teacherId } : s
            )
        }));
    };

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        if (!newSubjectName.trim()) return;

        try {
            const addedSubject = await adminService.createSubject({
                name: newSubjectName.trim(),
                description: 'Created via Class Wizard',
                type: 'CLASS_SPECIFIC',
                targetGrade: formData.grade
            });
            // Add to global list
            setGlobalSubjects(prev => [...prev, addedSubject]);
            // Automatically select it for this class wizard
            setWizardData(prev => ({
                ...prev,
                selectedSubjects: [...prev.selectedSubjects, { ...addedSubject, teacherId: null }]
            }));
            setNewSubjectName('');
            toast({ title: "Success", description: `Subject "${addedSubject.name}" created` });
        } catch (error) {
            toast({ title: "Error", description: error.response?.data || "Failed to create subject", variant: "destructive" });
        }
    };

    // Derived states for the wizard
    const availableClassTeachers = useMemo(() => {
        const assignedClassTeacherIds = new Set(classes.map(c => c.classTeacherId).filter(Boolean));
        return teachers.filter(t => !assignedClassTeacherIds.has(t.id));
    }, [classes, teachers]);

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

    const handleProfileClick = (cls) => {
        setProfileClass(cls);
        setIsProfileModalOpen(true);
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

    const handleDeleteClick = (cls) => {
        setClassToDelete(cls);
    };

    const confirmDelete = async () => {
        if (!classToDelete) return;

        try {
            await adminService.deleteClass(classToDelete.id);
            toast({ title: "Moved to Trash", description: `Section ${classToDelete.section} has been moved to trash.` });
            setClassToDelete(null);
            fetchClasses();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: error.response?.data || "Failed to move section to trash", variant: "destructive" });
        }
    };

    const toggleGrade = (grade) => {
        setExpandedGrades(prev => ({ ...prev, [grade]: !prev[grade] }));
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Class Management</h1>
                    <p className="text-gray-500 font-medium">Architect your school's structural layout and sections</p>
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                    if (!open) resetWizard();
                    setIsAddModalOpen(open);
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-200 border-none px-6 py-6 h-auto rounded-xl transition-all active:scale-95 group">
                            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                            <span className="font-semibold text-lg">Create New Grade</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-white">
                            <h2 className="text-2xl font-black tracking-tight">Class Architect Wizard</h2>
                            <p className="text-purple-100/80 font-medium mt-1">
                                {wizardStep === 1 && "Define the structural vitals of the new grade"}
                                {wizardStep === 2 && "Appoint leadership for this section"}
                                {wizardStep === 3 && "Construct the academic curriculum"}
                            </p>

                            {/* Step Indicators */}
                            <div className="flex items-center gap-3 mt-8">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className="flex items-center gap-2">
                                        <div className={`h-2.5 rounded-full transition-all duration-500 ${wizardStep === s ? 'w-10 bg-white' : wizardStep > s ? 'w-2.5 bg-green-400' : 'w-2.5 bg-white/20'}`} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 pb-10">
                            {wizardStep === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Grade Name</Label>
                                            <Input name="grade" value={formData.grade} onChange={handleInputChange} placeholder="e.g. Grade 1" className="h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-purple-500/10 text-lg font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Initial Section</Label>
                                            <Input name="section" value={formData.section} onChange={handleInputChange} placeholder="e.g. A" className="h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-purple-500/10 text-lg font-bold" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Classroom Capacity</Label>
                                            <Input name="capacity" type="number" value={formData.capacity} onChange={handleInputChange} className="h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-purple-500/10 text-lg font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Venue / Room No.</Label>
                                            <Input name="room" value={formData.room} onChange={handleInputChange} placeholder="e.g. S-102" className="h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-purple-500/10 text-lg font-bold" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {wizardStep === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                            <User className="w-7 h-7 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Appoint Class Teacher</h3>
                                            <p className="text-sm text-gray-500">This mentor will oversee student discipline and records</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Select Primary Mentor</Label>
                                        <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                            <button
                                                onClick={() => setWizardData(prev => ({ ...prev, classTeacherId: null }))}
                                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${!wizardData.classTeacherId ? 'border-purple-600 bg-purple-50' : 'border-gray-50 hover:border-gray-200 bg-white'}`}
                                            >
                                                <span className="font-bold text-gray-700">Assign Later</span>
                                                {!wizardData.classTeacherId && <CheckCircle2 className="w-5 h-5 text-purple-600" />}
                                            </button>
                                            {availableClassTeachers.length === 0 && (
                                                <div className="p-4 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex items-center justify-center h-[72px]">
                                                    <p className="text-sm font-medium text-gray-500">All teachers are currently assigned to classes.</p>
                                                </div>
                                            )}
                                            {availableClassTeachers.map(teacher => (
                                                <button
                                                    key={teacher.id}
                                                    onClick={() => setWizardData(prev => ({ ...prev, classTeacherId: teacher.id }))}
                                                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${wizardData.classTeacherId === teacher.id ? 'border-purple-600 bg-purple-50' : 'border-gray-50 hover:border-gray-200 bg-white'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs">
                                                            {(teacher.name || '').split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <span className="font-bold text-gray-900">{teacher.name}</span>
                                                    </div>
                                                    {wizardData.classTeacherId === teacher.id && <CheckCircle2 className="w-5 h-5 text-purple-600" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {wizardStep === 3 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                            <BookOpen className="w-7 h-7 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Configure Curriculum</h3>
                                            <p className="text-sm text-gray-500">Select subjects and assign specialist teachers</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-end justify-between gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <div className="flex-1 grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Subject Name</Label>
                                                    <Input
                                                        placeholder="e.g. Robotics, Art"
                                                        value={newSubjectName}
                                                        onChange={(e) => setNewSubjectName(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreateSubject(e); }}
                                                        className="h-10 border-gray-200 rounded-xl focus:ring-indigo-500 bg-white"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Subject Code</Label>
                                                    <div className="relative">
                                                        <Input
                                                            disabled
                                                            placeholder="Auto-Generated"
                                                            className="h-10 border-gray-200 rounded-xl bg-gray-100/50 font-mono text-gray-400 cursor-not-allowed italic text-sm pr-14"
                                                        />
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                            <div className="px-1.5 py-0.5 bg-indigo-100 rounded text-[9px] font-black tracking-widest text-indigo-600">
                                                                SYS
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={handleCreateSubject}
                                                disabled={!newSubjectName.trim()}
                                                className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-bold shrink-0"
                                            >
                                                Create & Add
                                            </Button>
                                        </div>

                                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Available Subjects</Label>
                                        <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                            {globalSubjects
                                                .filter(s => {
                                                    if (s.type === 'CLASS_SPECIFIC') return s.targetGrade === formData.grade;
                                                    if (s.type === 'UNIVERSAL') return !(s.excludedGrades || []).includes(formData.grade);
                                                    return true;
                                                })
                                                .map(subject => {
                                                    const isSelected = wizardData.selectedSubjects.some(s => s.id === subject.id);
                                                    const selectedSub = wizardData.selectedSubjects.find(s => s.id === subject.id);

                                                    return (
                                                        <div key={subject.id} className={`p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-50 bg-white'}`}>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleWizardSubject(subject)}>
                                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-200 bg-white'}`}>
                                                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                                    </div>
                                                                    <span className="font-bold text-gray-900">{subject.name}</span>
                                                                </div>
                                                                {isSelected && (
                                                                    <select
                                                                        className="bg-white border-none rounded-xl text-xs font-bold px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                                                        value={selectedSub.teacherId || 'none'}
                                                                        onChange={(e) => setWizardSubjectTeacher(subject.id, e.target.value)}
                                                                    >
                                                                        <option value="none">Set Teacher Later</option>
                                                                        {teachers.map(t => (
                                                                            <option key={t.id} value={t.id}>{t.name}</option>
                                                                        ))}
                                                                    </select>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-10">
                                <Button
                                    variant="ghost"
                                    className="rounded-2xl h-12 px-6 font-bold"
                                    onClick={() => wizardStep === 1 ? resetWizard() : setWizardStep(prev => prev - 1)}
                                >
                                    {wizardStep === 1 ? "Cancel Project" : <><ArrowLeft className="w-4 h-4 mr-2" /> Previous</>}
                                </Button>

                                <div className="flex items-center gap-3">
                                    {wizardStep < 3 ? (
                                        <Button
                                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-12 px-10 font-bold shadow-lg shadow-purple-100 transition-all active:scale-95 group"
                                            onClick={() => setWizardStep(prev => prev + 1)}
                                            disabled={!formData.grade || !formData.section}
                                        >
                                            Continue to {wizardStep === 1 ? "Leadership" : "Curriculum"}
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    ) : (
                                        <Button
                                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl h-12 px-12 font-black shadow-lg shadow-green-100 transition-all active:scale-95"
                                            onClick={handleCreateSubmit}
                                        >
                                            Complete Final Architecture
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start space-x-4">
                    <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                        <Box className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Grades</p>
                        <h3 className="text-2xl font-bold text-gray-900">{sortedGrades.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start space-x-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Sections</p>
                        <h3 className="text-2xl font-bold text-gray-900">{classes.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start space-x-4">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Capacity</p>
                        <h3 className="text-2xl font-bold text-gray-900">{classes.reduce((acc, c) => acc + (c.capacity || 0), 0)}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start space-x-4">
                    <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                        <Lock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Locked Sections</p>
                        <h3 className="text-2xl font-bold text-gray-900">{classes.filter(c => c.locked).length}</h3>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white/70 backdrop-blur-sm rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[500px]">
                {/* Search Header */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <Input
                            placeholder="Find a specific grade or section..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all text-base"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium">Synchronizing structures...</p>
                    </div>
                ) : sortedGrades.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center px-10">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Box className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">No classes organized yet</h3>
                        <p className="text-gray-500 max-w-sm mt-2">Start by creating your first grade and section to begin managing your school hierarchy.</p>
                        <Button onClick={() => setIsAddModalOpen(true)} className="mt-8 bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                            Get Started
                        </Button>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-6">
                            {sortedGrades.map(grade => (
                                <div key={grade} className="group bg-white rounded-3xl border border-gray-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 overflow-hidden">
                                    {/* Grade Header */}
                                    <div
                                        className="flex items-center justify-between p-6 cursor-pointer select-none"
                                        onClick={() => toggleGrade(grade)}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-100 transition-colors">
                                                {expandedGrades[grade] ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 leading-tight">{grade}</h3>
                                                <p className="text-sm font-medium text-gray-500">{groupedClasses[grade].length} Active Sections</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-10 px-4 rounded-xl text-purple-600 hover:bg-purple-50 font-semibold"
                                            onClick={(e) => { e.stopPropagation(); handleAddSectionClick(grade); }}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Append Section
                                        </Button>
                                    </div>

                                    {/* Sections Container */}
                                    {expandedGrades[grade] && (
                                        <div className="px-6 pb-6 pt-0">
                                            <div className="grid grid-cols-1 divide-y divide-gray-50 border-t border-gray-50">
                                                {groupedClasses[grade].map((cls) => (
                                                    <div key={cls.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-5 gap-4 group/item">
                                                        <div className="flex items-center gap-8">
                                                            <div className="flex flex-col">
                                                                <span className="text-3xl font-black text-gray-900 tracking-tighter w-12">{cls.section || '-'}</span>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Section</span>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-4">
                                                                <div className="flex items-center px-4 py-2 bg-gray-50 rounded-2xl text-gray-600">
                                                                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                                                                    <span className="font-bold text-sm">{cls.capacity}</span>
                                                                    <span className="ml-1 text-xs text-gray-400 font-medium">Students</span>
                                                                </div>
                                                                <div className="flex items-center px-4 py-2 bg-gray-50 rounded-2xl text-gray-600">
                                                                    <Box className="w-4 h-4 mr-2 text-gray-400" />
                                                                    <span className="text-xs text-gray-400 font-medium mr-1 uppercase">Room</span>
                                                                    <span className="font-bold text-sm tracking-tight">{cls.room || '-'}</span>
                                                                </div>

                                                                {cls.locked && (
                                                                    <div className="inline-flex items-center px-4 py-2 rounded-2xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                                                        <Lock className="w-3.5 h-3.5 mr-2 animate-pulse" />
                                                                        LOCKED
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 self-end sm:self-auto opacity-100 sm:opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-10 w-10 rounded-xl hover:bg-purple-50 hover:text-purple-600 mr-2 z-10 relative"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleProfileClick(cls);
                                                                }}
                                                                title="View Class Profile"
                                                            >
                                                                <User className="w-4.5 h-4.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-10 w-10 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 mr-2 z-10 relative"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    navigate('/students', { state: { filterClass: cls.id } });
                                                                }}
                                                                title="View All Students"
                                                            >
                                                                <Users className="w-4.5 h-4.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-10 w-10 rounded-xl hover:bg-blue-50 hover:text-blue-600"
                                                                onClick={() => handleEditClick(cls)}
                                                                disabled={cls.locked}
                                                                title="Configure Section"
                                                            >
                                                                <Edit2 className="w-4.5 h-4.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteClick(cls);
                                                                }}
                                                                disabled={cls.locked}
                                                                title="Remove Section"
                                                            >
                                                                <Trash2 className="w-4.5 h-4.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals are kept with modern styling applied above */}
            {/* Add Section Modal */}
            <Dialog open={isAddSectionModalOpen} onOpenChange={setIsAddSectionModalOpen}>
                <DialogContent className="rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">New Section for {selectedGradeForSection}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddSectionSubmit} className="space-y-5 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="add-section" className="text-sm font-semibold text-gray-700">Section Name</Label>
                            <Input id="add-section" name="section" value={formData.section} onChange={handleInputChange} placeholder="e.g. B, Rose" className="rounded-xl h-12 text-lg font-bold border-gray-200 focus:ring-purple-500" required autoFocus />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="add-capacity" className="text-sm font-semibold">Max Students</Label>
                                <Input id="add-capacity" name="capacity" type="number" min="1" value={formData.capacity} onChange={handleInputChange} className="rounded-xl h-12 bg-gray-50 border-gray-200" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-room" className="text-sm font-semibold">Assigned Room</Label>
                                <Input id="add-room" name="room" value={formData.room} onChange={handleInputChange} placeholder="e.g. 102" className="rounded-xl h-12 bg-gray-50 border-gray-200" />
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsAddSectionModalOpen(false)} className="rounded-xl">Cancel</Button>
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-purple-200">Append Section</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Section Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="rounded-2x max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Configure Section</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-5 pt-4">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="edit-grade" className="text-sm font-semibold uppercase tracking-wider text-gray-400">Parent Grade</Label>
                                <Input id="edit-grade" name="grade" value={formData.grade} onChange={handleInputChange} className="rounded-xl font-bold border-gray-100 bg-gray-50/50" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-section" className="text-sm font-semibold uppercase tracking-wider text-gray-400">Section ID</Label>
                                <Input id="edit-section" name="section" value={formData.section} onChange={handleInputChange} className="rounded-xl font-bold border-gray-100 bg-gray-50/50" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="edit-capacity" className="text-sm font-semibold">Capacity</Label>
                                <Input id="edit-capacity" name="capacity" type="number" min="1" value={formData.capacity} onChange={handleInputChange} className="rounded-xl border-gray-200" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-room" className="text-sm font-semibold">Room</Label>
                                <Input id="edit-room" name="room" value={formData.room} onChange={handleInputChange} className="rounded-xl border-gray-200" />
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-100">
                            <div>
                                <Label htmlFor="locked" className="font-bold text-gray-800">Security Lock</Label>
                                <p className="text-xs text-gray-500">Locking prevents deletion and major edits</p>
                            </div>
                            <Switch
                                id="locked"
                                checked={formData.locked}
                                onCheckedChange={handleSwitchChange}
                                className="data-[state=checked]:bg-rose-500"
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="rounded-xl">Cancel</Button>
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-10 h-12 font-bold shadow-lg shadow-purple-100 transition-all active:scale-95">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Custom Delete Confirmation Dialog */}
            <AlertDialog open={!!classToDelete} onOpenChange={(open) => !open && setClassToDelete(null)}>
                <AlertDialogContent className="rounded-2xl border-0 shadow-2xl overflow-hidden p-0 max-w-md">
                    <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 flex flex-col items-center justify-center text-center">
                        <div className="bg-white/20 p-4 rounded-full mb-3 backdrop-blur-sm">
                            <Trash2 className="w-8 h-8 text-white" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-bold text-white mb-1">Delete Section?</AlertDialogTitle>
                        <AlertDialogDescription className="text-rose-50 font-medium">
                            Move {classToDelete?.grade} - {classToDelete?.section} to trash
                        </AlertDialogDescription>
                    </div>

                    <div className="p-6 bg-white space-y-4">
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-sm text-rose-800 leading-relaxed font-medium text-center">
                            Are you sure you want to delete <span className="font-bold">Section "{classToDelete?.section}"</span> from <span className="font-bold">{classToDelete?.grade}</span>?
                            <br /><br />
                            This will automatically <span className="font-bold bg-rose-100 px-1 rounded text-rose-900 border border-rose-200">un-assign {classToDelete?.studentCount || 0} enrolled students</span> and move the class structure to the Trash. You can restore it later from Trash Management.
                        </div>

                        <AlertDialogFooter className="pt-4 flex items-center justify-between sm:justify-end gap-3 w-full">
                            <AlertDialogCancel className="w-full sm:w-auto h-12 rounded-xl font-semibold border-gray-200 hover:bg-gray-50 flex-1">
                                Keep Class
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="w-full sm:w-auto h-12 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200 px-8 flex-1 border-0"
                            >
                                Move to Trash
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            <ClassProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                selectedClass={profileClass}
                globalSubjects={globalSubjects}
                teachers={teachers}
            />
        </div>
    );
};

export default ClassManagement;
