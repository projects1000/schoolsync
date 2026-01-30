// Mock data for Super Admin Dashboard - Multi-School ERP System

export const mockSchools = [
  { id: 's1', name: 'Little Steps - Downtown', city: 'Mumbai', status: 'active', students: 145, teachers: 12, joinDate: '2024-01-15', adminName: 'Priya Sharma' },
  { id: 's2', name: 'Tiny Tots Academy', city: 'Delhi', status: 'active', students: 198, teachers: 18, joinDate: '2024-03-22', adminName: 'Rahul Verma' },
  { id: 's3', name: 'Happy Kids Playschool', city: 'Bangalore', status: 'active', students: 87, teachers: 8, joinDate: '2024-06-10', adminName: 'Anita Reddy' },
  { id: 's4', name: 'Sunshine Preschool', city: 'Chennai', status: 'active', students: 112, teachers: 10, joinDate: '2024-08-05', adminName: 'Kumar S.' },
  { id: 's5', name: 'Rainbow Kids', city: 'Pune', status: 'suspended', students: 45, teachers: 4, joinDate: '2023-11-20', adminName: 'Meera Joshi' },
  { id: 's6', name: 'Little Stars Academy', city: 'Hyderabad', status: 'active', students: 156, teachers: 14, joinDate: '2024-10-01', adminName: 'Vijay Kumar' },
  { id: 's7', name: 'Bright Minds Playschool', city: 'Kolkata', status: 'inactive', students: 0, teachers: 0, joinDate: '2024-02-28', adminName: 'Amit Das' },
  { id: 's8', name: 'Kidz Zone', city: 'Ahmedabad', status: 'active', students: 93, teachers: 9, joinDate: '2024-12-15', adminName: 'Neha Patel' },
];

export const mockOnboardingData = [
  { month: 'Feb', schools: 1 },
  { month: 'Mar', schools: 1 },
  { month: 'Apr', schools: 0 },
  { month: 'May', schools: 0 },
  { month: 'Jun', schools: 1 },
  { month: 'Jul', schools: 0 },
  { month: 'Aug', schools: 1 },
  { month: 'Sep', schools: 0 },
  { month: 'Oct', schools: 1 },
  { month: 'Nov', schools: 0 },
  { month: 'Dec', schools: 1 },
  { month: 'Jan', schools: 0 },
];

export const mockStudentGrowthData = [
  { year: '2020', students: 180 },
  { year: '2021', students: 320 },
  { year: '2022', students: 485 },
  { year: '2023', students: 620 },
  { year: '2024', students: 758 },
  { year: '2025', students: 836 },
];

export const mockAttendanceTrend = [
  { day: 'Week 1', percentage: 92 },
  { day: 'Week 2', percentage: 88 },
  { day: 'Week 3', percentage: 94 },
  { day: 'Week 4', percentage: 91 },
  { day: 'Week 5', percentage: 89 },
  { day: 'Week 6', percentage: 95 },
];

export const mockActiveAdmins = [
  { id: 'a1', name: 'Priya Sharma', school: 'Little Steps - Downtown', lastActive: '2 mins ago', avatar: 'PS' },
  { id: 'a2', name: 'Vijay Kumar', school: 'Little Stars Academy', lastActive: '15 mins ago', avatar: 'VK' },
  { id: 'a3', name: 'Neha Patel', school: 'Kidz Zone', lastActive: '1 hour ago', avatar: 'NP' },
  { id: 'a4', name: 'Kumar S.', school: 'Sunshine Preschool', lastActive: '2 hours ago', avatar: 'KS' },
  { id: 'a5', name: 'Anita Reddy', school: 'Happy Kids Playschool', lastActive: '5 hours ago', avatar: 'AR' },
];

export const mockSystemAlerts = [
  { id: 'al1', type: 'warning', title: 'Backup Delayed', message: 'Daily backup for Tiny Tots Academy delayed by 2 hours', time: '30 mins ago' },
  { id: 'al2', type: 'error', title: 'Server Load High', message: 'Database server experiencing high load (85%)', time: '1 hour ago' },
  { id: 'al3', type: 'info', title: 'Scheduled Maintenance', message: 'System maintenance scheduled for Sunday 2 AM - 4 AM', time: '3 hours ago' },
  { id: 'al4', type: 'success', title: 'Security Scan Complete', message: 'Weekly security scan completed - no issues found', time: '6 hours ago' },
];

export const mockPendingActions = [
  { id: 'p1', type: 'approval', title: 'New School Registration', description: 'Bloom Kids Academy requesting platform access', priority: 'high', date: 'Today' },
  { id: 'p2', type: 'review', title: 'License Renewal', description: 'Rainbow Kids license expires in 7 days', priority: 'medium', date: 'Jan 25' },
  { id: 'p3', type: 'action', title: 'Admin Access Request', description: 'New admin request for Sunshine Preschool', priority: 'low', date: 'Jan 24' },
  { id: 'p4', type: 'review', title: 'Report Review', description: 'Monthly compliance report ready for review', priority: 'medium', date: 'Jan 23' },
];

// Helper function to calculate totals
export const calculateStats = (schools) => {
  const totalSchools = schools.length;
  const activeSchools = schools.filter(s => s.status === 'active').length;
  const suspendedSchools = schools.filter(s => s.status === 'suspended' || s.status === 'inactive').length;
  const totalStudents = schools.reduce((sum, s) => sum + s.students, 0);
  const totalTeachers = schools.reduce((sum, s) => sum + s.teachers, 0);
  
  return { totalSchools, activeSchools, suspendedSchools, totalStudents, totalTeachers };
};
