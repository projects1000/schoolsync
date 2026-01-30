import React, { useState, useEffect } from 'react';
import { Plus, Search, Megaphone, Trash2, Users, School, BookOpen, Clock, Send } from 'lucide-react';
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
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

const AnnouncementManagement = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAudience, setFilterAudience] = useState('all');

    // Create Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        audience: 'SCHOOL',
        targetId: '',
        targetName: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [announcementsData, classesData, sectionsData] = await Promise.all([
                adminService.getAnnouncements(),
                adminService.getClasses(),
                adminService.getSections()
            ]);
            setAnnouncements(announcementsData);
            setClasses(classesData);
            setSections(sectionsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast({ title: "Error", description: "Failed to load announcements", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.message.trim()) {
            toast({ title: "Error", description: "Title and message are required", variant: "destructive" });
            return;
        }
        try {
            await adminService.createAnnouncement(formData);
            toast({ title: "Success", description: "Announcement published successfully!" });
            setIsCreateModalOpen(false);
            fetchData();
            setFormData({ title: '', message: '', audience: 'SCHOOL', targetId: '', targetName: '' });
        } catch (error) {
            toast({ title: "Error", description: "Failed to create announcement", variant: "destructive" });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await adminService.deleteAnnouncement(id);
            toast({ title: "Success", description: "Announcement deleted" });
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete announcement", variant: "destructive" });
        }
    };

    const handleAudienceChange = (value) => {
        setFormData(prev => ({
            ...prev,
            audience: value,
            targetId: '',
            targetName: value === 'SCHOOL' ? 'All School' : ''
        }));
    };

    const handleTargetChange = (value, items) => {
        const item = items.find(i => i.id === value);
        setFormData(prev => ({
            ...prev,
            targetId: value,
            targetName: item ? item.name : ''
        }));
    };

    const getAudienceBadge = (audience) => {
        const config = {
            SCHOOL: { icon: School, className: 'bg-purple-100 text-purple-800' },
            CLASS: { icon: BookOpen, className: 'bg-blue-100 text-blue-800' },
            SECTION: { icon: Users, className: 'bg-green-100 text-green-800' }
        };
        const c = config[audience] || config.SCHOOL;
        const Icon = c.icon;
        return (
            <Badge className={c.className}>
                <Icon className="w-3 h-3 mr-1" />
                {audience}
            </Badge>
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const filteredAnnouncements = announcements.filter(a => {
        const matchesSearch = a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.message?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAudience = filterAudience === 'all' || a.audience === filterAudience;
        return matchesSearch && matchesAudience;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
                    <p className="text-gray-500">Publish notices to parents, classes, or the entire school</p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="w-4 h-4 mr-2" />
                            New Announcement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center">
                                <Megaphone className="w-5 h-5 mr-2 text-purple-600" />
                                Create Announcement
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                    placeholder="Announcement title..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                                    placeholder="Write your announcement message..."
                                    rows={5}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Audience</Label>
                                <Select value={formData.audience} onValueChange={handleAudienceChange}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SCHOOL">
                                            <div className="flex items-center"><School className="w-4 h-4 mr-2" /> Entire School</div>
                                        </SelectItem>
                                        <SelectItem value="CLASS">
                                            <div className="flex items-center"><BookOpen className="w-4 h-4 mr-2" /> Specific Class</div>
                                        </SelectItem>
                                        <SelectItem value="SECTION">
                                            <div className="flex items-center"><Users className="w-4 h-4 mr-2" /> Specific Section</div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.audience === 'CLASS' && (
                                <div className="space-y-2">
                                    <Label>Select Class</Label>
                                    <Select value={formData.targetId} onValueChange={(val) => handleTargetChange(val, classes)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose class..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {formData.audience === 'SECTION' && (
                                <div className="space-y-2">
                                    <Label>Select Section</Label>
                                    <Select value={formData.targetId} onValueChange={(val) => handleTargetChange(val, sections)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose section..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                                    <Send className="w-4 h-4 mr-2" />
                                    Publish
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search announcements..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={filterAudience} onValueChange={setFilterAudience}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Audience" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="SCHOOL">School</SelectItem>
                        <SelectItem value="CLASS">Class</SelectItem>
                        <SelectItem value="SECTION">Section</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : filteredAnnouncements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No announcements yet. Create one to get started!</div>
                ) : (
                    filteredAnnouncements.map((announcement) => (
                        <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Megaphone className="w-5 h-5 text-purple-600" />
                                            {announcement.title}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-3 mt-2">
                                            {getAudienceBadge(announcement.audience)}
                                            {announcement.targetName && (
                                                <span className="text-sm text-gray-500">{announcement.targetName}</span>
                                            )}
                                            <span className="flex items-center text-xs text-gray-400">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {formatDate(announcement.createdAt)}
                                            </span>
                                        </CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(announcement.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 whitespace-pre-wrap">{announcement.message}</p>
                                <p className="text-xs text-gray-400 mt-3">Posted by: {announcement.createdBy}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default AnnouncementManagement;
