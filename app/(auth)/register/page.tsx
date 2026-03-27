"use client";

import React, { useState } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/navigation';
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
  </svg>
);

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Determine endpoint based on authMode
      const endpoint = authMode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      
      // Filter payload for login to avoid "Unrecognized key" error from strict Zod schema
      const payload = authMode === 'signup' 
        ? formData 
        : { email: formData.email, password: formData.password };
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, payload);

      if (response.data.success) {
        // alert(authMode === 'signup' ? "Registration Successful!" : "Login Successful!");
        // store token here
        const token = response.data.data.user.refreshToken;
        console.log(token);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
        console.log("Stored in localStorage:", localStorage.getItem("user"));
        setTimeout(() => {
          router.push("/dashboard");
        }, 100);
      }
    } catch (error: any) {
      console.log(error);
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };



  const containerVars: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#FAF8FF] selection:bg-[#0053DA] selection:text-white">
      
      {/* Left Side: Hero (Hidden on Mobile) */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 bg-[#0053DA] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 1.5 }}
            alt="Hero background" 
            className="w-full h-full object-cover mix-blend-luminosity"
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0053DA] via-[#0053DA]/80 to-transparent" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg font-bold text-[#0053DA]">EI</div>
            <span className="text-2xl font-black text-white font-sans tracking-tighter">Editorial Intelligence</span>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-8">
            Elevate your <br/><span className="text-[#B4C5FF]">intellectual flow.</span>
          </h1>
          <p className="text-xl text-[#DBE1FF] font-light mb-12">
            Join a sanctuary designed for high-performance learning. Access premium courses curated by visionaries.
          </p>
        </div>

        <div className="relative z-10 text-white/60 text-sm italic">
          "Intelligence is the ability to adapt to change." — Stephen Hawking
        </div>
      </section>

      {/* Right Side: Auth Form */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:px-24 py-12 overflow-y-auto">
        <motion.div 
          variants={containerVars}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[440px]"
        >
          {/* Mobile Header (Visible only on Mobile) */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-10">
            <div className="w-8 h-8 bg-[#0053DA] rounded-lg" />
            <span className="text-xl font-black text-[#131B2E]">Editorial Intelligence</span>
          </div>

          <header className="mb-8 text-center md:text-left">
            <motion.h2 variants={itemVars} className="text-3xl font-extrabold text-[#131B2E] tracking-tight mb-2">
              {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </motion.h2>
            <motion.p variants={itemVars} className="text-[#414754]">
              {authMode === 'signin' ? 'Sign in to your sanctuary.' : 'Join our global community of scholars.'}
            </motion.p>
          </header>

          {/* Switcher */}
          <motion.div variants={itemVars} className="bg-[#F2F3FF] p-1 rounded-full flex gap-1 mb-8">
            <button 
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${authMode === 'signin' ? 'bg-white text-[#0053DA] shadow-sm' : 'text-[#414754]'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${authMode === 'signup' ? 'bg-white text-[#0053DA] shadow-sm' : 'text-[#414754]'}`}
            >
              Register
            </button>
          </motion.div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {authMode === 'signup' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="block text-xs font-bold text-[#414754] uppercase tracking-wider ml-1">Full Name</label>
                  <input 
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-[#F2F3FF] border-none rounded-xl px-4 py-3.5 text-[#131B2E] focus:ring-2 focus:ring-[#0053DA]/20 focus:bg-white transition-all outline-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={itemVars} className="space-y-1.5">
              <label className="block text-xs font-bold text-[#414754] uppercase tracking-wider ml-1">Email Address</label>
              <input 
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email" 
                placeholder="name@company.com"
                className="w-full bg-[#F2F3FF] border-none rounded-xl px-4 py-3.5 text-[#131B2E] focus:ring-2 focus:ring-[#0053DA]/20 focus:bg-white transition-all outline-none"
              />
            </motion.div>

            <motion.div variants={itemVars} className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-xs font-bold text-[#414754] uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <input 
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="w-full bg-[#F2F3FF] border-none rounded-xl px-4 py-3.5 text-[#131B2E] focus:ring-2 focus:ring-[#0053DA]/20 focus:bg-white transition-all outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#414754] uppercase"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </motion.div>

            <motion.button 
              disabled={isLoading}
              variants={itemVars}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-[#0053DA] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-[#0053DA]/20 mt-4 disabled:opacity-70 flex justify-center items-center"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                authMode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div variants={itemVars} className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#C1C6D6]/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-[#FAF8FF] px-4 text-[#727785]">Or continue with</span>
            </div>
          </motion.div>

          {/* Social Buttons */}


          <motion.footer variants={itemVars} className="mt-8 text-center md:text-left">
             <div className="pt-8 border-t border-[#C1C6D6]/20 flex justify-center md:justify-start gap-6 text-[10px] uppercase tracking-widest font-bold text-[#727785]">
              <a href="#" className="hover:text-[#131B2E]">Privacy</a>
              <a href="#" className="hover:text-[#131B2E]">Terms</a>
              <a href="#" className="hover:text-[#131B2E]">Help</a>
            </div>
          </motion.footer>
        </motion.div>
      </section>
    </main>
  );
}