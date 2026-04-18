import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Lock,
  Users,
  Box,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  User,
  BookOpen,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import adminService from "@/services/adminService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import ClassProfileModal from "./ClassProfileModal";
import Pagination from "../common/Pagination";

const ClassManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [selectedGradeForSection, setSelectedGradeForSection] = useState("");
  const [expandedGrades, setExpandedGrades] = useState({});
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);
  const [isSubmittingWizard, setIsSubmittingWizard] = useState(false);

  // Profile state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileClass, setProfileClass] = useState(null);
  const [classToDelete, setClassToDelete] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  });

  // Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [teachers, setTeachers] = useState([]);
  const [globalSubjects, setGlobalSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [wizardData, setWizardData] = useState({
    classTeacherId: null,
    selectedSubjects: [], // Array of { id, name, teacherId }
  });

  // Form State
  const [formData, setFormData] = useState({
    grade: "",
    section: "",
    capacity: 30,
    room: "",
    locked: false,
  });

  const fetchClasses = async (page = 0) => {
    try {
      setLoading(true);
      const response = await adminService.getClasses({
        page,
        size: pagination.pageSize,
        sort: "createdAt,desc",
      });

      // Handle both array (legacy) and Page object (new)
      if (response && response.content) {
        setClasses(response.content);
        setPagination((prev) => ({
          ...prev,
          currentPage: response.number,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
        }));
      } else {
        setClasses(response || []);
        setPagination((prev) => ({
          ...prev,
          totalPages: 1,
          totalElements: (response || []).length,
        }));
      }
      // Initial state: grades are collapsed by default
      setExpandedGrades({});
    } catch (error) {
      console.error("Failed to fetch classes", error);
      toast({
        title: "Error",
        description: "Failed to load classes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchClasses(newPage);
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachersAndSubjects();
  }, []);

  const fetchTeachersAndSubjects = async () => {
    try {
      const [teacherData, subjectData] = await Promise.all([
        adminService.getTeachers({ size: 1000 }),
        adminService.getSubjects({ size: 1000 }),
      ]);
      setTeachers(teacherData.content || []);
      setGlobalSubjects(subjectData.content || []);
    } catch (error) {
      console.error("Failed to fetch wizard data", error);
    }
  };

  // Group classes by grade
  const groupedClasses = useMemo(() => {
    const groups = {};
    const filtered = classes.filter(
      (cls) =>
        (cls.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cls.grade || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cls.section || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cls.room || "").toLowerCase().includes(searchTerm.toLowerCase()),
    );
    filtered.forEach((cls) => {
      const grade = cls.grade || cls.name;
      if (!groups[grade]) {
        groups[grade] = [];
      }
      groups[grade].push(cls);
    });
    // Sort sections within each grade
    Object.keys(groups).forEach((grade) => {
      groups[grade].sort((a, b) =>
        (a.section || "").localeCompare(b.section || ""),
      );
    });
    return groups;
  }, [classes, searchTerm]);

  const sortedGrades = useMemo(() => {
    return Object.keys(groupedClasses).sort();
  }, [groupedClasses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      locked: checked,
    }));
  };

  const handleCreateSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmittingWizard) return;

    setIsSubmittingWizard(true);

    try {
      const createdClass = await adminService.createClass(formData);
      const classId = createdClass.id;

      if (wizardData.classTeacherId) {
        await adminService.assignClassTeacher(
          classId,
          wizardData.classTeacherId,
        );
      }

      if (wizardData.selectedSubjects.length > 0) {
        const subjectIds = wizardData.selectedSubjects.map((s) => s.id);
        await adminService.assignSubjectsToClass(classId, subjectIds);

        for (const sub of wizardData.selectedSubjects) {
          if (sub.teacherId) {
            await adminService.assignTeacherToSubject(
              classId,
              sub.id,
              sub.teacherId,
            );
          }
        }
      }

      toast({
        title: "Success",
        description: "Class architecture established successfully!",
      });

      resetWizard();
      fetchClasses();
    } catch (error) {
      console.error(error);
      toast({
        title: "Wizard Failed",
        description:
          error.response?.data || "An error occurred during multi-step setup",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingWizard(false);
    }
  };
  const resetWizard = () => {
    setIsAddModalOpen(false);
    setWizardStep(1);
    setFormData({
      grade: "",
      section: "",
      capacity: 30,
      room: "",
      locked: false,
    });
    setWizardData({ classTeacherId: null, selectedSubjects: [] });
  };

  const toggleWizardSubject = (subject) => {
    setWizardData((prev) => {
      const exists = prev.selectedSubjects.find((s) => s.id === subject.id);
      if (exists) {
        return {
          ...prev,
          selectedSubjects: prev.selectedSubjects.filter(
            (s) => s.id !== subject.id,
          ),
        };
      } else {
        return {
          ...prev,
          selectedSubjects: [
            ...prev.selectedSubjects,
            { ...subject, teacherId: null },
          ],
        };
      }
    });
  };

  const setWizardSubjectTeacher = (subjectId, teacherId) => {
    setWizardData((prev) => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.map((s) =>
        s.id === subjectId
          ? { ...s, teacherId: teacherId === "none" ? null : teacherId }
          : s,
      ),
    }));
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim() || isCreatingSubject) return;

    setIsCreatingSubject(true);

    try {
      const addedSubject = await adminService.createSubject({
        name: newSubjectName.trim(),
        description: "Created via Class Wizard",
        type: "CLASS_SPECIFIC",
        targetGrade: formData.grade,
      });

      setGlobalSubjects((prev) => [...prev, addedSubject]);

      setWizardData((prev) => ({
        ...prev,
        selectedSubjects: [
          ...prev.selectedSubjects,
          { ...addedSubject, teacherId: null },
        ],
      }));

      setNewSubjectName("");

      toast({
        title: "Success",
        description: `Subject "${addedSubject.name}" created`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data || "Failed to create subject",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSubject(false);
    }
  };

  // Derived states for the wizard
  const availableClassTeachers = useMemo(() => {
    const assignedClassTeacherIds = new Set(
      classes.map((c) => c.classTeacherId).filter(Boolean),
    );
    return teachers.filter((t) => !assignedClassTeacherIds.has(t.id));
  }, [classes, teachers]);

  const handleAddSectionClick = (grade) => {
    setSelectedGradeForSection(grade);
    setFormData({
      grade: grade,
      section: "",
      capacity: 30,
      room: "",
      locked: false,
    });
    setIsAddSectionModalOpen(true);
  };

  const handleAddSectionSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.createClass(formData);
      toast({
        title: "Success",
        description: `Section "${formData.section}" added to ${formData.grade}`,
      });
      setIsAddSectionModalOpen(false);
      fetchClasses();
      setFormData({
        grade: "",
        section: "",
        capacity: 30,
        room: "",
        locked: false,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error.response?.data || "Failed to add section",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (cls) => {
    setCurrentClass(cls);
    setFormData({
      grade: cls.grade || cls.name || "",
      section: cls.section || "",
      capacity: cls.capacity || 30,
      room: cls.room || "",
      locked: cls.locked || false,
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
      toast({
        title: "Error",
        description: error.response?.data || "Failed to update section",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (cls) => {
    setClassToDelete(cls);
  };

  const confirmDelete = async () => {
    if (!classToDelete) return;

    try {
      await adminService.deleteClass(classToDelete.id);
      toast({
        title: "Moved to Trash",
        description: `Section ${classToDelete.section} has been moved to trash.`,
      });
      setClassToDelete(null);
      fetchClasses();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error.response?.data || "Failed to move section to trash",
        variant: "destructive",
      });
    }
  };

  const toggleGrade = (grade) => {
    setExpandedGrades((prev) => ({ ...prev, [grade]: !prev[grade] }));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Class Management
          </h1>
          <p className="text-gray-500 font-medium">
            Architect your school's structural layout and sections
          </p>
        </div>
        <Dialog
          open={isAddModalOpen}
          onOpenChange={(open) => {
            if (!open) resetWizard();
            setIsAddModalOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-600 to-emerald-600 hover:from-emerald-700 hover:to-emerald-700 text-white shadow-lg shadow-emerald-200 border-none px-6 py-6 h-auto rounded-xl transition-all active:scale-95 group">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold text-lg">Create New Grade</span>
            </Button>
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl"
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 text-white">
              <h2 className="text-2xl font-black tracking-tight">
                Class Architect Wizard
              </h2>
              <p className="text-emerald-100/80 font-medium mt-1">
                {wizardStep === 1 &&
                  "Define the structural vitals of the new grade"}
                {wizardStep === 2 && "Appoint leadership for this section"}
                {wizardStep === 3 && "Construct the academic curriculum"}
              </p>

              {/* Step Indicators */}
              <div className="flex items-center gap-3 mt-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${wizardStep === s ? "w-10 bg-white" : wizardStep > s ? "w-2.5 bg-green-400" : "w-2.5 bg-white/20"}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 pb-10">
              {wizardStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Grade Name
                      </Label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                          Class :
                        </span>

                        <Input
                          name="grade"
                          value={formData.grade}
                          onChange={handleInputChange}
                          placeholder="1"
                          className="h-12 pl-20 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 text-lg font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Initial Section
                      </Label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                          Section :
                        </span>

                        <Input
                          name="section"
                          value={formData.section}
                          onChange={handleInputChange}
                          placeholder="A"
                          className="h-12 pl-24 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 text-lg font-bold"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Classroom Capacity
                      </Label>
                      <Input
                        name="capacity"
                        type="number"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 text-lg font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Venue / Room No.
                      </Label>
                      <Input
                        name="room"
                        value={formData.room}
                        onChange={handleInputChange}
                        placeholder="e.g. S-102"
                        className="h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 text-lg font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                      <User className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Appoint Class Teacher
                      </h3>
                      <p className="text-sm text-gray-500">
                        This mentor will oversee student discipline and records
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Select Primary Mentor
                    </Label>
                    <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      <button
                        onClick={() =>
                          setWizardData((prev) => ({
                            ...prev,
                            classTeacherId: null,
                          }))
                        }
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${!wizardData.classTeacherId ? "border-emerald-600 bg-emerald-50" : "border-gray-50 hover:border-gray-200 bg-white"}`}
                      >
                        <span className="font-bold text-gray-700">
                          Assign Later
                        </span>
                        {!wizardData.classTeacherId && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                      </button>
                      {availableClassTeachers.length === 0 && (
                        <div className="p-4 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex items-center justify-center h-[72px]">
                          <p className="text-sm font-medium text-gray-500">
                            All teachers are currently assigned to classes.
                          </p>
                        </div>
                      )}
                      {availableClassTeachers.map((teacher) => (
                        <button
                          key={teacher.id}
                          onClick={() =>
                            setWizardData((prev) => ({
                              ...prev,
                              classTeacherId: teacher.id,
                            }))
                          }
                          className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${wizardData.classTeacherId === teacher.id ? "border-emerald-600 bg-emerald-50" : "border-gray-50 hover:border-gray-200 bg-white"}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xs">
                              {(teacher.name || "")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <span className="font-bold text-gray-900">
                              {teacher.name}
                            </span>
                          </div>
                          {wizardData.classTeacherId === teacher.id && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                      <BookOpen className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Configure Curriculum
                      </h3>
                      <p className="text-sm text-gray-500">
                        Select subjects and assign specialist teachers
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-end justify-between gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                            Subject Name
                          </Label>
                          <Input
                            placeholder="e.g. Robotics, Art"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleCreateSubject(e);
                            }}
                            disabled={isCreatingSubject}
                            className="h-10 border-gray-200 rounded-xl focus:ring-emerald-500 bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                            Subject Code
                          </Label>
                          <div className="relative">
                            <Input
                              disabled
                              placeholder="Auto-Generated"
                              className="h-10 border-gray-200 rounded-xl bg-gray-100/50 font-mono text-gray-400 cursor-not-allowed italic text-sm pr-14"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <div className="px-1.5 py-0.5 bg-emerald-100 rounded text-[9px] font-black tracking-widest text-emerald-600">
                                SYS
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={handleCreateSubject}
                        disabled={!newSubjectName.trim() || isCreatingSubject}
                        className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold shrink-0 flex items-center justify-center gap-2"
                      >
                        {isCreatingSubject ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Creating...
                          </>
                        ) : (
                          "Create & Add"
                        )}
                      </Button>
                    </div>

                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Available Subjects
                    </Label>
                    <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      {globalSubjects
                        .filter((s) => {
                          if (s.type === "CLASS_SPECIFIC")
                            return s.targetGrade === formData.grade;
                          if (s.type === "UNIVERSAL")
                            return !(s.excludedGrades || []).includes(
                              formData.grade,
                            );
                          return true;
                        })
                        .map((subject) => {
                          const isSelected = wizardData.selectedSubjects.some(
                            (s) => s.id === subject.id,
                          );
                          const selectedSub = wizardData.selectedSubjects.find(
                            (s) => s.id === subject.id,
                          );

                          return (
                            <div
                              key={subject.id}
                              className={`p-4 rounded-2xl border-2 transition-all ${isSelected ? "border-emerald-600 bg-emerald-50/50" : "border-gray-50 bg-white"}`}
                            >
                              <div className="flex items-center justify-between">
                                <div
                                  className="flex items-center gap-3 cursor-pointer"
                                  onClick={() => toggleWizardSubject(subject)}
                                >
                                  <div
                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? "bg-emerald-600 border-emerald-600" : "border-gray-200 bg-white"}`}
                                  >
                                    {isSelected && (
                                      <CheckCircle2 className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                  <span className="font-bold text-gray-900">
                                    {subject.name}
                                  </span>
                                </div>
                                {isSelected && (
                                  <select
                                    className="bg-white border-none rounded-xl text-xs font-bold px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                    value={selectedSub.teacherId || "none"}
                                    onChange={(e) =>
                                      setWizardSubjectTeacher(
                                        subject.id,
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="none">
                                      Set Teacher Later
                                    </option>
                                    {teachers.map((t) => (
                                      <option key={t.id} value={t.id}>
                                        {t.name}
                                      </option>
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
                  onClick={() =>
                    wizardStep === 1
                      ? resetWizard()
                      : setWizardStep((prev) => prev - 1)
                  }
                >
                  {wizardStep === 1 ? (
                    "Cancel Project"
                  ) : (
                    <>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-3">
                  {wizardStep < 3 ? (
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-10 font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95 group"
                      onClick={() => setWizardStep((prev) => prev + 1)}
                      disabled={!formData.grade || !formData.section}
                    >
                      Continue to{" "}
                      {wizardStep === 1 ? "Leadership" : "Curriculum"}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <Button
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl h-12 px-12 font-black shadow-lg shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                      onClick={handleCreateSubmit}
                      disabled={isSubmittingWizard}
                    >
                      {isSubmittingWizard ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Building Architecture...
                        </>
                      ) : (
                        "Complete Final Architecture"
                      )}
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
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Grades</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {sortedGrades.length}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start space-x-4">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Sections</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {pagination.totalElements}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start space-x-4">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Capacity</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {classes.reduce((acc, c) => acc + (c.capacity || 0), 0)}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start space-x-4">
          <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Locked Sections</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {classes.filter((c) => c.locked).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white/70 backdrop-blur-sm rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[500px]">
        {/* Search Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Find a specific grade or section..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all text-base"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">
              Synchronizing structures...
            </p>
          </div>
        ) : sortedGrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-10">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Box className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              No classes organized yet
            </h3>
            <p className="text-gray-500 max-w-sm mt-2">
              Start by creating your first grade and section to begin managing
              your school hierarchy.
            </p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              Get Started
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              {sortedGrades.map((grade) => (
                <div
                  key={grade}
                  className="group bg-white rounded-3xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden"
                >
                  {/* Grade Header */}
                  <div
                    className="flex items-center justify-between p-6 cursor-pointer select-none"
                    onClick={() => toggleGrade(grade)}
                  >
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-100 transition-colors">
                        {expandedGrades[grade] ? (
                          <ChevronDown className="w-6 h-6" />
                        ) : (
                          <ChevronRight className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">
                          {grade}
                        </h3>
                        <p className="text-sm font-medium text-gray-500">
                          {groupedClasses[grade].length} Active Sections
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-10 px-4 rounded-xl text-emerald-600 hover:bg-emerald-50 font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSectionClick(grade);
                      }}
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
                          <div
                            key={cls.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between py-5 gap-4 group/item"
                          >
                            <div className="flex items-center gap-8">
                              <div className="flex flex-col">
                                <span className="text-3xl font-black text-gray-900 tracking-tighter w-12">
                                  {cls.section || "-"}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  Section
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center px-4 py-2 bg-gray-50 rounded-2xl text-gray-600">
                                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="font-bold text-sm">
                                    {cls.capacity}
                                  </span>
                                  <span className="ml-1 text-xs text-gray-400 font-medium">
                                    Students
                                  </span>
                                </div>
                                <div className="flex items-center px-4 py-2 bg-gray-50 rounded-2xl text-gray-600">
                                  <Box className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="text-xs text-gray-400 font-medium mr-1 uppercase">
                                    Room
                                  </span>
                                  <span className="font-bold text-sm tracking-tight">
                                    {cls.room || "-"}
                                  </span>
                                </div>

                                {cls.locked && (
                                  <div className="inline-flex items-center px-4 py-2 rounded-2xl text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
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
                                className="h-10 w-10 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 mr-2 z-10 relative"
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
                                className="h-10 w-10 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 mr-2 z-10 relative"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigate("/students", {
                                    state: { filterClass: cls.id },
                                  });
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
                                className="h-10 w-10 rounded-xl hover:bg-orange-50 hover:text-orange-600"
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

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          pageSize={pagination.pageSize}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modals are kept with modern styling applied above */}
      {/* Add Section Modal */}
      <Dialog
        open={isAddSectionModalOpen}
        onOpenChange={setIsAddSectionModalOpen}
      >
        <DialogContent
          className="rounded-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              New Section for {selectedGradeForSection}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSectionSubmit} className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label
                htmlFor="add-section"
                className="text-sm font-semibold text-gray-700"
              >
                Section Name
              </Label>
              <Input
                id="add-section"
                name="section"
                value={formData.section}
                onChange={handleInputChange}
                placeholder="e.g. B, Rose"
                className="rounded-xl h-12 text-lg font-bold border-gray-200 focus:ring-emerald-500"
                required
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="add-capacity" className="text-sm font-semibold">
                  Max Students
                </Label>
                <Input
                  id="add-capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="rounded-xl h-12 bg-gray-50 border-gray-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-room" className="text-sm font-semibold">
                  Assigned Room
                </Label>
                <Input
                  id="add-room"
                  name="room"
                  value={formData.room}
                  onChange={handleInputChange}
                  placeholder="e.g. 102"
                  className="rounded-xl h-12 bg-gray-50 border-gray-200"
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddSectionModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-emerald-200"
              >
                Append Section
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Section Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent
          className="rounded-2x max-w-lg"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Configure Section
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-5 pt-4">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-grade"
                  className="text-sm font-semibold uppercase tracking-wider text-gray-400"
                >
                  Parent Grade
                </Label>
                <Input
                  id="edit-grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="rounded-xl font-bold border-gray-100 bg-gray-50/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-section"
                  className="text-sm font-semibold uppercase tracking-wider text-gray-400"
                >
                  Section ID
                </Label>
                <Input
                  id="edit-section"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  className="rounded-xl font-bold border-gray-100 bg-gray-50/50"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-capacity"
                  className="text-sm font-semibold"
                >
                  Capacity
                </Label>
                <Input
                  id="edit-capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="rounded-xl border-gray-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-room" className="text-sm font-semibold">
                  Room
                </Label>
                <Input
                  id="edit-room"
                  name="room"
                  value={formData.room}
                  onChange={handleInputChange}
                  className="rounded-xl border-gray-200"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-100">
              <div>
                <Label htmlFor="locked" className="font-bold text-gray-800">
                  Security Lock
                </Label>
                <p className="text-xs text-gray-500">
                  Locking prevents deletion and major edits
                </p>
              </div>
              <Switch
                id="locked"
                checked={formData.locked}
                onCheckedChange={handleSwitchChange}
                className="data-[state=checked]:bg-orange-500"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-10 h-12 font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Custom Delete Confirmation Dialog */}
      <AlertDialog
        open={!!classToDelete}
        onOpenChange={(open) => !open && setClassToDelete(null)}
      >
        <AlertDialogContent
          className="rounded-2xl border-0 shadow-2xl overflow-hidden p-0 max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 flex flex-col items-center justify-center text-center">
            <div className="bg-white/20 p-4 rounded-full mb-3 backdrop-blur-sm">
              <Trash2 className="w-8 h-8 text-white" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-white mb-1">
              Delete Section?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-orange-50 font-medium">
              Move {classToDelete?.grade} - {classToDelete?.section} to trash
            </AlertDialogDescription>
          </div>

          <div className="p-6 bg-white space-y-4">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-800 leading-relaxed font-medium text-center">
              Are you sure you want to delete{" "}
              <span className="font-bold">
                Section "{classToDelete?.section}"
              </span>{" "}
              from <span className="font-bold">{classToDelete?.grade}</span>?
              <br />
              <br />
              This will automatically{" "}
              <span className="font-bold bg-orange-100 px-1 rounded text-orange-900 border border-orange-200">
                un-assign {classToDelete?.studentCount || 0} enrolled students
              </span>{" "}
              and move the class structure to the Trash. You can restore it
              later from Trash Management.
            </div>

            <AlertDialogFooter className="pt-4 flex items-center justify-between sm:justify-end gap-3 w-full">
              <AlertDialogCancel className="w-full sm:w-auto h-12 rounded-xl font-semibold border-gray-200 hover:bg-gray-50 flex-1">
                Keep Class
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="w-full sm:w-auto h-12 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200 px-8 flex-1 border-0"
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
