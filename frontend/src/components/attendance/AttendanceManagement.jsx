import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Search, Edit2, CheckCircle, XCircle, Clock, BarChart2, CalendarDays, ArrowLeft, Download, User } from 'lucide-react';
import adminService from '@/services/adminService';
import Pagination from '../common/Pagination';
import api from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import MarkAttendance from '@/components/teacher/MarkAttendance';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Removed ScrollArea import

const AttendanceManagement = ({ currentUser }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isTeacher = currentUser?.role === 'teacher';

  // Views: 'daily', 'report', 'mark'
  const [view, setView] = useState('daily');

  const [manualLoading, setManualLoading] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);

  // Pagination states
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Daily View Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Shared Filters
  const [selectedClassId, setSelectedClassId] = useState('all');

  // Report View State: Date Range for class
  const [classStartDate, setClassStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [classEndDate, setClassEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState([]);
  const [classDailyStats, setClassDailyStats] = useState([]); // [ { date, total, present, absent, percentage } ]
  const [singleDayStudents, setSingleDayStudents] = useState([]); // Detailed student list for single day view

  // Student Attendance View State (new)
  const [reportSubView, setReportSubView] = useState('class'); // 'class' or 'student'
  const [allStudents, setAllStudents] = useState([]);
  const [studentClassFilter, setStudentClassFilter] = useState('all'); // Filter students by class
  const [selectedStudentId, setSelectedStudentId] = useState('none');
  const [studentStartDate, setStudentStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [studentEndDate, setStudentEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentAttendanceData, setStudentAttendanceData] = useState([]);
  const [studentStats, setStudentStats] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editReason, setEditReason] = useState('');
  const [isEditWithinWindow, setIsEditWithinWindow] = useState(true); // Track if within 24-hour edit window

  const classesQuery = useQuery({
    queryKey: ['attendance', 'classes', isTeacher],
    queryFn: async () => {
      if (isTeacher) {
        const response = await api.get('/teacher/attendance/classes');
        return response.data || [];
      }

      const data = await adminService.getClasses();
      return data.content || data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!classesQuery.data) return;

    setClasses(classesQuery.data);
    if (isTeacher && classesQuery.data.length > 0) {
      setSelectedClassId(classesQuery.data[0].id);
    }
  }, [classesQuery.data, isTeacher]);

  useEffect(() => {
    if (!classesQuery.error) return;
    console.error('Failed to fetch classes', classesQuery.error);
  }, [classesQuery.error]);

  const allStudentsQuery = useQuery({
    queryKey: ['attendance', 'all-students', isTeacher],
    queryFn: async () => {
      const response = isTeacher
        ? await api.get('/teacher/students')
        : await api.get('/admin/students');

      return response.data.content || response.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!allStudentsQuery.data) return;
    setAllStudents(allStudentsQuery.data);
  }, [allStudentsQuery.data]);

  useEffect(() => {
    if (!allStudentsQuery.error) return;
    console.error('Failed to fetch students', allStudentsQuery.error);
  }, [allStudentsQuery.error]);

  const selectedClassObj = classes.find(c => c.id === selectedClassId);
  const selectedClassName = selectedClassObj ? selectedClassObj.name : null;

  const dailyAttendanceQuery = useQuery({
    queryKey: ['attendance', 'daily', isTeacher, selectedDate, selectedClassId, selectedClassName, page, pageSize, view],
    enabled: view === 'daily' && Boolean(selectedDate),
    queryFn: async () => {
      if (isTeacher) {
        const params = { date: selectedDate, page, size: pageSize };
        if (selectedClassName) params.className = selectedClassName;
        const response = await api.get('/teacher/attendance', { params });
        return response.data;
      }

      const params = { date: selectedDate, page, size: pageSize };
      if (selectedClassName && selectedClassName !== 'all') params.className = selectedClassName;
      return adminService.getAttendance(params);
    },
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (!dailyAttendanceQuery.data) return;

    const response = dailyAttendanceQuery.data;
    if (response && response.content) {
      setAttendance(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } else {
      setAttendance(Array.isArray(response) ? response : []);
      setTotalPages(1);
      setTotalElements(Array.isArray(response) ? response.length : 0);
    }
  }, [dailyAttendanceQuery.data]);

  useEffect(() => {
    if (!dailyAttendanceQuery.error) return;
    console.error('Failed to fetch attendance', dailyAttendanceQuery.error);
  }, [dailyAttendanceQuery.error]);

  const loading = manualLoading || dailyAttendanceQuery.isLoading || dailyAttendanceQuery.isFetching;

  const fetchReport = async () => {
    if (selectedClassId === 'all') return;
    setManualLoading(true);
    setSingleDayStudents([]); // Clear single day data
    try {
      const dates = getDatesInRange(classStartDate, classEndDate);
      const dailyStats = [];
      const isSingleDay = classStartDate === classEndDate;

      if (isTeacher) {
        // Teacher API returns aggregated data per student with dailyRecord map
        const res = await api.get(`/teacher/attendance/history/${selectedClassId}`, {
          params: { startDate: classStartDate, endDate: classEndDate }
        });
        const studentData = res.data || [];

        // If single day, prepare detailed student list
        if (isSingleDay && studentData.length > 0) {
          const detailedList = studentData.map(student => {
            const dailyRecord = student.dailyRecord || {};
            const status = dailyRecord[classStartDate] || 'NOT_MARKED';
            return {
              id: student.studentId,
              name: student.name,
              admissionNo: student.admissionNo,
              status
            };
          });
          setSingleDayStudents(detailedList);
        }

        // Calculate daily stats from the aggregated student data
        for (const date of dates) {
          let present = 0;
          let absent = 0;

          for (const student of studentData) {
            const dailyRecord = student.dailyRecord || {};
            const status = dailyRecord[date];
            if (status === 'PRESENT' || status === 'LATE') {
              present++;
            } else if (status === 'ABSENT' || status === 'HALF_DAY') {
              absent++;
            }
          }

          const total = present + absent;
          const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
          dailyStats.push({ date, total, present, absent, percentage });
        }
      } else {
        // Admin API - Use the new /history endpoint instead of looping
        const clsObj = classes.find(c => c.id === selectedClassId);
        const className = clsObj ? clsObj.name : null;
        
        const historyData = await adminService.getAttendanceHistory({
            startDate: classStartDate,
            endDate: classEndDate,
            className: className !== 'all' ? className : undefined
        });
        
        setClassDailyStats(historyData || []);

        // If single day, we still need the detailed student list
        if (isSingleDay) {
            const params = { date: classStartDate, page: 0, size: 1000 }; // Fetch all students for the single day detailed view
            if (className && className !== 'all') params.className = className;
            const resDetail = await adminService.getAttendance(params);
            
            const dayData = resDetail.content || resDetail.data || [];
            const detailedList = dayData.map(record => ({
              id: record.id,
              name: record.studentName,
              admissionNo: record.admissionNo || '-',
              status: record.status
            }));
            setSingleDayStudents(detailedList);
        }
      }
      setReportData([]); // Clear old data
    } catch (err) {
      console.error(err);
    } finally {
      setManualLoading(false);
    }
  };

  const fetchStudentAttendance = async () => {
    if (!selectedStudentId || selectedStudentId === 'none') {
      toast({ title: "Error", description: "Please select a student", variant: "destructive" });
      return;
    }
    setManualLoading(true);
    try {
      const response = await api.get(`/attendance/student/${selectedStudentId}`, {
        params: { startDate: studentStartDate, endDate: studentEndDate }
      });
      const data = response.data || [];
      setStudentAttendanceData(data);

      // Calculate stats
      const total = data.length;
      const present = data.filter(r => r.status === 'PRESENT').length;
      const absent = data.filter(r => r.status === 'ABSENT').length;
      const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
      setStudentStats({ total, present, absent, percentage });
    } catch (error) {
      console.error("Failed to fetch student attendance", error);
      toast({ title: "Error", description: "Failed to fetch student attendance", variant: "destructive" });
    } finally {
      setManualLoading(false);
    }
  };

  const handleEditClick = (record) => {
    const recordDate = new Date(record.attendanceDate);
    const now = new Date();

    // Set record date to end of that day (11:59:59 PM)
    const recordEndOfDay = new Date(recordDate);
    recordEndOfDay.setHours(23, 59, 59, 999);

    // Calculate 24 hours after the end of the attendance date
    const editDeadline = new Date(recordEndOfDay.getTime() + 24 * 60 * 60 * 1000);

    if (recordDate > now) {
      toast({ title: "Error", description: "Cannot edit future attendance records", variant: "destructive" });
      return;
    }

    // Check if within edit window but still open modal
    const withinWindow = now <= editDeadline;
    setIsEditWithinWindow(withinWindow);

    setCurrentRecord(record);
    setEditStatus(record.status);
    setEditReason('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editReason.trim()) {
      toast({ title: "Error", description: "Reason is mandatory", variant: "destructive" });
      return;
    }

    try {
      if (isTeacher) {
        await api.put(`/teacher/attendance/${currentRecord.id}`, { status: editStatus, reason: editReason });
      } else {
        await adminService.updateAttendance(currentRecord.id, editStatus, editReason);
      }
      toast({ title: "Success", description: "Attendance updated" });
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['attendance', 'daily'] });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PRESENT: { variant: 'success', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
      ABSENT: { variant: 'destructive', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
      LATE: { variant: 'warning', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100' },
      HALF_DAY: { variant: 'secondary', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' }
    };
    const config = statusConfig[status] || statusConfig.ABSENT;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`flex items-center gap-1 border-0 ${config.bg} ${config.color}`}>
        <Icon className={`w-3 h-3`} />
        {status}
      </Badge>
    );
  };

  const statusOptions = ['PRESENT', 'ABSENT'];

  // Helper to format date as DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Helper to get dates in range
  const getDatesInRange = (startDate, endDate) => {
    if (!startDate || !endDate) return [];
    const dates = [];
    let curr = new Date(startDate);
    const end = new Date(endDate);
    while (curr <= end) {
      dates.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const reportDates = getDatesInRange(classStartDate, classEndDate);

  const renderStatusCell = (status) => {
    if (!status) return <span className="text-gray-200 text-[10px]">•</span>;
    if (status === 'PRESENT') return <div className="w-5 h-5 mx-auto bg-green-100 text-green-700 rounded flex items-center justify-center text-[10px] font-bold" title="Present">P</div>;
    if (status === 'ABSENT') return <div className="w-5 h-5 mx-auto bg-red-100 text-red-700 rounded flex items-center justify-center text-[10px] font-bold" title="Absent">A</div>;
    if (status === 'LATE') return <div className="w-5 h-5 mx-auto bg-orange-100 text-orange-700 rounded flex items-center justify-center text-[10px] font-bold" title="Late">L</div>;
    if (status === 'HALF_DAY') return <div className="w-5 h-5 mx-auto bg-yellow-100 text-yellow-700 rounded flex items-center justify-center text-[10px] font-bold" title="Half Day">H</div>;
    return status.charAt(0);
  };

  const formatDateHeader = (dateStr) => {
    // Input: YYYY-MM-DD -> Output: DD/MM
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
          <p className="text-gray-500">Track and manage student attendance</p>
        </div>

        {view !== 'mark' && (
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <Button
              variant={view === 'daily' ? 'white' : 'ghost'}
              size="sm"
              onClick={() => setView('daily')}
              className={view === 'daily' ? 'bg-white shadow-sm' : ''}
            >
              <CalendarDays className="w-4 h-4 mr-2" /> Daily View
            </Button>
            <Button
              variant={view === 'report' ? 'white' : 'ghost'}
              size="sm"
              onClick={() => setView('report')}
              className={view === 'report' ? 'bg-white shadow-sm' : ''}
            >
              <BarChart2 className="w-4 h-4 mr-2" /> History & Reports
            </Button>
          </div>
        )}

        {isTeacher && view !== 'mark' && (
          <Button onClick={() => setView('mark')} className="bg-blue-600 hover:bg-blue-700 shadow-md">
            <CheckCircle className="w-4 h-4 mr-2" /> Take Attendance
          </Button>
        )}
      </div>

      {view === 'mark' ? (
        <MarkAttendance onBack={() => { setView('daily'); queryClient.invalidateQueries({ queryKey: ['attendance', 'daily'] }); }} onSuccess={() => { setView('daily'); queryClient.invalidateQueries({ queryKey: ['attendance', 'daily'] }); }} />
      ) : view === 'report' ? (
        <div className="space-y-4">
          {/* Sub-tab toggle for Class vs Student attendance */}
          <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
            <Button
              variant={reportSubView === 'class' ? 'white' : 'ghost'}
              size="sm"
              onClick={() => setReportSubView('class')}
              className={reportSubView === 'class' ? 'bg-white shadow-sm' : ''}
            >
              <CalendarDays className="w-4 h-4 mr-2" /> Class Attendance
            </Button>
            <Button
              variant={reportSubView === 'student' ? 'white' : 'ghost'}
              size="sm"
              onClick={() => setReportSubView('student')}
              className={reportSubView === 'student' ? 'bg-white shadow-sm' : ''}
            >
              <User className="w-4 h-4 mr-2" /> Student Attendance
            </Button>
          </div>

          {reportSubView === 'student' ? (
            /* Student Attendance View */
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Class:</span>
                  {isTeacher ? (
                    <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-blue-700">{classes[0]?.name || 'No class assigned'}</span>
                    </div>
                  ) : (
                    <Select value={studentClassFilter} onValueChange={(val) => { setStudentClassFilter(val); setSelectedStudentId('none'); }}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Student:</span>
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Select Student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select Student...</SelectItem>
                      {allStudents
                        .filter(s => studentClassFilter === 'all' || s.className === studentClassFilter)
                        .map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.className})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">From:</span>
                  <Input
                    type="date"
                    value={studentStartDate}
                    onChange={(e) => setStudentStartDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">To:</span>
                  <Input
                    type="date"
                    value={studentEndDate}
                    onChange={(e) => setStudentEndDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <Button onClick={fetchStudentAttendance} className="bg-blue-600 hover:bg-blue-700">
                  <Search className="w-4 h-4 mr-2" /> Search
                </Button>
              </div>

              {/* Student Attendance Summary */}
              {studentAttendanceData.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-800">{studentStats.total}</p>
                      <p className="text-xs text-gray-500">Total Days</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{studentStats.present}</p>
                      <p className="text-xs text-gray-500">Present</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{studentStats.absent}</p>
                      <p className="text-xs text-gray-500">Absent</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{studentStats.percentage}%</p>
                      <p className="text-xs text-gray-500">Attendance</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Student Attendance Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-10">Loading attendance...</TableCell>
                      </TableRow>
                    ) : studentAttendanceData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-10 text-gray-500">
                          {selectedStudentId && selectedStudentId !== 'none' ? 'No attendance records found for this date range.' : 'Please select a student and click Search.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      studentAttendanceData.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{formatDate(record.attendanceDate)}</TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                            {record.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            /* Class Attendance View with Date Range */
            <>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Class:</span>
                  {isTeacher ? (
                    <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-blue-700">{classes[0]?.name || 'No class assigned'}</span>
                    </div>
                  ) : (
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Select Class...</SelectItem>
                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">From:</span>
                  <Input
                    type="date"
                    value={classStartDate}
                    onChange={(e) => setClassStartDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">To:</span>
                  <Input
                    type="date"
                    value={classEndDate}
                    onChange={(e) => setClassEndDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <Button onClick={fetchReport} disabled={selectedClassId === 'all' || loading} className="bg-blue-600 hover:bg-blue-700">
                  <Search className="w-4 h-4 mr-2" /> Search
                </Button>
              </div>

              {selectedClassId === 'all' ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500">Please select a class to view attendance history.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Show detailed student list for single day, or summary stats for date range */}
                  {classStartDate === classEndDate && singleDayStudents.length > 0 ? (
                    <>
                      {/* Summary Stats for Single Day */}
                      <div className="p-4 border-b bg-gray-50">
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div className="p-3 bg-white rounded-lg shadow-sm">
                            <p className="text-2xl font-bold text-gray-800">{singleDayStudents.length}</p>
                            <p className="text-xs text-gray-500">Total Students</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{singleDayStudents.filter(s => s.status === 'PRESENT').length}</p>
                            <p className="text-xs text-gray-500">Present</p>
                          </div>
                          <div className="p-3 bg-red-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">{singleDayStudents.filter(s => s.status === 'ABSENT').length}</p>
                            <p className="text-xs text-gray-500">Absent</p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">
                              {singleDayStudents.length > 0 ? Math.round((singleDayStudents.filter(s => s.status === 'PRESENT').length / singleDayStudents.length) * 100) : 0}%
                            </p>
                            <p className="text-xs text-gray-500">Attendance</p>
                          </div>
                        </div>
                      </div>
                      {/* Detailed Student List */}
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 border-b border-gray-200">
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Admission No.</TableHead>
                            <TableHead className="w-[120px] text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {singleDayStudents.map((student, index) => (
                            <TableRow key={student.id} className="hover:bg-gray-50">
                              <TableCell className="text-gray-500">{index + 1}</TableCell>
                              <TableCell className="font-medium">{student.name}</TableCell>
                              <TableCell className="text-gray-500">{student.admissionNo}</TableCell>
                              <TableCell className="text-center">
                                {getStatusBadge(student.status)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead className="w-[120px]">Date</TableHead>
                          <TableHead className="w-[100px] text-center">Total Students</TableHead>
                          <TableHead className="w-[100px] text-center text-green-600">Present</TableHead>
                          <TableHead className="w-[100px] text-center text-red-500">Absent</TableHead>
                          <TableHead className="w-[120px] text-center">Attendance %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-10">Loading report...</TableCell>
                          </TableRow>
                        ) : classDailyStats.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                              Click Search to load attendance data for the selected date range.
                            </TableCell>
                          </TableRow>
                        ) : (
                          classDailyStats.map((day) => (
                            <TableRow key={day.date} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{formatDate(day.date)}</TableCell>
                              <TableCell className="text-center text-gray-600">{day.total}</TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                  <CheckCircle className="w-3 h-3" /> {day.present}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                                  <XCircle className="w-3 h-3" /> {day.absent}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center gap-2 justify-center">
                                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${day.percentage >= 80 ? 'bg-green-500' : day.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                      style={{ width: `${day.percentage}%` }}
                                    />
                                  </div>
                                  <span className={`font-bold ${day.percentage >= 80 ? 'text-green-600' : day.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {day.percentage}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Daily Filter */}
          <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-44"
              />
            </div>
            {/* Show class name directly for teachers (they can only be class teacher of one class) */}
            {isTeacher ? (
              classes.length > 0 ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-700">{classes[0]?.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-500">No class assigned</span>
                </div>
              )
            ) : (
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Button onClick={() => dailyAttendanceQuery.refetch()} variant="outline" size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading records...</TableCell>
                </TableRow>
              ) : attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No attendance records for this date
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.studentName}</TableCell>
                    <TableCell>{record.className}</TableCell>
                    <TableCell>{formatDate(record.attendanceDate)}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                      {record.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(record)}>
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
            totalElements={totalElements}
            pageSize={pageSize}
          />
        </div>
      )}

      {/* Edit Modal (Existing) */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">Edit Status for <strong>{currentRecord?.studentName}</strong></p>

            {!isEditWithinWindow && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 text-sm">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>Editing is only allowed within 24 hours of the attendance date. This record can no longer be modified.</span>
              </div>
            )}

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus} disabled={!isEditWithinWindow}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason <span className="text-red-500">*</span></Label>
              <Textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="Reason for change..."
                rows={3}
                disabled={!isEditWithinWindow}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={!isEditWithinWindow || !editReason.trim()}>
              {isEditWithinWindow ? 'Save' : 'Locked'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceManagement;
