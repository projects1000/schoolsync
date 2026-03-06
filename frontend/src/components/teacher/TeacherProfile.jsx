import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, GraduationCap, Calendar, Award, BookOpen } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TeacherProfile = () => {
    const { toast } = useToast();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/teacher/profile');
            setProfile(res.data);
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Failed to fetch profile", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-8 rounded-xl h-36" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
                        <div className="space-y-4">
                            {[1, 2, 3].map(j => (
                                <div key={j} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-5 h-5 bg-gray-200 rounded" />
                                    <div className="flex-1">
                                        <div className="h-3 bg-gray-200 rounded w-20 mb-1" />
                                        <div className="h-4 bg-gray-300 rounded w-36" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    if (!profile) return <div className="text-center py-10">Profile Not Found</div>;

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-xl shadow-lg text-white">
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <User className="w-12 h-12 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold">{profile.name}</h1>
                        <p className="text-blue-100 flex items-center justify-center md:justify-start gap-2 mt-1">
                            <Briefcase className="w-4 h-4" /> {profile.department} Department
                        </p>
                        <p className="text-blue-100 mt-1">{profile.schoolName}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" /> Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500">Email Address</p>
                                <p className="font-medium text-gray-900">{profile.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Phone className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500">Phone Number</p>
                                <p className="font-medium text-gray-900">{profile.phone || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Award className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500">Employee ID</p>
                                <p className="font-medium text-gray-900">{profile.employeeId || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500">Joining Date</p>
                                <p className="font-medium text-gray-900">{profile.joiningDate || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-purple-600" /> Professional Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Award className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500">Qualification</p>
                                <p className="font-medium text-gray-900">{profile.qualification || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Briefcase className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500">Experience</p>
                                <p className="font-medium text-gray-900">{profile.experience || '0'} Years</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-green-600" /> Assigned Classes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {(!profile.assignedClasses || profile.assignedClasses.length === 0) ? (
                        <p className="text-gray-500">No classes assigned.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {profile.assignedClasses.map((cls, idx) => (
                                <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{cls.name}</h3>
                                        <p className="text-sm text-gray-500">Grade: {cls.grade} | Section: {cls.section}</p>
                                    </div>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">Assigned</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TeacherProfile;
