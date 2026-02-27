import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Users, Mail, Phone, Link2, Copy, Check, Lock, Ban, CheckCircle, Eye, Trash2 } from 'lucide-react';
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
  DialogDescription,
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

const ParentManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [currentParent, setCurrentParent] = useState(null);
  const [editingParentId, setEditingParentId] = useState(null);
  const [viewingParent, setViewingParent] = useState(null);
  const [viewingChildren, setViewingChildren] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Credentials State
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    occupation: '',
    relation: 'FATHER'
  });

  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [mappedStudentIds, setMappedStudentIds] = useState([]);
  const [isMapLoading, setIsMapLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [parentsData, studentsData] = await Promise.all([
        adminService.getParents(),
        adminService.getStudents()
      ]);
      setParents(parentsData);
      setStudents(studentsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingParentId) {
        await adminService.updateParent(editingParentId, formData);
        toast({ title: "Success", description: "Parent updated successfully" });
        setIsAddModalOpen(false);
        fetchData();
      } else {
        const response = await adminService.createParent(formData);
        // Response contains: { parent, password, userId }
        setCreatedCredentials({
          email: response.parent.email,
          password: response.password
        });
        setIsAddModalOpen(false);
        setIsSuccessModalOpen(true);
        fetchData();
      }
      resetForm();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.error || "Operation failed", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', phone: '', password: '', address: '', occupation: '', relation: 'FATHER'
    });
    setEditingParentId(null);
  };

  const handleAddClick = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleEditClick = (parent) => {
    setEditingParentId(parent.id);
    setFormData({
      name: parent.name,
      email: parent.email,
      phone: parent.phone || parent.phoneNumber || '',
      password: '',
      address: parent.address || '',
      occupation: parent.occupation || '',
      relation: parent.relation || 'FATHER'
    });
    setIsAddModalOpen(true);
  };

  const handleStatusChange = async (parent, newStatus) => {
    try {
      await adminService.updateParentStatus(parent.id, newStatus);
      toast({ title: "Success", description: `Parent ${newStatus.toLowerCase()}` });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const handleResetPassword = async (parent) => {
    if (!window.confirm(`Reset password for ${parent.name}?`)) return;
    try {
      const result = await adminService.resetParentPassword(parent.id);
      setCreatedCredentials({ email: parent.email, password: result.password });
      setIsSuccessModalOpen(true);
    } catch (error) {
      toast({ title: "Error", description: "Failed to reset password", variant: "destructive" });
    }
  };

  const handleDeleteClick = (parent) => {
    setCurrentParent(parent);
    setConfirmAction({ type: 'delete', parent });
    setIsConfirmModalOpen(true);
  };

  const confirmActionSubmit = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'delete') {
        await adminService.deleteParent(confirmAction.parent.id);
        toast({ title: "Success", description: "Parent deleted and moved to Trash" });
      }
      setIsConfirmModalOpen(false);
      setConfirmAction(null);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${confirmAction.type} parent`, variant: "destructive" });
    }
  };

  const handleViewChildren = async (parent) => {
    setViewingParent(parent);
    setViewingChildren([]);
    setIsViewModalOpen(true);
    try {
      const children = await adminService.getParentChildren(parent.id);
      setViewingChildren(children);
    } catch (error) {
      console.error("Failed to fetch children");
    }
  };

  const copyToClipboard = () => {
    if (createdCredentials) {
      const text = `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied", description: "Credentials copied to clipboard" });
    }
  };

  const handleMapClick = async (parent) => {
    setCurrentParent(parent);
    setSelectedStudentIds([]);
    setMappedStudentIds([]);
    setIsMapModalOpen(true);
    setIsMapLoading(true);
    try {
      const children = await adminService.getParentChildren(parent.id);
      setMappedStudentIds(children.map(s => s.id));
    } catch (error) {
      console.error("Failed to load parent children", error);
    } finally {
      setIsMapLoading(false);
    }
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleMapSubmit = async () => {
    if (selectedStudentIds.length === 0) {
      toast({ title: "Error", description: "Please select at least one student", variant: "destructive" });
      return;
    }
    try {
      await adminService.mapStudentsToParent(currentParent.id, selectedStudentIds);
      toast({ title: "Success", description: "Students mapped to parent" });
      setIsMapModalOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to map students", variant: "destructive" });
    }
  };

  const filteredParents = parents.filter(parent =>
    parent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const relationOptions = ['FATHER', 'MOTHER', 'GUARDIAN', 'GRANDFATHER', 'GRANDMOTHER', 'UNCLE', 'AUNT', 'OTHER'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Parent Management</h1>
          <p className="text-gray-500">Manage parents and link them to students</p>
        </div>
        <Button onClick={handleAddClick} className="bg-pink-600 hover:bg-pink-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Parent
        </Button>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingParentId ? 'Edit Parent' : 'New Parent'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required disabled={!!editingParentId} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                </div>
              </div>
              {!editingParentId && (
                <div className="space-y-2">
                  <Label htmlFor="password">Temporary Password</Label>
                  <Input id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Leave blank to auto-generate" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="relation">Relation</Label>
                <Select value={formData.relation} onValueChange={(val) => setFormData(p => ({ ...p, relation: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Relation" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
              </div>
              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit">{editingParentId ? 'Update Parent' : 'Create Parent'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parent</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Relation</TableHead>
              <TableHead>Children</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : filteredParents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No parents found
                </TableCell>
              </TableRow>
            ) : (
              filteredParents.map((parent) => (
                <TableRow key={parent.id}>
                  <TableCell>
                    <div className="font-medium">{parent.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-gray-500 space-y-1">
                      <div className="flex items-center"><Mail className="w-3 h-3 mr-1" /> {parent.email}</div>
                      <div className="flex items-center"><Phone className="w-3 h-3 mr-1" /> {parent.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{parent.relation}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{parent.childrenCount || 0} children</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={parent.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {parent.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewChildren(parent)} title="View Students">
                        <Eye className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleMapClick(parent)} title="Map Student">
                        <Link2 className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(parent)} title="Edit">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleResetPassword(parent)} title="Reset Password">
                        <Lock className="w-4 h-4 text-orange-500" />
                      </Button>
                      {parent.status === 'ACTIVE' ? (
                        <Button variant="ghost" size="icon" onClick={() => handleStatusChange(parent, 'BLOCKED')} title="Block">
                          <Ban className="w-4 h-4 text-red-500" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleStatusChange(parent, 'ACTIVE')} title="Unblock">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(parent)} title="Delete Parent">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Map Student Modal */}
      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Map Student to {currentParent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">Select students to link to this parent</p>
            <div className="border rounded-md max-h-60 overflow-y-auto p-2 space-y-2">
              {isMapLoading ? (
                <p className="text-sm p-2 text-center text-gray-500">Loading mapped students...</p>
              ) : (
                students.map(student => {
                  const isMapped = mappedStudentIds.includes(student.id);
                  return (
                    <div key={student.id} className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-50 ${isMapped ? 'opacity-50' : ''}`}>
                      <input
                        type="checkbox"
                        id={`student-${student.id}`}
                        checked={selectedStudentIds.includes(student.id) || isMapped}
                        onChange={() => !isMapped && handleStudentToggle(student.id)}
                        disabled={isMapped}
                        className="h-4 w-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500 disabled:cursor-not-allowed"
                      />
                      <label htmlFor={`student-${student.id}`} className={`flex-1 text-sm cursor-pointer select-none ${isMapped ? 'cursor-not-allowed' : ''}`}>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.admissionNo} - {student.className}</div>
                      </label>
                      {isMapped && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Linked</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMapModalOpen(false)}>Cancel</Button>
            <Button onClick={handleMapSubmit} disabled={selectedStudentIds.length === 0}>Link Students</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Credentials Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-green-600">Parent Account Created</DialogTitle>
            <DialogDescription>
              Please share these credentials with the parent. They will need them to log in.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-50 p-4 rounded-md space-y-3 mt-2 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <span className="font-mono text-sm">{createdCredentials?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Password:</span>
              <span className="font-mono text-sm font-bold">{createdCredentials?.password}</span>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={copyToClipboard} className="flex items-center">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied" : "Copy Credentials"}
            </Button>
            <Button onClick={() => setIsSuccessModalOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Children Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Students Linked to {viewingParent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {viewingChildren.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">No students linked.</p>
            ) : (
              <div className="space-y-2">
                {viewingChildren.map(child => (
                  <div key={child.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                    <div>
                      <div className="font-medium text-sm">{child.name}</div>
                      <div className="text-xs text-gray-500">{child.admissionNo} - {child.className}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Action Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === 'delete' ? 'Delete Parent?' : 'Confirm'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {confirmAction?.type === 'delete' && (
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{confirmAction?.parent?.name}</strong>?
                They will be moved to the Trash.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
            <Button
              onClick={confirmActionSubmit}
              className={confirmAction?.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary'}
            >
              {confirmAction?.type === 'delete' ? 'Delete Parent' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentManagement;