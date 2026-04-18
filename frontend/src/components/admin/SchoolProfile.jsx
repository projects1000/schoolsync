import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Save, Building, Phone, Mail, Clock, MapPin } from 'lucide-react';
import adminService from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SchoolProfile = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [saving, setSaving] = useState(false);
    const [school, setSchool] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        timings: '',
        logo: '',
        city: '',
        state: '',
        pincode: ''
    });

    const schoolProfileQuery = useQuery({
        queryKey: ['admin', 'school-profile'],
        queryFn: () => adminService.getSchoolProfile(),
        staleTime: 1000 * 60,
    });

    useEffect(() => {
        if (!schoolProfileQuery.data) return;
        setSchool(schoolProfileQuery.data);
    }, [schoolProfileQuery.data]);

    useEffect(() => {
        if (!schoolProfileQuery.error) return;
        console.error('Failed to fetch school profile', schoolProfileQuery.error);
        toast({
            title: 'Error',
            description: 'Failed to load school profile.',
            variant: 'destructive'
        });
    }, [schoolProfileQuery.error, toast]);

    const loading = schoolProfileQuery.isLoading || schoolProfileQuery.isFetching;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSchool(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await adminService.updateSchoolProfile(school);
            queryClient.invalidateQueries({ queryKey: ['admin', 'school-profile'] });
            toast({
                title: "Success",
                description: "School profile updated successfully!"
            });
        } catch (error) {
            console.error("Failed to update school profile", error);
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="h-7 bg-gray-200 rounded w-40 mb-2" />
                        <div className="h-4 bg-gray-100 rounded w-64" />
                    </div>
                    <div className="h-16 w-16 bg-gray-200 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-24" />
                            <div className="h-10 bg-gray-100 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">School Profile</h1>
                        <p className="text-gray-500">Manage your school's public information</p>
                    </div>
                    {school.logo && (
                        <img src={school.logo} alt="School Logo" className="h-16 w-16 object-contain rounded-full border" />
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Read Only Fields */}
                        <div className="space-y-2">
                            <Label className="text-gray-500">School Name (Read-Only)</Label>
                            <div className="flex items-center px-3 py-2 bg-gray-100 rounded-md text-gray-600">
                                <Building className="w-4 h-4 mr-2" />
                                {school.name}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="timings">School Timings</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="timings"
                                    name="timings"
                                    value={school.timings || ''}
                                    onChange={handleChange}
                                    className="pl-9"
                                    placeholder="e.g., 9:00 AM - 3:00 PM"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Contact Number</Label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm font-medium select-none">+91</span>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={(school.phone || '').replace(/^\+91\s?/, '')}
                                    onChange={(e) => { const digits = e.target.value.replace(/\D/g, '').slice(0, 10); handleChange({ target: { name: 'phone', value: '+91 ' + digits } }); }}
                                    className="rounded-l-none"
                                    placeholder="9876543210"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={school.email || ''}
                                    onChange={handleChange}
                                    className="pl-9"
                                    placeholder="info@school.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="address"
                                    name="address"
                                    value={school.address || ''}
                                    onChange={handleChange}
                                    className="pl-9"
                                    placeholder="Street Address"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                name="city"
                                value={school.city || ''}
                                onChange={handleChange}
                                placeholder="City"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                name="state"
                                value={school.state || ''}
                                onChange={handleChange}
                                placeholder="State"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input
                                id="pincode"
                                name="pincode"
                                value={school.pincode || ''}
                                onChange={handleChange}
                                placeholder="000000"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="logo">Logo URL</Label>
                            <Input
                                id="logo"
                                name="logo"
                                value={school.logo || ''}
                                onChange={handleChange}
                                placeholder="https://example.com/logo.png"
                            />
                            <p className="text-xs text-gray-500">Enter a public URL for the school logo.</p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default SchoolProfile;
