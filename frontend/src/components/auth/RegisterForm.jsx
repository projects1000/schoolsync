import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Phone, Lock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const RegisterForm = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'superadmin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again."
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 8 characters long."
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('=== FRONTEND REGISTRATION DEBUG ===');
      console.log('Attempting registration with:', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      });

      const response = await fetch(formData.role === 'superadmin' ? '/api/auth/register-superadmin' : '/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role,
        }),
      });

      console.log('Backend response status:', response.status);
      console.log('Backend response ok:', response.ok);

      if (response.ok) {
        const userData = await response.json();
        toast({
          title: "Registration Successful! 🎉",
          description: `Account created for ${userData.name}. You can now log in.`
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'superadmin'
        });
        
        // Call success callback or switch to login
        if (onRegisterSuccess) {
          onRegisterSuccess(userData);
        } else {
          onSwitchToLogin();
        }
        return;
      }

      // Handle registration error
      const errorData = await response.json();
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errorData.message || "Unable to create account. Please try again."
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Unable to connect to server. Please check your connection and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ duration: 0.8, delay: 0.2 }} 
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Create Super Admin Account</h3>
          <p className="text-gray-600">Register as a new Super Administrator</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserCheck className="w-4 h-4 inline mr-2" />
              Role
            </label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="superadmin">Super Admin</option>
              <option value="admin">School Admin</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
              placeholder="Enter your full name" 
              required 
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
              placeholder="Enter your email" 
              required 
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm font-medium select-none">+91</span>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone.replace(/^\+91\s?/, '')} 
                onChange={(e) => { const digits = e.target.value.replace(/\D/g, '').slice(0, 10); handleChange({ target: { name: 'phone', value: '+91 ' + digits } }); }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg rounded-l-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                placeholder="9876543210" 
                required 
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                value={formData.password} 
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                placeholder="Create a strong password" 
                required 
                minLength={8}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Confirm Password
            </label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                placeholder="Re-enter your password" 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-medium transition-all transform hover:scale-105"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Create Super Admin Account
              </>
            )}
          </Button>
        </form>

        {/* Switch to Login */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Already have an account?{' '}
            <button 
              onClick={onSwitchToLogin}
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              Sign In Here
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterForm;