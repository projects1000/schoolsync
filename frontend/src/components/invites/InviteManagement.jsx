import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Mail, Clock, CheckCircle, XCircle, RefreshCw, Copy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const InviteForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'TEACHER'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSave(formData);
      setFormData({ email: '', role: 'TEACHER' });
    } catch (error) {
      console.error('Error creating invite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.9, y: 20 }} 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Send Invitation</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <XCircle className="w-5 h-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="TEACHER">Teacher</option>
              <option value="PARENT">Parent</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const InviteCard = ({ invite, onResend, onCancel }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'EXPIRED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/accept-invite/${invite.inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link Copied", description: "Invite link copied to clipboard" });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Mail className="w-5 h-5 text-gray-400" />
          <div>
            <h3 className="font-medium text-gray-900">{invite.email}</h3>
            <p className="text-sm text-gray-500">{invite.role}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(invite.status)}
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invite.status)}`}>
            {invite.status}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Created:</span>
          <span>{formatDate(invite.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span>Expires:</span>
          <span>{formatDate(invite.expiresAt)}</span>
        </div>
        {invite.acceptedAt && (
          <div className="flex justify-between">
            <span>Accepted:</span>
            <span>{formatDate(invite.acceptedAt)}</span>
          </div>
        )}
      </div>

      {invite.status === 'PENDING' && (
        <div className="flex items-center space-x-2">
          <Button
            onClick={copyInviteLink}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-1" />
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          <Button
            onClick={() => onResend(invite.id)}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onCancel(invite.id)}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            Cancel
          </Button>
        </div>
      )}
    </motion.div>
  );
};

const InviteManagement = ({ currentUser }) => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [stats, setStats] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    loadInvites();
    loadStats();
  }, []);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/invites', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInvites(data.content || data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load invites",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading invites:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/invites/statistics', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateInvite = async (inviteData) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inviteData)
      });

      if (response.ok) {
        const newInvite = await response.json();
        setInvites(prev => [newInvite, ...prev]);
        setIsFormOpen(false);
        loadStats();
        toast({
          title: "Invitation Sent",
          description: `Invitation sent to ${inviteData.email}`
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create invite');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleResendInvite = async (inviteId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/invites/${inviteId}/resend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedInvite = await response.json();
        setInvites(prev => prev.map(inv => inv.id === updatedInvite.id ? updatedInvite : inv));
        toast({
          title: "Invitation Resent",
          description: "A new invitation has been sent"
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to resend invite');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancelInvite = async (inviteId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/invites/${inviteId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setInvites(prev => prev.map(inv => 
          inv.id === inviteId ? { ...inv, status: 'CANCELLED' } : inv
        ));
        loadStats();
        toast({
          title: "Invitation Cancelled",
          description: "The invitation has been cancelled"
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel invite');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredInvites = invites.filter(invite => {
    const matchesSearch = invite.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || invite.status === selectedStatus;
    const matchesRole = selectedRole === 'all' || invite.role === selectedRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {isFormOpen && (
          <InviteForm 
            onSave={handleCreateInvite} 
            onCancel={() => setIsFormOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Invite Management</h1>
            <p className="text-gray-600 mt-1">Send and manage user invitations</p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)} 
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Send Invitation
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }} 
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Invites</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalInvites || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">{stats.pendingInvites || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-xl font-bold text-gray-900">{stats.acceptedInvites || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-blue-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">%</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Acceptance Rate</p>
              <p className="text-xl font-bold text-gray-900">{stats.acceptanceRate || 0}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }} 
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
      >
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="TEACHER">Teacher</option>
              <option value="PARENT">Parent</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Invites Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Loading invites...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvites.map((invite) => (
            <InviteCard
              key={invite.id}
              invite={invite}
              onResend={handleResendInvite}
              onCancel={handleCancelInvite}
            />
          ))}
        </div>
      )}

      {!loading && filteredInvites.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No invitations found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or send a new invitation.</p>
        </motion.div>
      )}
    </div>
  );
};

export default InviteManagement;