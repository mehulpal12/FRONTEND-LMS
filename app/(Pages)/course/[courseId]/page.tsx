"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  Play,
  Globe,
  CheckCircle2,
  ChevronDown,
  FileText,
  PlayCircle,
  ShieldCheck,
  Smartphone,
  Infinity,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import Navbar from "@/components/navbar";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createPayment, enrollCourse } from "@/lib/api";
import Link from "next/link";
// --- Types ---
interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "pdf";
  preview: boolean;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

// --- Components ---

const AccordionSection = ({
  section,
  courseId,
}: {
  section: Section;
  courseId: string;
}) => {
  const [isOpen, setIsOpen] = useState(true);
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
        <span className="text-xs font-medium text-muted-foreground">
          {section.lessons.length} lectures
        </span>
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
              {section.lessons.map((lesson) => (
                <Link key={lesson.id} href={`/course/${courseId}/lesson/${lesson.id}`}>
                <div
                  className="p-4 flex justify-between items-center rounded-xl group hover:bg-muted cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-4">
                    {lesson.type === "video" ? (
                      <PlayCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    ) : (
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground font-medium">
                      {lesson.title}
                    </span>
                  </div>
                  {lesson.preview && (
                    <span className="text-[10px] font-bold text-primary underline">
                      Preview
                    </span>
                  )}
                </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Stripe Component ---
const CheckoutForm = ({
  courseId,
  onSuccess,
  onCancel,
}: {
  courseId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  return (
    <div className="space-y-6 bg-muted/40 p-6 rounded-2xl border border-primary/20 animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-black uppercase tracking-widest text-primary">
          Secure Payment
        </h4>
        <button
          onClick={onCancel}
          className="text-[10px] font-bold text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      <form className="space-y-4">
        <div className="p-4 bg-card rounded-xl border border-border">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#fff",
                  "::placeholder": { color: "#64748b" },
                  iconColor: "#0053da",
                },
              },
            }}
          />
        </div>

        {errorMessage && (
          <p className="text-xs font-bold text-destructive bg-destructive/10 p-3 rounded-lg flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" /> {errorMessage}
          </p>
        )}

        <button
          disabled={isProcessing}
          className="w-full bg-primary text-primary-foreground font-black py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <ShieldCheck className="w-5 h-5" />
          )}
          {isProcessing ? "Verifying..." : "Confirm & Pay"}
        </button>
      </form>
      <p className="text-[10px] text-center text-muted-foreground font-medium flex items-center justify-center gap-1 mt-4">
        <Award className="w-3 h-3" /> SSL Encrypted • Secure Stripe Checkout
      </p>
    </div>
  );
};

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const courseRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/course/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          },
        );
        if (courseRes.data.success) {
          setCourse(courseRes.data.data.course);
        }

        if (token) {
          const userRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            },
          );
          if (userRes.data.success) {
            const enrolled = userRes.data.data.user.enrollments.some(
              (e: any) => e.courseId === courseId,
            );
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

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-6xl font-black text-foreground mb-4 opacity-10">
          404
        </h1>
        <p className="font-black text-2xl text-destructive uppercase tracking-tighter">
          Course Not Found
        </p>
        <p className="text-muted-foreground mt-2 mb-8">
          The editorial insight you are looking for does not exist.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
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
              <span className="bg-primary text-primary-foreground text-[10px] uppercase font-black tracking-[0.2em] px-3 py-1 rounded-full">
                Premium Insight
              </span>
              <div className="flex text-primary/40">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
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
                <span className="text-sm font-bold">
                  {course.instructor?.name}
                </span>
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
                src={
                  course.thumbnail ||
                  "https://images.unsplash.com/photo-1451187580459-43490279c0fa"
                }
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-8 py-20 grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-20">
          <section>
            <h2 className="text-3xl font-black text-foreground mb-8 tracking-tighter">
              What you'll learn
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Design mental models for rapid information synthesis.",
                "Integrate LLM workflows into research pipelines.",
                "Construct a personal 'Cognitive Sanctuary'.",
                "Advanced prompt engineering for high-stakes production.",
              ].map((text, i) => (
                <div
                  key={i}
                  className="p-6 bg-card rounded-2xl border border-border/50 flex gap-4 items-start shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-muted-foreground leading-relaxed">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-black text-foreground tracking-tighter mb-8">
              Course content
            </h2>
            <AccordionSection
              courseId={courseId as string}
              section={{
                id: "1",
                title: "Full Curriculum",
                lessons: course.lessons || [],
              }}
            />
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
                {!showPayment ? (
                  <div className="space-y-6">
                    <div className="flex items-baseline gap-3 mb-6">
                      <span className="text-5xl font-black text-foreground tracking-tighter">
                        ${course.price}
                      </span>
                      {course.price > 0 && (
                        <>
                          <span className="text-lg text-muted-foreground line-through opacity-50">
                            ${(course.price * 1.5).toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <CheckoutForm
                    courseId={courseId as string}
                    onSuccess={() => {
                      setIsEnrolled(true);
                      setShowPayment(false);
                      alert("Enrolled successfully! Welcome to the course.");
                    }}
                    onCancel={() => setShowPayment(false)}
                  />
                )}

                <div className="mt-10 space-y-5 border-t border-border/10 pt-8">
                  <h4 className="font-black text-foreground text-xs uppercase tracking-widest">
                    This course includes:
                  </h4>
                  <ul className="space-y-4">
                    {[
                      { icon: PlayCircle, text: "Self-paced HD Video" },
                      { icon: FileText, text: "Research Resources" },
                      { icon: Infinity, text: "Lifetime Access" },
                      { icon: Award, text: "Recognized Certificate" },
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-4 text-xs font-bold text-muted-foreground"
                      >
                        <item.icon className="w-4 h-4 text-primary" />
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </aside>
      </div>
    </div>
  );
}
