import React, { useState, useEffect } from 'react';
import { Calendar, Search, Edit2, CheckCircle, XCircle, Clock, BarChart2, CalendarDays, ArrowLeft, Download } from 'lucide-react';
import adminService from '@/services/adminService';
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
  const isTeacher = currentUser?.role === 'teacher';

  // Views: 'daily', 'report', 'mark'
  const [view, setView] = useState('daily');

  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);

  // Daily View Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Shared Filters
  const [selectedClassId, setSelectedClassId] = useState('all');

  // Report View State: Single Date
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState([]);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editReason, setEditReason] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (view === 'daily' && selectedDate) {
      fetchDailyAttendance();
    } else if (view === 'report' && isTeacher && selectedClassId !== 'all') {
      fetchReport();
    }
  }, [selectedDate, selectedClassId, view, reportDate]);

  const fetchClasses = async () => {
    try {
      let data;
      if (isTeacher) {
        const response = await api.get('/teacher/attendance/classes');
        data = response.data;
      } else {
        data = await adminService.getClasses();
      }
      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes", error);
    }
  };

  const fetchDailyAttendance = async () => {
    try {
      setLoading(true);
      // Find Class Name from ID
      const clsObj = classes.find(c => c.id === selectedClassId);
      const className = clsObj ? clsObj.name : null;

      let data;
      if (isTeacher) {
        const params = { date: selectedDate };
        if (className) params.className = className;
        const response = await api.get('/teacher/attendance', { params });
        data = response.data;
      } else {
        data = await adminService.getAttendance(selectedDate, className);
      }
      setAttendance(data);
    } catch (error) {
      console.error("Failed to fetch attendance", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      // Pass same date for start and end to get single day history
      const res = await api.get(`/teacher/attendance/history/${selectedClassId}`, {
        params: { startDate: reportDate, endDate: reportDate }
      });
      setReportData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record) => {
    const recordDate = new Date(record.attendanceDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (recordDate > today) {
      toast({ title: "Error", description: "Cannot edit future attendance records", variant: "destructive" });
      return;
    }

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
      fetchDailyAttendance();
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

  const statusOptions = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'];

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

  const reportDates = getDatesInRange(reportDate, reportDate);

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

        {isTeacher && view !== 'mark' && (
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
        <MarkAttendance onBack={() => { setView('daily'); fetchDailyAttendance(); }} onSuccess={() => { setView('daily'); fetchDailyAttendance(); }} />
      ) : view === 'report' && isTeacher ? (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Date:</span>
              <Input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-40"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Class:</span>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select Class...</SelectItem>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedClassId === 'all' ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500">Please select a class to view attendance history.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Native Scroll Container */}
              <div className="w-full whitespace-nowrap rounded-md border overflow-x-auto">
                <div className="flex w-full space-x-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-200">
                        <TableHead className="w-[200px] sticky left-0 bg-gray-50 z-20 shadow-[1px_0_0_0_#eee]">Student Name</TableHead>
                        {reportDates.map(d => (
                          <TableHead key={d} className="w-[40px] p-0 text-center text-xs text-gray-500 font-medium border-l border-gray-100">
                            {formatDateHeader(d)}
                          </TableHead>
                        ))}
                        <TableHead className="w-[50px] text-center text-xs font-bold text-green-600 border-l border-gray-100">P</TableHead>
                        <TableHead className="w-[50px] text-center text-xs font-bold text-red-500">A</TableHead>
                        <TableHead className="w-[50px] text-center text-xs font-bold text-gray-600">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={reportDates.length + 4} className="text-center py-10">Loading report...</TableCell>
                        </TableRow>
                      ) : reportData.map((row) => (
                        <TableRow key={row.studentId} className="hover:bg-blue-50/20">
                          <TableCell className="font-medium text-gray-800 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#eee]">
                            <div className="flex flex-col py-1">
                              <span>{row.name}</span>
                              <span className="text-[10px] text-gray-400">{row.admissionNo}</span>
                            </div>
                          </TableCell>
                          {reportDates.map(d => {
                            const status = row.dailyRecord ? row.dailyRecord[d] : null;
                            return (
                              <TableCell key={d} className="p-0 text-center border-l border-gray-50 min-w-[40px]">
                                {renderStatusCell(status)}
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center text-green-600 font-bold text-sm bg-green-50/30 border-l border-gray-100">{row.present}</TableCell>
                          <TableCell className="text-center text-red-500 font-bold text-sm bg-red-50/30">{row.absent}</TableCell>
                          <TableCell className="text-center text-xs font-medium">
                            {row.percentage}%
                          </TableCell>
                        </TableRow>
                      ))}
                      {reportData.length === 0 && !loading && (
                        <TableRow>
                          <TableCell colSpan={reportDates.length + 4} className="text-center py-10 text-gray-500">
                            No data available for this range.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
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
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={fetchDailyAttendance} variant="outline" size="icon">
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
                    <TableCell>{record.attendanceDate}</TableCell>
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
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={!editReason.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceManagement;
