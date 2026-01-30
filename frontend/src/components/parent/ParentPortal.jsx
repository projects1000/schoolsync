import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, CreditCard, MessageSquare, Download, Bell, Star, X, Send, ChevronsUpDown, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ParentPortal = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState({ subject: '', message: '' });
  const { toast } = useToast();

  const [students] = useLocalStorage('students', []);
  const [teachers] = useLocalStorage('teachers', []);
  const [attendance] = useLocalStorage('attendance', {});
  const [invoices] = useLocalStorage('invoices', []);
  const [communications, setCommunications] = useLocalStorage('communications', []);
  const [academics] = useLocalStorage('academics', []);

  // Get children for this parent
  const children = useMemo(() => 
    students.filter(student => student.parentId === currentUser?.id), 
    [students, currentUser]
  );

  const child = children[0]; // For now, handle single child
  
  const childAttendance = useMemo(() => {
    if (!child) return [];
    return attendance[child.id] || [];
  }, [child, attendance]);

  const childInvoices = useMemo(() => 
    invoices.filter(invoice => invoice.studentId === child?.id),
    [invoices, child]
  );

  const childMessages = useMemo(() => 
    communications.filter(comm => 
      comm.recipients.includes(currentUser?.id) && 
      comm.type === 'parent'
    ),
    [communications, currentUser]
  );

  const teacher = useMemo(() => 
    teachers.find(t => t.classId === child?.classId),
    [teachers, child]
  );

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    doc.text(`Progress Report - ${child?.name}`, 20, 20);
    
    const attendanceData = childAttendance.slice(0, 10).map(a => [a.date, a.status, a.time || 'N/A']);
    
    doc.autoTable({
      head: [['Date', 'Status', 'Time']],
      body: attendanceData,
      startY: 40,
    });

    doc.save(`${child?.name}_report.pdf`);
    
    toast({
      title: "Report Downloaded",
      description: `Progress report for ${child?.name} has been downloaded.`,
    });
  };

  const handleSendMessage = () => {
    if (!composeData.subject || !composeData.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const newMessage = {
      id: Date.now(),
      senderName: currentUser.name,
      senderId: currentUser.id,
      recipients: [teacher?.id],
      subject: composeData.subject,
      body: composeData.message,
      date: new Date().toISOString(),
      readBy: [currentUser.id],
      type: 'parent'
    };

    setCommunications([...communications, newMessage]);
    setComposeData({ subject: '', message: '' });
    setIsComposing(false);
    
    toast({
      title: "Message Sent",
      description: `Your message has been sent to ${teacher?.name}.`,
    });
  };

  const attendancePercentage = childAttendance.length > 0 
    ? Math.round((childAttendance.filter(a => a.status === 'present' || a.status === 'late').length / childAttendance.length) * 100) 
    : 100;

  if (children.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-lg shadow-sm">
        No child assigned to this parent account. Please contact administration.
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isComposing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.9 }} 
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Compose Message to {teacher?.name}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsComposing(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <input 
                  value={composeData.subject} 
                  onChange={(e) => setComposeData({...composeData, subject: e.target.value})} 
                  placeholder="Subject" 
                  className="w-full p-2 border rounded-lg" 
                />
                <textarea 
                  value={composeData.message} 
                  onChange={(e) => setComposeData({...composeData, message: e.target.value})} 
                  placeholder="Your message..." 
                  rows={5} 
                  className="w-full p-2 border rounded-lg" 
                />
                <div className="flex justify-end">
                  <Button onClick={handleSendMessage}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Parent Portal</h1>
              <p className="text-gray-600 mt-1">Track your child's progress and activities</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => setActiveTab('messages')} variant="outline" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </Button>
              <Button 
                onClick={handleDownloadReport} 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'attendance', label: 'Attendance', icon: Calendar },
                { id: 'fees', label: 'Fees', icon: CreditCard },
                { id: 'messages', label: 'Messages', icon: MessageSquare }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'border-purple-500 text-purple-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">Child Name</p>
                        <p className="text-2xl font-bold text-gray-900">{child?.name}</p>
                      </div>
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Attendance</p>
                        <p className="text-2xl font-bold text-gray-900">{attendancePercentage}%</p>
                      </div>
                      <Calendar className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">Messages</p>
                        <p className="text-2xl font-bold text-gray-900">{childMessages.length}</p>
                      </div>
                      <MessageSquare className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Attendance Records</h3>
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {childAttendance.slice(0, 10).map((record, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === 'present' 
                                ? 'bg-green-100 text-green-800' 
                                : record.status === 'absent'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.time || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'fees' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Fee History</h3>
                <div className="space-y-3">
                  {childInvoices.map((invoice, index) => (
                    <div key={invoice.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">Invoice #{invoice.id}</p>
                          <p className="text-sm text-gray-600">{invoice.description}</p>
                          <p className="text-sm text-gray-500">Due: {invoice.dueDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">₹{invoice.amount}</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            invoice.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : invoice.status === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Messages</h3>
                  <Button 
                    onClick={() => setIsComposing(true)} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Compose Message
                  </Button>
                </div>
                <div className="space-y-3">
                  {childMessages.map((message, index) => (
                    <motion.div 
                      key={message.id} 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: index * 0.1 }} 
                      className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                        !message.readBy.includes(currentUser.id) 
                          ? 'border-blue-200 bg-blue-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-800">{message.senderName}</p>
                          <p className="text-sm text-gray-500">{new Date(message.date).toLocaleString()}</p>
                        </div>
                        {!message.readBy.includes(currentUser.id) && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">{message.subject}</h4>
                      <p className="text-gray-600 text-sm">{message.body}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ParentPortal;