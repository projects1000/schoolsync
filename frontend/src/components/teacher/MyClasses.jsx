import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Users, GraduationCap, ChevronLeft, Search, Loader2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const MyClasses = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState(null);

    // Student List State
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        api.get('/teacher/classes')
            .then(res => {
                setClasses(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleClassClick = async (cls) => {
        setSelectedClass(cls);
        setLoadingStudents(true);
        try {
            const res = await api.get(`/teacher/classes/${cls.id}/students`);
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingStudents(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.admissionNo && s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gray-200 rounded" />
                <div className="h-7 bg-gray-200 rounded w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-xl border-l-4 border-l-gray-200 border border-gray-100 shadow-sm p-5">
                        <div className="h-5 bg-gray-200 rounded w-32 mb-3" />
                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <div className="h-4 bg-gray-200 rounded w-12" />
                                <div className="h-4 bg-gray-300 rounded w-16" />
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <div className="h-4 bg-gray-200 rounded w-14" />
                                <div className="h-4 bg-gray-300 rounded w-10" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (selectedClass) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedClass(null); setStudents([]); setSearchQuery(''); }}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Classes
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-800">{selectedClass.name} - Students</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search students..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{filteredStudents.length} Students</span>
                    </div>

                    {loadingStudents ? (
                        <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="w-[80px]">Roll No</TableHead>
                                    <TableHead className="w-[100px]">ID</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Guardian</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents
                                    .sort((a, b) => (parseInt(a.rollNo) || 0) - (parseInt(b.rollNo) || 0))
                                    .map(student => (
                                        <TableRow key={student.id} className="hover:bg-blue-50/50 transition-colors">
                                            <TableCell className="font-semibold text-gray-700">{student.rollNo || '-'}</TableCell>
                                            <TableCell className="font-medium text-gray-500">{student.admissionNo}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <span className="font-semibold text-gray-700">{student.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{student.guardian || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span>{student.guardianPhone || '-'}</span>
                                                    <span className="text-xs text-gray-400">{student.guardianEmail}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">View Profile</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                {filteredStudents.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                                            No students found matching your search.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">My Assigned Classes</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(cls => (
                    <Card key={cls.id} onClick={() => handleClassClick(cls)} className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500 hover:scale-105 group bg-white">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                                    {cls.name}
                                </CardTitle>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${cls.role === 'Class Teacher' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                                    }`}>
                                    {cls.role}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <span className="text-sm text-gray-500">Grade</span>
                                    <span className="font-semibold text-gray-700">{cls.grade}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <span className="text-sm text-gray-500">Section</span>
                                    <span className="font-semibold text-gray-700">{cls.section || 'N/A'}</span>
                                </div>
                                {cls.subject && (
                                    <div className="flex justify-between items-center bg-purple-50 p-2 rounded">
                                        <span className="text-sm text-purple-600">Subject</span>
                                        <span className="font-semibold text-purple-700">{cls.subject}</span>
                                    </div>
                                )}
                                <div className="pt-2 flex items-center justify-end text-blue-600 text-sm font-medium">
                                    <Users className="w-4 h-4 mr-1" /> View Student List &rarr;
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {classes.length === 0 && (
                    <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No classes assigned to you yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default MyClasses;
