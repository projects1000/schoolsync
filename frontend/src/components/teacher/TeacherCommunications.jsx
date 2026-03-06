import React, { useState, useEffect } from 'react';
import { Send, History, User, Users, Inbox } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TeacherCommunications = ({ currentUser }) => {
    const { toast } = useToast();
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [students, setStudents] = useState([]);
    const [recipientId, setRecipientId] = useState('ALL');
    const [messageContent, setMessageContent] = useState('');
    const [messages, setMessages] = useState([]);
    const [inboxMessages, setInboxMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('COMPOSE');

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            fetchStudents();
            setRecipientId('ALL');
        }
    }, [selectedClassId]);

    useEffect(() => {
        if (selectedClassId && activeTab === 'HISTORY') {
            fetchMessages();
        } else if (activeTab === 'INBOX') {
            fetchInboxMessages();
        }
    }, [selectedClassId, activeTab]);

    const fetchClasses = async () => {
        try {
            // Use /teacher/classes which returns ALL assigned classes (subject teacher + class teacher)
            const res = await api.get('/teacher/classes');
            setClasses(res.data);
            if (res.data.length > 0) {
                setSelectedClassId(res.data[0].id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStudents = async () => {
        if (!selectedClassId) return;
        try {
            const res = await api.get(`/teacher/classes/${selectedClassId}/students`);
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async () => {
        if (!selectedClassId) return;
        setLoading(true);
        try {
            const res = await api.get(`/teacher/messages/class/${selectedClassId}`);
            setMessages(res.data);
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Failed to fetch message history", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const fetchInboxMessages = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/teacher/messages/inbox`);
            setInboxMessages(res.data);
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Failed to fetch inbox messages", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!selectedClassId || !messageContent.trim()) {
            toast({ title: "Error", description: "Please select a class and write a message", variant: "destructive" });
            return;
        }

        try {
            await api.post('/teacher/messages', {
                classId: selectedClassId,
                content: messageContent,
                recipientId: recipientId
            });
            toast({ title: "Success", description: "Message sent successfully." });
            setMessageContent('');
            if (activeTab === 'HISTORY') {
                fetchMessages();
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800">Parent Communication</h1>
                <p className="text-gray-500">Send updates and announcements to parents</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-[600px] grid-cols-3 mb-6">
                    <TabsTrigger value="INBOX">Inbox</TabsTrigger>
                    <TabsTrigger value="COMPOSE">Compose Message</TabsTrigger>
                    <TabsTrigger value="HISTORY">Message History</TabsTrigger>
                </TabsList>

                <TabsContent value="INBOX">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Admin Announcements & Direct Messages</CardTitle>
                                <CardDescription>View messages sent to you by the school administration.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchInboxMessages}>
                                <History className="w-4 h-4 mr-2" /> Refresh
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-3 animate-pulse">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-9 h-9 bg-gray-200 rounded-full" />
                                                <div className="flex-1">
                                                    <div className="h-5 bg-gray-200 rounded w-44 mb-1" />
                                                    <div className="h-3 bg-gray-100 rounded w-64" />
                                                </div>
                                            </div>
                                            <div className="ml-12 h-16 bg-gray-50 rounded" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {inboxMessages.length === 0 ? (
                                        <div className="text-center py-10 text-gray-500">
                                            <Inbox className="mx-auto w-12 h-12 text-gray-300 mb-4" />
                                            No messages in your inbox.
                                        </div>
                                    ) : inboxMessages.map((msg) => (
                                        <div key={msg.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-full ${msg.type === 'BROADCAST' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'}`}>
                                                        {msg.type === 'BROADCAST' ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold text-gray-800 text-lg">{msg.subject}</h4>
                                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${msg.type === 'BROADCAST' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'}`}>
                                                                {msg.type}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">From: {msg.senderName} ({msg.senderRole}) • {new Date(msg.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded text-gray-700 text-sm whitespace-pre-wrap ml-12 border border-gray-100 mt-2">
                                                {msg.body}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="COMPOSE">
                    <Card>
                        <CardHeader>
                            <CardTitle>Send New Message</CardTitle>
                            <CardDescription>
                                {recipientId === 'ALL'
                                    ? "This message will be sent to ALL parents of the selected class."
                                    : "This message will be sent ONLY to the selected parent."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Select Class</label>
                                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Recipient</label>
                                    <Select value={recipientId} onValueChange={setRecipientId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Recipient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Parents (Broadcast)</SelectItem>
                                            {students.map(s => (
                                                <SelectItem key={s.id} value={s.id}>
                                                    {s.name} {s.guardian ? `(Guardian: ${s.guardian})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Message Content</label>
                                <Textarea
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="min-h-[150px]"
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700">
                                    <Send className="w-4 h-4 mr-2" />
                                    {recipientId === 'ALL' ? 'Send Broadcast' : 'Send Message'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="HISTORY">
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-600">Filter History by Class:</span>
                                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchMessages}>
                                <History className="w-4 h-4 mr-2" /> Refresh
                            </Button>
                        </div>

                        {loading ? (
                            <div className="space-y-3 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-9 h-9 bg-gray-200 rounded-full" />
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-48 mb-1" />
                                                <div className="h-3 bg-gray-100 rounded w-32" />
                                            </div>
                                        </div>
                                        <div className="ml-12 h-12 bg-gray-50 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {messages.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">No messages sent to this class yet.</div>
                                ) : messages.map((msg) => (
                                    <div key={msg.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 rounded-full ${msg.recipientId === 'ALL' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                                    {msg.recipientId === 'ALL' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {msg.recipientId === 'ALL'
                                                            ? `Broadcast to ${classes.find(c => c.id === msg.classId)?.name || 'Class'}`
                                                            : `To: ${students.find(s => s.id === msg.recipientId)?.name || 'Individual Student'}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Sent on {new Date(msg.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-wrap pl-11">{msg.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default TeacherCommunications;
