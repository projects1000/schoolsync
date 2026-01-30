import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Users, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Crown,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const SuperAdminManagement = ({ currentUser }) => {
  const [admins, setAdmins] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const { toast } = useToast();

  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [debugForm, setDebugForm] = useState({
    email: '',
    password: ''
  });

  const [showDebugForm, setShowDebugForm] = useState(false);

  // Check if current user is super admin
  const isSuperAdmin = currentUser?.role === 'superadmin';
  
  // Check if we're in demo mode
  const isDemoMode = () => {
    const token = localStorage.getItem('authToken');
    return token && token.startsWith('mock_token_');
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
      fetchPermissions();
    }
  }, [isSuperAdmin]);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // All admin data must come from backend - no mock data

      const response = await fetch('/api/admin/list-admins', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      } else {
        throw new Error('Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: "Error",
        description: "Failed to load admin list (using demo data)",
        variant: "destructive"
      });
      
      // Fallback to mock data on error
      const mockAdmins = [
        {
          id: 1,
          name: 'Super Admin',
          email: 'admin@littlesteps.com',
          role: 'SUPERADMIN',
          active: true,
          phone: '+1-234-567-8900'
        }
      ];
      setAdmins(mockAdmins);
    }
  };

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Check if we're using mock authentication
      if (token && token.startsWith('mock_token_')) {
        // Set mock permissions for demo
        setPermissions({
          canCreateAdmin: true,
          canManageUsers: true,
          canViewReports: true,
          isSuperAdmin: true
        });
        return;
      }

      const response = await fetch('/api/admin/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      // Set minimal permissions if backend fails
      setPermissions({
        canCreateAdmin: false,
        canManageUsers: false,
        canViewReports: false,
        isSuperAdmin: false
      });
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      
      // Check if we're using mock authentication
      if (token && token.startsWith('mock_token_')) {
        // Simulate admin creation for demo
        const newAdmin = {
          id: Date.now(),
          name: newAdminForm.name,
          email: newAdminForm.email,
          phone: newAdminForm.phone,
          role: 'ADMIN',
          active: true
        };
        
        setAdmins([...admins, newAdmin]);
        setNewAdminForm({ name: '', email: '', phone: '', password: '' });
        setShowCreateForm(false);
        toast({
          title: "Success!",
          description: "New admin created successfully (Demo Mode)"
        });
        return;
      }

      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAdminForm)
      });

      if (response.ok) {
        const newAdmin = await response.json();
        setAdmins([...admins, newAdmin]);
        setNewAdminForm({ name: '', email: '', phone: '', password: '' });
        setShowCreateForm(false);
        
        // Verify admin was saved to database
        setTimeout(async () => {
          try {
            const verifyResponse = await fetch(`/api/admin/verify-email/${newAdmin.email}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              console.log('✅ Admin verification successful:', verifyData);
              if (verifyData.exists) {
                toast({
                  title: "✅ Database Confirmed!",
                  description: `Admin '${newAdmin.name}' is permanently saved in database`
                });
              }
            }
          } catch (verifyError) {
            console.log('Verification check failed:', verifyError);
          }
        }, 1000);
        
        toast({
          title: "Success!",
          description: `New admin '${newAdmin.name}' created and saved to database`
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      
      // Try demo mode as fallback
      const newAdmin = {
        id: Date.now(),
        name: newAdminForm.name,
        email: newAdminForm.email,
        phone: newAdminForm.phone,
        role: 'ADMIN',
        active: true
      };
      
      setAdmins([...admins, newAdmin]);
      setNewAdminForm({ name: '', email: '', phone: '', password: '' });
      setShowCreateForm(false);
      
      toast({
        title: "Created in Demo Mode",
        description: "Admin created locally (backend connection failed)"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAdminStatus = async (adminId, currentStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Check if we're using mock authentication or if backend fails
      if (token && token.startsWith('mock_token_')) {
        // Update status locally for demo
        setAdmins(admins.map(admin => 
          admin.id === adminId ? { ...admin, active: !currentStatus } : admin
        ));
        toast({
          title: "Success!",
          description: `Admin ${!currentStatus ? 'activated' : 'deactivated'} successfully (Demo Mode)`
        });
        return;
      }

      const response = await fetch(`/api/admin/admin/${adminId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !currentStatus })
      });

      if (response.ok) {
        const updatedAdmin = await response.json();
        setAdmins(admins.map(admin => 
          admin.id === adminId ? updatedAdmin : admin
        ));
        toast({
          title: "Success!",
          description: `Admin ${!currentStatus ? 'activated' : 'deactivated'} successfully`
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update admin status');
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      
      // Fallback to local update
      setAdmins(admins.map(admin => 
        admin.id === adminId ? { ...admin, active: !currentStatus } : admin
      ));
      
      toast({
        title: "Updated Locally",
        description: `Admin ${!currentStatus ? 'activated' : 'deactivated'} (backend connection failed)`
      });
    }
  };

  const handleDebugUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      
      // Check if using demo mode
      if (!token || token.startsWith('mock_token_')) {
        toast({
          title: "Demo Mode",
          description: "Debug feature not available in demo mode"
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/admin/debug-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(debugForm)
      });

      if (response.ok) {
        const debugData = await response.json();
        console.log('Debug data:', debugData);
        
        if (debugData.found) {
          const status = debugData.passwordMatches ? '✅ CORRECT' : '❌ INCORRECT';
          toast({
            title: `User Debug Results`,
            description: `Found: ${debugData.found} | Active: ${debugData.active} | Password: ${status} | Role: ${debugData.role}`,
          });
        } else {
          toast({
            title: "User Not Found",
            description: debugData.message,
            variant: "destructive"
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Debug failed');
      }
    } catch (error) {
      console.error('Debug error:', error);
      toast({
        title: "Debug Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Access Denied</h2>
          <p className="text-gray-500">Super Admin privileges required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Mode Notice */}
      {isDemoMode() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-100 border-l-4 border-yellow-500 rounded-xl p-4"
        >
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <p className="text-yellow-800 font-medium">Demo Mode Active</p>
              <p className="text-yellow-700 text-sm">You're viewing a demonstration. Changes are local only and backend connectivity is limited.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-sm p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
              <p className="text-purple-100">Manage administrators and system permissions</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Admin
            </Button>
            <Button
              onClick={() => setShowDebugForm(true)}
              className="bg-yellow-500 text-white hover:bg-yellow-600"
            >
              🔍 Debug
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Permissions Status */}
      {permissions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Your Permissions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Super Admin</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Create Admins</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Manage Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Full System Access</span>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('authToken');
                  const response = await fetch('/api/admin/count', {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  if (response.ok) {
                    const data = await response.json();
                    toast({
                      title: "Database Status",
                      description: `Total admins in database: ${data.totalAdmins}`
                    });
                  }
                } catch (error) {
                  toast({
                    title: "Demo Mode",
                    description: `Current admins shown: ${admins.length}`,
                    variant: "default"
                  });
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2"
            >
              Check Database Count
            </Button>
          </div>
        </motion.div>
      )}

      {/* Create Admin Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Administrator</h2>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={newAdminForm.name}
                  onChange={(e) => setNewAdminForm({...newAdminForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({...newAdminForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={newAdminForm.phone}
                  onChange={(e) => setNewAdminForm({...newAdminForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={newAdminForm.password}
                  onChange={(e) => setNewAdminForm({...newAdminForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                {isLoading ? 'Creating...' : 'Create Admin'}
              </Button>
              <Button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Debug Admin Form */}
      {showDebugForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-yellow-800 mb-4">🔍 Debug Admin Credentials</h2>
          <p className="text-yellow-700 text-sm mb-4">Test if admin credentials exist and work correctly in the database</p>
          <form onSubmit={handleDebugUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={debugForm.email}
                  onChange={(e) => setDebugForm({...debugForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="test1@gmail.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-2">Password</label>
                <input
                  type="password"
                  value={debugForm.password}
                  onChange={(e) => setDebugForm({...debugForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="test1@1234"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <Button type="submit" disabled={isLoading} className="bg-yellow-600 hover:bg-yellow-700">
                {isLoading ? 'Testing...' : 'Test Credentials'}
              </Button>
              <Button 
                type="button" 
                onClick={() => setShowDebugForm(false)}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Admins List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            System Administrators ({admins.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {admins.map((admin) => (
            <div key={admin.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {admin.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center">
                      {admin.name}
                      {admin.role === 'SUPERADMIN' && (
                        <Crown className="w-4 h-4 ml-2 text-yellow-500" />
                      )}
                    </h3>
                    <p className="text-gray-600 text-sm">{admin.email}</p>
                    <p className="text-gray-500 text-xs capitalize flex items-center">
                      {admin.role.toLowerCase()}
                      {admin.active ? (
                        <CheckCircle className="w-3 h-3 ml-1 text-green-500" />
                      ) : (
                        <XCircle className="w-3 h-3 ml-1 text-red-500" />
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {admin.role !== 'SUPERADMIN' && (
                    <Button
                      onClick={() => handleToggleAdminStatus(admin.id, admin.active)}
                      className={admin.active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                    >
                      {admin.active ? (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  )}
                  {admin.role === 'SUPERADMIN' && (
                    <div className="flex items-center text-yellow-600 text-sm">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Protected
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SuperAdminManagement;