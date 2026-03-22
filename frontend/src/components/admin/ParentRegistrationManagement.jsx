import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Phone, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ParentRegistrationManagement = () => {
  const [formData, setFormData] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    studentName: '',
    studentClass: ''
  });
  const [registrationCode, setRegistrationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call backend to create parent registration and then create user account
      const response = await fetch('/api/admin/create-parent-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          parentName: formData.parentName,
          parentEmail: formData.parentEmail,
          parentPhone: formData.parentPhone,
          studentName: formData.studentName,
          studentClass: formData.studentClass
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Now register the parent with a default password using the registration code
        const defaultPassword = `parent${String(Date.now()).slice(-4)}`;
        
        const registerResponse = await fetch('/api/auth/register-parent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.parentName,
            email: formData.parentEmail,
            phone: formData.parentPhone,
            password: defaultPassword,
            confirmPassword: defaultPassword,
            role: 'parent',
            registrationCode: data.registration.registrationCode
          }),
        });

        if (registerResponse.ok) {
          const generatedCode = `${formData.parentEmail} / ${defaultPassword}`;
          setRegistrationCode(generatedCode);
          setShowCode(true);
          toast({
            title: "Parent Account Created Successfully!",
            description: `Login: ${formData.parentEmail} / ${defaultPassword}`
          });
          
          // Reset form
          setFormData({
            parentName: '',
            parentEmail: '',
            parentPhone: '',
            studentName: '',
            studentClass: ''
          });
        } else {
          throw new Error('Failed to register parent user');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create parent registration");
      }
    } catch (error) {
      console.error('Registration creation error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Unable to create parent account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(registrationCode);
    toast({
      title: "Copied!",
      description: "Registration code copied to clipboard"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Parent Registration Management</h1>
        <p className="text-gray-600">Create parent accounts with instant login credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border"
        >
          <div className="flex items-center mb-6">
            <UserPlus className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Add New Parent</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Name *
                </label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Emma Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Email *
              </label>
              <input
                type="email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john.doe@email.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Phone *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm font-medium select-none">+91</span>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone.replace(/^\+91\s?/, '')}
                    onChange={(e) => { const digits = e.target.value.replace(/\D/g, '').slice(0, 10); handleChange({ target: { name: 'parentPhone', value: '+91 ' + digits } }); }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg rounded-l-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Class *
                </label>
                <select
                  name="studentClass"
                  value={formData.studentClass}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Class</option>
                  <option value="Playgroup A">Playgroup A</option>
                  <option value="Playgroup B">Playgroup B</option>
                  <option value="Nursery A">Nursery A</option>
                  <option value="Nursery B">Nursery B</option>
                  <option value="KG A">KG A</option>
                  <option value="KG B">KG B</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Creating Registration...
                </div>
              ) : (
                'Create Parent Account'
              )}
            </Button>
          </form>
        </motion.div>

        {/* Registration Code Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border"
        >
          <div className="flex items-center mb-6">
            <Mail className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Registration Code</h2>
          </div>

          {showCode ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-800 mb-2">
                      Parent Account Created!
                    </h3>
                    <div className="bg-white border rounded-lg p-3 font-mono text-sm break-all">
                      {registrationCode}
                    </div>
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    className="ml-2 p-2 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Share these credentials with the parent
                  </li>
                  <li className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Send via Email or WhatsApp
                  </li>
                  <li className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Parent can login immediately at the login page
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => {
                  setShowCode(false);
                  setRegistrationCode('');
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white"
              >
                Create Another Registration
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No Registration Code Generated
              </h3>
              <p className="text-gray-500">
                Fill out the form and click "Generate Registration Code" to create a new parent registration.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Sample Codes for Testing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-gray-50 rounded-xl p-6 border"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Sample Registration Codes (For Testing)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="font-mono text-sm text-gray-700 mb-2">PARENT_JOHN_DOE_1234567890</div>
            <div className="text-xs text-gray-500">For: John Doe, Phone: 1234567890</div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="font-mono text-sm text-gray-700 mb-2">PARENT_JANE_SMITH_9876543210</div>
            <div className="text-xs text-gray-500">For: Jane Smith, Phone: 9876543210</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ParentRegistrationManagement;