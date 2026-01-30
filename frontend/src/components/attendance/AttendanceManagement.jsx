import React, { useState, useEffect } from 'react';
import { Calendar, Search, Edit2, CheckCircle, XCircle, Clock } from 'lucide-react';
import adminService from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
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

const AttendanceManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterClass, setFilterClass] = useState('all');

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editReason, setEditReason] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAttendance();
    }
  }, [selectedDate, filterClass]);

  const fetchClasses = async () => {
    try {
      const data = await adminService.getClasses();
      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes", error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const className = filterClass !== 'all' ? filterClass : null;
      const data = await adminService.getAttendance(selectedDate, className);
      setAttendance(data);
    } catch (error) {
      console.error("Failed to fetch attendance", error);
      toast({ title: "Error", description: "Failed to load attendance", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record) => {
    // Check if date is in the future
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
      toast({ title: "Error", description: "Reason is mandatory for attendance edits", variant: "destructive" });
      return;
    }

    try {
      await adminService.updateAttendance(currentRecord.id, editStatus, editReason);
      toast({ title: "Success", description: "Attendance updated successfully" });
      setIsEditModalOpen(false);
      fetchAttendance();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to update", variant: "destructive" });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PRESENT: { variant: 'success', icon: CheckCircle, color: 'text-green-600' },
      ABSENT: { variant: 'destructive', icon: XCircle, color: 'text-red-600' },
      LATE: { variant: 'warning', icon: Clock, color: 'text-orange-500' },
      HALF_DAY: { variant: 'secondary', icon: Clock, color: 'text-yellow-600' }
    };
    const config = statusConfig[status] || statusConfig.ABSENT;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`w-3 h-3 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  const statusOptions = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
          <p className="text-gray-500">View and edit attendance records (with audit trail)</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Filters */}
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
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={fetchAttendance} variant="outline">Refresh</Button>
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
                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
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

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Editing attendance for <strong>{currentRecord?.studentName}</strong> on {currentRecord?.attendanceDate}
            </p>
            <div className="space-y-2">
              <Label>New Status</Label>
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
              <Label>Reason for Change <span className="text-red-500">*</span></Label>
              <Textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="Explain why you are changing this attendance record..."
                rows={3}
              />
              <p className="text-xs text-gray-400">This will be logged in the audit trail.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={!editReason.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceManagement;
