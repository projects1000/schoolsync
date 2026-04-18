import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Building2,
    Users,
    GraduationCap,
    DollarSign,
    CreditCard,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Settings,
    UserCheck,
    AlertCircle
} from 'lucide-react';
import SuperAdminService from '../../services/superAdminService';
import { Button } from '@/components/ui/button';

const SchoolDetails = ({ currentUser }) => {
    const { schoolId } = useParams();
    const navigate = useNavigate();
    
    const [isLoading, setIsLoading] = useState(true);
    const [schoolData, setSchoolData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await SuperAdminService.getSchoolDetails(schoolId);
                setSchoolData(response.data);
            } catch (error) {
                console.error("Failed to fetch school details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [schoolId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!schoolData || !schoolData.school) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <AlertCircle className="w-16 h-16 text-orange-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">School Not Found</h2>
                <Button onClick={() => navigate('/superadmin/schools')} className="mt-4 bg-emerald-600">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Schools
                </Button>
            </div>
        );
    }

    const { school, teachers, students, totalStudents, totalTeachers, totalRevenue, subscriptionDue } = schoolData;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/superadmin/schools')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-800">{school.name}</h1>
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 uppercase">
                                {school.status}
                            </span>
                        </div>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> {school.city}, {school.state} 
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{opacity: 0}} animate={{opacity:1}} transition={{delay: 0.1}} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Students</p>
                        <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
                    </div>
                </motion.div>

                <motion.div initial={{opacity: 0}} animate={{opacity:1}} transition={{delay: 0.15}} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Teachers</p>
                        <p className="text-2xl font-bold text-gray-800">{totalTeachers}</p>
                    </div>
                </motion.div>

                <motion.div initial={{opacity: 0}} animate={{opacity:1}} transition={{delay: 0.2}} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-800">${totalRevenue?.toFixed(2) || '0.00'}</p>
                    </div>
                </motion.div>

                <motion.div initial={{opacity: 0}} animate={{opacity:1}} transition={{delay: 0.25}} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Monthly Subs Due</p>
                        <p className="text-2xl font-bold text-gray-800">${subscriptionDue?.toFixed(2) || '0.00'}</p>
                    </div>
                </motion.div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {['overview', 'students', 'teachers', 'financials'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                                activeTab === tab 
                                ? 'text-emerald-600 border-b-2 border-emerald-600' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                        <Building2 className="w-5 h-5 text-emerald-500" />
                                        Contact Information
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <p className="text-gray-600 flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-gray-400" /> {school.phone || 'N/A'}
                                        </p>
                                        <p className="text-gray-600 flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-gray-400" /> {school.email || 'N/A'}
                                        </p>
                                        <p className="text-gray-600 flex items-center gap-3">
                                            <MapPin className="w-4 h-4 text-gray-400" /> {school.address}, {school.city}, {school.state} - {school.pincode}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                        <UserCheck className="w-5 h-5 text-emerald-500" />
                                        Assigned Admin
                                    </h3>
                                    {school.admin ? (
                                        <div className="bg-emerald-50 rounded-lg p-4 flex items-center gap-4 border border-emerald-100">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold shadow-sm">
                                                {school.admin.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{school.admin.name}</p>
                                                <p className="text-sm text-gray-500">{school.admin.email}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-lg p-6 text-center border border-dashed border-gray-300">
                                            <p className="text-gray-500 italic">No admin assigned to this school yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STUDENTS TAB */}
                    {activeTab === 'students' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">All Students</h3>
                                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">{totalStudents} Total</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="p-3">Name</th>
                                            <th className="p-3">Admission No</th>
                                            <th className="p-3">Guardian</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {students?.slice(0, 100).map((s, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="p-3 text-sm text-gray-800 font-medium">{s.name}</td>
                                                <td className="p-3 text-sm text-gray-500">{s.admissionNo}</td>
                                                <td className="p-3 text-sm text-gray-500">{s.guardian} ({s.guardianPhone})</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {s.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {students?.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center p-8 text-gray-500 italic">No students found.</td>
                                            </tr>
                                        )}
                                        {students?.length > 100 && (
                                            <tr>
                                                <td colSpan="4" className="text-center p-3 text-xs text-gray-400">Showing first 100 students due to large dataset.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TEACHERS TAB */}
                    {activeTab === 'teachers' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">All Teachers</h3>
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">{totalTeachers} Total</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="p-3">Name</th>
                                            <th className="p-3">Employee Id</th>
                                            <th className="p-3">Department</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {teachers?.map((t, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="p-3 text-sm text-gray-800 font-medium">{t.name}</td>
                                                <td className="p-3 text-sm text-gray-500">{t.employeeId}</td>
                                                <td className="p-3 text-sm text-gray-500">{t.department || 'N/A'}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${t.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {t.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {teachers?.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center p-8 text-gray-500 italic">No teachers found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* FINANCIALS TAB */}
                    {activeTab === 'financials' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Overview</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-md">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-emerald-100 text-sm font-medium mb-1">Total Fee Revenue</p>
                                            <h2 className="text-3xl font-bold">${totalRevenue?.toFixed(2) || '0.00'}</h2>
                                        </div>
                                        <div className="p-3 bg-white/20 rounded-lg">
                                            <DollarSign className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-emerald-100 mt-4 opacity-80">Aggregate compiled from all paid student fee invoices within the school system.</p>
                                </div>

                                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-md">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-emerald-100 text-sm font-medium mb-1">Current Subscription Due (Estimated)</p>
                                            <h2 className="text-3xl font-bold">${subscriptionDue?.toFixed(2) || '0.00'}</h2>
                                        </div>
                                        <div className="p-3 bg-white/20 rounded-lg">
                                            <CreditCard className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-emerald-100 mt-4 opacity-80">Calculated based on active student volume ($10 per active student monthly scale).</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default SchoolDetails;
