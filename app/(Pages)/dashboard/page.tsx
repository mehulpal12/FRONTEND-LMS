"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import { 
  Search, 
  Bell, 
  UserCircle, 
  Sparkles, 
  ArrowRight, 
  Star,
  BookOpen
} from 'lucide-react'; // Using Lucide as a robust alternative to Material Symbols
import Navbar from '@/components/navbar';

// --- Animation Variants ---
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// --- Components ---



export const ProgressCard = ({ title, module, progress, eta, img }: any) => (
  <motion.div 
    variants={fadeIn}
    whileHover={{ y: -5 }}
    className="bg-card rounded-2xl p-6 flex gap-6 border border-border/50 shadow-sm hover:shadow-md transition-all group"
  >
    <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
      <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
    </div>
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded uppercase tracking-wider">{module}</span>
          <span className="text-[10px] font-medium text-muted-foreground italic">{eta}</span>
        </div>
        <h3 className="font-bold text-lg text-foreground leading-snug">{title}</h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold text-foreground uppercase">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-blue-500" 
          />
        </div>
      </div>
    </div>
  </motion.div>
);

const CourseCard = ({ title, author, price, rating, img, tag }: any) => (
  <motion.div 
    variants={fadeIn}
    className="bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 group"
  >
    <div className="aspect-video relative overflow-hidden bg-muted">
      <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      {tag && (
        <div className="absolute top-4 left-4 bg-foreground/90 text-background text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-md">
          {tag}
        </div>
      )}
    </div>
    <div className="p-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex text-primary">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-current' : ''}`} />
          ))}
        </div>
        <span className="text-xs font-bold text-muted-foreground">({rating})</span>
      </div>
      <h3 className="font-bold text-xl text-foreground mb-3 group-hover:text-primary transition-colors min-h-[56px]">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 font-medium">By {author}</p>
      <div className="flex justify-between items-center pt-6 border-t border-border/50">
        <span className="text-2xl font-black text-foreground">${price}</span>
        <button className="bg-primary/10 text-primary font-bold px-6 py-2 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all active:scale-95">
          Enroll
        </button>
      </div>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/course`, {
          withCredentials: true
        });
        if (response.data.success) {
          // Note: Backend returns { courses: [...] } in response.data.data
          setCourses(response.data.data.courses || []);
          console.log("Featured courses loaded:", response.data.data.courses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="z-10"
            >
              <h1 className="font-extrabold text-6xl lg:text-8xl tracking-tighter text-foreground mb-8 leading-[1.05]">
                The Cognitive <br />
                <span className="text-primary italic font-serif">Sanctuary.</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg mb-12 leading-relaxed font-medium">
                Treating educational content with the reverence of a premium publication. Elevate your skills through intentional, AI-driven learning paths.
              </p>
              
              <div className="relative max-w-xl group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-500 rounded-full blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
                <div className="relative flex items-center bg-card rounded-full p-2 shadow-xl border border-border/50">
                  <Search className="ml-4 text-primary w-5 h-5" />
                  <input 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-foreground px-4 py-3 font-medium placeholder:text-muted-foreground" 
                    placeholder="What do you want to learn today?" 
                  />
                  <button className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                    Explore
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative hidden lg:block"
            >
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-2xl border-8 border-card">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
                  alt="Aesthetic Study Space" 
                />
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute bottom-6 left-6 right-6 bg-card/60 backdrop-blur-xl p-6 rounded-2xl border border-border/40"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <Sparkles className="text-primary w-4 h-4" />
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary">AI Recommendation</span>
                  </div>
                  <p className="text-card-foreground font-bold text-lg leading-tight">Curating the future of architectural design for you.</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-muted py-12 px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              variants={staggerContainer}
              className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar"
            >
              {['All Access', 'Development', 'Business', 'Artificial Intelligence', 'Visual Design', 'Marketing', 'Philosophy'].map((cat, i) => (
                <motion.button 
                  key={cat}
                  variants={fadeIn}
                  className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all ${i === 0 ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card text-muted-foreground border border-border/50 hover:bg-muted'}`}
                >
                  {cat}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Continue Learning */}
        <section className="py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
                <h2 className="text-4xl font-black tracking-tight text-foreground">Continue Learning</h2>
                <p className="text-muted-foreground mt-2 font-medium">Pick up exactly where you left off.</p>
              </motion.div>
              <a className="text-primary font-bold flex items-center gap-2 group" href="#">
                View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              variants={staggerContainer}
              className="grid md:grid-cols-2 gap-8"
            >
              <ProgressCard 
                title="The Architecture of Clean Code" 
                module="Module 4 of 12" 
                progress={68} 
                eta="12 mins remaining"
                img="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80" 
              />
              <ProgressCard 
                title="Data Storytelling with AI" 
                module="Module 1 of 8" 
                progress={12} 
                eta="45 mins remaining"
                img="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80" 
              />
            </motion.div>
          </div>
        </section>

        <section className="py-24 px-8 bg-muted">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="mb-16 flex items-center gap-6"
            >
              <div className="h-0.5 w-16 bg-primary"></div>
              <h2 className="text-4xl font-black tracking-tight text-foreground">Featured Curriculum</h2>
            </motion.div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            >
              {isLoading ? (
                // Loading Skeleton (Simple)
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-[400px] animate-pulse border border-[#c1c6d6]/10" />
                ))
              ) : (
                courses.map((course) => (
                  <Link href={`/course/${course.id}`} key={course.id}>
                    <CourseCard 
                      key={course.id}
                      title={course.title}
                      author={course.instructor?.name || "Unknown Author"}
                      price={course.price || "Free"}
                      rating={4.5} // Dummy rating
                      tag={course.price === 0 ? "Free" : ""}
                      img={course.thumbnail || "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80"}
                    />
                  </Link>
                ))
              )}
            </motion.div>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-32 px-8 relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-primary/90 -z-10"></div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-background/5 skew-x-12 transform origin-top translate-x-20"></div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-5xl lg:text-7xl font-black mb-8 tracking-tighter">Join the Intellectual Elite.</h2>
            <p className="text-primary text-xl mb-12 max-w-2xl mx-auto font-medium">
              Subscribe to get weekly insights on AI, Design, and Philosophy curated by our editorial team.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
             <input 
  type="email"
  placeholder="Your professional email" 
  className="flex-1 px-6 py-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium shadow-sm" 
/>
              <button className="bg-background  font-black px-10 py-5 rounded-2xl hover:scale-105 transition-all shadow-2xl">
                Join Newsletter
              </button>
            </form>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border/50 py-20 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <span className="font-black text-xl text-foreground block mb-6">Editorial Intelligence</span>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed opacity-70 max-w-[200px]">
              Defining the future of education through intentional design and cognitive clarity.
            </p>
          </div>
          {[
            { name: 'Company', links: ['Terms of Service', 'Privacy Policy'] },
            { name: 'Support', links: ['Help Center', 'Contact'] },
            { name: 'Social', links: ['Twitter / X', 'LinkedIn'] }
          ].map(section => (
            <div key={section.name} className="flex flex-col gap-4">
              <span className="font-bold text-xs uppercase tracking-widest text-foreground">{section.name}</span>
              {section.links.map(link => (
                <a key={link} className="text-xs font-medium text-muted-foreground opacity-70 hover:opacity-100 hover:text-primary transition-all" href="#">{link}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-border/10 text-center">
          <p className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase tracking-[0.2em]">© 2026 Editorial Intelligence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}