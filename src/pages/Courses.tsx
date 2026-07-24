import { motion } from 'framer-motion';
import { Search, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCourses } from '../lib/useCourses';
import { INITIAL_COURSES } from '../data';
import { useState } from 'react';

export function Courses() {
  const { courses, loading } = useCourses();
  const [searchQuery, setSearchQuery] = useState("");
  
  const displayCourses = courses.length > 0 ? courses : INITIAL_COURSES.map((c, i) => ({ ...c, id: `temp-${i}` }));

  const filteredCourses = displayCourses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-8 sm:pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 sm:mb-12"
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3 sm:mb-4">All Courses</h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
          Browse all subjects for the current semester. Select a course to access its materials.
        </p>
      </motion.div>

      <div className="mb-8 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground\/70" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-4 bg-card border border-card-border rounded-[20px] shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder-gray-400"
          placeholder="Search courses by name, code, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, idx) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="h-full"
          >
            <Link
              to={`/courses/${course.id}`}
              className={`group flex flex-col h-full p-6 sm:p-8 rounded-[24px] border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 theme-${course.colorTheme || 'blue'} theme-card bg-grain`}
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
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm bg-black/30 backdrop-blur-sm">
                    {course.credits} CR
                  </span>
                </div>
                <div className="bg-black/20 backdrop-blur-sm p-3 rounded-xl mb-3 flex-grow">
                  <h3 className="text-xl font-bold text-white line-clamp-2 drop-shadow-sm">
                    {course.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/20 mt-auto">
                  <span className="text-base font-black text-white bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg drop-shadow-sm">{course.code}</span>
                  <span className="text-xs font-bold text-white px-3 py-1 rounded-lg bg-black/30 backdrop-blur-sm">{course.category}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      {filteredCourses.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No courses found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
