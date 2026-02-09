import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Check, X, Clock, AlertTriangle, Lock, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const MarkAttendance = ({ onBack, onSuccess }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({}); // { studentId: { status, notes, id } }
    const [existingAttendance, setExistingAttendance] = useState(false);
    const [isWithinEditWindow, setIsWithinEditWindow] = useState(false); // Can edit within 24 hours

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.get('/teacher/attendance/classes');
                setClasses(response.data);
                // Auto-select the first (and only) class since teacher can only be class teacher of one class
                if (response.data && response.data.length > 0) {
                    setSelectedClass(response.data[0]);
                }
            } catch (err) {
                toast({ title: "Error", description: "Failed to load classes", variant: "destructive" });
            }
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass && selectedDate) {
            checkExistingAttendance();
        }
    }, [selectedClass, selectedDate]);

    const checkExistingAttendance = async () => {
        setLoading(true);
        try {
            const response = await api.get('/teacher/attendance', {
                params: { date: selectedDate, className: selectedClass.name }
            });

            if (response.data && response.data.length > 0) {
                setExistingAttendance(true);

                // Check if within 24-hour edit window
                const attendanceDate = new Date(selectedDate);
                const now = new Date();
                const attendanceEndOfDay = new Date(attendanceDate);
                attendanceEndOfDay.setHours(23, 59, 59, 999);
                const editDeadline = new Date(attendanceEndOfDay.getTime() + 24 * 60 * 60 * 1000);
                const canEdit = now <= editDeadline;
                setIsWithinEditWindow(canEdit);

                const map = {};
                response.data.forEach(r => {
                    map[r.studentId] = { status: r.status, notes: r.notes, id: r.id };
                });
                setAttendanceData(map);
                setStudents(response.data.map(r => ({ ...r, id: r.studentId, name: r.studentName })));

            } else {
                setExistingAttendance(false);
                setIsWithinEditWindow(true);
                const studentRes = await api.get('/teacher/students');
                const classStudents = studentRes.data.filter(s => s.className === selectedClass.name);
                setStudents(classStudents);

                // Initialize default 'ABSENT' so teacher can 'tick' to present
                const initialData = {};
                classStudents.forEach(s => {
                    initialData[s.id] = { status: 'ABSENT', notes: '' };
                });
                setAttendanceData(initialData);
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleMark = (studentId, isPresent) => {
        if (existingAttendance && !isWithinEditWindow) return;
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status: isPresent ? 'PRESENT' : 'ABSENT' }
        }));
    };

    const markAllPresent = () => {
        if (existingAttendance && !isWithinEditWindow) return;
        const newData = { ...attendanceData };
        students.forEach(s => {
            newData[s.id] = { ...newData[s.id], status: 'PRESENT' };
        });
        setAttendanceData(newData);
    };

    const markAllAbsent = () => {
        if (existingAttendance && !isWithinEditWindow) return;
        const newData = { ...attendanceData };
        students.forEach(s => {
            newData[s.id] = { ...newData[s.id], status: 'ABSENT' };
        });
        setAttendanceData(newData);
    };

    const handleNote = (studentId, notes) => {
        if (existingAttendance && !isWithinEditWindow) return;
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], notes }
        }));
    };

    const handleSubmit = async () => {
        if (existingAttendance && !isWithinEditWindow) return;
        if (new Date(selectedDate) > new Date()) {
            toast({ title: "Error", description: "Cannot mark future attendance", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            if (existingAttendance && isWithinEditWindow) {
                // Update existing attendance records
                const updatePromises = students.map(s => {
                    const record = attendanceData[s.id];
                    if (record && record.id) {
                        return api.put(`/teacher/attendance/${record.id}`, {
                            status: record.status,
                            reason: 'Updated within 24-hour window'
                        });
                    }
                    return Promise.resolve();
                });
                await Promise.all(updatePromises);
                toast({ title: "Success", description: "Attendance updated successfully" });
            } else {
                // Create new attendance records
                const payload = students.map(s => ({
                    studentId: s.id,
                    studentName: s.name,
                    attendanceDate: selectedDate,
                    className: selectedClass.name,
                    status: attendanceData[s.id]?.status || 'ABSENT',
                    notes: attendanceData[s.id]?.notes || ''
                }));

                await api.post('/teacher/attendance', payload);
                toast({ title: "Success", description: "Attendance submitted successfully" });
            }
            setExistingAttendance(true);
            if (onSuccess) onSuccess();
        } catch (err) {
            toast({ title: "Error", description: err.response?.data?.message || "Failed to submit", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onBack}>&larr; Back to History</Button>
                <h1 className="text-2xl font-bold">Mark Attendance</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Select Class & Date</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4 flex-wrap">
                    <div className="w-48">
                        <label className="text-sm font-medium mb-1 block">Class</label>
                        {classes.length > 0 ? (
                            <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-sm font-medium text-blue-700">{selectedClass?.name || classes[0]?.name}</span>
                            </div>
                        ) : (
                            <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="text-sm text-gray-500">No class assigned</span>
                            </div>
                        )}
                    </div>
                    <div className="w-48">
                        <label className="text-sm font-medium mb-1 block">Date</label>
                        <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
                    </div>
                </CardContent>
            </Card>

            {selectedClass && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-500" />
                            <span className="font-semibold text-gray-700">{students.length} Students</span>
                        </div>
                        {(!existingAttendance || isWithinEditWindow) ? (
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={markAllAbsent}>Uncheck All</Button>
                                <Button variant="outline" size="sm" onClick={markAllPresent}>Mark All Present</Button>
                                <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 ml-2">
                                    {loading ? 'Submitting...' : (existingAttendance ? 'Update Attendance' : 'Submit Attendance')}
                                </Button>
                            </div>
                        ) : (
                            <span className="flex items-center gap-2 text-orange-600 font-medium">
                                <Lock className="w-4 h-4" /> Attendance Locked (24hrs passed)
                            </span>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Roll No</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Student Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 w-32 text-center">Present?</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students
                                    .sort((a, b) => (parseInt(a.rollNo) || 0) - (parseInt(b.rollNo) || 0))
                                    .map(student => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                                {student.rollNo || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{student.name}</p>
                                                        <p className="text-xs text-gray-500">{student.admissionNo}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={attendanceData[student.id]?.status === 'PRESENT'}
                                                        onChange={(e) => handleMark(student.id, e.target.checked)}
                                                        disabled={existingAttendance && !isWithinEditWindow}
                                                        className="w-6 h-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Input
                                                    placeholder="Note..."
                                                    value={attendanceData[student.id]?.notes || ''}
                                                    onChange={(e) => handleNote(student.id, e.target.value)}
                                                    disabled={existingAttendance && !isWithinEditWindow}
                                                    className="h-8 text-sm"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                            No students found for this class.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarkAttendance;
