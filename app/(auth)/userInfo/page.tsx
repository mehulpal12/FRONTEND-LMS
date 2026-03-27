"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle, 
  Clock,
  LogOut,
  Settings
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  enrollments: {
    course: {
      title: string;
      thumbnail: string;
      lessons: { id: string }[];
    }
  }[];
  progress: { completed: boolean }[];
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Replace with your actual API endpoint and Auth headers
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setUserData(response.data.data.user);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/register");
  }

  if (loading) return <ProfileSkeleton />;

  const completedLessons = userData?.progress.filter(p => p.completed).length || 0;
  const totalLessons = userData?.enrollments.reduce((acc, curr) => acc + curr.course.lessons.length, 0) || 0;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#FAF8FF] p-6 lg:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-8 border border-[#C1C6D6]/20 shadow-sm flex flex-col md:flex-row items-center gap-8"
        >
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-[#0053DA] to-[#346DF5] flex items-center justify-center text-white text-4xl font-black shadow-xl">
              {userData?.avatar ? (
                <img src={userData.avatar} className="w-full h-full object-cover rounded-3xl" alt="Avatar" />
              ) : (
                userData?.name.charAt(0)
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-[#131B2E] tracking-tighter">{userData?.name}</h1>
              <span className="px-3 py-1 bg-[#0053DA]/10 text-[#0053DA] text-[10px] font-black uppercase tracking-widest rounded-full w-fit mx-auto md:mx-0">
                {userData?.role}
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[#414754] text-sm font-medium">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {userData?.email}</div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#006A61]" /> Verified Account</div>
            </div>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-2 text-red-500 font-bold text-sm hover:bg-red-50 px-6 py-3 rounded-2xl transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <StatCard icon={<BookOpen className="text-[#0053DA]"/>} label="Enrolled Courses" value={userData?.enrollments.length || 0} />
          <StatCard icon={<CheckCircle className="text-[#006A61]"/>} label="Lessons Completed" value={completedLessons} />
          <StatCard icon={<Clock className="text-[#346DF5]"/>} label="Overall Progress" value={`${progressPercentage}%`} />
        </div>

        {/* Enrolled Courses List */}
        <div className="mt-12">
          <h2 className="text-2xl font-black text-[#131B2E] mb-6 tracking-tight">Active Curriculum</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userData?.enrollments.map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-[24px] border border-[#C1C6D6]/20 flex gap-4 items-center"
              >
                <img src={item.course.thumbnail || "/api/placeholder/100/100"} className="w-20 h-20 rounded-2xl object-cover" alt="Course" />
                <div className="flex-1">
                  <h3 className="font-bold text-[#131B2E] leading-tight">{item.course.title}</h3>
                  <div className="mt-3 h-1.5 w-full bg-[#F2F3FF] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0053DA]" style={{ width: '45%' }} /> {/* Example per-course progress */}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-[28px] border border-[#C1C6D6]/20 shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-[#F2F3FF] flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="text-2xl font-black text-[#131B2E]">{value}</div>
      <div className="text-sm text-[#414754] font-medium">{label}</div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAF8FF] p-12 flex justify-center">
      <div className="w-full max-w-5xl animate-pulse bg-white rounded-[32px] h-[300px]" />
    </div>
  );
}