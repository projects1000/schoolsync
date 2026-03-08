import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, ChevronRight, Save, UserCheck, GraduationCap, Plus, Trash2, Search } from 'lucide-react';
import adminService from '@/services/adminService';
import Pagination from '@/components/common/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const AcademicsManagement = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);

    // Subject Management state
    const [newSubjectName, setNewSubjectName] = useState('');
    const [isCreatingSubject, setIsCreatingSubject] = useState(false);
    const [newSubjectType, setNewSubjectType] = useState('UNIVERSAL');
    const [newSubjectTargetGrade, setNewSubjectTargetGrade] = useState('');
    const [newSubjectExcludedGrades, setNewSubjectExcludedGrades] = useState([]);
    const [subjectPage, setSubjectPage] = useState(0);
    const [subjectPageSize, setSubjectPageSize] = useState(10);
    const [subjectTotalPages, setSubjectTotalPages] = useState(0);
    const [subjectTotalElements, setSubjectTotalElements] = useState(0);

    // Selected Class
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);

    // Assignments for selected class
    const [classTeacherId, setClassTeacherId] = useState('');
    const [classSubjects, setClassSubjects] = useState([]);

    // Available subjects (not yet assigned to class)
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [selectedSubjectsToAdd, setSelectedSubjectsToAdd] = useState([]);

    // Track changes
    const [originalClassTeacherId, setOriginalClassTeacherId] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    // Teacher search filters
    const [classTeacherSearch, setClassTeacherSearch] = useState('');
    const [subjectTeacherSearch, setSubjectTeacherSearch] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchSubjects(subjectPage);
    }, [subjectPage]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            // Fetch classes, teachers, and a base list of subjects for dropdowns/mapping
            const [classesData, teachersData, subjectsData] = await Promise.all([
                adminService.getClasses({ size: 1000 }),
                adminService.getTeachers({ size: 1000 }),
                adminService.getSubjects({ size: 1000 })
            ]);
            setClasses(classesData.content || []);
            setTeachers(teachersData.content || []);
            setAllSubjects(subjectsData.content || []);
            await fetchSubjects(0);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast({
                title: "Error",
                description: "Failed to load academic data",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async (page) => {
        try {
            const data = await adminService.getSubjects({ page, size: subjectPageSize });
            setSubjects(data.content || []);
            setSubjectTotalPages(data.totalPages || 0);
            setSubjectTotalElements(data.totalElements || 0);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
        }
    };

    const availableClassTeachers = useMemo(() => {
        const assignedTeacherIds = classes
            .filter(c => c.id !== selectedClassId && c.classTeacherId)
            .map(c => c.classTeacherId);

        return teachers.filter(t =>
            !assignedTeacherIds.includes(t.id) || t.id === classTeacherId
        );
    }, [teachers, classes, selectedClassId, classTeacherId]);

    const filteredClassTeachers = useMemo(() => {
        if (!classTeacherSearch.trim()) return availableClassTeachers;
        const search = classTeacherSearch.toLowerCase();
        return availableClassTeachers.filter(t =>
            t.name?.toLowerCase().includes(search) ||
            t.department?.toLowerCase().includes(search)
        );
    }, [availableClassTeachers, classTeacherSearch]);

    const filteredSubjectTeachers = useMemo(() => {
        if (!subjectTeacherSearch.trim()) return teachers;
        const search = subjectTeacherSearch.toLowerCase();
        return teachers.filter(t =>
            t.name?.toLowerCase().includes(search) ||
            t.department?.toLowerCase().includes(search)
        );
    }, [teachers, subjectTeacherSearch]);

    const handleGradeSelect = (grade) => {
        setSelectedGrade(grade);
        setSelectedClassId('');
        setSelectedClass(null);
        setClassTeacherId('');
        setClassSubjects([]);
        setAvailableSubjects([]);
    };

    const handleClassSelect = async (classId) => {
        setSelectedClassId(classId);
        const cls = classes.find(c => c.id === classId);
        setSelectedClass(cls);

        if (!cls) {
            setClassTeacherId('');
            setClassSubjects([]);
            return;
        }

        const ctId = cls.classTeacherId || '';
        setClassTeacherId(ctId);
        setOriginalClassTeacherId(ctId);

        try {
            const classSubjectsData = await adminService.getClassSubjects(classId);
            const mapped = (classSubjectsData || []).map(cs => ({
                id: cs.id,
                subjectId: cs.subjectId,
                subjectName: cs.subjectName || 'Unknown',
                teacherId: cs.teacherId || '',
                teacherName: cs.teacherName || 'Unassigned'
            }));
            setClassSubjects(mapped);

            const assignedSubjectIds = mapped.map(cs => cs.subjectId);
            const available = allSubjects.filter(s => {
                if (assignedSubjectIds.includes(s.id)) return false;
                const clsGrade = cls.grade || cls.name;
                if (s.type === 'CLASS_SPECIFIC') return s.targetGrade === clsGrade;
                if (s.type === 'UNIVERSAL') return !(s.excludedGrades || []).includes(clsGrade);
                return true;
            });
            setAvailableSubjects(available);
        } catch (error) {
            console.error('Failed to fetch class subjects:', error);
            setClassSubjects([]);
            setAvailableSubjects(allSubjects.filter(s => {
                const clsGrade = cls.grade || cls.name;
                if (s.type === 'CLASS_SPECIFIC') return s.targetGrade === clsGrade;
                if (s.type === 'UNIVERSAL') return !(s.excludedGrades || []).includes(clsGrade);
                return true;
            }));
        }

        setSelectedSubjectsToAdd([]);
        setHasChanges(false);
    };

    const handleClassTeacherChange = (teacherId) => {
        setClassTeacherId(teacherId === '_none_' ? '' : teacherId);
        setHasChanges(true);
    };

    const handleSubjectTeacherChange = (subjectId, teacherId) => {
        const actualTeacherId = teacherId === '_none_' ? '' : teacherId;
        setClassSubjects(prev => prev.map(cs =>
            cs.subjectId === subjectId
                ? { ...cs, teacherId: actualTeacherId, teacherName: teachers.find(t => t.id === actualTeacherId)?.name || 'Unassigned' }
                : cs
        ));
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!selectedClassId) return;

        setSaving(true);
        try {
            if (classTeacherId !== originalClassTeacherId) {
                await adminService.assignClassTeacher(selectedClassId, classTeacherId);
            }

            for (const cs of classSubjects) {
                if (cs.teacherId) {
                    await adminService.assignTeacherToSubject(selectedClassId, cs.subjectId, cs.teacherId);
                }
            }

            toast({
                title: "Success",
                description: "Academic assignments saved successfully"
            });

            setOriginalClassTeacherId(classTeacherId);
            setHasChanges(false);

            const updatedClasses = await adminService.getClasses();
            setClasses(updatedClasses.content || updatedClasses || []);

        } catch (error) {
            console.error('Failed to save:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to save assignments",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleSubjectSelection = (subjectId) => {
        setSelectedSubjectsToAdd(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };

    const handleAddSubjects = async () => {
        if (selectedSubjectsToAdd.length === 0 || !selectedClassId) return;

        setSaving(true);
        try {
            await adminService.assignSubjectsToClass(selectedClassId, selectedSubjectsToAdd);

            toast({
                title: "Success",
                description: `${selectedSubjectsToAdd.length} subject(s) assigned to class`
            });

            await handleClassSelect(selectedClassId);
        } catch (error) {
            console.error('Failed to add subjects:', error);
            toast({
                title: "Error",
                description: typeof error.response?.data === 'string'
                    ? error.response.data
                    : error.response?.data?.message || "Failed to assign subjects",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCreateSubject = async () => {
        if (!newSubjectName.trim()) {
            toast({
                title: "Error",
                description: "Subject name is required",
                variant: "destructive"
            });
            return;
        }

        setIsCreatingSubject(true);
        try {
            await adminService.createSubject({
                name: newSubjectName,
                type: newSubjectType,
                targetGrade: newSubjectTargetGrade || null,
                excludedGrades: newSubjectExcludedGrades
            });
            toast({
                title: "Success",
                description: "Subject created successfully"
            });
            setNewSubjectName('');
            setNewSubjectType('UNIVERSAL');
            setNewSubjectTargetGrade('');
            setNewSubjectExcludedGrades([]);
            const allSubs = await adminService.getSubjects({ size: 1000 });
            setAllSubjects(allSubs.content || []);
            await fetchSubjects(subjectPage);
        } catch (error) {
            console.error('Failed to create subject:', error);
            toast({
                title: "Error",
                description: typeof error.response?.data === 'string'
                    ? error.response.data
                    : error.response?.data?.message || "Failed to create subject",
                variant: "destructive"
            });
        } finally {
            setIsCreatingSubject(false);
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        if (!window.confirm("Are you sure you want to delete this subject? It will be removed from all classes.")) return;

        try {
            await adminService.deleteSubject(subjectId);
            toast({
                title: "Success",
                description: "Subject deleted successfully"
            });
            const allSubs = await adminService.getSubjects({ size: 1000 });
            setAllSubjects(allSubs.content || []);
            await fetchSubjects(subjectPage);
            if (selectedClassId) {
                handleClassSelect(selectedClassId);
            }
        } catch (error) {
            console.error('Failed to delete subject:', error);
            toast({
                title: "Error",
                description: typeof error.response?.data === 'string'
                    ? error.response.data
                    : error.response?.data?.message || "Failed to delete subject",
                variant: "destructive"
            });
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    if (loading) {
        return (
            <div className="space-y-8 pb-12 animate-pulse">
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gray-200 rounded-2xl w-12 h-12" />
                        <div className="h-8 bg-gray-200 rounded w-64" />
                    </div>
                    <div className="h-4 bg-gray-100 rounded w-80 mt-2" />
                </div>
                <div className="flex gap-2">
                    <div className="h-12 bg-gray-200 rounded-2xl w-48" />
                    <div className="h-12 bg-gray-200 rounded-2xl w-40" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
                        <div className="grid grid-cols-2 gap-2">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-12 bg-gray-100 rounded-xl" />
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-8 space-y-6">
                        <div className="h-80 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white rounded-3xl p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-purple-100 rounded-2xl">
                                <GraduationCap className="h-6 w-6 text-purple-600" />
                            </div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900">
                                Academics Management
                            </h1>
                        </div>
                        <p className="text-gray-500 text-lg">Orchestrate your school's curriculum and teaching assignments</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end text-right">
                            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Academic Year</span>
                            <span className="text-gray-900 font-bold">2025-2026</span>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="assignments" className="w-full space-y-6">
                <TabsList className="bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-100 shadow-sm w-auto mb-2">
                    <TabsTrigger
                        value="assignments"
                        className="rounded-xl px-8 py-2.5 text-base font-semibold data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all"
                    >
                        Academic Assignments
                    </TabsTrigger>
                    <TabsTrigger
                        value="subjects"
                        className="rounded-xl px-8 py-2.5 text-base font-semibold data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all"
                    >
                        Subject Master
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="assignments" className="space-y-8">
                    {/* Interactive Selection Canvas */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Selector Sidebar */}
                        <Card className="lg:col-span-4 rounded-3xl border-gray-100 shadow-sm overflow-hidden h-fit">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-6">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-purple-600" />
                                    Select Target Class
                                </CardTitle>
                                <CardDescription>Pick a grade and section to manage</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Step 1: Grade</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[...new Set(classes.map(c => c.grade || c.name))].sort().map(grade => (
                                            <button
                                                key={grade}
                                                onClick={() => handleGradeSelect(grade)}
                                                className={`px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-sm ${selectedGrade === grade
                                                    ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-sm'
                                                    : 'bg-white border-gray-100 text-gray-500 hover:border-purple-200 hover:bg-purple-50/30'
                                                    }`}
                                            >
                                                {grade}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedGrade && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-4"
                                    >
                                        <Label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Step 2: Section</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {classes
                                                .filter(c => (c.grade || c.name) === selectedGrade)
                                                .sort((a, b) => (a.section || '').localeCompare(b.section || ''))
                                                .map(cls => (
                                                    <button
                                                        key={cls.id}
                                                        onClick={() => handleClassSelect(cls.id)}
                                                        className={`px-3 py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 font-bold ${selectedClassId === cls.id
                                                            ? 'bg-purple-600 border-purple-600 text-white shadow-lg scale-105'
                                                            : 'bg-white border-gray-100 text-gray-600 hover:border-purple-200'
                                                            }`}
                                                    >
                                                        <span className="text-xs opacity-70">Sec</span>
                                                        <span className="text-lg">{cls.section || 'N/A'}</span>
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Main Assignment Area */}
                        <div className="lg:col-span-8 space-y-8">
                            {!selectedClass ? (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-200 text-gray-400 p-8 text-center group">
                                    <div className="p-6 bg-white rounded-3xl shadow-sm mb-4 transition-transform group-hover:scale-110">
                                        <GraduationCap className="h-12 w-12 text-gray-200" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Class Selected</h3>
                                    <p className="max-w-[280px]">Please select a grade and section from the left panel to begin managing academics.</p>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    {/* Action Bar */}
                                    {hasChanges && (
                                        <div className="flex items-center justify-between bg-purple-900 text-white p-4 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4">
                                            <p className="flex items-center gap-2 font-medium px-2">
                                                <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></div>
                                                You have unsaved changes in teaching assignments
                                            </p>
                                            <Button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="bg-white text-purple-900 hover:bg-purple-50 font-bold rounded-xl px-6"
                                            >
                                                {saving ? 'Syncing...' : 'Save Assignments'}
                                                {!saving && <Save className="ml-2 h-4 w-4" />}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Class Teacher Card */}
                                    <Card className="rounded-[32px] border-none shadow-xl shadow-purple-900/[0.03] overflow-hidden">
                                        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50/30 p-8">
                                            <div className="flex items-center justify-between mb-2">
                                                <CardTitle className="text-2xl flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded-xl shadow-sm">
                                                        <UserCheck className="h-6 w-6 text-green-500" />
                                                    </div>
                                                    Class Teacher
                                                </CardTitle>
                                                <div className="px-4 py-1.5 bg-white/80 rounded-full text-xs font-bold text-purple-700 border border-purple-100">
                                                    PRIMARY MENTOR
                                                </div>
                                            </div>
                                            <CardDescription className="text-lg">
                                                The dedicated mentor for class <span className="font-bold text-purple-900">{selectedClass.name}</span>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8">
                                            <div className="max-w-md space-y-4">
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-4 z-10">
                                                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                                    </div>
                                                    <Input
                                                        placeholder="Search all teachers..."
                                                        value={classTeacherSearch}
                                                        onChange={(e) => setClassTeacherSearch(e.target.value)}
                                                        className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/30 text-lg transition-all focus:ring-purple-200 focus:bg-white"
                                                    />
                                                </div>
                                                <Select value={classTeacherId || '_none_'} onValueChange={handleClassTeacherChange}>
                                                    <SelectTrigger className="h-16 rounded-2xl border-gray-100 shadow-sm text-lg font-medium px-6">
                                                        <SelectValue placeholder="Assign a mentor..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl p-2">
                                                        <SelectItem value="_none_" className="rounded-xl py-3 cursor-pointer">Unassigned</SelectItem>
                                                        {filteredClassTeachers.map(teacher => (
                                                            <SelectItem key={teacher.id} value={teacher.id} className="rounded-xl py-4 cursor-pointer">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                                                                        {getInitials(teacher.name)}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold">{teacher.name}</span>
                                                                        <span className="text-xs text-gray-400">{teacher.department || 'Academic Dept'}</span>
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Subject Teachers Management */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                                <div className="p-2 bg-orange-100 rounded-xl">
                                                    <Users className="h-6 w-6 text-orange-600" />
                                                </div>
                                                Subject Assignments
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        placeholder="Quick filter..."
                                                        value={subjectTeacherSearch}
                                                        onChange={(e) => setSubjectTeacherSearch(e.target.value)}
                                                        className="pl-9 h-10 bg-white rounded-xl border-gray-100 w-48 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Available Subjects Pool (Premium Chip Cloud) */}
                                        {availableSubjects.length > 0 && (
                                            <Card className="rounded-[32px] border-2 border-dashed border-purple-100 bg-purple-50/10 p-2 overflow-hidden">
                                                <div className="p-6">
                                                    <div className="flex flex-col gap-1 mb-6">
                                                        <h4 className="font-bold text-purple-900 flex items-center gap-2">
                                                            <Plus className="h-4 w-4" />
                                                            Assign New Subjects
                                                        </h4>
                                                        <p className="text-sm text-gray-500">Enable additional curriculum for this section</p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-3 mb-6">
                                                        {availableSubjects.map(subject => (
                                                            <button
                                                                key={subject.id}
                                                                onClick={() => toggleSubjectSelection(subject.id)}
                                                                className={`group flex items-center gap-2 px-5 py-3 rounded-2xl border-2 transition-all font-bold text-sm ${selectedSubjectsToAdd.includes(subject.id)
                                                                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg'
                                                                    : 'bg-white border-gray-100 text-gray-600 hover:border-purple-300'
                                                                    }`}
                                                            >
                                                                <div className={`p-1 rounded-md transition-colors ${selectedSubjectsToAdd.includes(subject.id) ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-purple-100'
                                                                    }`}>
                                                                    <BookOpen className={`h-3 w-3 ${selectedSubjectsToAdd.includes(subject.id) ? 'text-white' : 'text-gray-400 group-hover:text-purple-600'
                                                                        }`} />
                                                                </div>
                                                                {subject.name}
                                                                {selectedSubjectsToAdd.includes(subject.id) && <Plus className="h-3 w-3" />}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {selectedSubjectsToAdd.length > 0 && (
                                                        <Button
                                                            onClick={handleAddSubjects}
                                                            disabled={saving}
                                                            className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
                                                        >
                                                            {saving ? 'Processing...' : `Assign ${selectedSubjectsToAdd.length} selected subjects`}
                                                        </Button>
                                                    )}
                                                </div>
                                            </Card>
                                        )}

                                        {/* Assigned Subjects Grid */}
                                        {classSubjects.length === 0 ? (
                                            <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100 shadow-sm">
                                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <BookOpen className="h-10 w-10 text-gray-200" />
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-700 mb-2">Empty Curriculum</h4>
                                                <p className="text-gray-400 max-w-sm mx-auto px-4">This section has no subjects assigned. Use the panel above to start building the curriculum.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {classSubjects.map((cs, idx) => (
                                                    <motion.div
                                                        key={cs.subjectId}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-purple-900/[0.04] hover:-translate-y-1"
                                                    >
                                                        <div className="flex flex-col gap-6">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-inner">
                                                                        {cs.subjectName.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-xl font-bold text-gray-800">{cs.subjectName}</h4>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className={`w-2 h-2 rounded-full ${cs.teacherId ? 'bg-green-500' : 'bg-red-400 animate-pulse'}`}></span>
                                                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                                                {cs.teacherId ? 'Teaching Staff Assigned' : 'Unassigned'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Instructor</Label>
                                                                <Select
                                                                    value={cs.teacherId || '_none_'}
                                                                    onValueChange={(val) => handleSubjectTeacherChange(cs.subjectId, val)}
                                                                >
                                                                    <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 group-hover:bg-white group-hover:border-purple-100 shadow-none font-bold transition-all">
                                                                        <SelectValue placeholder="Assign teacher..." />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="rounded-2xl">
                                                                        <SelectItem value="_none_">Unassigned</SelectItem>
                                                                        {filteredSubjectTeachers.map(teacher => (
                                                                            <SelectItem key={teacher.id} value={teacher.id} className="py-3">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-6 h-6 rounded-full bg-gray-100 text-[10px] flex items-center justify-center font-bold">
                                                                                        {getInitials(teacher.name)}
                                                                                    </div>
                                                                                    {teacher.name}
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="subjects" className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Creation Panel */}
                        <Card className="lg:col-span-4 rounded-[32px] border-none shadow-xl shadow-purple-900/[0.04]">
                            <CardHeader className="p-8">
                                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-xl">
                                        <Plus className="h-6 w-6 text-purple-600" />
                                    </div>
                                    Define Subject
                                </CardTitle>
                                <CardDescription className="text-base text-gray-500">Establish a new standard curriculum component</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="font-bold text-gray-700 ml-1">Subject Name</Label>
                                        <Input
                                            placeholder="e.g. Creative Writing"
                                            value={newSubjectName}
                                            onChange={(e) => setNewSubjectName(e.target.value)}
                                            className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-gray-700 ml-1">Subject Code</Label>
                                        <div className="relative">
                                            <Input
                                                disabled
                                                placeholder="Auto-Generated by System"
                                                className="h-14 rounded-2xl border-gray-100 bg-gray-50/70 font-mono text-gray-400 cursor-not-allowed italic pr-20"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <div className="px-2 py-1 bg-purple-100 rounded text-[10px] font-black tracking-widest text-purple-600">
                                                    SYSTEM
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-gray-700 ml-1">Subject Scope (Type)</Label>
                                        <Select value={newSubjectType} onValueChange={(val) => {
                                            setNewSubjectType(val);
                                            setNewSubjectTargetGrade('');
                                            setNewSubjectExcludedGrades([]);
                                        }}>
                                            <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 hover:bg-white text-lg">
                                                <SelectValue placeholder="Select scope..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                <SelectItem value="UNIVERSAL" className="rounded-xl py-3">Universal (All Grades)</SelectItem>
                                                <SelectItem value="CLASS_SPECIFIC" className="rounded-xl py-3">Grade-Specific (One Grade)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {newSubjectType === 'CLASS_SPECIFIC' && (
                                        <div className="space-y-2">
                                            <Label className="font-bold text-gray-700 ml-1">Target Grade</Label>
                                            <Select value={newSubjectTargetGrade} onValueChange={setNewSubjectTargetGrade}>
                                                <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 hover:bg-white text-lg">
                                                    <SelectValue placeholder="Select target grade..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl max-h-[200px]">
                                                    {[...new Set(classes.map(c => c.grade || c.name))].sort().map(g => (
                                                        <SelectItem key={g} value={g} className="rounded-xl py-3">{g}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    className="w-full h-16 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-95"
                                    onClick={handleCreateSubject}
                                    disabled={isCreatingSubject}
                                >
                                    {isCreatingSubject ? 'Creating Master Entry...' : 'Create Subject Entry'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Master List */}
                        <Card className="lg:col-span-8 rounded-[32px] border-none shadow-xl shadow-purple-900/[0.03]">
                            <CardHeader className="p-8 flex flex-row items-center justify-between border-b border-gray-50">
                                <div>
                                    <CardTitle className="text-2xl font-bold">Curriculum Repository</CardTitle>
                                    <CardDescription className="text-base">All globally defined subjects for this academy</CardDescription>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-full text-xs font-bold text-gray-400 px-4">
                                    {subjectTotalElements} TOTAL ENTRIES
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {subjects.length === 0 ? (
                                        <div className="col-span-full py-20 text-center">
                                            <Search className="h-16 w-16 text-gray-100 mx-auto mb-4" />
                                            <p className="text-xl font-bold text-gray-300 italic">No subject meta-data found</p>
                                        </div>
                                    ) : (
                                        subjects.map((subject, idx) => (
                                            <motion.div
                                                key={subject.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className="flex items-center justify-between p-5 bg-gray-50/30 rounded-3xl border border-gray-100 group transition-all hover:bg-white hover:shadow-lg hover:shadow-purple-900/[0.03]"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-purple-600 font-black text-lg transition-transform group-hover:rotate-6">
                                                        {subject.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-lg">{subject.name}</p>
                                                        {subject.code && (
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                                                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">{subject.code}</span>
                                                            </div>
                                                        )}
                                                        <div className="mt-1">
                                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${subject.type === 'CLASS_SPECIFIC' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                                                {subject.type === 'CLASS_SPECIFIC' ? `SPECIFIC: ${subject.targetGrade}` : 'UNIVERSAL'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all active:scale-75"
                                                    onClick={() => handleDeleteSubject(subject.id)}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                                {subjectTotalPages > 1 && (
                                    <div className="mt-8 pt-6 border-t border-gray-50">
                                        <Pagination
                                            currentPage={subjectPage}
                                            totalPages={subjectTotalPages}
                                            onPageChange={setSubjectPage}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AcademicsManagement;
