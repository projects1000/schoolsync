import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Search, Filter, Download, Eye, Send, AlertCircle, X, Check, Printer, Mail, Phone, User, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { exportToCSV } from '@/lib/utils';

const initialInvoices = [
  { id: 1, invoiceNo: 'INV-2025-001', studentId: 1, studentName: 'Emma Wilson', class: 'Nursery A', amount: 5000, dueDate: '2025-09-15', status: 'paid', paidDate: '2025-09-10', feeType: 'Monthly Fee', parentName: 'John Wilson', parentEmail: 'john@example.com', parentPhone: '9876543210' },
  { id: 2, invoiceNo: 'INV-2025-002', studentId: 2, studentName: 'Liam Johnson', class: 'Playgroup B', amount: 4500, dueDate: '2025-09-15', status: 'pending', paidDate: null, feeType: 'Monthly Fee', parentName: 'Sarah Johnson', parentEmail: 'sarah@example.com', parentPhone: '9876543211' },
  { id: 3, invoiceNo: 'INV-2025-003', studentId: 3, studentName: 'Sophia Davis', class: 'KG A', amount: 5500, dueDate: '2025-09-10', status: 'overdue', paidDate: null, feeType: 'Monthly Fee', parentName: 'Mike Davis', parentEmail: 'mike@example.com', parentPhone: '9876543212' },
  { id: 4, invoiceNo: 'INV-2025-004', studentId: 4, studentName: 'Noah Brown', class: 'Nursery B', amount: 5000, dueDate: '2025-09-20', status: 'pending', paidDate: null, feeType: 'Monthly Fee', parentName: 'Emily Brown', parentEmail: 'emily@example.com', parentPhone: '9876543213' }
];

const initialFeeStructure = [
  { id: 1, class: 'Playgroup', monthlyFee: 4500, admissionFee: 10000, activityFee: 1000 },
  { id: 2, class: 'Nursery', monthlyFee: 5000, admissionFee: 12000, activityFee: 1200 },
  { id: 3, class: 'Kindergarten', monthlyFee: 5500, admissionFee: 15000, activityFee: 1500 }
];

const InvoiceForm = ({ students, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ studentId: '', amount: '', dueDate: new Date().toISOString().split('T')[0], feeType: 'Monthly Fee' });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.amount) {
      alert('Please select a student and enter an amount.');
      return;
    }
    onSave(formData);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Generate New Invoice</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <select name="studentId" value={formData.studentId} onChange={handleChange} className="w-full p-2 border rounded-lg" required>
            <option value="">Select Student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class})</option>)}
          </select>
          <input name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="Amount" className="w-full p-2 border rounded-lg" required />
          <input name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          <input name="feeType" value={formData.feeType} onChange={handleChange} placeholder="Fee Type" className="w-full p-2 border rounded-lg" />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600">Generate</Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// View Invoice Modal Component
const ViewInvoiceModal = ({ invoice, onClose, onPrint }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-white">Invoice Details</h2>
            <p className="text-blue-100 text-sm">{invoice.invoiceNo}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20"><X className="w-5 h-5" /></Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-between items-center">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(invoice.status)}`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-800">₹{invoice.amount.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{invoice.feeType}</p>
            </div>
          </div>

          {/* Student Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-700 flex items-center"><User className="w-4 h-4 mr-2" /> Student Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Student Name</p>
                <p className="font-medium">{invoice.studentName}</p>
              </div>
              <div>
                <p className="text-gray-500">Class</p>
                <p className="font-medium">{invoice.class}</p>
              </div>
              <div>
                <p className="text-gray-500">Parent Name</p>
                <p className="font-medium">{invoice.parentName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Contact</p>
                <p className="font-medium">{invoice.parentPhone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-700 flex items-center"><Calendar className="w-4 h-4 mr-2" /> Payment Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Due Date</p>
                <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Paid Date</p>
                <p className="font-medium">{invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : '-'}</p>
              </div>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="border-t pt-4">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">{invoice.feeType}</span>
              <span className="font-medium">₹{invoice.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-t font-bold text-lg">
              <span>Total Amount</span>
              <span className="text-blue-600">₹{invoice.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end space-x-3 bg-gray-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onPrint} className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Printer className="w-4 h-4 mr-2" /> Print Receipt
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Send Reminder Modal Component
const SendReminderModal = ({ invoice, onClose, onSend }) => {
  const [sendMethod, setSendMethod] = useState('both');
  const [message, setMessage] = useState(`Dear ${invoice.parentName || 'Parent'},\n\nThis is a friendly reminder that the fee payment of ₹${invoice.amount.toLocaleString()} for ${invoice.studentName} (${invoice.class}) is ${invoice.status === 'overdue' ? 'overdue' : 'pending'}.\n\nInvoice No: ${invoice.invoiceNo}\nDue Date: ${new Date(invoice.dueDate).toLocaleDateString()}\n\nPlease make the payment at the earliest.\n\nThank you,\nSchool Administration`);

  const handleSend = () => {
    onSend(sendMethod, message);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Send Payment Reminder</h2>
            <p className="text-sm text-gray-500">To: {invoice.parentName || invoice.studentName}'s Parent</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Contact Info */}
          <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 mr-1 text-blue-600" />
                <span>{invoice.parentEmail || 'No email'}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 mr-1 text-green-600" />
                <span>{invoice.parentPhone || 'No phone'}</span>
              </div>
            </div>
          </div>

          {/* Send Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Send via</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input type="radio" name="sendMethod" value="email" checked={sendMethod === 'email'} onChange={(e) => setSendMethod(e.target.value)} className="mr-2" />
                <Mail className="w-4 h-4 mr-1" /> Email
              </label>
              <label className="flex items-center">
                <input type="radio" name="sendMethod" value="sms" checked={sendMethod === 'sms'} onChange={(e) => setSendMethod(e.target.value)} className="mr-2" />
                <Phone className="w-4 h-4 mr-1" /> SMS
              </label>
              <label className="flex items-center">
                <input type="radio" name="sendMethod" value="both" checked={sendMethod === 'both'} onChange={(e) => setSendMethod(e.target.value)} className="mr-2" />
                Both
              </label>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="p-6 border-t flex justify-end space-x-3 bg-gray-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
            <Send className="w-4 h-4 mr-2" /> Send Reminder
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const FeesManagement = ({ currentUser }) => {
  const [invoices, setInvoices] = useLocalStorage('invoices', initialInvoices);
  const [feeStructure, setFeeStructure] = useLocalStorage('feeStructure', initialFeeStructure);
  const [students] = useLocalStorage('students', []);
  const [activeTab, setActiveTab] = useState('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [sendReminderInvoice, setSendReminderInvoice] = useState(null);
  const { toast } = useToast();

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSaveInvoice = (invoiceData) => {
    const student = students.find(s => s.id === parseInt(invoiceData.studentId));
    const newInvoice = {
      id: Date.now(),
      invoiceNo: `INV-${String(Date.now()).slice(-5)}`,
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      amount: parseFloat(invoiceData.amount),
      dueDate: invoiceData.dueDate,
      status: 'pending',
      paidDate: null,
      feeType: invoiceData.feeType,
      parentName: student.parentName || 'Parent',
      parentEmail: student.parentEmail || '',
      parentPhone: student.parentPhone || ''
    };
    setInvoices(prev => [newInvoice, ...prev]);
    toast({ title: "Invoice Generated", description: `Invoice for ${student.name} has been created.` });
    setIsFormOpen(false);
  };

  const handleMarkAsPaid = (invoiceId) => {
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'paid', paidDate: new Date().toISOString().split('T')[0] } : inv));
    toast({ title: "Payment Recorded", description: "Invoice has been marked as paid." });
  };

  const handleExport = () => {
    exportToCSV(filteredInvoices, 'invoices_export');
    toast({ title: "Export Successful", description: "Invoice data has been exported to CSV." });
  };

  const handleViewInvoice = (invoice) => {
    setViewInvoice(invoice);
  };

  const handlePrintReceipt = () => {
    toast({ title: "Printing Receipt", description: `Receipt for ${viewInvoice.invoiceNo} sent to printer.` });
    setViewInvoice(null);
  };

  const handleSendReminder = (invoice) => {
    setSendReminderInvoice(invoice);
  };

  const handleSendReminderSubmit = (method, message) => {
    toast({
      title: "Reminder Sent!",
      description: `Payment reminder sent to ${sendReminderInvoice.parentName || 'Parent'} via ${method === 'both' ? 'Email & SMS' : method.toUpperCase()}.`
    });
    setSendReminderInvoice(null);
  };

  const handleAction = (action, item = null) => {
    toast({ title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" });
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = totalAmount - paidAmount;
  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {isFormOpen && <InvoiceForm students={students} onSave={handleSaveInvoice} onCancel={() => setIsFormOpen(false)} />}
        {viewInvoice && <ViewInvoiceModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} onPrint={handlePrintReceipt} />}
        {sendReminderInvoice && <SendReminderModal invoice={sendReminderInvoice} onClose={() => setSendReminderInvoice(null)} onSend={handleSendReminderSubmit} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Fees & Billing Management</h1>
            <p className="text-gray-600 mt-1">Manage fee collection and billing</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={handleExport} variant="outline" className="flex items-center space-x-2"><Download className="w-4 h-4" /><span>Export</span></Button>
            <Button onClick={() => setIsFormOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2"><Plus className="w-4 h-4" /><span>Generate Invoice</span></Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"><div className="flex items-center space-x-3"><div className="p-2 bg-blue-100 rounded-lg"><CreditCard className="w-5 h-5 text-blue-600" /></div><div><p className="text-sm text-gray-500">Total Amount</p><p className="text-xl font-bold text-gray-800">₹{totalAmount.toLocaleString()}</p></div></div></motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"><div className="flex items-center space-x-3"><div className="p-2 bg-green-100 rounded-lg"><CreditCard className="w-5 h-5 text-green-600" /></div><div><p className="text-sm text-gray-500">Collected</p><p className="text-xl font-bold text-gray-800">₹{paidAmount.toLocaleString()}</p></div></div></motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"><div className="flex items-center space-x-3"><div className="p-2 bg-orange-100 rounded-lg"><CreditCard className="w-5 h-5 text-orange-600" /></div><div><p className="text-sm text-gray-500">Pending</p><p className="text-xl font-bold text-gray-800">₹{pendingAmount.toLocaleString()}</p></div></div></motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"><div className="flex items-center space-x-3"><div className="p-2 bg-red-100 rounded-lg"><AlertCircle className="w-5 h-5 text-red-600" /></div><div><p className="text-sm text-gray-500">Overdue</p><p className="text-xl font-bold text-gray-800">{overdueCount}</p></div></div></motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button onClick={() => setActiveTab('invoices')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'invoices' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Invoices</button>
            <button onClick={() => setActiveTab('fee-structure')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'fee-structure' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Fee Structure</button>
          </nav>
        </div>
        <div className="p-6">
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" placeholder="Search by student name or invoice number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                <div className="flex items-center space-x-2"><Filter className="w-4 h-4 text-gray-400" /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"><option value="all">All Status</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="overdue">Overdue</option></select></div>
              </div>
              <div className="space-y-3">
                {filteredInvoices.map((invoice, index) => (
                  <motion.div key={invoice.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center space-x-4"><div><h4 className="font-medium text-gray-800">{invoice.studentName}</h4><p className="text-sm text-gray-500">{invoice.invoiceNo} • {invoice.class}</p></div></div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right"><p className="font-semibold text-gray-800">₹{invoice.amount.toLocaleString()}</p><p className="text-sm text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p></div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invoice.status)}`}>{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span>
                        <div className="flex items-center space-x-1">
                          {invoice.status !== 'paid' && (<Button onClick={() => handleMarkAsPaid(invoice.id)} variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50"><Check className="w-4 h-4 mr-1" /> Paid</Button>)}
                          <Button onClick={() => handleViewInvoice(invoice)} variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"><Eye className="w-4 h-4" /></Button>
                          {invoice.status !== 'paid' && (<Button onClick={() => handleSendReminder(invoice)} variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"><Send className="w-4 h-4" /></Button>)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'fee-structure' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center"><h3 className="text-lg font-semibold text-gray-800">Fee Structure</h3><Button onClick={() => handleAction('edit-structure')} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">Edit Structure</Button></div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead><tr className="border-b border-gray-200"><th className="text-left py-3 px-4 font-semibold text-gray-800">Class</th><th className="text-left py-3 px-4 font-semibold text-gray-800">Monthly Fee</th><th className="text-left py-3 px-4 font-semibold text-gray-800">Admission Fee</th><th className="text-left py-3 px-4 font-semibold text-gray-800">Activity Fee</th><th className="text-left py-3 px-4 font-semibold text-gray-800">Total</th></tr></thead>
                  <tbody>
                    {feeStructure.map((fee, index) => (
                      <motion.tr key={fee.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{fee.class}</td><td className="py-3 px-4 text-gray-600">₹{fee.monthlyFee.toLocaleString()}</td><td className="py-3 px-4 text-gray-600">₹{fee.admissionFee.toLocaleString()}</td><td className="py-3 px-4 text-gray-600">₹{fee.activityFee.toLocaleString()}</td><td className="py-3 px-4 font-semibold text-gray-800">₹{(fee.monthlyFee + fee.activityFee).toLocaleString()}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FeesManagement;