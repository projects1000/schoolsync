import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bell, Users, User, History, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
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
import api from '@/services/api';

const Communications = ({ currentUser }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('DIRECT');

  // Data state
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [parents, setParents] = useState([]); // Loaded dynamically based on class
  const [history, setHistory] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inboxLoading, setInboxLoading] = useState(false);

  // Direct Message state
  const [dmAudience, setDmAudience] = useState('TEACHER'); // 'TEACHER' or 'PARENT'
  const [dmTeacherId, setDmTeacherId] = useState('');
  const [dmClassId, setDmClassId] = useState('');
  const [dmParentId, setDmParentId] = useState('');
  const [dmSubject, setDmSubject] = useState('');
  const [dmBody, setDmBody] = useState('');

  // Broadcast state
  const [bcAudience, setBcAudience] = useState('ALL_TEACHERS'); // 'ALL_TEACHERS', 'CLASS_PARENTS', 'ALL_PARENTS'
  const [bcClassId, setBcClassId] = useState('');
  const [bcSubject, setBcSubject] = useState('');
  const [bcBody, setBcBody] = useState('');

  useEffect(() => {
    fetchInitialData();
    fetchHistory();
    fetchInbox();
  }, []);

  useEffect(() => {
    if (dmAudience === 'PARENT' && dmClassId) {
      fetchParents(dmClassId);
      setDmParentId('');
    }
  }, [dmAudience, dmClassId]);

  const fetchInitialData = async () => {
    try {
      const [teachersRes, classesRes] = await Promise.all([
        api.get('/admin/communications/teachers'),
        api.get('/admin/communications/classes')
      ]);
      setTeachers(teachersRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      toast({ title: "Error", description: "Failed to load teachers and classes.", variant: "destructive" });
    }
  };

  const fetchParents = async (classId) => {
    try {
      const res = await api.get(`/admin/communications/parents/${classId}`);
      setParents(res.data);
    } catch (error) {
      console.error('Failed to fetch parents:', error);
      toast({ title: "Error", description: "Failed to load parents for the selected class.", variant: "destructive" });
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/communications/history');
      setHistory(res.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInbox = async () => {
    setInboxLoading(true);
    try {
      const res = await api.get('/admin/communications/inbox');
      setInbox(res.data);
    } catch (error) {
      console.error('Failed to fetch inbox:', error);
    } finally {
      setInboxLoading(false);
    }
  };

  const handleSendDirect = async () => {
    if (!dmSubject.trim() || !dmBody.trim()) {
      toast({ title: "Validation Error", description: "Subject and message body are required.", variant: "destructive" });
      return;
    }

    let payload = {
      subject: dmSubject,
      body: dmBody,
      recipientType: dmAudience
    };

    if (dmAudience === 'TEACHER') {
      if (!dmTeacherId) {
        toast({ title: "Validation Error", description: "Please select a teacher.", variant: "destructive" });
        return;
      }
      payload.recipientId = dmTeacherId;
    } else {
      if (!dmParentId) {
        toast({ title: "Validation Error", description: "Please select a parent.", variant: "destructive" });
        return;
      }
      payload.recipientId = dmParentId.split('_')[0];
      payload.targetStudentId = dmParentId.split('_')[1];
      payload.targetClassId = dmClassId;
    }

    try {
      await api.post('/admin/communications/direct', payload);
      toast({ title: "Success!", description: "Direct message sent successfully." });
      // Reset form
      setDmSubject('');
      setDmBody('');
      setDmTeacherId('');
      setDmParentId('');
      fetchHistory();
    } catch (error) {
      console.error('Error sending DM:', error);
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    }
  };

  const handleSendBroadcast = async () => {
    if (!bcSubject.trim() || !bcBody.trim()) {
      toast({ title: "Validation Error", description: "Subject and message body are required.", variant: "destructive" });
      return;
    }

    let payload = {
      subject: bcSubject,
      body: bcBody,
      recipientType: bcAudience
    };

    if (bcAudience === 'CLASS_PARENTS') {
      if (!bcClassId) {
        toast({ title: "Validation Error", description: "Please select a class for this broadcast.", variant: "destructive" });
        return;
      }
      payload.targetClassId = bcClassId;
    }

    try {
      await api.post('/admin/communications/broadcast', payload);
      toast({ title: "Success!", description: "Broadcast sent successfully." });
      setBcSubject('');
      setBcBody('');
      setBcClassId('');
      fetchHistory();
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast({ title: "Error", description: "Failed to send broadcast.", variant: "destructive" });
    }
  };

  const renderRecipientDisplay = (comm) => {
    if (comm.type === 'BROADCAST') {
      switch (comm.recipientType) {
        case 'ALL_TEACHERS': return 'Broadcast to All Teachers';
        case 'ALL_PARENTS': return 'Broadcast to All Parents';
        case 'CLASS_PARENTS':
          const cls = classes.find(c => c.id === comm.targetClassId);
          return `Broadcast to Class Parents ${cls ? `(${cls.name})` : ''}`;
        default: return 'Broadcast';
      }
    } else {
      const names = comm.recipientNames || [];
      return `Direct Message to: ${names.join(', ')}`;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Communications</h1>
            <p className="text-gray-600 mt-1">Send direct messages and broadasts to staff and parents</p>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-[750px] grid-cols-4 mb-6">
          <TabsTrigger value="INBOX">Inbox</TabsTrigger>
          <TabsTrigger value="DIRECT">Direct Message</TabsTrigger>
          <TabsTrigger value="BROADCAST">Broadcast</TabsTrigger>
          <TabsTrigger value="HISTORY">Sent History</TabsTrigger>
        </TabsList>

        {/* DIRECT MESSAGE TAB */}
        <TabsContent value="DIRECT">
          <Card>
            <CardHeader>
              <CardTitle>Send Direct Message</CardTitle>
              <CardDescription>Send a private message to a specific teacher or parent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Audience Type</label>
                <Select value={dmAudience} onValueChange={setDmAudience}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select Audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="PARENT">Parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dmAudience === 'TEACHER' ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select Teacher</label>
                  <Select value={dmTeacherId} onValueChange={setDmTeacherId}>
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue placeholder="Select Teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Select Class</label>
                    <Select value={dmClassId} onValueChange={setDmClassId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Select Parent</label>
                    <Select value={dmParentId} onValueChange={setDmParentId} disabled={!dmClassId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Parent" />
                      </SelectTrigger>
                      <SelectContent>
                        {parents.length === 0 && <SelectItem value="none" disabled>No parents found</SelectItem>}
                        {parents.map(p => <SelectItem key={`${p.parentUserId}_${p.studentId}`} value={`${p.parentUserId}_${p.studentId}`}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <input
                  value={dmSubject}
                  onChange={(e) => setDmSubject(e.target.value)}
                  placeholder="Message Subject"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Message Body</label>
                <Textarea
                  value={dmBody}
                  onChange={(e) => setDmBody(e.target.value)}
                  placeholder="Type your message here..."
                  className="min-h-[150px]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSendDirect} className="bg-gradient-to-r from-blue-600 to-emerald-600">
                  <Send className="w-4 h-4 mr-2" />
                  Send Direct Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BROADCAST TAB */}
        <TabsContent value="BROADCAST">
          <Card>
            <CardHeader>
              <CardTitle>Send Broadcast</CardTitle>
              <CardDescription>Send an announcement or notification to a group of people.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Broadcast Audience</label>
                <Select value={bcAudience} onValueChange={setBcAudience}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select Audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_TEACHERS">All Teachers</SelectItem>
                    <SelectItem value="ALL_PARENTS">All Parents (Entire School)</SelectItem>
                    <SelectItem value="CLASS_PARENTS">Parents of a Specific Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {bcAudience === 'CLASS_PARENTS' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select Class</label>
                  <Select value={bcClassId} onValueChange={setBcClassId}>
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <input
                  value={bcSubject}
                  onChange={(e) => setBcSubject(e.target.value)}
                  placeholder="Announcement Subject"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Message Body</label>
                <Textarea
                  value={bcBody}
                  onChange={(e) => setBcBody(e.target.value)}
                  placeholder="Type your announcement here..."
                  className="min-h-[150px]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSendBroadcast} className="bg-gradient-to-r from-green-600 to-emerald-600">
                  <Bell className="w-4 h-4 mr-2" />
                  Send Broadcast
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="HISTORY">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sent History</CardTitle>
                <CardDescription>View all messages and broadcasts sent by you.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchHistory}>
                <History className="w-4 h-4 mr-2" /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-10 text-gray-500">Loading history...</p>
              ) : history.length === 0 ? (
                <div className="text-center py-10">
                  <Send className="mx-auto w-12 h-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-800">No Communications Sent</h3>
                  <p className="mt-1 text-sm text-gray-500">Use the tabs above to send your first message or broadcast.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((comm) => (
                    <motion.div
                      key={comm.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${comm.type === 'BROADCAST' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                            {comm.type === 'BROADCAST' ? <Bell className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-800 text-lg">{comm.subject}</h4>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${comm.type === 'BROADCAST' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                {comm.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              {comm.type === 'BROADCAST' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                              <span>{renderRecipientDisplay(comm)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          {new Date(comm.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded text-gray-700 text-sm whitespace-pre-wrap ml-12 border border-gray-100">
                        {comm.body}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* INBOX TAB */}
        <TabsContent value="INBOX">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Inbox</CardTitle>
                <CardDescription>Messages received from Super Admin and others.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchInbox}>
                <History className="w-4 h-4 mr-2" /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {inboxLoading ? (
                <p className="text-center py-10 text-gray-500">Loading inbox...</p>
              ) : inbox.length === 0 ? (
                <div className="text-center py-10">
                  <Inbox className="mx-auto w-12 h-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-800">No Messages Received</h3>
                  <p className="mt-1 text-sm text-gray-500">You have no messages in your inbox yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inbox.map((comm) => (
                    <motion.div
                      key={comm.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${comm.senderRole === 'SUPERADMIN' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                            {comm.senderRole === 'SUPERADMIN' ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-800 text-lg">{comm.subject}</h4>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${comm.senderRole === 'SUPERADMIN' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                                {comm.senderRole === 'SUPERADMIN' ? 'Super Admin' : comm.senderRole}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">From: {comm.senderName}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          {new Date(comm.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded text-gray-700 text-sm whitespace-pre-wrap ml-12 border border-gray-100">
                        {comm.body}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Communications;