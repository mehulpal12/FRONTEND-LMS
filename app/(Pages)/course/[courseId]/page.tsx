"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Star, 
  Play, 
  Globe, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  PlayCircle, 
  Clock, 
  ShieldCheck, 
  Smartphone, 
  Infinity, 
  Award,
  Sparkles,
  ArrowRight,
  Search,
  Bell,
  UserCircle
} from 'lucide-react';
import axios from 'axios';
import { createPayment, verifyPayment, enrollCourse } from '@/lib/api';
import Navbar from '@/components/navbar';

// --- Types ---
interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'pdf';
  preview: boolean;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

// --- Components ---


const AccordionSection = ({ section, courseId }: { section: Section, courseId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-border/50 rounded-2xl overflow-hidden mb-4 bg-card shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 bg-muted/30 flex justify-between items-center hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown className="w-5 h-5 text-primary" />
          </motion.div>
          <span className="font-bold text-foreground">{section.title}</span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">{section.lessons.length} lectures • 45min</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2 divide-y divide-border/10">
              {section.lessons.map((lesson) => {
                const isPreviewOrEnrolled = lesson.preview;
                const lessonContent = (
                  <div 
                    key={lesson.id} 
                    className={`p-4 flex justify-between items-center rounded-xl group transition-all ${isPreviewOrEnrolled ? 'hover:bg-muted cursor-pointer' : 'opacity-70 cursor-not-allowed'}`}
                  >
                    <div className="flex items-center gap-4">
                      {lesson.type === 'video' ? <PlayCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary" /> : <FileText className="w-4 h-4 text-muted-foreground" />}
                      <span className="text-sm text-muted-foreground font-medium">{lesson.title}</span>
                    </div>
                    <div className="flex gap-4 items-center">
                      {lesson.preview && <span className="text-[10px] font-bold text-primary underline cursor-pointer">Preview</span>}
                      <span className="text-[10px] text-muted-foreground/60">{lesson.duration}</span>
                    </div>
                  </div>
                );
                return lessonContent;
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const courseRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        if (courseRes.data.success) {
          setCourse(courseRes.data.data.course);
        }

        if (token) {
          const userRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          if (userRes.data.success) {
            const enrolled = userRes.data.data.user.enrollments.some((e: any) => e.courseId === courseId);
            setIsEnrolled(enrolled);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId) fetchData();
  }, [courseId]);

  const handleEnroll = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/register");
      return;
    }

    if (typeof courseId !== "string") return;

    try {
      setIsEnrolling(true);
      
      // Step 1: Create Payment
      console.log("Initiating payment...");
      await createPayment(courseId, token);
      
      // Step 2: Verify Payment
      console.log("Verifying payment...");
      await verifyPayment(courseId, token);
      
      // Step 3: Enroll Course
      console.log("Finalizing enrollment...");
      await enrollCourse(courseId, token);
      
      setIsEnrolled(true);
      alert("Enrolled successfully!");
    } catch (error: any) {
      if (error.response?.data?.message === "Already purchased") {
        setIsEnrolled(true);
        const firstLesson = course.lessons?.[0];
        if (firstLesson) {
          router.push(`/course/${courseId}/lessons/${firstLesson.id}`);
        }
        return;
      }
      console.error("Enrollment failed", error);
      alert(error.response?.data?.message || "Enrollment failed. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

// 1. Handle Loading First
if (isLoading) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="font-black text-foreground animate-pulse uppercase tracking-widest text-xs">
          Entering the Sanctuary...
        </p>
      </div>
    </div>
  );
}

// 2. Handle Error State
if (!course) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-6xl font-black text-foreground mb-4 opacity-10">404</h1>
      <p className="font-black text-2xl text-destructive uppercase tracking-tighter">Course Not Found</p>
      <p className="text-muted-foreground mt-2 mb-8">The editorial insight you are looking for does not exist.</p>
      <button 
        onClick={() => router.push('/dashboard')}
        className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold shadow-lg"
      >
        Back to Dashboard
      </button>
    </div>
  );
}


  return (
    <div className="bg-background min-h-screen font-sans selection:bg-primary/30">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#131B2E] text-white py-16 lg:py-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#0053da]/10 blur-[120px] rounded-full translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-12 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-primary text-primary-foreground text-[10px] uppercase font-black tracking-[0.2em] px-3 py-1 rounded-full">Premium Insight</span>
              <div className="flex text-primary/40">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
              </div>
              {/* <span className="text-xs font-medium text-white/60">({course.rating || "4.8"} ratings • ID: {courseId})</span> */}
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-tight mb-6">
              {course.title}
            </h1>
            
            <p className="text-lg text-white/70 mb-8 max-w-2xl leading-relaxed">
              {course.description}
            </p>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary/50 border-2 border-white/20 flex items-center justify-center text-white font-bold">
                  {course.instructor?.name?.charAt(0)}
                </div>
                <span className="text-sm font-bold">{course.instructor?.name}</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2 text-sm text-white/60 font-medium">
                <Globe className="w-4 h-4" />
                <span>English [CC]</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-5 group"
          >
            <div className="aspect-video bg-black rounded-[32px] overflow-hidden shadow-2xl relative border border-white/10">
              <img 
                src={course.thumbnail || "https://images.unsplash.com/photo-1451187580459-43490279c0fa"} 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                alt="Course Preview"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30"
                >
                  <Play className="w-8 h-8 fill-white text-white translate-x-0.5" />
                </motion.button>
              </div>
              <div className="absolute bottom-6 w-full text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Preview Course</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-8 py-20 grid lg:grid-cols-12 gap-16">
        
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-20">
          
          {/* What you'll learn */}
          <section>
            <h2 className="text-3xl font-black text-foreground mb-8 tracking-tighter">What you'll learn</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Design mental models for rapid information synthesis.",
                "Integrate LLM workflows into research pipelines.",
                "Construct a personal 'Cognitive Sanctuary'.",
                "Advanced prompt engineering for high-stakes production."
              ].map((text, i) => (
                <div key={i} className="p-6 bg-card rounded-2xl border border-border/50 flex gap-4 items-start shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-muted-foreground leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Curriculum */}
          <section>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-foreground tracking-tighter">Course content</h2>
                <p className="text-sm font-medium text-muted-foreground mt-2">{course.lessons?.length || 0} lectures</p>
              </div>
              <button className="text-primary font-bold text-sm hover:underline">Expand all</button>
            </div>
            
            <AccordionSection 
              courseId={courseId as string}
              section={{
                id: '1',
                title: "Full Curriculum",
                lessons: course.lessons?.map((lesson: any) => ({
                  id: lesson.id,
                  title: lesson.title,
                  duration: "Video", // dummy
                  type: 'video',
                  preview: true
                })) || []
              }} 
            />
          </section>

          {/* Instructor */}
          <section className="bg-card p-10 rounded-[40px] border border-border/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
            <h2 className="text-3xl font-black text-foreground mb-8 tracking-tighter">Instructor</h2>
            <div className="flex flex-col md:flex-row gap-8 relative z-10">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-[#131B2E] to-[#0053da] shadow-xl flex-shrink-0 overflow-hidden">
                <img src={course.instructor?.avatar} className="w-full h-full object-cover" alt="Elena" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-primary tracking-tight">{course.instructor?.name}</h3>
                <p className="text-muted-foreground font-bold text-sm mt-1">{course.instructor?.role}</p>
                <div className="flex gap-6 my-6 text-[10px] font-black uppercase tracking-widest text-foreground">
                  <div className="flex items-center gap-2"><Star className="w-3 h-3 fill-primary text-primary" /> 4.8 Rating</div>
                  <div className="flex items-center gap-2 text-emerald-500"><CheckCircle2 className="w-3 h-3" /> 245k Students</div>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm font-medium mb-6 italic">
                  "The intersection of editorial thought and algorithmic scale is where true intelligence resides."
                </p>
                <button className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest group">
                  View Profile <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-card rounded-[32px] shadow-2xl shadow-primary/10 overflow-hidden border border-border"
            >
              <div className="p-8">
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-5xl font-black text-foreground tracking-tighter">${course.price}</span>
                  {course.price > 0 && (
                    <>
                      <span className="text-lg text-muted-foreground line-through decoration-destructive decoration-2 opacity-50">${(course.price * 1.5).toFixed(2)}</span>
                      <span className="text-emerald-500 font-black text-xs bg-emerald-500/10 px-2 py-1 rounded-md">35% OFF</span>
                    </>
                  )}
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 text-lg disabled:opacity-70"
                  >
                    {isEnrolling ? "Processing..." : isEnrolled ? "Continue Learning" : "Enroll Now"}
                  </button>
                  <button className="w-full bg-muted text-primary font-bold py-5 rounded-2xl hover:bg-muted/80 transition-all">
                    Add to Cart
                  </button>
                </div>

                <div className="mt-10 space-y-5 border-t border-border/10 pt-8">
                  <h4 className="font-black text-foreground text-xs uppercase tracking-widest">This sanctuary includes:</h4>
                  <ul className="space-y-4">
                    {[
                      { icon: PlayCircle, text: "18.5 hours HD Video" },
                      { icon: FileText, text: "42 Research Resources" },
                      { icon: Infinity, text: "Full Lifetime Access" },
                      { icon: Smartphone, text: "Mobile / TV Access" },
                      { icon: Award, text: "Recognized Certificate" }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                        <item.icon className="w-4 h-4 text-primary" />
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
              <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-white/10 rotate-12 group-hover:scale-110 transition-transform" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="font-black text-sm tracking-tight">AI Assistant</span>
                </div>
                <p className="text-xs font-medium text-white/70 leading-relaxed mb-6">
                  Have questions about this curriculum? Our AI can map these lessons to your specific career goals.
                </p>
                <button className="w-full bg-white text-emerald-900 font-black py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg">
                  Ask Elena's Bot
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}