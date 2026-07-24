import { useState, useEffect } from 'react';
import { useAuth } from '../lib/useAuth';
import { useCourses } from '../lib/useCourses';
import { useSettings } from '../lib/useSettings';
import { useFiles } from '../lib/useFiles';
import { Link, Navigate } from 'react-router-dom';
import { BookOpen, FileText, Upload, HardDrive, Activity, Plus, Edit2, Trash2, X, Image as ImageIcon, Save, ArrowRight, Settings, FolderPlus, LayoutDashboard, LayoutList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Course, SiteSettings } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { THEMES } from '../data';
import toast from 'react-hot-toast';
import { DashboardSkeleton } from '../components/SkeletonLoader';

export function AdminDashboard() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { courses, loading: coursesLoading, addCourse, updateCourse, removeCourse } = useCourses();
  const { settings, updateSettings } = useSettings();
  const { files, loading: filesLoading } = useFiles();

  const [activeTab, setActiveTab] = useState<'overview' | 'courses'>('overview');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [courseFormData, setCourseFormData] = useState<Partial<Course>>({});

  const [localSettings, setLocalSettings] = useState<Partial<SiteSettings>>({});
  
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (authLoading || coursesLoading || filesLoading) return <DashboardSkeleton />;
  
  if (!user || !isAdmin) return <Navigate to="/" />;

  const totalFiles = files.length;
  const totalDownloads = files.reduce((acc, file) => acc + (file.downloadCount || 0), 0);
  const totalStorageBytes = files.reduce((acc, file) => acc + (file.size || 0), 0);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stats = [
    { label: 'Total Courses', value: courses.length.toString(), icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Total Categories', value: '8', icon: FolderPlus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Files', value: totalFiles.toString(), icon: FileText, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { label: 'Downloads', value: totalDownloads.toString(), icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Storage Used', value: formatBytes(totalStorageBytes), icon: HardDrive, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  const recentActivity = files
    .slice()
    .sort((a, b) => b.uploadDate - a.uploadDate || 0)
    .slice(0, 5)
    .map(f => ({
      id: f.id,
      title: `Uploaded ${f.name}`,
      time: f.date,
      icon: Upload
    }));

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setCourseFormData(course);
    } else {
      setEditingCourse(null);
      setCourseFormData({ colorTheme: 'blue' });
    }
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!courseFormData.code || !courseFormData.title || !courseFormData.credits || !courseFormData.category) {
        toast.error('Please fill in required fields');
        return;
    }
    
    try {
        if (editingCourse) {
          await updateCourse(editingCourse.id, courseFormData);
          toast.success('Course updated successfully!');
        } else {
          await addCourse(courseFormData as Omit<Course, 'id'>);
          toast.success('Course created successfully!');
        }
        setIsCourseModalOpen(false);
    } catch(err: any) {
        toast.error('Error saving course: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-6 sm:py-10 px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto font-sans">
      
      {/* Top Welcome Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-6 p-5 sm:p-8 bg-card rounded-[24px] border border-card-border shadow-sm backdrop-blur-xl bg-opacity-80">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground font-medium text-lg flex items-center gap-2">
            {settings.semester || 'Semester Repository'} <span className="opacity-50">•</span> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setIsSettingsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full font-semibold transition-all shadow-sm">
            <Settings className="w-5 h-5" /> Settings
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-card p-2 rounded-2xl border border-card-border shadow-sm w-max">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Overview
        </button>
        <button 
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'courses' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'}`}
        >
          <LayoutList className="w-4 h-4" /> Manage Courses
        </button>
      </div>

      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {/* Statistics Grid */}
            <section>
              <h2 className="text-xl font-bold mb-6 text-foreground/90">Platform Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="bg-card p-6 rounded-[24px] border border-card-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="xl:col-span-1 space-y-8">
             <section className="bg-card rounded-[24px] border border-card-border shadow-sm p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-6 text-foreground/90">Recent Activity</h2>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                        <div 
                          key={activity.id + i} 
                          className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-primary text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                                <activity.icon className="w-4 h-4" />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-[16px] border border-card-border bg-background shadow-sm group-hover:border-primary/30 transition-colors">
                                <div className="flex items-center justify-between mb-1">
                                    <time className="text-xs font-semibold text-primary">{activity.time}</time>
                                </div>
                                <div className="text-sm font-semibold text-foreground">{activity.title}</div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 text-muted-foreground">No recent activity</div>
                    )}
                </div>
             </section>
          </div>
        </motion.div>
      )}

      {activeTab === 'courses' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground/90">Courses Repository</h2>
              <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full font-bold shadow-[0_4px_14px_0_rgba(155,89,182,0.39)] hover:shadow-[0_6px_20px_rgba(155,89,182,0.23)] hover:-translate-y-0.5">
                <Plus className="w-5 h-5" /> Add New Course
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course, idx) => (
                  <motion.div
                      key={course.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="h-full"
                  >
                      <div 
                          className={`group flex flex-col h-full p-6 rounded-[24px] border shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 theme-${course.colorTheme || 'blue'} theme-card bg-grain relative`}
                      >
                          <div className="relative z-10 flex flex-col h-full">
                              <div className="flex justify-between items-start mb-6">
                                {course.imageUrl ? (
                                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-300">
                                      <img src={course.imageUrl} alt={course.code} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm border border-white/30 group-hover:scale-110 transition-transform duration-300">
                                      <span className="text-xl font-bold text-white shadow-sm">{course.code.substring(0, 2)}</span>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                  <button onClick={() => handleOpenModal(course)} className="p-2.5 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-xl transition-all shadow-sm">
                                      <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => setCourseToDelete(course.id)} className="p-2.5 bg-white/20 hover:bg-error/80 backdrop-blur-sm text-white rounded-xl transition-all shadow-sm">
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="mt-auto">
                                <div className="flex flex-wrap gap-2 mb-4">
                                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-lg border border-white/20 shadow-sm">{course.code}</span>
                                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-lg border border-white/20 shadow-sm">{course.credits} Credits</span>
                                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-lg border border-white/20 shadow-sm">{course.category}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 leading-tight drop-shadow-sm">{course.title}</h3>
                              </div>
                              <Link to={`/courses/${course.id}`} className="mt-6 flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-[16px] text-white font-bold transition-all border border-white/20 group/btn shadow-sm">
                                  <span>Manage Contents</span>
                                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                              </Link>
                          </div>
                      </div>
                  </motion.div>
              ))}
           </div>
        </motion.div>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-xl rounded-3xl border border-card-border shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-card-border flex items-center justify-between bg-white/5 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-foreground">Global Settings</h3>
                <button onClick={() => setIsSettingsModalOpen(false)} className="p-2 text-muted-foreground hover:text-foreground bg-muted rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Semester Text</label>
                    <input 
                       type="text" 
                       value={localSettings.semester || ''} 
                       onChange={(e) => setLocalSettings({...localSettings, semester: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
                    />
                </div>
              </div>
              <div className="px-8 py-5 border-t border-card-border flex justify-end gap-3 bg-muted/30">
                <button onClick={() => setIsSettingsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={() => { updateSettings(localSettings); setIsSettingsModalOpen(false); toast.success('Settings saved!'); }} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:bg-primary/90 shadow-sm hover:shadow-md transition-all">Save Changes</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Course Modal */}
      <AnimatePresence>
        {isCourseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/80 backdrop-blur-md pt-10 pb-10 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-2xl rounded-3xl border border-card-border shadow-2xl overflow-hidden my-auto"
            >
              <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-card-border flex items-center justify-between bg-white/5 backdrop-blur-sm sticky top-0 z-10">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">{editingCourse ? 'Edit Course' : 'Create Course'}</h3>
                <button onClick={() => setIsCourseModalOpen(false)} className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground bg-muted rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 sm:p-8 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-2 gap-5">
                    <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Subject Code *</label>
                    <input type="text" value={courseFormData.code || ''} onChange={e => setCourseFormData({...courseFormData, code: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-card-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all shadow-inner" placeholder="e.g. CS101" />
                    </div>
                    <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Credits *</label>
                    <input type="number" value={courseFormData.credits || ''} onChange={e => setCourseFormData({...courseFormData, credits: parseInt(e.target.value)})} className="w-full px-5 py-3 rounded-2xl border border-card-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all shadow-inner" placeholder="3" />
                    </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Course Title *</label>
                  <input type="text" value={courseFormData.title || ''} onChange={e => setCourseFormData({...courseFormData, title: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-card-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all shadow-inner" placeholder="e.g. Intro to Computer Science" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Category (Type) *</label>
                  <input type="text" value={courseFormData.category || ''} onChange={e => setCourseFormData({...courseFormData, category: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-card-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all shadow-inner" placeholder="e.g. Core, Elective" />
                </div>
                
                <div className="pt-4 border-t border-card-border">
                  <label className="block text-sm font-semibold text-foreground mb-4">Tile Appearance</label>
                  
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Custom Image URL (Optional)</label>
                    <div className="flex gap-2">
                       <input 
                         type="url" 
                         value={courseFormData.imageUrl || ''} 
                         onChange={e => setCourseFormData({...courseFormData, imageUrl: e.target.value})} 
                         className="flex-1 px-5 py-3 rounded-2xl border border-card-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all shadow-inner" 
                         placeholder="https://example.com/image.jpg" 
                       />
                       {courseFormData.imageUrl && (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-card-border shrink-0">
                            <img src={courseFormData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                       )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">If provided, this image will replace the initial abbreviation on the course tile.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Color Theme (Applied to tile background)</label>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                      {THEMES.map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setCourseFormData({...courseFormData, colorTheme: theme})}
                          className={`w-10 h-10 rounded-full border-2 transition-all theme-${theme} theme-card ${courseFormData.colorTheme === theme ? 'border-foreground scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                          title={theme}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </div>
              <div className="px-6 py-4 sm:px-8 sm:py-5 border-t border-card-border flex justify-end gap-3 bg-muted/30 sticky bottom-0">
                <button onClick={() => setIsCourseModalOpen(false)} className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={handleSaveCourse} className="px-4 py-2 sm:px-6 sm:py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:bg-primary/90 shadow-md hover:shadow-lg transition-all">Save Course</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!courseToDelete}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone and will not delete associated files automatically."
        onConfirm={() => {
          if (courseToDelete) {
            removeCourse(courseToDelete);
            setCourseToDelete(null);
            toast.success('Course deleted');
          }
        }}
        onCancel={() => setCourseToDelete(null)}
      />
    </div>
  );
}
