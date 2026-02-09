import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, ChevronRight, Save, UserCheck, GraduationCap, Plus, Trash2, Search } from 'lucide-react';
import adminService from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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

    // Subject Management state
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectCode, setNewSubjectCode] = useState('');
    const [isCreatingSubject, setIsCreatingSubject] = useState(false);

    // Selected Class
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);

    // Assignments for selected class
    const [classTeacherId, setClassTeacherId] = useState('');
    const [classSubjects, setClassSubjects] = useState([]); // { subjectId, subjectName, teacherId, teacherName }

    // Available subjects (not yet assigned to class)
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [selectedSubjectsToAdd, setSelectedSubjectsToAdd] = useState([]);
    const [showAddSubjects, setShowAddSubjects] = useState(false);

    // Track changes
    const [originalClassTeacherId, setOriginalClassTeacherId] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    // Teacher search filters
    const [classTeacherSearch, setClassTeacherSearch] = useState('');
    const [subjectTeacherSearch, setSubjectTeacherSearch] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [classesData, teachersData, subjectsData] = await Promise.all([
                adminService.getClasses(),
                adminService.getTeachers(),
                adminService.getSubjects()
            ]);
            setClasses(classesData || []);
            setTeachers(teachersData || []);
            setSubjects(subjectsData || []);
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

    // Compute available class teachers (exclude those already assigned as class teachers to other sections)
    const availableClassTeachers = useMemo(() => {
        // Get all teacher IDs who are already class teachers (excluding the currently selected class)
        const assignedTeacherIds = classes
            .filter(c => c.id !== selectedClassId && c.classTeacherId)
            .map(c => c.classTeacherId);

        // Filter teachers to only include those not already assigned
        return teachers.filter(t =>
            !assignedTeacherIds.includes(t.id) || t.id === classTeacherId
        );
    }, [teachers, classes, selectedClassId, classTeacherId]);

    // Filtered class teachers based on search
    const filteredClassTeachers = useMemo(() => {
        if (!classTeacherSearch.trim()) return availableClassTeachers;
        const search = classTeacherSearch.toLowerCase();
        return availableClassTeachers.filter(t =>
            t.name?.toLowerCase().includes(search) ||
            t.department?.toLowerCase().includes(search)
        );
    }, [availableClassTeachers, classTeacherSearch]);

    // Filtered subject teachers based on search
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

        // Set Class Teacher
        const ctId = cls.classTeacherId || '';
        setClassTeacherId(ctId);
        setOriginalClassTeacherId(ctId);

        // Fetch subjects assigned to this class
        try {
            const classSubjectsData = await adminService.getClassSubjects(classId);
            // Transform to UI format
            const mapped = (classSubjectsData || []).map(cs => ({
                id: cs.id,
                subjectId: cs.subjectId,
                subjectName: subjects.find(s => s.id === cs.subjectId)?.name || 'Unknown',
                teacherId: cs.teacherId || '',
                teacherName: teachers.find(t => t.id === cs.teacherId)?.name || 'Unassigned'
            }));
            setClassSubjects(mapped);

            // Calculate available subjects (not yet assigned to this class)
            const assignedSubjectIds = mapped.map(cs => cs.subjectId);
            const available = subjects.filter(s => !assignedSubjectIds.includes(s.id));
            setAvailableSubjects(available);
        } catch (error) {
            console.error('Failed to fetch class subjects:', error);
            setClassSubjects([]);
            setAvailableSubjects(subjects); // All subjects available if fetch failed
        }

        setSelectedSubjectsToAdd([]);
        setShowAddSubjects(false);
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
            // Save Class Teacher if changed
            if (classTeacherId !== originalClassTeacherId) {
                await adminService.assignClassTeacher(selectedClassId, classTeacherId);
            }

            // Save Subject Teachers
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

            // Refresh classes to get updated classTeacherId
            const updatedClasses = await adminService.getClasses();
            setClasses(updatedClasses);

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

    const getTeacherDisplay = (teacherId) => {
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher ? teacher.name : 'Select Teacher';
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

            // Refresh data for this class
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
                code: newSubjectCode
            });
            toast({
                title: "Success",
                description: "Subject created successfully"
            });
            setNewSubjectName('');
            setNewSubjectCode('');
            // Refresh subjects
            const subjectsData = await adminService.getSubjects();
            setSubjects(subjectsData || []);
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
            // Refresh subjects
            const subjectsData = await adminService.getSubjects();
            setSubjects(subjectsData || []);
            // If the deleted subject was selected for a class, refresh class details
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-purple-600" />
                        Academics Management
                    </h1>
                    <p className="text-gray-500">Manage subjects and academic assignments</p>
                </div>
            </div>

            <Tabs defaultValue="assignments" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="assignments">Academic Assignments</TabsTrigger>
                    <TabsTrigger value="subjects">Subject Master</TabsTrigger>
                </TabsList>

                <TabsContent value="assignments">
                    <div className="space-y-6">
                        {/* Save Button for Assignments */}
                        <div className="flex justify-end">
                            {hasChanges && (
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            )}
                        </div>

                        {/* Class Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-500" />
                                    Select Class & Section
                                </CardTitle>
                                <CardDescription>Manage academic assignments by section</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2 block">Grade</Label>
                                        <Select value={selectedGrade} onValueChange={handleGradeSelect}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Grade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[...new Set(classes.map(c => c.grade || c.name))].sort().map(grade => (
                                                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedGrade && (
                                        <div className="animate-in fade-in slide-in-from-left-2">
                                            <Label className="mb-2 block">Section</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {classes
                                                    .filter(c => (c.grade || c.name) === selectedGrade)
                                                    .sort((a, b) => (a.section || '').localeCompare(b.section || ''))
                                                    .map(cls => (
                                                        <Button
                                                            key={cls.id}
                                                            variant={selectedClassId === cls.id ? "default" : "outline"}
                                                            onClick={() => handleClassSelect(cls.id)}
                                                            className="min-w-[60px]"
                                                        >
                                                            {cls.section || 'N/A'}
                                                        </Button>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Class Details */}
                        {selectedClass && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Class Teacher */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <UserCheck className="h-5 w-5 text-green-500" />
                                            Class Teacher
                                        </CardTitle>
                                        <CardDescription>
                                            Assign the class teacher for {selectedClass.name}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="max-w-md space-y-3">
                                            <Label className="block">Class Teacher</Label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder="Search teachers..."
                                                    value={classTeacherSearch}
                                                    onChange={(e) => setClassTeacherSearch(e.target.value)}
                                                    className="pl-9 mb-2"
                                                />
                                            </div>
                                            <Select value={classTeacherId || '_none_'} onValueChange={handleClassTeacherChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select class teacher..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="_none_">None</SelectItem>
                                                    {filteredClassTeachers.length === 0 ? (
                                                        <div className="px-2 py-4 text-center text-sm text-gray-500">No teachers found</div>
                                                    ) : (
                                                        filteredClassTeachers.map(teacher => (
                                                            <SelectItem key={teacher.id} value={teacher.id}>
                                                                {teacher.name} ({teacher.department || 'General'})
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Add Subjects to Class */}
                                {availableSubjects.length > 0 && (
                                    <Card className="border-dashed border-2 border-blue-200 bg-blue-50/30">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Plus className="h-5 w-5 text-blue-500" />
                                                Add Subjects to Class
                                            </CardTitle>
                                            <CardDescription>
                                                Select subjects to assign to {selectedClass.name}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                                                {availableSubjects.map(subject => (
                                                    <div
                                                        key={subject.id}
                                                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${selectedSubjectsToAdd.includes(subject.id)
                                                            ? 'bg-blue-100 border-blue-400'
                                                            : 'bg-white border-gray-200 hover:border-blue-300'
                                                            }`}
                                                        onClick={() => toggleSubjectSelection(subject.id)}
                                                    >
                                                        <Checkbox
                                                            checked={selectedSubjectsToAdd.includes(subject.id)}
                                                            onCheckedChange={() => toggleSubjectSelection(subject.id)}
                                                        />
                                                        <span className="text-sm font-medium">{subject.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {selectedSubjectsToAdd.length > 0 && (
                                                <Button
                                                    onClick={handleAddSubjects}
                                                    disabled={saving}
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    {saving ? 'Adding...' : `Add ${selectedSubjectsToAdd.length} Subject(s)`}
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Subject Teachers */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Users className="h-5 w-5 text-orange-500" />
                                            Subject Teachers
                                        </CardTitle>
                                        <CardDescription>
                                            Assign teachers to each subject for {selectedClass.name}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {classSubjects.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                                <p>No subjects assigned to this class yet.</p>
                                                <p className="text-sm">Use Class Management to assign subjects first.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Search input for subject teachers */}
                                                <div className="relative max-w-sm">
                                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        placeholder="Search teachers for subjects..."
                                                        value={subjectTeacherSearch}
                                                        onChange={(e) => setSubjectTeacherSearch(e.target.value)}
                                                        className="pl-9"
                                                    />
                                                </div>
                                                {classSubjects.map(cs => (
                                                    <div key={cs.subjectId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                                <BookOpen className="h-5 w-5 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-800">{cs.subjectName}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {cs.teacherId ? getTeacherDisplay(cs.teacherId) : 'Unassigned'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="w-64">
                                                            <Select
                                                                value={cs.teacherId || '_none_'}
                                                                onValueChange={(val) => handleSubjectTeacherChange(cs.subjectId, val)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Assign teacher..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="_none_">Unassigned</SelectItem>
                                                                    {filteredSubjectTeachers.length === 0 ? (
                                                                        <div className="px-2 py-4 text-center text-sm text-gray-500">No teachers found</div>
                                                                    ) : (
                                                                        filteredSubjectTeachers.map(teacher => (
                                                                            <SelectItem key={teacher.id} value={teacher.id}>
                                                                                {teacher.name}
                                                                            </SelectItem>
                                                                        ))
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="subjects">
                    <div className="space-y-6">
                        {/* Create Subject */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Plus className="h-5 w-5 text-purple-600" />
                                    Define New Subject
                                </CardTitle>
                                <CardDescription>Add a new subject to the school's master list</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="subjectName">Subject Name</Label>
                                        <Input
                                            id="subjectName"
                                            placeholder="e.g. Mathematics"
                                            value={newSubjectName}
                                            onChange={(e) => setNewSubjectName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subjectCode">Subject Code (Optional)</Label>
                                        <Input
                                            id="subjectCode"
                                            placeholder="e.g. MATH101"
                                            value={newSubjectCode}
                                            onChange={(e) => setNewSubjectCode(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="mt-4 bg-purple-600 hover:bg-purple-700"
                                    onClick={handleCreateSubject}
                                    disabled={isCreatingSubject}
                                >
                                    {isCreatingSubject ? 'Creating...' : 'Create Subject'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Subjects List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-500" />
                                    Master Subject List
                                </CardTitle>
                                <CardDescription>List of all subjects defined for the school</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {subjects.length === 0 ? (
                                        <div className="col-span-full py-12 text-center text-gray-500">
                                            No subjects created yet
                                        </div>
                                    ) : (
                                        subjects.map(subject => (
                                            <div key={subject.id} className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm group hover:border-purple-300 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                                                        {subject.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{subject.name}</p>
                                                        {subject.code && (
                                                            <p className="text-xs text-gray-400 font-mono">{subject.code}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDeleteSubject(subject.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AcademicsManagement;
