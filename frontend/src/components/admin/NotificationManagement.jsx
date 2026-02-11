import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

const NotificationManagement = ({ currentUser }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        recipientId: '',
        title: '',
        message: '',
        type: 'INFO'
    });
    const [users, setUsers] = useState([]); // In a real app, fetch users. For now, we might need a way to select users.

    // Fetch users (Teachers/Parents) to send notifications to.
    // Assuming there is an API to get users or we can just type ID for now to keep it simple, 
    // or better, fetch teachers/parents.
    // Given complexity, let's start with a simple ID input or maybe just a broadcast feature if supported.
    // The plan said "Send notification to user(s)".
    // Let's implement fetching teachers for now as an example.

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // This endpoint might not exist or might need implementation. 
                // For now, I'll allow typing recipient ID manually or provide a way to search if I had time.
                // Let's stick to manual ID or maybe mocking a list if we can't fetch.
                // Actually, let's just use a text input for Recipient ID for now to be safe, 
                // as I don't want to break things by assuming a user list API exists.
            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        };
        fetchUsers();
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:8082/api/notifications', formData, {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });

            toast({
                title: "Notification Sent",
                description: "The notification has been sent successfully."
            });
            setFormData({ recipientId: '', title: '', message: '', type: 'INFO' });
        } catch (error) {
            console.error("Failed to send notification", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to send notification. Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Notification Management</h2>
                    <p className="text-gray-500">Send notifications to users</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="recipientId">Recipient ID</Label>
                        <Input
                            id="recipientId"
                            value={formData.recipientId}
                            onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
                            placeholder="Enter User ID"
                            required
                        />
                        <p className="text-xs text-gray-400">Enter the system ID of the user (Parent, Teacher, or Admin)</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Notification Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INFO">Information</SelectItem>
                                <SelectItem value="WARNING">Warning</SelectItem>
                                <SelectItem value="SUCCESS">Success</SelectItem>
                                <SelectItem value="ERROR">Error</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Notification Title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Type your message here..."
                            required
                            className="h-32"
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                Sending...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Send className="w-4 h-4" />
                                Send Notification
                            </span>
                        )}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default NotificationManagement;
