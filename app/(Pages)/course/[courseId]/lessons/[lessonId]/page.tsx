"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  PlayCircle,
  Link as LinkIcon,
  Sparkles,
  Send,
  Search,
  Bell,
  UserCircle,
} from "lucide-react";
import Navbar from "@/components/navbar";

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams();
  const [activeTab, setActiveTab] = useState<"curriculum" | "ai">("curriculum");
  const [isCompleted, setIsCompleted] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);
  const [lesson, setLesson] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/register");
          return;
        }
        const config = {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        };
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/lecture/${courseId}/${lessonId}`,
          config,
        );
        const fetchedLesson = response.data.data.lesson;
        setLesson(fetchedLesson);
        setCurriculum(fetchedLesson.course.lessons || []);

        const [progressRes, courseProgressRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/progress/lesson/${lessonId}`,
            config,
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/progress/course/${courseId}`,
            config,
          ),
        ]);

        if (progressRes.data.success) {
          setIsCompleted(progressRes.data.data.completed);
        }
        if (courseProgressRes.data.success) {
          setCourseProgress(courseProgressRes.data.data.progressPercent);
        }
      } catch (error: any) {
        console.error("Error fetching lesson data:", error);
        if (error.response?.status === 403) {
          router.push(`/course/${courseId}?error=not-enrolled`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId && lessonId) fetchData();
  }, [courseId, lessonId, router]);

  const handleToggleComplete = async () => {
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/progress`,
        {
          lessonId: lessonId,
          completed: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      );

      // Update course progress after toggling
      const courseProgressRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/progress/course/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      );
      if (courseProgressRes.data.success) {
        setCourseProgress(courseProgressRes.data.data.progressPercent);
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
      setIsCompleted(!newStatus); // Rollback on error
    }
  };


// 1. Handle Loading First
if (isLoading) {
  return (
    <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#0053da]/20 border-t-[#0053da] rounded-full animate-spin" />
        <p className="font-black text-[#131b2e] animate-pulse uppercase tracking-widest text-xs">
          Entering the Sanctuary...
        </p>
      </div>
    </div>
  );
}

// 2. Handle Error State
if (!lesson) {
  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-6xl font-black text-[#131b2e] mb-4 opacity-10">404</h1>
      <p className="font-black text-2xl text-red-500 uppercase tracking-tighter">Lesson Not Found</p>
      <p className="text-[#414754] mt-2 mb-8">The editorial insight you are looking for does not exist.</p>
      <button 
        onClick={() => router.push('/dashboard')}
        className="bg-[#0053da] text-white px-8 py-4 rounded-2xl font-bold shadow-lg"
      >
        Back to Dashboard
      </button>
    </div>
  );
}


  const currentLessonIndex = curriculum.findIndex((l) => l.id === lessonId);
  const prevLesson = curriculum[currentLessonIndex - 1];
  const nextLesson = curriculum[currentLessonIndex + 1];

  return (
    <div className="flex flex-col h-screen bg-[#faf8ff] overflow-hidden selection:bg-[#B4C5FF]">
      {/* Top Header */}
      <Navbar />

      <main className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Main Content Area */}
        <section className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {/* Breadcrumbs & Title */}
          <div className="px-8 pt-10 pb-6">
            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-[#414754] uppercase mb-3">
              <span className="bg-[#f2f3ff] px-2 py-1 rounded">Course</span>
              <span className="opacity-30">•</span>
              <span>{lesson.course?.title}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#131b2e]">
              {lesson.position}. {lesson.title}
            </h1>
          </div>

          {/* Video Player */}
          <div className="px-8 w-full group">
            <div className="relative aspect-video bg-[#131b2e] rounded-[32px] overflow-hidden shadow-2xl">
              <video
                src={lesson.videoUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
              />
            </div>
          </div>

          {/* Interaction & Stats */}
          <div className="px-8 py-10 flex flex-wrap items-center justify-between gap-6 border-b border-[#c1c6d6]/10">
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  prevLesson &&
                  router.push(`/course/${courseId}/lessons/${prevLesson.id}`)
                }
                disabled={!prevLesson}
                className="flex items-center gap-2 px-5 py-3 bg-[#f2f3ff] text-[#131b2e] font-bold rounded-2xl hover:bg-[#dae2fd] transition-all text-sm disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() =>
                  nextLesson &&
                  router.push(`/course/${courseId}/lessons/${nextLesson.id}`)
                }
                disabled={!nextLesson}
                className="flex items-center gap-2 px-5 py-3 bg-[#f2f3ff] text-[#131b2e] font-bold rounded-2xl hover:bg-[#dae2fd] transition-all text-sm disabled:opacity-50"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <motion.button
              onClick={handleToggleComplete}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold shadow-lg transition-all ${
                isCompleted
                  ? "bg-[#006a61] text-white shadow-[#006a61]/20"
                  : "bg-[#0053da] text-white shadow-[#0053da]/20"
              }`}
            >
              <CheckCircle
                className={`w-5 h-5 ${isCompleted ? "fill-white text-[#006a61]" : ""}`}
              />
              {isCompleted ? "Completed" : "Mark as Complete"}
            </motion.button>
          </div>

          {/* Lesson Details */}
          <div className="px-8 py-12 grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <h3 className="text-xl font-black text-[#131b2e] mb-4">
                About this lesson
              </h3>
              <p className="text-[#414754] leading-relaxed font-medium">
                Master the techniques and mental models presented in this
                session to elevate your strategic thinking and execution.
              </p>
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="w-full md:w-[400px] lg:w-[460px] bg-[#f8f9ff] border-l border-[#c1c6d6]/20 flex flex-col shrink-0">
          <div className="flex border-b border-[#c1c6d6]/20 bg-white">
            <button
              onClick={() => setActiveTab("curriculum")}
              className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === "curriculum" ? "text-[#0053da] border-b-2 border-[#0053da]" : "text-[#727785]"}`}
            >
              Curriculum
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === "ai" ? "text-[#0053da] border-b-2 border-[#0053da]" : "text-[#727785]"}`}
            >
              AI Assistant
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === "curriculum" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="bg-white p-6 rounded-3xl border border-[#c1c6d6]/10 mb-6 shadow-sm">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[10px] font-black text-[#131b2e] uppercase tracking-widest">
                      Course Progress
                    </span>
                    <span className="text-xl font-black text-[#0053da]">
                      {courseProgress}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#f2f3ff] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${courseProgress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[#0053da] to-[#4c89ff]"
                    />
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#727785]">
                      {curriculum.length} Lessons total
                    </span>
                  </div>
                </div>

                <div className="bg-[#f2f3ff] p-4 rounded-2xl flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black text-[#131b2e] uppercase tracking-widest">
                    Full Curriculum
                  </span>
                  <span className="text-[10px] font-bold text-[#0053da]">
                    {curriculum.length} Lessons
                  </span>
                </div>

                {curriculum.map((item) => (
                  <Link
                    href={`/course/${courseId}/lessons/${item.id}`}
                    key={item.id}
                    className={`p-4 rounded-[20px] flex gap-4 items-center transition-all cursor-pointer ${
                      item.id === lessonId
                        ? "bg-white shadow-xl shadow-[#0053da]/5 border border-[#0053da]/10"
                        : "hover:bg-white"
                    }`}
                  >
                    <div className="shrink-0">
                      <PlayCircle
                        className={`w-5 h-5 ${item.id === lessonId ? "text-[#0053da]" : "text-[#727785]"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-bold leading-tight ${item.id === lessonId ? "text-[#0053da]" : "text-[#131b2e]"}`}
                      >
                        {item.position}. {item.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col"
              >
                <div className="bg-white p-6 rounded-3xl border border-[#006a61]/10 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#006a61]/5 rounded-full blur-2xl transition-transform group-hover:scale-150" />
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-10 h-10 bg-[#006a61] rounded-xl flex items-center justify-center text-white shadow-lg">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-[#131b2e]">
                        Cognitive AI
                      </h5>
                      <span className="text-[10px] font-bold text-[#006a61] uppercase tracking-widest">
                        Expert Tutor
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#414754] font-medium leading-relaxed mb-4">
                    "I can explain the neural principles discussed in the
                    current segment. Ask me anything about the lesson."
                  </p>
                  <button className="w-full py-3 bg-[#006a61] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-[#006a61]/20 hover:opacity-90 transition-opacity">
                    Launch Deep Chat
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Chat Input */}
          <div className="p-6 bg-white border-t border-[#c1c6d6]/20">
            <div className="relative">
              <input
                className="w-full pl-6 pr-14 py-4 bg-[#f2f3ff] border-none rounded-2xl text-sm font-medium placeholder:text-[#727785] focus:ring-2 focus:ring-[#0053da]/20"
                placeholder="Ask your tutor anything..."
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#0053da] text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
