import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Mail, BookOpen, CheckCircle,
  ShieldOff, ShieldCheck
} from 'lucide-react';

import adminService from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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


const TeacherManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    qualification: '',
    experience: '',
    employmentType: 'FULL_TIME',
    joiningDate: new Date().toISOString().split('T')[0],
    address: '',
    password: ''
  });

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getTeachers();
      setTeachers(data);
    } catch (error) {
      console.error("Failed to fetch teachers", error);
      toast({ title: "Error", description: "Failed to load teachers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await adminService.getClasses();
      setClasses(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.createTeacher(formData);
      toast({ title: "Success", description: "Teacher created successfully" });
      setIsAddModalOpen(false);
      fetchTeachers();
      setFormData({
        name: '', email: '', phone: '', department: '', qualification: '',
        experience: '', employmentType: 'FULL_TIME',
        joiningDate: new Date().toISOString().split('T')[0], address: '', password: ''
      });
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to create teacher", variant: "destructive" });
    }
  };

  const handleEditClick = (teacher) => {
    setCurrentTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      department: teacher.department,
      qualification: teacher.qualification,
      experience: teacher.experience,
      employmentType: teacher.employmentType,
      joiningDate: teacher.joiningDate,
      address: teacher.address
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateTeacher(currentTeacher.id, formData);
      toast({ title: "Success", description: "Teacher updated successfully" });
      setIsEditModalOpen(false);
      fetchTeachers();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update teacher", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this teacher?")) return;
    try {
      await adminService.deleteTeacher(id);
      toast({ title: "Success", description: "Teacher deactivated" });
      fetchTeachers();
    } catch (error) {
      toast({ title: "Error", description: "Failed to deactivate teacher", variant: "destructive" });
    }
  };

  const handleAssignClick = (teacher) => {
    setCurrentTeacher(teacher);
    setSelectedClasses(teacher.assignedClasses || []);
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async () => {
    try {
      await adminService.updateTeacherClassAssignments(currentTeacher.id, selectedClasses);
      toast({ title: "Success", description: "Classes assigned successfully" });
      setIsAssignModalOpen(false);
      fetchTeachers();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to assign classes", variant: "destructive" });
    }
  };

  const toggleClassSelection = (classId) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  // Block/Unblock Teacher
  const handleStatusChange = async (teacher, newStatus) => {
    setCurrentTeacher(teacher);
    setConfirmAction({ type: newStatus === 'BLOCKED' ? 'block' : 'unblock', teacher, status: newStatus });
    setIsConfirmModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!confirmAction) return;
    try {
      await adminService.updateTeacherStatus(confirmAction.teacher.id, confirmAction.status);
      toast({
        title: "Success",
        description: confirmAction.status === 'BLOCKED'
          ? `${confirmAction.teacher.name} has been blocked`
          : `${confirmAction.teacher.name} has been unblocked`
      });
      setIsConfirmModalOpen(false);
      setConfirmAction(null);
      fetchTeachers();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update teacher status",
        variant: "destructive"
      });
    }
  };

  // Filter teachers
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'BLOCKED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Blocked</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Teacher Management</h1>
          <p className="text-gray-500">Manage teaching staff, classes, and access</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password (optional)</Label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Auto-generated if empty" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={formData.department} onChange={handleInputChange} placeholder="e.g. Science" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input id="qualification" name="qualification" value={formData.qualification} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input id="experience" name="experience" value={formData.experience} onChange={handleInputChange} placeholder="e.g. 5 years" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joiningDate">Joining Date</Label>
                <Input id="joiningDate" name="joiningDate" type="date" value={formData.joiningDate} onChange={handleInputChange} />
              </div>
              <div className="col-span-2 pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit">Create Teacher</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="BLOCKED">Blocked</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto text-sm text-gray-500">
            {filteredTeachers.length} teacher(s)
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Assigned Classes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Loading teachers...
                </TableCell>
              </TableRow>
            ) : filteredTeachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No teachers found
                </TableCell>
              </TableRow>
            ) : (
              filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id} className={teacher.status === 'BLOCKED' ? 'bg-red-50/50' : ''}>
                  <TableCell>
                    <div className="font-medium">{teacher.name}</div>
                    <div className="text-xs text-gray-500">{teacher.department || 'No department'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-3 h-3 mr-1" /> {teacher.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {teacher.assignedClasses?.length > 0 ? (
                        teacher.assignedClasses.slice(0, 3).map((clsId, idx) => {
                          const cls = classes.find(c => c.id === clsId);
                          return <Badge key={idx} variant="outline" className="text-xs">{cls ? cls.name : clsId}</Badge>
                        })
                      ) : (
                        <span className="text-xs text-gray-400">No classes assigned</span>
                      )}
                      {teacher.assignedClasses?.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{teacher.assignedClasses.length - 3} more</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(teacher.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleAssignClick(teacher)} title="Assign Classes">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(teacher)} title="Edit">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </Button>
                      {teacher.status === 'ACTIVE' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(teacher, 'BLOCKED')}
                          title="Block Teacher"
                        >
                          <ShieldOff className="w-4 h-4 text-red-500" />
                        </Button>
                      ) : teacher.status === 'BLOCKED' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(teacher, 'ACTIVE')}
                          title="Unblock Teacher"
                        >
                          <ShieldCheck className="w-4 h-4 text-green-500" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
          </DialogHeader>
          {currentTeacher && (
            <form onSubmit={handleEditSubmit} className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dept">Department</Label>
                <Input id="edit-dept" name="department" value={formData.department} onChange={handleInputChange} />
              </div>
              <div className="col-span-2 pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Classes Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Classes to {currentTeacher?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            {classes.length === 0 ? (
              <div className="text-center text-gray-500">No classes available.</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {classes.map(cls => (
                  <div
                    key={cls.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedClasses.includes(cls.id)
                      ? 'bg-purple-50 border-purple-500 text-purple-700'
                      : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    onClick={() => toggleClassSelection(cls.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{cls.name}</span>
                      {selectedClasses.includes(cls.id) && <CheckCircle className="w-4 h-4" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignSubmit}>Save Assignments</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Block/Unblock Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === 'block' ? 'Block Teacher?' : 'Unblock Teacher?'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {confirmAction?.type === 'block' ? (
              <p className="text-gray-600">
                Are you sure you want to block <strong>{confirmAction?.teacher?.name}</strong>?
                They will no longer be able to login to the system.
              </p>
            ) : (
              <p className="text-gray-600">
                Are you sure you want to unblock <strong>{confirmAction?.teacher?.name}</strong>?
                They will regain access to the system.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
            <Button
              onClick={confirmStatusChange}
              className={confirmAction?.type === 'block' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {confirmAction?.type === 'block' ? 'Block Teacher' : 'Unblock Teacher'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherManagement;