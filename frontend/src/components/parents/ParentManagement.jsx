import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Users, Mail, Phone, Link2 } from 'lucide-react';
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

const ParentManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [currentParent, setCurrentParent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    occupation: '',
    relation: 'FATHER'
  });

  const [selectedStudentId, setSelectedStudentId] = useState('');

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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.createParent(formData);
      toast({ title: "Success", description: "Parent created successfully" });
      setIsAddModalOpen(false);
      fetchData();
      setFormData({
        name: '', email: '', phoneNumber: '', address: '', occupation: '', relation: 'FATHER'
      });
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to create parent", variant: "destructive" });
    }
  };

  const handleMapClick = (parent) => {
    setCurrentParent(parent);
    setSelectedStudentId('');
    setIsMapModalOpen(true);
  };

  const handleMapSubmit = async () => {
    if (!selectedStudentId) {
      toast({ title: "Error", description: "Please select a student", variant: "destructive" });
      return;
    }
    try {
      await adminService.mapStudentToParent(currentParent.id, selectedStudentId);
      toast({ title: "Success", description: "Student mapped to parent" });
      setIsMapModalOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Student may already be mapped or an error occurred", variant: "destructive" });
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
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Parent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New Parent</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone</Label>
                  <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required />
                </div>
              </div>
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
                <Button type="submit">Create Parent</Button>
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
                      <div className="flex items-center"><Phone className="w-3 h-3 mr-1" /> {parent.phoneNumber}</div>
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
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleMapClick(parent)} title="Map Student">
                        <Link2 className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Edit">
                        <Edit2 className="w-4 h-4 text-gray-500" />
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
            <p className="text-sm text-gray-500">Select a student to link to this parent.</p>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.admissionNo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMapModalOpen(false)}>Cancel</Button>
            <Button onClick={handleMapSubmit} disabled={!selectedStudentId}>Link Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentManagement;