import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bell, Users, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const Communications = ({ currentUser }) => {
  const [communications, setCommunications] = useLocalStorage('communications', []);
  const [users] = useLocalStorage('users', []);
  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState({ type: 'announcement', subject: '', body: '', recipients: 'all' });
  const { toast } = useToast();

  const teachers = users.filter(u => u.role === 'teacher');
  const parents = users.filter(u => u.role === 'parent');

  const handleSend = () => {
    if (!composeData.subject || !composeData.body) {
      toast({ title: "Incomplete", description: "Subject and body are required.", variant: "destructive" });
      return;
    }

    let recipientIds = [];
    let recipientNames = [];

    if (composeData.recipients === 'all') {
      recipientIds = [...teachers.map(t => t.id), ...parents.map(p => p.id)];
      recipientNames = ['All Staff & Parents'];
    } else if (composeData.recipients === 'all-teachers') {
      recipientIds = teachers.map(t => t.id);
      recipientNames = ['All Teachers'];
    } else if (composeData.recipients === 'all-parents') {
      recipientIds = parents.map(p => p.id);
      recipientNames = ['All Parents'];
    } else {
      const user = users.find(u => u.id === parseInt(composeData.recipients));
      if (user) {
        recipientIds = [user.id];
        recipientNames = [user.name];
      }
    }

    const newComm = {
      id: Date.now(),
      type: composeData.type,
      senderId: currentUser.id,
      senderName: currentUser.name,
      recipientIds,
      recipientNames,
      subject: composeData.subject,
      body: composeData.body,
      date: new Date().toISOString(),
      readBy: [currentUser.id]
    };

    setCommunications(prev => [newComm, ...prev]);
    setIsComposing(false);
    setComposeData({ type: 'announcement', subject: '', body: '', recipients: 'all' });
    toast({ title: "Sent!", description: `Your ${composeData.type} has been sent.` });
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {isComposing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Compose Message/Announcement</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsComposing(false)}><X className="w-5 h-5" /></Button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex space-x-2">
                  <Button variant={composeData.type === 'announcement' ? 'default' : 'outline'} onClick={() => setComposeData({...composeData, type: 'announcement'})}><Bell className="w-4 h-4 mr-2"/>Announcement</Button>
                  <Button variant={composeData.type === 'message' ? 'default' : 'outline'} onClick={() => setComposeData({...composeData, type: 'message'})}><Send className="w-4 h-4 mr-2"/>Message</Button>
                </div>
                <select value={composeData.recipients} onChange={(e) => setComposeData({...composeData, recipients: e.target.value})} className="w-full p-2 border rounded-lg">
                  <option value="all">All Staff & Parents</option>
                  <option value="all-teachers">All Teachers</option>
                  <option value="all-parents">All Parents</option>
                  <optgroup label="Specific Teacher">
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </optgroup>
                  <optgroup label="Specific Parent">
                    {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </optgroup>
                </select>
                <input value={composeData.subject} onChange={(e) => setComposeData({...composeData, subject: e.target.value})} placeholder="Subject" className="w-full p-2 border rounded-lg" />
                <textarea value={composeData.body} onChange={(e) => setComposeData({...composeData, body: e.target.value})} placeholder="Your message..." rows={6} className="w-full p-2 border rounded-lg" />
                <div className="flex justify-end">
                  <Button onClick={handleSend} className="bg-gradient-to-r from-blue-600 to-purple-600"><Send className="w-4 h-4 mr-2" />Send Now</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div><h1 className="text-2xl font-bold text-gray-800">Communications</h1><p className="text-gray-600 mt-1">Send announcements and messages</p></div>
          <Button onClick={() => setIsComposing(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 flex items-center space-x-2"><Send className="w-4 h-4" /><span>Compose New</span></Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Sent History</h3>
        <div className="space-y-4">
          {communications.map((comm, index) => (
            <motion.div key={comm.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    {comm.type === 'announcement' ? <Bell className="w-5 h-5 text-yellow-500" /> : <Send className="w-5 h-5 text-blue-500" />}
                    <h4 className="font-semibold text-gray-800">{comm.subject}</h4>
                  </div>
                  <p className="text-sm text-gray-500">Sent by: {comm.senderName} on {new Date(comm.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {comm.recipientNames.length > 1 || comm.recipientNames[0] === 'All Staff & Parents' || comm.recipientNames[0] === 'All Teachers' || comm.recipientNames[0] === 'All Parents' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span>To: {comm.recipientNames.join(', ')}</span>
                </div>
              </div>
              <p className="mt-3 text-gray-700">{comm.body}</p>
            </motion.div>
          ))}
          {communications.length === 0 && (
            <div className="text-center py-10">
              <Send className="mx-auto w-12 h-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-800">No Communications Sent</h3>
              <p className="mt-1 text-sm text-gray-500">Click "Compose New" to send your first message or announcement.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Communications;