import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { Loader2, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const MyStudents = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [fetchingStudents, setFetchingStudents] = useState(false);

    useEffect(() => {
        const redirectId = localStorage.getItem('redirect_class_id');
        if (redirectId) {
            setSelectedClassId(redirectId);
            localStorage.removeItem('redirect_class_id');
        }
    }, []);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await api.get('/teacher/classes');
                setClasses(res.data);
            } catch (err) {
                console.error("Failed to load classes", err);
            }
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        const fetchStudents = async () => {
            setFetchingStudents(true);
            try {
                let res;
                if (selectedClassId === 'all') {
                    res = await api.get('/teacher/students');
                } else {
                    res = await api.get(`/teacher/classes/${selectedClassId}/students`);
                }
                setStudents(res.data);
            } catch (err) {
                console.error("Failed to load students", err);
            } finally {
                setFetchingStudents(false);
                setLoading(false);
            }
        };
        fetchStudents();
    }, [selectedClassId]);

    useEffect(() => {
        const lower = searchQuery.toLowerCase();
        setFilteredStudents(students.filter(s =>
            s.name.toLowerCase().includes(lower) ||
            (s.admissionNo && s.admissionNo.toLowerCase().includes(lower))
        ));
    }, [searchQuery, students]);

    if (loading && classes.length === 0) return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-7 bg-gray-200 rounded w-40 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-64" />
                </div>
                <div className="flex gap-4">
                    <div className="h-10 bg-gray-200 rounded w-48" />
                    <div className="h-10 bg-gray-200 rounded w-64" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-28 mb-1" />
                                <div className="h-3 bg-gray-100 rounded w-20" />
                            </div>
                            <div className="h-5 bg-gray-200 rounded-full w-16" />
                        </div>
                        <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-2">
                            <div className="h-3 bg-gray-100 rounded w-full" />
                            <div className="h-3 bg-gray-100 rounded w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        Student List
                    </h2>
                    <p className="text-gray-500">View and manage students in your assigned classes</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="w-48">
                        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Class" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Classes</SelectItem>
                                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or ID..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {fetchingStudents ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map(student => (
                        <motion.div key={student.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group">
                            <Card className="hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-blue-500 overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{student.name}</h4>
                                                <p className="text-sm text-gray-500">{student.className}</p>
                                            </div>
                                        </div>
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                                            {student.admissionNo}
                                        </span>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-y-2 text-sm">
                                        <div>
                                            <span className="text-xs text-gray-400 block uppercase tracking-wider">Guardian</span>
                                            <span className="text-gray-700 font-medium truncate block" title={student.guardian}>{student.guardian || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 block uppercase tracking-wider">Phone</span>
                                            <span className="text-gray-700 font-medium">{student.guardianPhone || '-'}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                    {filteredStudents.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">No students found</h3>
                            <p className="text-gray-500">Try adjusting your filters or search query.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyStudents;
