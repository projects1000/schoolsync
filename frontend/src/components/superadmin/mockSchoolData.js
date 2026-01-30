// Extended mock data for School Management

export const mockSchoolsData = [
    {
        id: 's1',
        name: 'Little Steps - Downtown',
        city: 'Mumbai',
        address: '123 Main Street, Downtown, Mumbai 400001',
        phone: '+91 22 1234 5678',
        email: 'downtown@littlesteps.com',
        type: 'Playschool',
        status: 'active',
        students: 145,
        teachers: 12,
        createdAt: '2024-01-15',
        admin: { id: 'a1', name: 'Priya Sharma', email: 'priya@littlesteps.com' }
    },
    {
        id: 's2',
        name: 'Tiny Tots Academy',
        city: 'Delhi',
        address: '456 Park Avenue, South Delhi 110001',
        phone: '+91 11 2345 6789',
        email: 'contact@tinytots.com',
        type: 'Preschool',
        status: 'active',
        students: 198,
        teachers: 18,
        createdAt: '2024-03-22',
        admin: { id: 'a2', name: 'Rahul Verma', email: 'rahul@tinytots.com' }
    },
    {
        id: 's3',
        name: 'Happy Kids Playschool',
        city: 'Bangalore',
        address: '789 Tech Park Road, Whitefield, Bangalore 560066',
        phone: '+91 80 3456 7890',
        email: 'info@happykids.com',
        type: 'Playschool',
        status: 'active',
        students: 87,
        teachers: 8,
        createdAt: '2024-06-10',
        admin: { id: 'a3', name: 'Anita Reddy', email: 'anita@happykids.com' }
    },
    {
        id: 's4',
        name: 'Sunshine Preschool',
        city: 'Chennai',
        address: '321 Beach Road, Anna Nagar, Chennai 600040',
        phone: '+91 44 4567 8901',
        email: 'hello@sunshinepreschool.com',
        type: 'Preschool',
        status: 'active',
        students: 112,
        teachers: 10,
        createdAt: '2024-08-05',
        admin: { id: 'a4', name: 'Kumar S.', email: 'kumar@sunshinepreschool.com' }
    },
    {
        id: 's5',
        name: 'Rainbow Kids',
        city: 'Pune',
        address: '567 Lane 5, Koregaon Park, Pune 411001',
        phone: '+91 20 5678 9012',
        email: 'admin@rainbowkids.com',
        type: 'Daycare',
        status: 'suspended',
        students: 45,
        teachers: 4,
        createdAt: '2023-11-20',
        suspendedReason: 'License renewal pending',
        admin: { id: 'a5', name: 'Meera Joshi', email: 'meera@rainbowkids.com' }
    },
    {
        id: 's6',
        name: 'Little Stars Academy',
        city: 'Hyderabad',
        address: '890 Hi-Tech City, Hyderabad 500081',
        phone: '+91 40 6789 0123',
        email: 'stars@littlestars.com',
        type: 'Playschool',
        status: 'active',
        students: 156,
        teachers: 14,
        createdAt: '2024-10-01',
        admin: { id: 'a6', name: 'Vijay Kumar', email: 'vijay@littlestars.com' }
    },
    {
        id: 's7',
        name: 'Bright Minds Playschool',
        city: 'Kolkata',
        address: '234 Salt Lake, Sector V, Kolkata 700091',
        phone: '+91 33 7890 1234',
        email: 'contact@brightminds.com',
        type: 'Preschool',
        status: 'inactive',
        students: 0,
        teachers: 0,
        createdAt: '2024-02-28',
        admin: null
    },
    {
        id: 's8',
        name: 'Kidz Zone',
        city: 'Ahmedabad',
        address: '678 SG Highway, Ahmedabad 380054',
        phone: '+91 79 8901 2345',
        email: 'info@kidzzone.com',
        type: 'Daycare',
        status: 'active',
        students: 93,
        teachers: 9,
        createdAt: '2024-12-15',
        admin: { id: 'a8', name: 'Neha Patel', email: 'neha@kidzzone.com' }
    },
];

export const mockAvailableAdmins = [
    { id: 'new1', name: 'Ravi Sharma', email: 'ravi.sharma@gmail.com', phone: '+91 98765 43210' },
    { id: 'new2', name: 'Sneha Gupta', email: 'sneha.gupta@gmail.com', phone: '+91 87654 32109' },
    { id: 'new3', name: 'Amit Patel', email: 'amit.patel@gmail.com', phone: '+91 76543 21098' },
    { id: 'new4', name: 'Pooja Singh', email: 'pooja.singh@gmail.com', phone: '+91 65432 10987' },
];

export const schoolTypes = ['Playschool', 'Preschool', 'Daycare', 'Kindergarten'];

export const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata', 'Ahmedabad'];

export const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'SUSPENDED', label: 'Suspended' },
];
