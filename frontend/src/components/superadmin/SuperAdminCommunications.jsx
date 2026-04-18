import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bell, Users, User, History, Shield } from 'lucide-react';
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
import SuperAdminService from '../../services/superAdminService';

const SuperAdminCommunications = ({ currentUser }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('DIRECT');

  // Data state
  const [admins, setAdmins] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Direct Message state
  const [dmAdminId, setDmAdminId] = useState('');
  const [dmSubject, setDmSubject] = useState('');
  const [dmBody, setDmBody] = useState('');

  // Broadcast state
  const [bcSubject, setBcSubject] = useState('');
  const [bcBody, setBcBody] = useState('');

  useEffect(() => {
    fetchAdmins();
    fetchHistory();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await SuperAdminService.getAdminsForComms();
      setAdmins(res.data);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      toast({ title: "Error", description: "Failed to load admins list.", variant: "destructive" });
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await SuperAdminService.getCommHistory();
      const data = res.data;
      // Backend returns a Spring Page object; extract content array safely
      const items = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
      setHistory(items);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendDirect = async () => {
    if (!dmSubject.trim() || !dmBody.trim()) {
      toast({ title: "Validation Error", description: "Subject and message body are required.", variant: "destructive" });
      return;
    }
    if (!dmAdminId) {
      toast({ title: "Validation Error", description: "Please select an admin.", variant: "destructive" });
      return;
    }

    try {
      await SuperAdminService.sendDirectMessage({
        subject: dmSubject,
        body: dmBody,
        recipientId: dmAdminId
      });
      toast({ title: "Success!", description: "Direct message sent to admin successfully." });
      setDmSubject('');
      setDmBody('');
      setDmAdminId('');
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

    try {
      await SuperAdminService.sendBroadcast({
        subject: bcSubject,
        body: bcBody
      });
      toast({ title: "Success!", description: "Broadcast sent to all admins successfully." });
      setBcSubject('');
      setBcBody('');
      fetchHistory();
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast({ title: "Error", description: "Failed to send broadcast.", variant: "destructive" });
    }
  };

  const renderRecipientDisplay = (comm) => {
    if (comm.type === 'BROADCAST') {
      return 'Broadcast to All Admins';
    } else {
      const names = comm.recipientNames || [];
      return `Direct Message to: ${[...names].join(', ')}`;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-slate-800 via-slate-900 to-emerald-900 rounded-xl shadow-xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Super Admin Communications</h1>
            <p className="text-slate-300 text-sm mt-1">Send messages and announcements to school administrators</p>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3 mb-6">
          <TabsTrigger value="DIRECT">Direct Message</TabsTrigger>
          <TabsTrigger value="BROADCAST">Broadcast</TabsTrigger>
          <TabsTrigger value="HISTORY">Sent History</TabsTrigger>
        </TabsList>

        {/* DIRECT MESSAGE TAB */}
        <TabsContent value="DIRECT">
          <Card>
            <CardHeader>
              <CardTitle>Send Direct Message to Admin</CardTitle>
              <CardDescription>Send a private message to a specific school administrator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Admin</label>
                <Select value={dmAdminId} onValueChange={setDmAdminId}>
                  <SelectTrigger className="w-full md:w-[500px]">
                    <SelectValue placeholder="Select an Admin" />
                  </SelectTrigger>
                  <SelectContent style={{ '--select-content-max-height': '400px' }} className="[&_[role=listbox]]:!overflow-y-scroll">
                    {admins.length === 0 && <SelectItem value="none" disabled>No admins found</SelectItem>}
                    {admins.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        <span className="font-medium">{a.name}</span>
                        <span className="text-gray-400 mx-1">—</span>
                        <span className="text-gray-500">{a.schoolName || 'No School'}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <input
                  value={dmSubject}
                  onChange={(e) => setDmSubject(e.target.value)}
                  placeholder="Message Subject"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                <Button onClick={handleSendDirect} className="bg-gradient-to-r from-emerald-600 to-emerald-600">
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
              <CardTitle>Broadcast to All Admins</CardTitle>
              <CardDescription>Send an announcement or notification to all school administrators at once.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-600" />
                <p className="text-sm text-emerald-700">
                  This message will be sent to <span className="font-semibold">{admins.length} admin{admins.length !== 1 ? 's' : ''}</span> across all schools.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <input
                  value={bcSubject}
                  onChange={(e) => setBcSubject(e.target.value)}
                  placeholder="Announcement Subject"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                <Button onClick={handleSendBroadcast} className="bg-gradient-to-r from-emerald-600 to-emerald-600">
                  <Bell className="w-4 h-4 mr-2" />
                  Send Broadcast to All Admins
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
                <CardDescription>View all messages and broadcasts sent by you to admins.</CardDescription>
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
                  <p className="mt-1 text-sm text-gray-500">Use the tabs above to send your first message or broadcast to admins.</p>
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
                          <div className={`p-2 rounded-full ${comm.type === 'BROADCAST' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {comm.type === 'BROADCAST' ? <Bell className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-800 text-lg">{comm.subject}</h4>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${comm.type === 'BROADCAST' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
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
      </Tabs>
    </div>
  );
};

export default SuperAdminCommunications;
