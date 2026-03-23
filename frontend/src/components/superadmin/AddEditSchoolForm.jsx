import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    ChevronRight,
    ChevronLeft,
    Check,
    X,
    Save,
    Send,
    UserPlus,
    AlertCircle,
    Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { schoolTypes, cities, statusOptions } from './mockSchoolData';
import SuperAdminService from '../../services/superAdminService';

const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Lakshadweep', 'Delhi', 'Puducherry', 'Ladakh', 'Jammu and Kashmir'
].sort();

const AddEditSchoolForm = ({
    isOpen,
    onClose,
    onSave,
    editSchool = null,
    existingSchools = []
}) => {
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [isDraft, setIsDraft] = useState(false);
    const [errors, setErrors] = useState({});
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [availableAdmins, setAvailableAdmins] = useState([]);
    const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        address: '',
        city: '',
        otherCity: '',
        state: '',
        phone: '',
        email: '',
        type: 'Playschool',
        status: 'ACTIVE'
    });

    // Initialize form data when editing
    useEffect(() => {
        if (editSchool) {
            const isCityInList = cities.includes(editSchool.city);
            setFormData({
                name: editSchool.name || '',
                code: editSchool.code || '',
                address: editSchool.address || '',
                city: isCityInList ? (editSchool.city || '') : 'Other',
                otherCity: isCityInList ? '' : (editSchool.city || ''),
                state: editSchool.state || 'Maharashtra',
                phone: editSchool.phone || '',
                email: editSchool.email || '',
                type: editSchool.type || 'Playschool',
                status: editSchool.status || 'ACTIVE'
            });
            // If editing, try to reconstruct selectedAdmin from principal fields
            if (editSchool.principalName) {
                setSelectedAdmin({
                    name: editSchool.principalName,
                    email: editSchool.principalEmail
                });
            } else {
                setSelectedAdmin(null);
            }
            setIsDraft(editSchool.isDraft || false);
        } else {
            resetForm();
        }
    }, [editSchool, isOpen]);

    // Fetch available admins when modal opens or step changes to 2
    useEffect(() => {
        if (isOpen && currentStep === 2) {
            fetchAdmins();
        }
    }, [isOpen, currentStep]);

    const fetchAdmins = async () => {
        try {
            setIsLoadingAdmins(true);
            const response = await SuperAdminService.getAllAdmins();
            // Filter out admins who already have a school assigned, unless it's the current school's admin
            const allAdmins = response.data || [];
            const unassignedAdmins = allAdmins.filter(admin => !admin.schoolId || (editSchool && admin.id === editSchool.adminId));
            setAvailableAdmins(unassignedAdmins);
        } catch (error) {
            console.error("Failed to fetch admins:", error);
            toast({
                title: 'Error',
                description: 'Failed to load available admins',
                variant: 'destructive'
            });
        } finally {
            setIsLoadingAdmins(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', code: '', address: '', city: '', otherCity: '', state: '',
            phone: '', email: '', type: 'Playschool', status: 'ACTIVE'
        });
        setCurrentStep(1);
        setErrors({});
        setSelectedAdmin(null);
        setIsDraft(false);
    };

    // Validation
    const validateStep1 = () => {
        const newErrors = {};

        // Required field validation
        if (!formData.name.trim()) {
            newErrors.name = 'School name is required';
        } else {
            // Check for duplicate names (case insensitive)
            const isDuplicate = existingSchools.some(
                school => school.name.toLowerCase() === formData.name.toLowerCase() &&
                    school.id !== editSchool?.id
            );
            if (isDuplicate) {
                newErrors.name = 'A school with this name already exists';
            }
        }

        if (!formData.code.trim()) {
            newErrors.code = 'School code is required';
        }

        if (!formData.state) {
            newErrors.state = 'State is required';
        }

        if (!formData.city) {
            newErrors.city = 'City is required';
        } else if (formData.city === 'Other' && !formData.otherCity?.trim()) {
            newErrors.otherCity = 'Please specify your city';
        }

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Phone validation
        if (formData.phone && !/^[\d\s\-+()]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSave = (asDraft = false) => {
        if (currentStep === 1 && !validateStep1()) {
            return;
        }

        const schoolData = {
            ...formData,
            city: formData.city === 'Other' ? formData.otherCity : formData.city,
            id: editSchool?.id, // Let backend generate ID for new schools
            principalName: selectedAdmin?.name,
            principalEmail: selectedAdmin?.email,
            isDraft: asDraft,
            status: asDraft ? 'draft' : formData.status,
            students: editSchool?.students || 0,
            teachers: editSchool?.teachers || 0,
            createdAt: editSchool?.createdAt || new Date().toISOString()
        };
        // Remove otherCity from data sent to server
        delete schoolData.otherCity;

        onSave(schoolData);

        toast({
            title: asDraft ? 'Draft Saved' : (editSchool ? 'School Updated' : 'School Created'),
            description: asDraft
                ? `${formData.name} saved as draft`
                : `${formData.name} has been ${editSchool ? 'updated' : 'published'} successfully`
        });

        onClose();
        resetForm();
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Auto-generate code from name
            if (field === 'name') {
                const nameBase = value.trim().substring(0, 3).toUpperCase();
                if (nameBase.length >= 2) {
                    // If code is empty or we are creating a new school, update it
                    if (!editSchool) {
                        newData.code = nameBase + '-' + Math.floor(100 + Math.random() * 900);
                    }
                }
            }

            // Auto-prefix phone with +91
            if (field === 'phone') {
                let phoneValue = value;
                if (phoneValue && !phoneValue.startsWith('+91')) {
                    // If they just started typing a digit, prepend +91
                    if (/^\d/.test(phoneValue)) {
                        phoneValue = '+91 ' + phoneValue;
                    }
                }
                newData.phone = phoneValue;
            }

            return newData;
        });

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    if (!isOpen) return null;

    const steps = [
        { num: 1, label: 'Basic Info' },
        { num: 2, label: 'Admin Assignment' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{editSchool ? 'Edit School' : 'Add New School'}</h2>
                                <p className="text-indigo-100 text-sm">Fill in the details to {editSchool ? 'update' : 'create'} the school</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Breadcrumb / Steps */}
                    <div className="flex items-center gap-2 mt-6">
                        <button onClick={() => setCurrentStep(1)} className="flex items-center gap-1 text-sm text-indigo-100 hover:text-white">
                            <Home className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-indigo-200" />
                        {steps.map((step, index) => (
                            <React.Fragment key={step.num}>
                                <button
                                    onClick={() => step.num <= currentStep && setCurrentStep(step.num)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${currentStep === step.num
                                        ? 'bg-white text-indigo-600'
                                        : currentStep > step.num
                                            ? 'bg-white/20 text-white hover:bg-white/30'
                                            : 'text-indigo-200'
                                        }`}
                                >
                                    {currentStep > step.num ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <span className="w-5 h-5 flex items-center justify-center text-xs border border-current rounded-full">
                                            {step.num}
                                        </span>
                                    )}
                                    {step.label}
                                </button>
                                {index < steps.length - 1 && (
                                    <ChevronRight className="w-4 h-4 text-indigo-200" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-5"
                            >
                                {/* School Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        School Name <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.name ? 'border-rose-500 bg-rose-50' : 'border-gray-200'
                                                }`}
                                            placeholder="Enter school name"
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-rose-500 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* School Code */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-sm font-medium text-gray-700">
                                            School Code <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                                            System Generated
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.code}
                                            readOnly
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                                            placeholder="Waiting for school name..."
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Unique identifier generated automatically from school name
                                    </p>
                                    {errors.code && (
                                        <p className="mt-1 text-sm text-rose-500 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {errors.code}
                                        </p>
                                    )}
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                            placeholder="Full address"
                                            rows={2}
                                        />
                                    </div>
                                </div>

                                {/* State & City */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            State <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={formData.state}
                                            onChange={(e) => {
                                                const newState = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    state: newState,
                                                    city: '' // Reset city when state changes
                                                }));
                                                if (errors.state) {
                                                    setErrors(prev => ({ ...prev, state: null }));
                                                }
                                            }}
                                            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.state ? 'border-rose-500 bg-rose-50' : 'border-gray-200'
                                                }`}
                                        >
                                            <option value="">Select state</option>
                                            {states.map(state => <option key={state} value={state}>{state}</option>)}
                                        </select>
                                        {errors.state && (
                                            <p className="mt-1 text-sm text-rose-500 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                {errors.state}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            City <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={formData.city}
                                            disabled={!formData.state}
                                            onChange={(e) => handleInputChange('city', e.target.value)}
                                            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${!formData.state ? 'bg-gray-50 cursor-not-allowed text-gray-400' : ''} ${errors.city ? 'border-rose-500 bg-rose-50' : 'border-gray-200'
                                                }`}
                                        >
                                            <option value="">Select city</option>
                                            {cities.map(city => <option key={city} value={city}>{city}</option>)}
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.city && (
                                            <p className="mt-1 text-sm text-rose-500 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                {errors.city}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Custom City Field */}
                                <AnimatePresence>
                                    {formData.city === 'Other' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                    Specify City <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={formData.otherCity || ''}
                                                        onChange={(e) => handleInputChange('otherCity', e.target.value)}
                                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.otherCity ? 'border-rose-500 bg-rose-50' : 'border-gray-200'}`}
                                                        placeholder="Enter your city name"
                                                    />
                                                </div>
                                                {errors.otherCity && (
                                                    <p className="mt-1 text-sm text-rose-500 flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        {errors.otherCity}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Contact & Email */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Number</label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm font-medium select-none">+91</span>
                                            <input
                                                type="tel"
                                                value={(formData.phone || '').replace(/^\+91\s?/, '')}
                                                onChange={(e) => { const digits = e.target.value.replace(/\D/g, '').slice(0, 10); handleInputChange('phone', '+91 ' + digits); }}
                                                className={`flex-1 pr-4 py-2.5 border rounded-r-lg rounded-l-none focus:ring-2 focus:ring-indigo-500 ${errors.phone ? 'border-rose-500 bg-rose-50' : 'border-gray-200'}`}
                                                placeholder="9876543210"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-rose-500 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.email ? 'border-rose-500 bg-rose-50' : 'border-gray-200'
                                                    }`}
                                                placeholder="school@example.com"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-rose-500 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Type & Status */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">School Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => handleInputChange('type', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {schoolTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => handleInputChange('status', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {statusOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                            >
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <UserPlus className="w-8 h-8 text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Assign School Admin</h3>
                                    <p className="text-sm text-gray-500">Select an admin (Principal) for this school</p>
                                </div>

                                {selectedAdmin && (
                                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-semibold">{(selectedAdmin.name || 'A').charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-emerald-800">{selectedAdmin.name}</p>
                                                    <p className="text-sm text-emerald-600">{selectedAdmin.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedAdmin(null)}
                                                className="p-1 hover:bg-emerald-200 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4 text-emerald-700" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {isLoadingAdmins ? (
                                        <div className="text-center py-8 text-gray-500">Loading admins...</div>
                                    ) : availableAdmins.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">No admins found</div>
                                    ) : (
                                        availableAdmins.map(admin => (
                                            <button
                                                key={admin.id}
                                                onClick={() => setSelectedAdmin(admin)}
                                                className={`w-full p-4 flex items-center gap-3 rounded-xl border transition-all ${selectedAdmin?.email === admin.email
                                                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedAdmin?.email === admin.email ? 'bg-indigo-500' : 'bg-gray-200'
                                                    }`}>
                                                    <span className={`font-semibold ${selectedAdmin?.email === admin.email ? 'text-white' : 'text-gray-600'
                                                        }`}>
                                                        {(admin.name || 'A').charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="text-left flex-1">
                                                    <p className="font-medium text-gray-800">{admin.name}</p>
                                                    <p className="text-sm text-gray-500">{admin.email}</p>
                                                </div>
                                                {selectedAdmin?.email === admin.email && (
                                                    <Check className="w-5 h-5 text-indigo-600" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>

                                <p className="text-sm text-gray-400 text-center">
                                    You can skip this step and assign an admin later
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            {currentStep > 1 && (
                                <Button onClick={handleBack} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Back
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={onClose} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                                Cancel
                            </Button>

                            {currentStep === 1 && (
                                <Button onClick={() => handleSave(true)} className="bg-gray-600 hover:bg-gray-700">
                                    <Save className="w-4 h-4 mr-1" />
                                    Save Draft
                                </Button>
                            )}

                            {currentStep === 1 ? (
                                <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700">
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            ) : (
                                <Button onClick={() => handleSave(false)} className="bg-indigo-600 hover:bg-indigo-700">
                                    <Send className="w-4 h-4 mr-1" />
                                    {editSchool ? 'Update School' : 'Publish School'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AddEditSchoolForm;
