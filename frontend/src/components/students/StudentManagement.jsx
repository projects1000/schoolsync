import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Plus, Search, Edit2, Trash2, Users, Mail, Phone,
  BookOpen, Calendar, CheckCircle, ArrowRight, AlertCircle,
  Heart, GraduationCap, Bus
} from 'lucide-react';
import adminService from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import Pagination from '../common/Pagination';
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

const StudentManagement = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [filterClass, setFilterClass] = useState('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [confirmAction, setConfirmAction] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [profileStudentId, setProfileStudentId] = useState(null);
  const [profileStudentName, setProfileStudentName] = useState('');

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

  // Profile Form State
  const [profileFormData, setProfileFormData] = useState({
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    newToEducation: true,
    previousSchool: '',
    medicalConditions: '',
    transportMode: ''
  });

  // Promotion State
  const [promoteData, setPromoteData] = useState({
    classId: '',
    sectionId: ''
  });

  useEffect(() => {
    fetchInitialData();

    // Check for passed filter from navigation state
    if (location.state?.filterClass) {
      setFilterClass(location.state.filterClass);
    }
  }, [page, pageSize]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const params = { page, size: pageSize };
      const [studentsRes, classesData] = await Promise.all([
        adminService.getStudents(params),
        adminService.getClasses()
      ]);
      
      // Handle Page object
      if (studentsRes && studentsRes.content) {
        setStudents(studentsRes.content);
        setTotalPages(studentsRes.totalPages);
        setTotalElements(studentsRes.totalElements);
      } else {
        setStudents(studentsRes || []);
        setTotalPages(1);
        setTotalElements(studentsRes?.length || 0);
      }
      
      setClasses(classesData.content || classesData || []);
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

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const createdStudent = await adminService.createStudent(formData);
      toast({ title: "Success", description: "Student admitted successfully" });
      setIsAddModalOpen(false);
      fetchInitialData();
      setFormData({
        name: '', age: '', classId: '', sectionId: '',
        guardian: '', guardianPhone: '', guardianEmail: '', address: ''
      });

      // Auto-open the Complete Profile popup
      setProfileStudentId(createdStudent.id);
      setProfileStudentName(createdStudent.name);
      setProfileFormData({
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        newToEducation: true,
        previousSchool: '',
        medicalConditions: '',
        transportMode: ''
      });
      setIsProfileModalOpen(true);
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to create student", variant: "destructive" });
    }
  };

  const handleProfileSubmit = async () => {
    try {
      await adminService.updateStudent(profileStudentId, {
        ...profileFormData,
        profileCompleted: true
      });
      toast({ title: "Success", description: "Student profile completed successfully" });
      setIsProfileModalOpen(false);
      setProfileStudentId(null);
      setProfileStudentName('');
      fetchInitialData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save profile", variant: "destructive" });
    }
  };

  const handleProfileSkip = () => {
    setIsProfileModalOpen(false);
    setProfileStudentId(null);
    setProfileStudentName('');
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
  };

  const handleDeleteClick = (student) => {
    setCurrentStudent(student);
    setConfirmAction({ type: 'delete', student });
    setIsConfirmModalOpen(true);
  };

  const confirmActionSubmit = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'delete') {
        await adminService.deleteStudent(confirmAction.student.id);
        toast({ title: "Success", description: "Student deleted and moved to Trash" });
      }
      setIsConfirmModalOpen(false);
      setConfirmAction(null);
      fetchInitialData();
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${confirmAction.type} student`, variant: "destructive" });
    }
  };

  // Open profile popup for existing students with incomplete profile
  const handleCompleteProfileClick = (student) => {
    setProfileStudentId(student.id);
    setProfileStudentName(student.name);
    setProfileFormData({
      dateOfBirth: student.dateOfBirth || '',
      gender: student.gender || '',
      bloodGroup: student.bloodGroup || '',
      newToEducation: student.newToEducation ?? true,
      previousSchool: student.previousSchool || '',
      medicalConditions: student.medicalConditions || '',
      transportMode: student.transportMode || ''
    });
    setIsProfileModalOpen(true);
  };

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
          <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
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
              <TableHead>Roll No</TableHead>
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
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-xs">{student.rollNo}</TableCell>
                  <TableCell className="font-mono text-xs">{student.admissionNo}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.age} years old</div>
                      </div>
                      {!student.profileCompleted && (
                        <button
                          onClick={() => handleCompleteProfileClick(student)}
                          title="Profile incomplete — click to complete"
                          className="ml-1"
                        >
                          <AlertCircle className="w-4 h-4 text-amber-500 hover:text-amber-600 transition-colors" />
                        </button>
                      )}
                    </div>
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
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(student)} title="Delete Student">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )))}
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

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
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
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
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

      {/* Complete Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={(open) => { if (!open) handleProfileSkip(); }}>
        <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              Complete Student Profile
            </DialogTitle>
            <DialogDescription>
              Fill in additional details for <strong>{profileStudentName}</strong>. You can skip this and complete it later.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dob" className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                Date of Birth
              </Label>
              <Input
                id="dob"
                name="dateOfBirth"
                type="date"
                value={profileFormData.dateOfBirth}
                onChange={handleProfileInputChange}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                Gender
              </Label>
              <Select
                value={profileFormData.gender}
                onValueChange={(val) => setProfileFormData(p => ({ ...p, gender: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Blood Group */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                Blood Group
              </Label>
              <Select
                value={profileFormData.bloodGroup}
                onValueChange={(val) => setProfileFormData(p => ({ ...p, bloodGroup: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transport Mode */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5 text-gray-500" />
                Transport Mode
              </Label>
              <Select
                value={profileFormData.transportMode}
                onValueChange={(val) => setProfileFormData(p => ({ ...p, transportMode: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Transport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="School Bus">School Bus</SelectItem>
                  <SelectItem value="Private Vehicle">Private Vehicle</SelectItem>
                  <SelectItem value="Walk">Walk</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <hr className="col-span-2" />

            {/* New to Education */}
            <div className="col-span-2 space-y-3">
              <Label className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-gray-500" />
                Education History
              </Label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="educationHistory"
                    checked={profileFormData.newToEducation === true}
                    onChange={() => setProfileFormData(p => ({ ...p, newToEducation: true, previousSchool: '' }))}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-sm">New to education</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="educationHistory"
                    checked={profileFormData.newToEducation === false}
                    onChange={() => setProfileFormData(p => ({ ...p, newToEducation: false }))}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-sm">Previously admitted in another school</span>
                </label>
              </div>

              {/* Previous School - shown only when not new to education */}
              {profileFormData.newToEducation === false && (
                <div className="space-y-2 mt-2">
                  <Label htmlFor="previousSchool">Previous School Name</Label>
                  <Input
                    id="previousSchool"
                    name="previousSchool"
                    placeholder="Enter the name of the last school"
                    value={profileFormData.previousSchool}
                    onChange={handleProfileInputChange}
                  />
                </div>
              )}
            </div>

            {/* Medical Conditions */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="medical" className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
                Medical Conditions / Allergies
              </Label>
              <textarea
                id="medical"
                name="medicalConditions"
                placeholder="Any known allergies, conditions, or medications (optional)"
                value={profileFormData.medicalConditions}
                onChange={handleProfileInputChange}
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleProfileSkip}>
              Skip for now
            </Button>
            <Button onClick={handleProfileSubmit} className="bg-purple-600 hover:bg-purple-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Action Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === 'delete' ? 'Delete Student?' : 'Confirm'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {confirmAction?.type === 'delete' && (
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{confirmAction?.student?.name}</strong>?
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
              {confirmAction?.type === 'delete' ? 'Delete Student' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;