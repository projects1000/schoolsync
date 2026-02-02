import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CreateAdminModal = ({ isOpen, onClose, onSave, schools }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        schoolId: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                schoolId: ''
            });
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';

        if (!formData.schoolId) newErrors.schoolId = 'School selection is required';
        else {
            const selectedSchool = schools.find(s => s.id === formData.schoolId);
            if (selectedSchool && selectedSchool.admin) {
                newErrors.schoolId = `This school already has an admin (${selectedSchool.admin.name})`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSave(formData);
            // onSave handles closing and toast
        } catch (error) {
            console.error(error);
            // Error handling usually in parent, but we can set specific field error if backend returns it
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-800">Create New Admin</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* School Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="schoolId" className="text-gray-700 font-medium">Assign to School <span className="text-red-500">*</span></Label>
                            <select
                                id="schoolId"
                                name="schoolId"
                                value={formData.schoolId}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.schoolId ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            >
                                <option value="">Select a School</option>
                                {schools.map(school => (
                                    <option
                                        key={school.id}
                                        value={school.id}
                                        disabled={!!school.admin}
                                        className={school.admin ? 'text-gray-400 bg-gray-50' : ''}
                                    >
                                        {school.name} {school.admin ? '(Has Admin)' : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.schoolId && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.schoolId}</p>}
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700 font-medium">Admin Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Full Name"
                                className={errors.name ? 'border-red-500 bg-red-50' : ''}
                            />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 font-medium">Email Address <span className="text-red-500">*</span></Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@school.com"
                                className={errors.email ? 'border-red-500 bg-red-50' : ''}
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number <span className="text-red-500">*</span></Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 234 567 8900"
                                className={errors.phone ? 'border-red-500 bg-red-50' : ''}
                            />
                            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700 font-medium">Temporary Password <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    className={`pr-10 ${errors.password ? 'border-red-500 bg-red-50' : ''}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" /> Create & Assign
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreateAdminModal;
