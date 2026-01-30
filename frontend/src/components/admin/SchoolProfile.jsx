import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Building, Phone, Mail, Clock, MapPin } from 'lucide-react';
import adminService from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SchoolProfile = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        const fetchSchool = async () => {
            try {
                const data = await adminService.getSchoolProfile();
                setSchool(data);
            } catch (error) {
                console.error("Failed to fetch school profile", error);
                toast({
                    title: "Error",
                    description: "Failed to load school profile.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchSchool();
    }, [toast]);

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

    if (loading) return <div>Loading profile...</div>;

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
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={school.phone || ''}
                                    onChange={handleChange}
                                    className="pl-9"
                                    placeholder="+91 9876543210"
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
                        <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700">
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
