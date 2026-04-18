import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck, MailOpen } from 'lucide-react';
import axios from 'axios';

// Animated Background Particles
const FloatingParticle = ({ delay, duration, x, y, size }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size, height: size,
      left: `${x}%`, top: `${y}%`,
      background: 'radial-gradient(circle, rgba(5,150,105,0.3) 0%, transparent 70%)',
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

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089'}/api/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute w-[500px] h-[500px] rounded-full" style={{ top: '-10%', right: '-5%', background: 'radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute w-[600px] h-[600px] rounded-full" style={{ bottom: '-15%', left: '-10%', background: 'radial-gradient(circle, rgba(5,150,105,0.05) 0%, transparent 65%)' }}
          animate={{ scale: [1.1, 1, 1.1], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} />
        
        <FloatingParticle delay={0} duration={6} x={10} y={20} size={8} />
        <FloatingParticle delay={1} duration={8} x={85} y={15} size={6} />
        <FloatingParticle delay={2} duration={7} x={70} y={70} size={10} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 mx-4 text-center"
      >
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(5,150,105,0.05) 0%, transparent 60%)' }} />

        {/* Icon Container */}
        <div className="flex justify-center mb-6">
          <AnimatePresence mode="wait">
            {status === 'loading' && (
              <motion.div key="loading" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center relative">
                <motion.div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-500"
                  animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
                <MailOpen className="w-8 h-8 text-emerald-500 relative z-10" />
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center relative">
                <motion.div className="absolute inset-0 rounded-full bg-emerald-400/20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                <CheckCircle2 className="w-10 h-10 text-emerald-500 relative z-10" />
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div key="error" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Text Content */}
        <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
          {status === 'loading' && 'Verifying Email'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h2>
        
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          {message}
        </p>

        {/* Action Button */}
        <AnimatePresence>
          {status !== 'loading' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Link to="/login"
                className="inline-flex w-full items-center justify-center space-x-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                style={{ 
                  background: status === 'error' 
                    ? 'linear-gradient(135deg, #475569 0%, #334155 100%)' 
                    : 'linear-gradient(135deg, #059669 0%, #059669 50%, #059669 100%)',
                  boxShadow: status === 'error' 
                    ? '0 4px 15px rgba(71,85,105,0.2)' 
                    : '0 4px 20px rgba(5,150,105,0.3)' 
                }}>
                <span>Return to Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust Badges */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center space-x-6">
          <div className="flex items-center space-x-1.5 opacity-60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-medium text-slate-500 tracking-wide uppercase">Secure Verification</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
