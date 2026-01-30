
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, Calendar, BookOpen, MessageSquare, Send, X, Plus, Edit, Trash2, Folder, BarChart, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import AttendanceManagement from '@/components/attendance/AttendanceManagement';
import Communications from '@/components/communications/Communications';
import TimetableManagement from '@/components/timetable/TimetableManagement';

const TeacherDashboard = ({ teacher, students, attendance, academics, setActiveTab }) => {
  const myStudents = students.filter(s => teacher.classes.includes(s.class));
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance[today] || {};
  
  let presentCount = 0;
  teacher.classes.forEach(cls => {
    if (todayAttendance[cls]) {
      presentCount += todayAttendance[cls].filter(s => s.status === 'present' || s.status === 'late').length;
    }
  });

  const attendancePercentage = myStudents.length > 0 ? Math.round((presentCount / myStudents.length) * 100) : 0;
  const recentAcademics = academics.filter(a => myStudents.some(s => s.id === a.studentId)).slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('my-students')}><div className="flex items-center space-x-3"><Users className="w-8 h-8 text-blue-600" /><div><p className="text-sm text-blue-600">Total Students</p><p className="text-2xl font-bold text-blue-800">{myStudents.length}</p></div></div></div>
          <div className="bg-green-50 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('attendance')}><div className="flex items-center space-x-3"><Calendar className="w-8 h-8 text-green-600" /><div><p className="text-sm text-green-600">Today's Attendance</p><p className="text-2xl font-bold text-green-800">{attendancePercentage}%</p></div></div></div>
          <div className="bg-purple-50 rounded-lg p-4"><div className="flex items-center space-x-3"><BookOpen className="w-8 h-8 text-purple-600" /><div><p className="text-sm text-purple-600">Classes Assigned</p><p className="text-2xl font-bold text-purple-800">{teacher.classes.length}</p></div></div></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">My Classes</h3>
          <div className="flex flex-wrap gap-2">
            {teacher.classes.map(cls => <span key={cls} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">{cls}</span>)}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Academic Updates</h3>
        <div className="space-y-3">
          {recentAcademics.map(item => (
            <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-sm text-gray-700">{students.find(s=>s.id === item.studentId)?.name}</p>
              <p className="text-xs text-gray-500">{item.type === 'result' ? `Result: ${item.subject}` : 'Suggestion'}</p>
            </div>
          ))}
          {recentAcademics.length === 0 && <p className="text-sm text-gray-500">No recent updates.</p>}
        </div>
      </div>
    </div>
  );
};

const MyStudents = ({ teacher, students }) => {
  const myStudents = students.filter(s => teacher.classes.includes(s.class));
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {myStudents.map(student => (
        <motion.div key={student.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <img className="w-12 h-12 rounded-full object-cover" alt={student.name} src="https://images.unsplash.com/photo-1694664516919-4a291a5007c3" />
            <div>
              <h4 className="font-semibold text-gray-800">{student.name}</h4>
              <p className="text-sm text-gray-500">{student.class}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const AcademicsManagement = ({ teacher, students, academics, setAcademics }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ type: 'result', studentId: '', subject: '', marks: '', grade: '', suggestion: '' });
  const { toast } = useToast();
  const myStudents = students.filter(s => teacher.classes.includes(s.class));

  const handleSave = () => {
    if ((formData.type === 'result' && (!formData.studentId || !formData.subject)) || (formData.type === 'suggestion' && (!formData.studentId || !formData.suggestion))) {
      toast({ title: "Incomplete form", variant: "destructive" });
      return;
    }
    if (editingItem) {
      setAcademics(prev => prev.map(item => item.id === editingItem.id ? { ...formData, id: editingItem.id, teacherId: teacher.id } : item));
      toast({ title: "Updated successfully" });
    } else {
      setAcademics(prev => [{ ...formData, id: Date.now(), teacherId: teacher.id }, ...prev]);
      toast({ title: "Added successfully" });
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setAcademics(prev => prev.filter(item => item.id !== id));
    toast({ title: "Deleted successfully" });
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
              <div className="p-6 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">{editingItem ? 'Edit' : 'Add'} Academic Record</h2><Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)}><X className="w-5 h-5" /></Button></div>
              <div className="p-6 space-y-4">
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full p-2 border rounded-lg">
                  <option value="result">Exam Result</option>
                  <option value="suggestion">Suggestion</option>
                </select>
                <select value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: parseInt(e.target.value) })} className="w-full p-2 border rounded-lg">
                  <option value="">Select Student</option>
                  {myStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class})</option>)}
                </select>
                {formData.type === 'result' ? (
                  <>
                    <input value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} placeholder="Subject" className="w-full p-2 border rounded-lg" />
                    <div className="grid grid-cols-2 gap-4">
                      <input value={formData.marks} onChange={e => setFormData({ ...formData, marks: e.target.value })} placeholder="Marks" className="w-full p-2 border rounded-lg" />
                      <input value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} placeholder="Grade" className="w-full p-2 border rounded-lg" />
                    </div>
                  </>
                ) : (
                  <textarea value={formData.suggestion} onChange={e => setFormData({ ...formData, suggestion: e.target.value })} placeholder="Suggestion for parent..." rows={4} className="w-full p-2 border rounded-lg" />
                )}
                <div className="flex justify-end"><Button onClick={handleSave}>Save</Button></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Academic Records</h3>
        <Button onClick={() => { setEditingItem(null); setFormData({ type: 'result', studentId: '', subject: '', marks: '', grade: '', suggestion: '' }); setIsFormOpen(true); }}><Plus className="w-4 h-4 mr-2" />Add New</Button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {academics.filter(a => myStudents.some(s => s.id === a.studentId)).map(item => (
            <div key={item.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
              <div>
                <p className="font-medium">{students.find(s => s.id === item.studentId)?.name}</p>
                {item.type === 'result' ? (
                  <p className="text-sm text-gray-600">Result: {item.subject} - Marks: {item.marks}, Grade: {item.grade}</p>
                ) : (
                  <p className="text-sm text-gray-600">Suggestion: {item.suggestion}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="w-4 h-4 text-blue-600" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CourseProgress = ({ teacher, students }) => {
  const { toast } = useToast();
  return <div className="text-center p-10" onClick={() => toast({ title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" })}>
    <CheckSquare className="mx-auto w-12 h-12 text-gray-300" />
    <h3 className="mt-4 text-lg font-medium text-gray-800">Course Progress</h3>
    <p className="mt-1 text-sm text-gray-500">Track syllabus completion for your classes here.</p>
  </div>;
};

const LearningResources = ({ teacher, students }) => {
  const { toast } = useToast();
  return <div className="text-center p-10" onClick={() => toast({ title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" })}>
    <Folder className="mx-auto w-12 h-12 text-gray-300" />
    <h3 className="mt-4 text-lg font-medium text-gray-800">Learning Resources</h3>
    <p className="mt-1 text-sm text-gray-500">Manage and share teaching materials with your students.</p>
  </div>;
};

const TeacherPortal = ({ currentUser, setActiveModule }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [teachers] = useLocalStorage('teachers', []);
  const [students] = useLocalStorage('students', []);
  const [academics, setAcademics] = useLocalStorage('academics', []);
  const [attendance] = useLocalStorage('attendance', {});
  const [users] = useLocalStorage('users', []);

  const teacher = useMemo(() => teachers.find(t => t.id === currentUser.id) || users.find(u => u.id === currentUser.id), [teachers, users, currentUser]);

  if (!teacher) {
    return <div>Loading teacher data...</div>;
  }
  
  if (!teacher.classes) {
      teacher.classes = [];
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <TeacherDashboard teacher={teacher} students={students} attendance={attendance} academics={academics} setActiveTab={setActiveTab} />;
      case 'my-students':
        return <MyStudents teacher={teacher} students={students} />;
      case 'attendance':
        return <AttendanceManagement currentUser={currentUser} />;
      case 'academics':
        return <AcademicsManagement teacher={teacher} students={students} academics={academics} setAcademics={setAcademics} />;
      case 'timetable':
        return <TimetableManagement currentUser={currentUser} />;
      case 'course-progress':
        return <CourseProgress teacher={teacher} students={students} />;
      case 'resources':
        return <LearningResources teacher={teacher} students={students} />;
      case 'communications':
        return <Communications currentUser={currentUser} />;
      default:
        return <TeacherDashboard teacher={teacher} students={students} attendance={attendance} academics={academics} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div><h1 className="text-2xl font-bold text-gray-800">Teacher Portal</h1><p className="text-gray-600 mt-1">Welcome, {teacher.name}!</p></div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 px-6 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'my-students', label: 'My Students', icon: Users },
              { id: 'attendance', label: 'Attendance', icon: Calendar },
              { id: 'timetable', label: 'Timetable', icon: BookOpen },
              { id: 'academics', label: 'Academics', icon: BarChart },
              { id: 'course-progress', label: 'Course Progress', icon: CheckSquare },
              { id: 'resources', label: 'Resources', icon: Folder },
              { id: 'communications', label: 'Communications', icon: MessageSquare },
            ].map(tab => {
              const Icon = tab.icon;
              return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Icon className="w-4 h-4" /><span>{tab.label}</span></button>);
            })}
          </nav>
        </div>
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherPortal;
