import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Heart,
  GraduationCap,
  Bus,
} from "lucide-react";
import adminService from "@/services/adminService";
import { useToast } from "@/components/ui/use-toast";
import Pagination from "../common/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [filterClass, setFilterClass] = useState("all");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [confirmAction, setConfirmAction] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    classId: "",
  });

  // Promotion State
  const [promoteData, setPromoteData] = useState({
    classId: "",
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
        adminService.getClasses(),
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
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsCreating(true);
      await adminService.createStudent(formData);
      toast({ title: "Success", description: "Student admitted successfully" });
      setIsAddModalOpen(false);
      fetchInitialData();
      setFormData({
        name: "",
        classId: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create student",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (student) => {
    setCurrentStudent(student);
    setFormData({
      name: student.name,
      classId: student.classId,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...currentStudent,
        ...formData
      };
      await adminService.updateStudent(currentStudent.id, payload);
      toast({ title: "Success", description: "Student updated successfully" });
      setIsEditModalOpen(false);
      fetchInitialData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive",
      });
    }
  };

  const handlePromoteClick = (student) => {
    setCurrentStudent(student);
    setPromoteData({ classId: "" });
    setIsPromoteModalOpen(true);
  };

  const handlePromoteSubmit = async () => {
    try {
      await adminService.promoteStudent(currentStudent.id, promoteData);
      toast({ title: "Success", description: "Student promoted successfully" });
      setIsPromoteModalOpen(false);
      fetchInitialData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to promote student",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (student) => {
    setCurrentStudent(student);
    setConfirmAction({ type: "delete", student });
    setIsConfirmModalOpen(true);
  };

  const confirmActionSubmit = async () => {
    if (!confirmAction) return;

    try {
      setDeleting(true);

      if (confirmAction.type === "delete") {
        await adminService.deleteStudent(confirmAction.student.id);

        toast({
          title: "Success",
          description: "Student moved to Trash",
        });
      }

      setIsConfirmModalOpen(false);
      setConfirmAction(null);
      fetchInitialData();
    } catch (error) {
      console.error(error);

      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to delete student",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };



const filteredStudents = students.filter((student) => {
  const name = student.name?.toLowerCase() || "";
  const admissionNo = student.admissionNo?.toLowerCase() || "";
  const search = searchTerm?.toLowerCase() || "";

  const matchesSearch =
    name.includes(search) || admissionNo.includes(search);

  const matchesClass =
    filterClass === "all" || student.classId === filterClass;

  return matchesSearch && matchesClass;
});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Student Management
          </h1>
          <p className="text-gray-500">Admissions, promotions, and records</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Admit Student
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-2xl"
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>New Admission</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleCreateSubmit}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classId">Class</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(val) =>
                    setFormData((p) => ({ ...p, classId: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>



              <div className="col-span-2 pt-4 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block" />
                      Admitting...
                    </>
                  ) : (
                    "Admit Student"
                  )}
                </Button>
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
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
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
                <TableCell
                  colSpan={7}
                  className="text-center text-gray-500 py-8"
                >
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-xs">
                    {student.rollNo}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {student.admissionNo}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-gray-500">
                          {student.age ? `${student.age} years old` : "Age pending"}
                        </div>
                      </div>

                    </div>
                  </TableCell>
                  <TableCell>{student.className || "Unassigned"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-gray-500 space-y-1">
                      <div>{student.guardian}</div>
                      <div className="flex items-center text-xs">
                        <Phone className="w-3 h-3 mr-1" />{" "}
                        {student.guardianPhone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        student.status === "ACTIVE" ? "success" : "secondary"
                      }
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePromoteClick(student)}
                        title="Promote"
                      >
                        <ArrowRight className="w-4 h-4 text-orange-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(student)}
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(student)}
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
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

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent
          className="max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {currentStudent && (
            <form
              onSubmit={handleEditSubmit}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-2 col-span-2">
                <Label>Full Name</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(val) =>
                    setFormData((p) => ({ ...p, classId: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 pt-4 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Promote Modal */}
      <Dialog open={isPromoteModalOpen} onOpenChange={setIsPromoteModalOpen}>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Promote Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Promoting <strong>{currentStudent?.name}</strong> to:
            </p>
            <div className="space-y-2">
              <Label>New Class</Label>
              <Select
                value={promoteData.classId}
                onValueChange={(val) =>
                  setPromoteData((p) => ({ ...p, classId: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPromoteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePromoteSubmit}
              disabled={!promoteData.classId}
            >
              Confirm Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Confirm Action Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "delete" ? "Delete Student?" : "Confirm"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {confirmAction?.type === "delete" && (
              <p className="text-gray-600">
                Are you sure you want to delete{" "}
                <strong>{confirmAction?.student?.name}</strong>? They will be
                moved to the Trash.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmActionSubmit}
              disabled={deleting}
              className={
                confirmAction?.type === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-primary"
              }
            >
              {deleting ? (
                <>
                  <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block" />
                  Deleting...
                </>
              ) : (
                "Delete Student"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;
