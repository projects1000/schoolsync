import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, School, Users, BookOpen, Heart, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import RegisterForm from './RegisterForm';


const LoginPage = ({ onLogin }) => {
  const [showRegister, setShowRegister] = useState(false);

  const handleRegisterSuccess = (userData) => {
    setShowRegister(false);
    // Optionally auto-login the user or show success message
  };

  const switchToLogin = () => setShowRegister(false);
  const switchToRegister = () => setShowRegister(true);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <motion.div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-xl" animate={{ x: [0, 100, 0], y: [0, -100, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
        <motion.div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-xl" animate={{ x: [0, -150, 0], y: [0, 100, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        <Branding />
        {showRegister ? (
          <RegisterForm
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={switchToLogin}
          />
        ) : (
          <LoginForm
            onLogin={onLogin}
            onSwitchToRegister={switchToRegister}
          />
        )}
      </div>
    </div>
  );
};

const Branding = () => (
  <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="text-white space-y-8 text-center lg:text-left">
    <div className="space-y-4">
      <motion.div className="flex items-center justify-center lg:justify-start space-x-3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><School className="w-8 h-8" /></div>
        <h1 className="text-3xl font-bold">Little Steps</h1>
      </motion.div>
      <motion.h2 className="text-5xl lg:text-6xl font-bold leading-tight" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>Playschool<span className="block text-yellow-300">Management</span></motion.h2>
      <motion.p className="text-xl text-white/80 max-w-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>Comprehensive solution for managing students, teachers, attendance, and parent communication</motion.p>
    </div>
    <motion.div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
      <div className="text-center"><div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm mb-2 mx-auto w-fit"><Users className="w-6 h-6" /></div><p className="text-sm">Student Management</p></div>
      <div className="text-center"><div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm mb-2 mx-auto w-fit"><BookOpen className="w-6 h-6" /></div><p className="text-sm">Learning Tracking</p></div>
      <div className="text-center"><div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm mb-2 mx-auto w-fit"><Heart className="w-6 h-6" /></div><p className="text-sm">Parent Portal</p></div>
    </motion.div>
  </motion.div>
);

const LoginForm = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'superadmin' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Debug logging
      console.log('=== FRONTEND LOGIN DEBUG ===');
      console.log('Attempting login with:', {
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      // Try backend authentication first (since you have PostgreSQL)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      console.log('Backend response status:', response.status);
      console.log('Backend response ok:', response.ok);

      if (response.ok) {
        const userData = await response.json();
        // Save auth token for future API calls
        if (userData.token) {
          localStorage.setItem('authToken', userData.token);
        }
        onLogin(userData);
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${userData.name}!`
        });
        return;
      }

      // Backend authentication failed - show error
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Unable to connect to server. Please check your credentials and try again."
      });
      setIsLoading(false);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // No demo credentials - all authentication must go through backend

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="w-full max-w-md mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8"><h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h3><p className="text-gray-600">Sign in to your account</p></div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Role</label><select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"><option value="superadmin">Super Admin</option><option value="admin">School Admin</option><option value="teacher">Teacher</option><option value="parent">Parent</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="Enter your email" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Password</label><div className="relative"><input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="Enter your password" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div></div>
          <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-all transform hover:scale-105">{isLoading ? <div className="flex items-center justify-center space-x-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Signing in...</span></div> : 'Sign In'}</Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-4">Enter your credentials to access the system</p>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need to create a Super Admin account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-green-600 hover:text-green-700 font-medium transition-colors inline-flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Register Here
              </button>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};



export default LoginPage;