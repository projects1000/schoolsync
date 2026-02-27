import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Calendar, CheckCircle, AlertCircle,
    Heart, GraduationCap, Bus, Users, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useParent } from '@/context/ParentContext';
import parentService from '@/services/parentService';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const ParentStudentProfile = ({ currentUser }) => {
    const { toast } = useToast();
    const { selectedChild } = useParent();
    const [isSaving, setIsSaving] = useState(false);
    const [showMandatoryPopup, setShowMandatoryPopup] = useState(false);

    const [profileFormData, setProfileFormData] = useState({
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        newToEducation: true,
        previousSchool: '',
        previousClass: '',
        previousPercentage: '',
        medicalConditions: '',
        transportMode: ''
    });

    // Load existing profile data when child is selected
    useEffect(() => {
        if (selectedChild) {
            setProfileFormData({
                dateOfBirth: selectedChild.dateOfBirth || '',
                gender: selectedChild.gender || '',
                bloodGroup: selectedChild.bloodGroup || '',
                newToEducation: selectedChild.newToEducation ?? true,
                previousSchool: selectedChild.previousSchool || '',
                previousClass: selectedChild.previousClass || '',
                previousPercentage: selectedChild.previousPercentage || '',
                medicalConditions: selectedChild.medicalConditions || '',
                transportMode: selectedChild.transportMode || ''
            });

            // Auto-show mandatory popup if profile is not completed
            if (!selectedChild.profileCompleted) {
                setShowMandatoryPopup(true);
            }
        }
    }, [selectedChild]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileFormData(prev => ({ ...prev, [name]: value }));
    };

    // Check if all required fields are filled
    const isProfileComplete = () => {
        return (
            profileFormData.dateOfBirth &&
            profileFormData.gender &&
            profileFormData.bloodGroup &&
            profileFormData.transportMode
        );
    };

    const handleSaveProfile = async () => {
        if (!isProfileComplete()) {
            toast({
                title: "Incomplete",
                description: "Please fill all required fields (Date of Birth, Gender, Blood Group, Transport Mode)",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsSaving(true);
            await parentService.updateChildProfile(selectedChild.id, {
                ...profileFormData,
                profileCompleted: true
            });
            toast({ title: "Success", description: "Profile saved successfully!" });
            setShowMandatoryPopup(false);
            // Refresh to update child data
            window.location.reload();
        } catch (error) {
            toast({ title: "Error", description: "Failed to save profile", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (!selectedChild) {
        return null;
    }

    // Shared profile form — rendered as a function (NOT a component) to prevent re-mounting on state change
    const renderProfileForm = (prefix) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div className="space-y-2">
                <Label htmlFor={`dob-${prefix}`} className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input
                    id={`dob-${prefix}`}
                    name="dateOfBirth"
                    type="date"
                    value={profileFormData.dateOfBirth}
                    onChange={handleInputChange}
                />
            </div>

            {/* Gender */}
            <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-500" />
                    Gender <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={profileFormData.gender}
                    onValueChange={(val) => setProfileFormData(p => ({ ...p, gender: val }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Blood Group */}
            <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-red-500" />
                    Blood Group <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={profileFormData.bloodGroup}
                    onValueChange={(val) => setProfileFormData(p => ({ ...p, bloodGroup: val }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Blood Group" />
                    </SelectTrigger>
                    <SelectContent>
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Transport Mode */}
            <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5 text-gray-500" />
                    Transport Mode <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={profileFormData.transportMode}
                    onValueChange={(val) => setProfileFormData(p => ({ ...p, transportMode: val }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Transport" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="School Bus">School Bus</SelectItem>
                        <SelectItem value="Private Vehicle">Private Vehicle</SelectItem>
                        <SelectItem value="Walk">Walk</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <hr className="col-span-1 md:col-span-2" />

            {/* Education History */}
            <div className="col-span-1 md:col-span-2 space-y-3">
                <Label className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-500" />
                    Education History
                </Label>
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name={`educationHistory-${prefix}`}
                            checked={profileFormData.newToEducation === true}
                            onChange={() => setProfileFormData(p => ({ ...p, newToEducation: true, previousSchool: '', previousClass: '', previousPercentage: '' }))}
                            className="w-4 h-4 text-purple-600"
                        />
                        <span className="text-sm">New to education</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name={`educationHistory-${prefix}`}
                            checked={profileFormData.newToEducation === false}
                            onChange={() => setProfileFormData(p => ({ ...p, newToEducation: false }))}
                            className="w-4 h-4 text-purple-600"
                        />
                        <span className="text-sm">Previously admitted in another school</span>
                    </label>
                </div>

                {profileFormData.newToEducation === false && (
                    <>
                        <div className="space-y-2 mt-2">
                            <Label htmlFor={`previousSchool-${prefix}`}>Previous School Name</Label>
                            <Input
                                id={`previousSchool-${prefix}`}
                                name="previousSchool"
                                placeholder="Enter the name of the last school"
                                value={profileFormData.previousSchool}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="space-y-2">
                                <Label htmlFor={`previousClass-${prefix}`}>Previous Class</Label>
                                <Input
                                    id={`previousClass-${prefix}`}
                                    name="previousClass"
                                    placeholder="e.g. UKG, Class 1"
                                    value={profileFormData.previousClass}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`previousPercentage-${prefix}`}>Percentage / Grade</Label>
                                <Input
                                    id={`previousPercentage-${prefix}`}
                                    name="previousPercentage"
                                    placeholder="e.g. 85%, A+"
                                    value={profileFormData.previousPercentage}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Medical Conditions */}
            <div className="col-span-1 md:col-span-2 space-y-2">
                <Label htmlFor={`medical-${prefix}`} className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
                    Medical Conditions / Allergies
                </Label>
                <textarea
                    id={`medical-${prefix}`}
                    name="medicalConditions"
                    placeholder="Any known allergies, conditions, or medications (optional)"
                    value={profileFormData.medicalConditions}
                    onChange={handleInputChange}
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
            </div>
        </div >
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Student Profile</h1>
                        <p className="text-gray-600 mt-1">Manage {selectedChild.name}'s profile information</p>
                    </div>
                    {selectedChild.profileCompleted ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1">
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                            Profile Complete
                        </Badge>
                    ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-3 py-1">
                            <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                            Profile Incomplete
                        </Badge>
                    )}
                </div>
            </motion.div>

            {/* Student Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100"
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">
                            {selectedChild.name?.charAt(0)}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedChild.name}</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-600">Class: <strong>{selectedChild.className || 'N/A'}</strong></span>
                            <span className="text-gray-300">|</span>
                            <span className="text-sm text-gray-600">Roll No: <strong>{selectedChild.rollNo || 'N/A'}</strong></span>
                            <span className="text-gray-300">|</span>
                            <span className="text-sm text-gray-600">Admission: <strong>{selectedChild.admissionNo || 'N/A'}</strong></span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Profile Form Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
                <div className="flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Profile Details</h3>
                    <span className="text-xs text-gray-400 ml-2">Fields marked with <span className="text-red-500">*</span> are required</span>
                </div>

                {renderProfileForm('page')}

                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving || !isProfileComplete()}
                        className="bg-purple-600 hover:bg-purple-700 px-6"
                    >
                        {isSaving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </Button>
                </div>
            </motion.div>

            {/* Mandatory Profile Popup — Cannot be dismissed until profile is complete */}
            <Dialog
                open={showMandatoryPopup}
                onOpenChange={setShowMandatoryPopup}
            >
                <DialogContent
                    className="max-w-2xl"
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Complete {selectedChild.name}'s Profile
                        </DialogTitle>
                        <DialogDescription>
                            Please fill in the required details for your child. This information is mandatory and helps the school provide better care. <strong>You must complete this before proceeding.</strong>
                        </DialogDescription>
                    </DialogHeader>

                    {renderProfileForm('popup')}

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSaveProfile}
                            disabled={isSaving || !isProfileComplete()}
                            className="bg-purple-600 hover:bg-purple-700 px-6"
                        >
                            {isSaving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            {isSaving ? 'Saving...' : 'Save & Continue'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ParentStudentProfile;
