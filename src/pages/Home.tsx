import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Layers, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCourses } from '../lib/useCourses';
import { useSettings } from '../lib/useSettings';
import { INITIAL_COURSES } from '../data';
import { useEffect } from 'react';

export function Home() {
  const { courses, loading } = useCourses();
  const { settings, updateSettings } = useSettings();
  
  useEffect(() => {
    if (settings.aboutText === "while (learning) { conquerUniverse(); }") {
      updateSettings({ aboutText: "Veni, Vidi, Vici" });
    }
  }, [settings.aboutText, updateSettings]);

  // Use INITIAL_COURSES as fallback for display if DB is empty
  const displayCourses = courses.length > 0 ? courses : INITIAL_COURSES.map((c, i) => ({ ...c, id: `temp-${i}` }));

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 -z-10" />
        {settings.heroImageUrl && (
           <div className="absolute inset-0 -z-20 opacity-20">
             <img src={settings.heroImageUrl} alt="" className="w-full h-full object-cover" />
           </div>
        )}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/60 backdrop-blur-md border border-card-border/50 text-sm font-medium text-muted-foreground mb-8 shadow-sm"
            >
              <Star className="w-4 h-4 text-warning" />
              <span>{settings.semester} Repository</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              {settings.title}
            </h1>
            
            <div className="mb-10 inline-block text-left">
              <code className="text-base md:text-lg text-muted-foreground bg-muted/80 backdrop-blur-sm px-6 py-4 rounded-xl border border-card-border shadow-sm block font-mono">
                {settings.aboutText}
              </code>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/courses"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-full font-medium hover:bg-foreground/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <BookOpen className="w-5 h-5" />
                Browse Materials
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-card text-foreground border border-card-border rounded-full font-medium hover:bg-muted transition-all shadow-sm hover:shadow-md"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-24 bg-card relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Current Courses</h2>
              <p className="text-muted-foreground">Explore materials by subject.</p>
            </div>
            <Link to="/courses" className="hidden sm:flex items-center gap-1 text-primary font-medium hover:text-primary/80 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCourses.slice(0, 6).map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="h-full"
              >
                <Link
                  to={`/courses/${course.id}`}
                  className={`group flex flex-col h-full p-8 rounded-[24px] border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 theme-${course.colorTheme || 'blue'} theme-card bg-grain`}
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      {course.imageUrl ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-300">
                          <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-[var(--theme-main)] group-hover:scale-110 transition-transform duration-300 shadow-sm">
                          <Layers className="w-6 h-6" />
                        </div>
                      )}
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm bg-black/30 backdrop-blur-sm">
                        {course.credits} Credits
                      </span>
                    </div>
                    <div className="bg-black/20 backdrop-blur-sm p-3 rounded-xl mb-3 flex-grow">
                      <h3 className="text-xl font-bold text-white line-clamp-2 drop-shadow-sm">
                        {course.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/20">
                      <p className="text-base font-black text-white bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg drop-shadow-sm">{course.code}</p>
                      <p className="text-xs font-bold text-white px-3 py-1 rounded-lg bg-black/30 backdrop-blur-sm">{course.category}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
