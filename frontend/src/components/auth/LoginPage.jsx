import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, Lock, Mail, ChevronDown, Loader2, ShieldCheck, Users, BookOpen, BarChart3, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ROLES = [
  { value: 'superadmin', label: 'Super Admin', icon: ShieldCheck, color: '#a78bfa' },
  { value: 'admin', label: 'School Admin', icon: BarChart3, color: '#60a5fa' },
  { value: 'teacher', label: 'Teacher', icon: BookOpen, color: '#34d399' },
  { value: 'parent', label: 'Parent', icon: Users, color: '#fbbf24' },
];

/* ── floating particle component ── */
const FloatingParticle = ({ delay, duration, x, y, size }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size, height: size,
      left: `${x}%`, top: `${y}%`,
      background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
    }}
    animate={{
      y: [0, -30, 0],
      x: [0, 15, 0],
      opacity: [0.2, 0.6, 0.2],
      scale: [1, 1.3, 1],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

/* ── animated stat counter ── */
const StatCounter = ({ end, label, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(end / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 40);
    return () => clearInterval(timer);
  }, [end]);
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-white">{count}{suffix}</p>
      <p className="text-[11px] text-indigo-200/60 mt-0.5">{label}</p>
    </div>
  );
};

/* ── pulsing ring component ── */
const PulsingRing = ({ size, delay, color }) => (
  <motion.div
    className="absolute rounded-full border"
    style={{ width: size, height: size, borderColor: color }}
    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
    transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'superadmin' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [activeRoleIdx, setActiveRoleIdx] = useState(0);
  const { toast } = useToast();

  // Cycle through feature highlights
  const features = [
    { icon: Users, title: 'Student Management', desc: 'Track enrollment, profiles & progress' },
    { icon: BookOpen, title: 'Learning Tracker', desc: 'Curriculum planning & assessments' },
    { icon: BarChart3, title: 'Smart Analytics', desc: 'Real-time insights & reports' },
    { icon: Sparkles, title: 'Parent Portal', desc: 'Seamless home-school connection' },
  ];
  const [featureIdx, setFeatureIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFeatureIdx(i => (i + 1) % features.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password, role: formData.role }),
      });
      if (response.ok) {
        const userData = await response.json();
        if (userData.token) localStorage.setItem('authToken', userData.token);
        onLogin(userData);
        toast({ title: 'Welcome back!', description: `Signed in as ${userData.name}` });
        return;
      }
      toast({ variant: 'destructive', title: 'Authentication Failed', description: 'Invalid credentials. Please check your email and password.' });
    } catch {
      toast({ variant: 'destructive', title: 'Connection Error', description: 'Unable to reach the server. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'role') {
      setActiveRoleIdx(ROLES.findIndex(r => r.value === e.target.value));
    }
  };

  const selectedRole = ROLES[activeRoleIdx];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#050a18' }}>

      {/* ── Animated background layer ── */}
      <div className="absolute inset-0">
        {/* Mesh gradient blobs */}
        <motion.div className="absolute w-[500px] h-[500px] rounded-full" style={{ top: '-10%', right: '-5%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute w-[600px] h-[600px] rounded-full" style={{ bottom: '-15%', left: '-10%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)' }}
          animate={{ scale: [1.1, 1, 1.1], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute w-[400px] h-[400px] rounded-full" style={{ top: '40%', left: '30%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 60%)' }}
          animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }} />

        {/* Floating particles */}
        <FloatingParticle delay={0} duration={6} x={10} y={20} size={8} />
        <FloatingParticle delay={1} duration={8} x={85} y={15} size={6} />
        <FloatingParticle delay={2} duration={7} x={70} y={70} size={10} />
        <FloatingParticle delay={0.5} duration={9} x={20} y={80} size={5} />
        <FloatingParticle delay={3} duration={6} x={50} y={10} size={7} />
        <FloatingParticle delay={1.5} duration={10} x={90} y={60} size={4} />
        <FloatingParticle delay={2.5} duration={7} x={35} y={50} size={6} />
        <FloatingParticle delay={0.8} duration={8} x={60} y={85} size={8} />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 w-full max-w-[1100px] mx-auto grid lg:grid-cols-[1.15fr_1fr] items-stretch m-4">

        {/* ═══════════════ LEFT PANEL ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="hidden lg:flex flex-col justify-between p-10 rounded-l-[28px] relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #312e81 0%, #4338ca 40%, #6366f1 100%)' }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40" style={{ background: 'radial-gradient(circle at top right, rgba(255,255,255,0.08) 0%, transparent 60%)' }} />
          <PulsingRing size={120} delay={0} color="rgba(255,255,255,0.06)" />
          <motion.div className="absolute bottom-20 right-8 w-3 h-3 rounded-full bg-emerald-400/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.div className="absolute top-32 right-16 w-2 h-2 rounded-full bg-violet-300/40"
            animate={{ scale: [1, 2, 1], opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 3, delay: 1, repeat: Infinity }} />

          {/* Top section */}
          <div className="relative z-10">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center space-x-3 mb-10">
              <div className="relative">
                <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm border border-white/20">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <motion.div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-600"
                  animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">SchoolSync</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <h2 className="text-[2.6rem] font-extrabold text-white leading-[1.1] mb-3 tracking-tight">
                Smart School
                <span className="block bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  Management
                </span>
              </h2>
              <p className="text-indigo-200/70 text-sm leading-relaxed max-w-xs">
                Everything you need to run your school efficiently — all in one place.
              </p>
            </motion.div>
          </div>

          {/* Rotating feature showcase */}
          <div className="relative z-10 my-8">
            <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Feature Spotlight</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={featureIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-start space-x-4"
                >
                  <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex-shrink-0 mt-0.5">
                    {React.createElement(features[featureIdx].icon, { className: 'w-5 h-5 text-emerald-300' })}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">{features[featureIdx].title}</h4>
                    <p className="text-indigo-200/60 text-xs leading-relaxed">{features[featureIdx].desc}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
              {/* Progress dots */}
              <div className="flex items-center space-x-1.5 mt-4">
                {features.map((_, i) => (
                  <motion.div key={i} className="h-1 rounded-full" style={{ background: i === featureIdx ? '#34d399' : 'rgba(255,255,255,0.15)' }}
                    animate={{ width: i === featureIdx ? 20 : 6 }} transition={{ duration: 0.3 }} />
                ))}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="relative z-10 grid grid-cols-3 gap-4 rounded-2xl p-4"
            style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <StatCounter end={500} suffix="+" label="Schools" />
            <StatCounter end={25} suffix="K" label="Students" />
            <StatCounter end={99} suffix="%" label="Uptime" />
          </motion.div>
        </motion.div>

        {/* ═══════════════ RIGHT PANEL ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
          className="flex flex-col justify-center p-8 sm:p-10 rounded-3xl lg:rounded-l-none lg:rounded-r-[28px] relative"
          style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Decorative corner glow */}
          <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(99,102,241,0.08) 0%, transparent 60%)' }} />

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <GraduationCap className="w-7 h-7 text-indigo-400" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SchoolSync</span>
          </div>

          {/* Header */}
          <div className="mb-7">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-indigo-300">Secure Portal</span>
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-1.5">Welcome back</h3>
            <p className="text-slate-400 text-sm">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector — Pill style */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Sign in as</label>
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {ROLES.map((role, idx) => {
                  const isActive = idx === activeRoleIdx;
                  return (
                    <motion.button
                      key={role.value}
                      type="button"
                      onClick={() => { setFormData({ ...formData, role: role.value }); setActiveRoleIdx(idx); }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative py-2.5 px-1 rounded-lg text-[11px] font-medium transition-all duration-300 flex flex-col items-center space-y-1"
                      style={{
                        color: isActive ? '#fff' : 'rgba(148,163,184,0.8)',
                        background: isActive ? 'rgba(99,102,241,0.25)' : 'transparent',
                        border: isActive ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                      }}
                    >
                      {isActive && <motion.div layoutId="activeRole" className="absolute inset-0 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }} transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
                      <role.icon className="w-3.5 h-3.5 relative z-10" style={{ color: isActive ? role.color : undefined }} />
                      <span className="relative z-10 leading-tight">{role.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <div className="relative group">
                <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'email' ? 'text-indigo-400' : 'text-slate-500'}`}>
                  <Mail className="w-4 h-4" />
                </div>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                  placeholder="you@school.com" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 transition-all duration-300 focus:outline-none"
                  style={{
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: focusedField === 'email' ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: focusedField === 'email' ? '0 0 20px rgba(99,102,241,0.1)' : 'none',
                  }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative group">
                <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'password' ? 'text-indigo-400' : 'text-slate-500'}`}>
                  <Lock className="w-4 h-4" />
                </div>
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password" required
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white placeholder-slate-600 transition-all duration-300 focus:outline-none"
                  style={{
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: focusedField === 'password' ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: focusedField === 'password' ? '0 0 20px rgba(99,102,241,0.1)' : 'none',
                  }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-200">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <motion.button type="submit" disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.015, boxShadow: '0 8px 30px rgba(99,102,241,0.35)' }}
              whileTap={{ scale: isLoading ? 1 : 0.985 }}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group mt-2"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
              {/* Shimmer sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {/* Animated border glow */}
              <motion.div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.1)' }} />

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* Trust badges */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="mt-7 pt-5 border-t border-white/5">
            <div className="flex items-center justify-center space-x-6">
              {[
                { icon: ShieldCheck, text: '256-bit SSL' },
                { icon: CheckCircle2, text: 'GDPR Ready' },
                { icon: Lock, text: 'Encrypted' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center space-x-1.5">
                  <badge.icon className="w-3 h-3 text-emerald-400/60" />
                  <span className="text-[10px] text-slate-500 font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom attribution */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <p className="text-[11px] text-slate-700">© 2026 SchoolSync — All rights reserved</p>
      </motion.div>
    </div>
  );
};

export default LoginPage;