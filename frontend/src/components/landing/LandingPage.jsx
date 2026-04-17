import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, CalendarCheck, Wallet, Users, LayoutDashboard,
  MessageCircle, BookOpen, ArrowRight, Play, Shield, BarChart3,
  Globe, Smartphone, Star, ChevronRight, Sparkles, CheckCircle2,
  Menu, X, Zap, Clock, HeartHandshake, TrendingUp
} from 'lucide-react';

/* ─── Animated Counter ─── */
const AnimatedCounter = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─── Floating Orb ─── */
const FloatingOrb = ({ size, x, y, color, delay = 0, duration = 8 }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size, height: size,
      left: `${x}%`, top: `${y}%`,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: 'blur(1px)',
    }}
    animate={{
      y: [0, -40, 0],
      x: [0, 20, 0],
      scale: [1, 1.2, 1],
      opacity: [0.4, 0.7, 0.4],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

/* ─── Section Wrapper with InView Animation ─── */
const AnimatedSection = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Feature Card ─── */
const FeatureCard = ({ icon: Icon, title, description, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative bg-white rounded-3xl p-8 cursor-default"
      style={{
        boxShadow: '0 4px 24px rgba(79, 70, 229, 0.04)',
        border: '1px solid rgba(199, 196, 216, 0.15)',
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ boxShadow: '0 20px 60px rgba(79, 70, 229, 0.12)' }} />

      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
          style={{ background: 'linear-gradient(135deg, #e2dfff 0%, #eaddff 100%)' }}>
          <Icon className="w-7 h-7" style={{ color: '#4f46e5' }} />
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: '#191c1e', fontFamily: "'Space Grotesk', sans-serif" }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: '#464555', lineHeight: 1.7 }}>
          {description}
        </p>
      </div>

      {/* Bottom accent on hover */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-0.5 rounded-full transition-all duration-500"
        style={{ background: 'linear-gradient(90deg, #4f46e5, #712ae2)' }} />
    </motion.div>
  );
};

/* ─── Testimonial Card ─── */
const TestimonialCard = ({ quote, name, role, avatar, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-white rounded-3xl p-8 flex flex-col"
      style={{
        boxShadow: '0 4px 24px rgba(79, 70, 229, 0.04)',
        border: '1px solid rgba(199, 196, 216, 0.15)',
      }}
    >
      {/* Quote mark */}
      <div className="text-5xl font-serif leading-none mb-4" style={{ color: '#c3c0ff' }}>"</div>
      <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: '#464555', lineHeight: 1.8 }}>
        {quote}
      </p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: `linear-gradient(135deg, ${avatar.color1}, ${avatar.color2})` }}>
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#191c1e' }}>{name}</p>
          <p className="text-xs" style={{ color: '#777587' }}>{role}</p>
        </div>
      </div>
      {/* Star ratings */}
      <div className="absolute top-8 right-8 flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════ */
/* ═══════════  LANDING PAGE  ═══════════════ */
/* ═══════════════════════════════════════════ */

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeatureSpotlight, setActiveFeatureSpotlight] = useState(0);

  const spotlightFeatures = [
    { icon: CalendarCheck, title: 'Smart Attendance', desc: 'Automated tracking with real-time sync' },
    { icon: BarChart3, title: 'Live Analytics', desc: 'Actionable insights at your fingertips' },
    { icon: Users, title: 'Parent Connect', desc: 'Seamless home-school communication' },
    { icon: Zap, title: 'Instant Reports', desc: 'Generate reports in seconds' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveFeatureSpotlight(i => (i + 1) % spotlightFeatures.length), 3500);
    return () => clearInterval(t);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Features', id: 'features' },
    { label: 'Services', id: 'services' },
    { label: 'About', id: 'about' },
    { label: 'Testimonials', id: 'testimonials' },
  ];

  const features = [
    { icon: CalendarCheck, title: 'Attendance Tracking', description: 'Automated daily attendance with biometric integration, real-time parent notifications, and comprehensive monthly reports.' },
    { icon: Wallet, title: 'Fee Management', description: 'Smart billing with automated reminders, multiple payment gateways, installment plans, and transparent financial reporting.' },
    { icon: Users, title: 'Parent Portal', description: 'A dedicated space for parents to track progress, view attendance, pay fees, and communicate with teachers effortlessly.' },
    { icon: LayoutDashboard, title: 'Teacher Dashboard', description: 'Empower educators with lesson planning tools, automated grading, resource management, and classroom analytics.' },
    { icon: MessageCircle, title: 'Communication Hub', description: 'Bulk SMS, emails, and in-app notifications to keep administrators, teachers, and parents always in the loop.' },
    { icon: BookOpen, title: 'Academic Management', description: 'Complete curriculum management, examination schedules, automated report cards, and learning resource distribution.' },
  ];

  const stats = [
    { value: 500, suffix: '+', label: 'Schools Onboarded' },
    { value: 50000, suffix: '+', label: 'Students Managed' },
    { value: 10000, suffix: '+', label: 'Teachers Empowered' },
    { value: 99, suffix: '.9%', label: 'Uptime Guarantee' },
  ];

  const services = [
    { icon: Shield, title: 'Multi-Role Access', description: 'Dedicated dashboards for Super Admins, School Admins, Teachers, and Parents — each tailored for their unique workflow.', color: '#4f46e5' },
    { icon: BarChart3, title: 'Real-Time Analytics', description: 'Live dashboards with actionable insights on attendance, fees, academic performance, and school-wide metrics.', color: '#712ae2' },
    { icon: Globe, title: 'Cloud-Based SaaS', description: 'Access your school data anywhere, anytime. Secure cloud infrastructure with automatic backups and 99.9% uptime.', color: '#4c3f7e' },
    { icon: Smartphone, title: 'Mobile Responsive', description: 'Fully optimized for all devices. Manage your school on the go from any smartphone, tablet, or desktop.', color: '#3525cd' },
  ];

  const testimonials = [
    {
      quote: 'SchoolSync has completely transformed how we handle our administrative tasks. The interface is intuitive and the analytics are groundbreaking. We saved 20 hours per week.',
      name: 'Dr. Priya Sharma',
      role: 'Principal, Little Steps Academy',
      avatar: { color1: '#4f46e5', color2: '#712ae2' },
    },
    {
      quote: 'The parent engagement portal alone makes this worth every penny. Communication has never been this streamlined. Parents love the real-time updates on their children.',
      name: 'Rajesh Kumar',
      role: 'School Administrator, Bright Future School',
      avatar: { color1: '#712ae2', color2: '#8a4cfc' },
    },
    {
      quote: 'As a teacher, having automated attendance and grade management has freed me to focus on what matters most — teaching. Course handouts and resources are brilliantly organized.',
      name: 'Ananya Mehta',
      role: 'Senior Teacher, Sunrise Playschool',
      avatar: { color1: '#4c3f7e', color2: '#645797' },
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#f7f9fb', fontFamily: "'Inter', sans-serif" }}>

      {/* ═══════ NAVIGATION ═══════ */}

      {/* Full-width navbar — visible at top (before scroll) */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-50"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-5">
                {/* Logo */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => scrollToSection('hero')}
                >
                  <div className="relative">
                    <div className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <motion.div
                      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400"
                      style={{ border: '2px solid rgba(79, 70, 229, 0.8)' }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    SchoolSync
                  </span>
                </motion.div>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-1">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => scrollToSection(link.id)}
                      className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 text-white/70 hover:text-white hover:bg-white/10"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>

                {/* Login Button */}
                <div className="hidden md:flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(255,255,255,0.15)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/login')}
                    className="px-6 py-2.5 rounded-full text-sm font-semibold text-indigo-700 transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.95)' }}
                  >
                    Login
                  </motion.button>
                </div>

                {/* Mobile menu button */}
                <button
                  className="md:hidden p-2 rounded-xl text-white/80"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu (top state) */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="md:hidden overflow-hidden"
                  style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(24px)' }}
                >
                  <div className="px-4 pb-4 space-y-1">
                    {navLinks.map((link) => (
                      <button
                        key={link.id}
                        onClick={() => scrollToSection(link.id)}
                        className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-indigo-50"
                        style={{ color: '#464555' }}
                      >
                        {link.label}
                      </button>
                    ))}
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                      className="block w-full px-4 py-3 rounded-xl text-sm font-semibold text-white text-center mt-2"
                      style={{ background: 'linear-gradient(135deg, #3525cd, #712ae2)' }}
                    >
                      Login
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Floating Pill Navbar — visible on scroll */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ y: -80, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed top-5 left-0 right-0 z-50 flex justify-center pointer-events-none"
          >
            <nav className="pointer-events-auto">
              <div
                className="flex items-center gap-1 px-2 py-2 rounded-full"
                style={{
                  background: 'rgba(25, 28, 30, 0.45)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                {/* Logo icon in pill */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection('hero')}
                  className="p-2.5 rounded-full transition-colors duration-200 hover:bg-white/10 flex-shrink-0"
                >
                  <GraduationCap className="w-[18px] h-[18px] text-indigo-300" />
                </motion.button>

                {/* Separator */}
                <div className="w-px h-5 bg-white/10 mx-1 hidden md:block" />

                {/* Nav Links */}
                <div className="hidden md:flex items-center">
                  {navLinks.map((link) => (
                    <motion.button
                      key={link.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => scrollToSection(link.id)}
                      className="px-4 py-2 text-[13px] font-medium rounded-full transition-all duration-200 text-white/65 hover:text-white hover:bg-white/10"
                    >
                      {link.label}
                    </motion.button>
                  ))}
                </div>

                {/* Separator */}
                <div className="w-px h-5 bg-white/10 mx-1 hidden md:block" />

                {/* Login Button */}
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="px-5 py-2 rounded-full text-[13px] font-semibold text-white transition-all duration-300 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #712ae2)' }}
                >
                  Login
                </motion.button>

                {/* Mobile menu in pill */}
                <button
                  className="md:hidden p-2 rounded-full text-white/70 hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              </div>

              {/* Mobile dropdown from pill */}
              <AnimatePresence>
                {mobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 8, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="md:hidden absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-2xl overflow-hidden p-2"
                    style={{
                      background: 'rgba(25, 28, 30, 0.92)',
                      backdropFilter: 'blur(24px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                    }}
                  >
                    {navLinks.map((link) => (
                      <button
                        key={link.id}
                        onClick={() => scrollToSection(link.id)}
                        className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {link.label}
                      </button>
                    ))}
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                      className="block w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white text-center mt-1"
                      style={{ background: 'linear-gradient(135deg, #4f46e5, #712ae2)' }}
                    >
                      Login
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ HERO SECTION ═══════ */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-8">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(160deg, #3525cd 0%, #4f46e5 25%, #712ae2 55%, #8a4cfc 80%, #4f46e5 100%)',
          }} />
          {/* Geometric accents */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(138,76,252,0.3) 0%, transparent 60%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(53,37,205,0.4) 0%, transparent 60%)', transform: 'translate(-30%, 30%)' }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
          {/* Floating orbs */}
          <FloatingOrb size={120} x={10} y={20} color="rgba(195,192,255,0.15)" delay={0} duration={10} />
          <FloatingOrb size={80} x={80} y={15} color="rgba(138,76,252,0.12)" delay={2} duration={8} />
          <FloatingOrb size={60} x={70} y={70} color="rgba(226,223,255,0.1)" delay={1} duration={12} />
          <FloatingOrb size={100} x={15} y={75} color="rgba(113,42,226,0.1)" delay={3} duration={9} />
          <FloatingOrb size={40} x={50} y={10} color="rgba(195,192,255,0.2)" delay={1.5} duration={7} />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-semibold text-white/90 tracking-wide">THE FUTURE OF SCHOOL MANAGEMENT</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Empowering Schools
                <span className="block mt-2" style={{
                  background: 'linear-gradient(135deg, #c3c0ff 0%, #eaddff 50%, #e2dfff 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  with Smart Management
                </span>
              </h1>

              <p className="text-lg text-indigo-100/70 leading-relaxed mb-6 max-w-lg">
                The all-in-one platform for administrators, teachers, and parents to streamline school operations, enhance learning, and build stronger communities.
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(255,255,255,0.2)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 transition-all duration-300"
                  style={{ background: '#fff', color: '#3525cd' }}
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.15)' }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-full text-sm font-semibold text-white flex items-center gap-2 transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <Play className="w-4 h-4" /> Watch Demo
                </motion.button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 flex-wrap">
                {[
                  { icon: Shield, text: '256-bit Encrypted' },
                  { icon: CheckCircle2, text: 'GDPR Ready' },
                  { icon: Clock, text: '24/7 Support' },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <badge.icon className="w-4 h-4 text-emerald-300" />
                    <span className="text-xs text-white/90 font-medium">{badge.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Dashboard Preview Card */}
            <motion.div
              initial={{ opacity: 0, x: 60, rotateY: -15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Glow */}
                <div className="absolute -inset-4 rounded-3xl"
                  style={{ background: 'radial-gradient(ellipse, rgba(195,192,255,0.15) 0%, transparent 70%)' }} />

                {/* Main card */}
                <div className="relative rounded-3xl overflow-hidden p-5"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Mock Dashboard Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-400/60" />
                      <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
                    </div>
                    <div className="px-3 py-1 rounded-full text-[10px] font-semibold text-emerald-300"
                      style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                      ● Live Dashboard
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Students', value: '1,247', change: '+12%', color: '#c3c0ff' },
                      { label: 'Attendance', value: '94.8%', change: '+3%', color: '#34d399' },
                      { label: 'Revenue', value: '₹12.4L', change: '+8%', color: '#eaddff' },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + i * 0.15 }}
                        className="rounded-xl p-3"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <p className="text-[10px] text-indigo-200/50 uppercase tracking-wider mb-1">{stat.label}</p>
                        <p className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</p>
                        <p className="text-[10px] text-emerald-300 font-semibold mt-1">{stat.change}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Feature Spotlight */}
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">Feature Spotlight</span>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeFeatureSpotlight}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-start gap-4"
                      >
                        <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {React.createElement(spotlightFeatures[activeFeatureSpotlight].icon, { className: 'w-5 h-5 text-indigo-200' })}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-sm mb-1">{spotlightFeatures[activeFeatureSpotlight].title}</h4>
                          <p className="text-indigo-200/50 text-xs">{spotlightFeatures[activeFeatureSpotlight].desc}</p>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    <div className="flex gap-1.5 mt-4">
                      {spotlightFeatures.map((_, i) => (
                        <motion.div key={i} className="h-1 rounded-full"
                          style={{ background: i === activeFeatureSpotlight ? '#c3c0ff' : 'rgba(255,255,255,0.1)' }}
                          animate={{ width: i === activeFeatureSpotlight ? 20 : 6 }}
                          transition={{ duration: 0.3 }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 100V60C240 10 480 0 720 20C960 40 1200 80 1440 60V100H0Z" fill="#f7f9fb" />
          </svg>
        </div>
      </section>

      {/* ═══════ FEATURES SECTION ═══════ */}
      <section id="features" className="py-24 lg:py-32 relative" style={{ background: '#f7f9fb' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: '#e2dfff', border: '1px solid #c7c4d8' }}>
              <Zap className="w-4 h-4" style={{ color: '#4f46e5' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4f46e5' }}>
                Powerful Features
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-5 tracking-tight"
              style={{ color: '#191c1e', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>
              Designed for{' '}
              <span style={{
                background: 'linear-gradient(135deg, #3525cd, #712ae2)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Excellence
              </span>
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#464555', lineHeight: 1.7 }}>
              Everything you need to run a modern educational institution in one seamless, beautiful workspace.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={i} index={i} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SERVICES SECTION ═══════ */}
      <section id="services" className="py-24 lg:py-32 relative" style={{ background: '#f2f4f6' }}>
        {/* Geometric accent */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(138,76,252,0.06) 0%, transparent 60%)', transform: 'translate(40%, -40%)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: '#eaddff', border: '1px solid #d2bbff' }}>
              <HeartHandshake className="w-4 h-4" style={{ color: '#712ae2' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#712ae2' }}>
                Our Services
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-5 tracking-tight"
              style={{ color: '#191c1e', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>
              What We{' '}
              <span style={{
                background: 'linear-gradient(135deg, #712ae2, #8a4cfc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Offer
              </span>
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#464555', lineHeight: 1.7 }}>
              Comprehensive solutions tailored for every stakeholder in the educational ecosystem.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-6">
            {services.map((service, index) => {
              const ref = useRef(null);
              const isInView = useInView(ref, { once: true, margin: '-60px' });
              return (
                <motion.div
                  ref={ref}
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.3 } }}
                  className="group relative bg-white rounded-3xl p-8 flex gap-6"
                  style={{
                    boxShadow: '0 4px 24px rgba(79, 70, 229, 0.04)',
                    border: '1px solid rgba(199, 196, 216, 0.15)',
                  }}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${service.color}15, ${service.color}20)` }}>
                    <service.icon className="w-7 h-7" style={{ color: service.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#191c1e', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#464555', lineHeight: 1.7 }}>
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ STATS / ABOUT SECTION ═══════ */}
      <section id="about" className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #3525cd 0%, #4f46e5 30%, #712ae2 70%, #8a4cfc 100%)',
        }} />
        {/* Geometric shapes */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(195,192,255,0.08) 0%, transparent 60%)', transform: 'translate(-30%, -30%)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(138,76,252,0.15) 0%, transparent 60%)', transform: 'translate(30%, 30%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Trusted Platform
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>
              Trusted by Educators{' '}
              <span style={{
                background: 'linear-gradient(135deg, #c3c0ff, #eaddff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Worldwide
              </span>
            </h2>
            <p className="text-base text-indigo-100/60 leading-relaxed">
              Join hundreds of schools that have already transformed their operations with SchoolSync's intelligent platform.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const ref = useRef(null);
              const isInView = useInView(ref, { once: true, margin: '-60px' });
              return (
                <motion.div
                  ref={ref}
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center p-8 rounded-3xl"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <p className="text-4xl lg:text-5xl font-extrabold text-white mb-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-sm text-indigo-200/50 font-medium">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS SECTION ═══════ */}
      <section id="testimonials" className="py-24 lg:py-32 relative" style={{ background: '#f7f9fb' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: '#e2dfff', border: '1px solid #c7c4d8' }}>
              <Star className="w-4 h-4" style={{ color: '#4f46e5' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4f46e5' }}>
                Testimonials
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-5 tracking-tight"
              style={{ color: '#191c1e', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>
              Loved by{' '}
              <span style={{
                background: 'linear-gradient(135deg, #3525cd, #712ae2)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Educators
              </span>
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#464555', lineHeight: 1.7 }}>
              See why top administrators and teachers are choosing SchoolSync for their digital transformation journey.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard key={i} index={i} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA SECTION ═══════ */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #3525cd 0%, #4f46e5 40%, #712ae2 100%)',
        }} />
        {/* Floating accents */}
        <FloatingOrb size={200} x={5} y={10} color="rgba(195,192,255,0.08)" delay={0} duration={12} />
        <FloatingOrb size={150} x={85} y={60} color="rgba(138,76,252,0.1)" delay={2} duration={10} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>
              Ready to{' '}
              <span style={{
                background: 'linear-gradient(135deg, #c3c0ff, #eaddff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Sync Your School?
              </span>
            </h2>
            <p className="text-lg text-indigo-100/60 leading-relaxed mb-10 max-w-2xl mx-auto">
              Join thousands of schools already using SchoolSync to transform their management experience. Start your free trial today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                className="px-10 py-4 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 transition-all duration-300"
                style={{ background: '#fff', color: '#3525cd' }}
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 rounded-full text-sm font-semibold text-white flex items-center gap-2 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                Contact Sales <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="py-16 relative" style={{ background: '#191c1e' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #4f46e5, #712ae2)' }}>
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  SchoolSync
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#777587' }}>
                Empowering schools with intelligent management tools. Built for the digital era of education.
              </p>
              <div className="flex gap-3">
                {['𝕏', 'in', 'f', '▶'].map((icon, i) => (
                  <div key={i} className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-300 hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#777587' }}>
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Integrations', 'Changelog'],
              },
              {
                title: 'Company',
                links: ['About Us', 'Careers', 'Blog', 'Press Kit'],
              },
              {
                title: 'Support',
                links: ['Help Center', 'Contact', 'Privacy Policy', 'Terms of Service'],
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-sm font-bold text-white mb-5 uppercase tracking-wider"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.05em' }}>
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm transition-colors duration-300 hover:text-white" style={{ color: '#777587' }}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs" style={{ color: '#777587' }}>
                © 2026 SchoolSync. All rights reserved. Designed for the digital curator.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-xs transition-colors duration-300 hover:text-white" style={{ color: '#777587' }}>Privacy</a>
                <a href="#" className="text-xs transition-colors duration-300 hover:text-white" style={{ color: '#777587' }}>Terms</a>
                <a href="#" className="text-xs transition-colors duration-300 hover:text-white" style={{ color: '#777587' }}>Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
