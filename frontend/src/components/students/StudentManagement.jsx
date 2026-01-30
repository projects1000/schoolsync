import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, Users, Mail, Phone,
  BookOpen, Calendar, CheckCircle, ArrowRight
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

const StudentManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filters
  const [filterClass, setFilterClass] = useState('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);

  const [currentStudent, setCurrentStudent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    classId: '',
    sectionId: '',
    guardian: '',
    guardianPhone: '',
    guardianEmail: '',
    address: ''
  });

  // Promotion State
  const [promoteData, setPromoteData] = useState({
    classId: '',
    sectionId: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [studentsData, classesData] = await Promise.all([
        adminService.getStudents(),
        adminService.getClasses()
      ]);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async (classId) => {
    if (!classId) return;
    try {
      const data = await adminService.getSections(classId);
      setSections(data);
    } catch (error) {
      console.error("Failed to fetch sections", error);
    }
  };

  // When class changes in form, fetch sections
  useEffect(() => {
    if (formData.classId) {
      fetchSections(formData.classId);
    }
  }, [formData.classId]);

  // When promote class changes, fetch sections
  useEffect(() => {
    if (promoteData.classId) {
      fetchSections(promoteData.classId);
    }
  }, [promoteData.classId]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.createStudent(formData);
      toast({ title: "Success", description: "Student admitted successfully" });
      setIsAddModalOpen(false);
      fetchInitialData();
      setFormData({
        name: '', age: '', classId: '', sectionId: '',
        guardian: '', guardianPhone: '', guardianEmail: '', address: ''
      });
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to create student", variant: "destructive" });
    }
  };

  const handleEditClick = (student) => {
    setCurrentStudent(student);
    setFormData({
      name: student.name,
      age: student.age,
      classId: student.classId,
      sectionId: student.sectionId,
      guardian: student.guardian,
      guardianPhone: student.guardianPhone,
      guardianEmail: student.guardianEmail,
      address: student.address
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateStudent(currentStudent.id, formData);
      toast({ title: "Success", description: "Student updated successfully" });
      setIsEditModalOpen(false);
      fetchInitialData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update student", variant: "destructive" });
    }
  };

  const handlePromoteClick = (student) => {
    setCurrentStudent(student);
    setPromoteData({ classId: '', sectionId: '' });
    setIsPromoteModalOpen(true);
  }

  const handlePromoteSubmit = async () => {
    try {
      await adminService.promoteStudent(currentStudent.id, promoteData);
      toast({ title: "Success", description: "Student promoted successfully" });
      setIsPromoteModalOpen(false);
      fetchInitialData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to promote student", variant: "destructive" });
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || student.classId === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
          <p className="text-gray-500">Admissions, promotions, and records</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Admit Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Admission</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" value={formData.age} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classId">Class</Label>
                <Select value={formData.classId} onValueChange={(val) => setFormData(p => ({ ...p, classId: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sectionId">Section</Label>
                <Select value={formData.sectionId} onValueChange={(val) => setFormData(p => ({ ...p, sectionId: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <hr className="col-span-2 my-2" />

              <div className="space-y-2">
                <Label htmlFor="guardian">Guardian Name</Label>
                <Input id="guardian" name="guardian" value={formData.guardian} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
              </div>

              <div className="col-span-2 pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit">Admit Student</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Search & Filter */}
        <div className="p-4 border-b border-gray-200 flex space-x-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admission No</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Guardian</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-xs">{student.admissionNo}</TableCell>
                  <TableCell>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.age} years old</div>
                  </TableCell>
                  <TableCell>
                    {student.className || 'Unassigned'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-gray-500 space-y-1">
                      <div>{student.guardian}</div>
                      <div className="flex items-center text-xs"><Phone className="w-3 h-3 mr-1" /> {student.guardianPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handlePromoteClick(student)} title="Promote">
                        <ArrowRight className="w-4 h-4 text-orange-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(student)} title="Edit">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {currentStudent && (
            <form onSubmit={handleEditSubmit} className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Full Name</Label>
                <Input name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={formData.classId} onValueChange={(val) => setFormData(p => ({ ...p, classId: val }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select value={formData.sectionId} onValueChange={(val) => setFormData(p => ({ ...p, sectionId: val }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {sections.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Promote Modal */}
      <Dialog open={isPromoteModalOpen} onOpenChange={setIsPromoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">Promoting <strong>{currentStudent?.name}</strong> to:</p>
            <div className="space-y-2">
              <Label>New Class</Label>
              <Select value={promoteData.classId} onValueChange={(val) => setPromoteData(p => ({ ...p, classId: val }))}>
                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>New Section</Label>
              <Select value={promoteData.sectionId} onValueChange={(val) => setPromoteData(p => ({ ...p, sectionId: val }))}>
                <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                <SelectContent>
                  {sections.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPromoteModalOpen(false)}>Cancel</Button>
            <Button onClick={handlePromoteSubmit} disabled={!promoteData.classId}>Confirm Promotion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;