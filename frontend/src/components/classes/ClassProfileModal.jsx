import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import adminService from '../../services/adminService';
import {
    X, Users, BookOpen, User, GraduationCap, MapPin, Loader2, AlertCircle,
    Trophy, Medal, Award, Star, Calculator, Beaker, Atom, FlaskConical,
    Flower2, Quote, Landmark, Globe, Cpu, Palette, Music, Dumbbell, Globe2
} from 'lucide-react';
import { Dialog, DialogContent } from '../ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

const subjectIconMap = {
    'Maths': Calculator,
    'Mathematics': Calculator,
    'Science': Beaker,
    'Physics': Atom,
    'Chemistry': FlaskConical,
    'Biology': Flower2,
    'English': Quote,
    'History': Landmark,
    'Geography': Globe,
    'Computer Science': Cpu,
    'Art': Palette,
    'Music': Music,
    'Physical Education': Dumbbell,
    'Games': Trophy,
    'Social Science': Globe2
};

const ClassProfileModal = ({ isOpen, onClose, selectedClass, globalSubjects, teachers }) => {
    const {
        data: profileData,
        isLoading: loading,
        isError,
    } = useQuery({
        queryKey: ['class-profile', selectedClass?.id],
        enabled: Boolean(isOpen && selectedClass?.id),
        queryFn: async () => {
            const [studentsData, subjectsData] = await Promise.all([
                adminService.getClassStudents(selectedClass.id),
                adminService.getClassSubjects(selectedClass.id)
            ]);

            return {
                students: studentsData?.content || [],
                classSubjectsRaw: subjectsData || [],
            };
        },
        staleTime: 1000 * 60 * 2,
    });

    const students = profileData?.students || [];
    const classSubjects = useMemo(() => {
        const classSubjectsRaw = profileData?.classSubjectsRaw || [];
        return classSubjectsRaw.map(cs => ({
            ...cs,
            subjectName: globalSubjects.find(s => s.id === cs.subjectId)?.name || 'Unknown Subject',
            teacherName: teachers.find(t => t.id === cs.teacherId)?.name || 'Unassigned'
        }));
    }, [profileData?.classSubjectsRaw, globalSubjects, teachers]);
    const error = isError ? 'Failed to load class details.' : null;

    if (!selectedClass) return null;

    const classTeacher = teachers.find(t => t.id === selectedClass.classTeacherId);

    // Identify Top Performers (Top 3 based on roll number as placeholder for performance)
    const sortedStudents = [...students].sort((a, b) => (a.rollNo || 999) - (b.rollNo || 999));
    const topPerformers = sortedStudents.slice(0, 3);
    const regularStudents = sortedStudents.slice(3);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
    };

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Trophy className="w-5 h-5 text-yellow-500" />;
            case 1: return <Medal className="w-5 h-5 text-slate-400" />;
            case 2: return <Award className="w-5 h-5 text-amber-600" />;
            default: return null;
        }
    };

    const getRankBg = (index) => {
        switch (index) {
            case 0: return 'bg-yellow-50 border-yellow-100 ring-yellow-200/50';
            case 1: return 'bg-slate-50 border-slate-100 ring-slate-200/50';
            case 2: return 'bg-amber-50 border-amber-100 ring-amber-200/50';
            default: return 'bg-gray-50 border-gray-100';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden bg-[#fafafa] backdrop-blur-xl border-white/20 shadow-2xl rounded-[2.5rem]" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
                <div className="flex justify-between items-center p-8 bg-white border-b border-gray-100/80">
                    <div className="flex items-center gap-6">
                        <motion.div
                            initial={{ rotate: -10, scale: 0.9 }}
                            animate={{ rotate: 0, scale: 1 }}
                            className="h-16 w-16 rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200"
                        >
                            <GraduationCap className="w-8 h-8 text-white" />
                        </motion.div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{selectedClass.name}</h2>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100/50">
                                    Section {selectedClass.section || 'A'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold text-gray-400 mt-2">
                                <span className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-emerald-400" /> Grade {selectedClass.grade}
                                </span>
                                {selectedClass.room && (
                                    <span className="flex items-center gap-2 h-4 border-l border-gray-200 pl-4">
                                        <MapPin className="w-4 h-4 text-emerald-400" /> Room {selectedClass.room}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-12 w-12 rounded-2xl hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar bg-gray-50/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="relative">
                                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                </div>
                            </div>
                            <p className="text-gray-400 font-bold mt-6 tracking-wide uppercase text-xs">Synchronizing Academic Records</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="h-20 w-20 bg-orange-50 rounded-[2rem] flex items-center justify-center mb-6 border border-orange-100 shadow-sm">
                                <AlertCircle className="h-10 w-10 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Data Retrieval Failed</h3>
                            <p className="text-gray-500 max-w-sm mx-auto font-medium">{error}</p>
                        </div>
                    ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

                            {/* Class Teacher Profile & Quick Stats */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow group flex items-center gap-6">
                                    <div className="h-20 w-20 rounded-[1.5rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <User className="w-10 h-10 text-emerald-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Primary Mentor</p>
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{classTeacher ? classTeacher.name : 'Not Assigned'}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            {classTeacher?.email && (
                                                <p className="text-xs font-bold text-gray-400 truncate max-w-[180px]">{classTeacher.email}</p>
                                            )}
                                            <span className="h-1 w-1 bg-gray-300 rounded-full" />
                                            <p className="text-xs font-bold text-gray-400">Class Teacher</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="bg-white p-6 rounded-[2rem] border border-gray-200/50 shadow-sm flex flex-col justify-center items-center text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Class Population</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-gray-900 tracking-tighter">{students.length}</span>
                                        <span className="text-sm font-bold text-gray-300 uppercase leading-none">/ {selectedClass.capacity || '-'}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden max-w-[100px]">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((students.length / (selectedClass.capacity || 1)) * 100, 100)}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-emerald-500 rounded-full"
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Academic Curriculum */}
                                <motion.div variants={itemVariants} className="bg-white p-7 rounded-[2.5rem] border border-gray-200/50 shadow-sm flex flex-col min-h-[450px]">
                                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-50/80">
                                        <div className="p-3 bg-emerald-50 rounded-2xl shadow-sm">
                                            <BookOpen className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl text-gray-900 tracking-tight">Academic Curriculum</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Assigned Subjects & Staff</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-4">
                                        {classSubjects.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <div className="p-4 bg-gray-50 rounded-full mb-3">
                                                    <BookOpen className="w-8 h-8 text-gray-200" />
                                                </div>
                                                <p className="text-sm text-gray-400 font-bold italic">Curriculum Pending Assignment</p>
                                            </div>
                                        ) : (
                                            classSubjects.map(sub => {
                                                const SubjectIcon = subjectIconMap[sub.subjectName] || subjectIconMap[sub.subjectName.split(' ')[0]] || BookOpen;
                                                return (
                                                    <div key={sub.id} className="p-5 bg-gray-50/50 rounded-3xl border border-gray-100/80 hover:bg-white hover:shadow-md hover:border-emerald-100 transition-all group">
                                                        <div className="flex items-start gap-4">
                                                            <div className="p-3 bg-white rounded-2xl border border-gray-100 group-hover:scale-110 transition-transform shadow-sm">
                                                                <SubjectIcon className="w-5 h-5 text-emerald-500" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-black text-gray-900 tracking-tight text-lg">{sub.subjectName}</p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <div className="h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                                                        <User className="w-3 h-3 text-emerald-600" />
                                                                    </div>
                                                                    <span className="text-xs font-bold text-gray-500">{sub.teacherName}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </motion.div>

                                {/* Enrolled Roster & Performers */}
                                <motion.div variants={itemVariants} className="bg-white p-7 rounded-[2.5rem] border border-gray-200/50 shadow-sm flex flex-col min-h-[450px]">
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50/80">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-emerald-50 rounded-2xl shadow-sm">
                                                <Users className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl text-gray-900 tracking-tight">Active Roster</h3>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Enrolled Student Registry</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/50 text-emerald-600 border border-emerald-100/50 font-black text-[10px] rounded-xl uppercase tracking-wider">
                                            {students.length} Verified
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-4">
                                        {students.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <div className="p-4 bg-gray-50 rounded-full mb-3">
                                                    <Users className="w-8 h-8 text-gray-200" />
                                                </div>
                                                <p className="text-sm text-gray-400 font-bold italic">Roster Awaiting Enrollment</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {/* Top Performers Section */}
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2 mb-4">
                                                        <Trophy className="w-3 h-3" /> Top Performers
                                                    </p>
                                                    {topPerformers.map((student, index) => (
                                                        <motion.div
                                                            key={student.id}
                                                            whileHover={{ x: 5 }}
                                                            className={`flex items-center gap-4 p-4 rounded-3xl border shadow-sm ring-4 ring-transparent transition-all hover:ring-offset-2 ${getRankBg(index)}`}
                                                        >
                                                            <div className="relative group/rank">
                                                                <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center text-gray-600 font-black text-sm">
                                                                    {(student.name || '?').charAt(0)}
                                                                </div>
                                                                <div className="absolute -top-2 -right-2 bg-white rounded-xl p-1 shadow-md border border-gray-50">
                                                                    {getRankIcon(index)}
                                                                </div>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-black text-gray-900 text-sm truncate">{student.name}</p>
                                                                    <span className="text-[10px] font-black text-emerald-400 px-1.5 py-0.5 bg-white border border-emerald-50 rounded-md">#{student.rollNo || (index + 1)}</span>
                                                                </div>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Adm: {student.admissionNo}</p>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                {/* Other Students */}
                                                {regularStudents.length > 0 && (
                                                    <div className="space-y-2 pt-2 border-t border-gray-100">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Student Registry</p>
                                                        {regularStudents.map(student => (
                                                            <div key={student.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100 group">
                                                                <div className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs shrink-0 group-hover:bg-emerald-50 transition-colors">
                                                                    {(student.name || '?').charAt(0)}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-bold text-gray-800 text-sm truncate">{student.name}</p>
                                                                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold text-gray-400">
                                                                        <span>Roll No: {student.rollNo || 'N/A'}</span>
                                                                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                                                        <span>ID: {student.admissionNo}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ClassProfileModal;
