import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, FileText, Download, Link as LinkIcon, Trash2, Plus, X, Upload, HardDrive, Clock, Search, Folder, MoreVertical, Edit2, PlayCircle, Image as ImageIcon, Archive, File, Eye, Copy, RefreshCw } from 'lucide-react';
import { useCourses } from '../lib/useCourses';
import { useFiles } from '../lib/useFiles';
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../lib/useAuth';
import { ConfirmModal } from '../components/ConfirmModal';
import { ContextMenu, useContextMenu } from '../components/ContextMenu';
import toast from 'react-hot-toast';
import { CourseDetailsSkeleton } from '../components/SkeletonLoader';

const getFileIcon = (type: string, imageUrl?: string | null) => {
  if (imageUrl) {
    return <img src={imageUrl} alt="preview" className="w-8 h-8 rounded-lg object-cover" />;
  }
  const t = type.toLowerCase();
  if (['link'].includes(t)) return <LinkIcon className="w-5 h-5 text-blue-500" />;
  if (['pdf'].includes(t)) return <FileText className="w-5 h-5 text-red-500" />;
  if (['doc', 'docx'].includes(t)) return <FileText className="w-5 h-5 text-blue-500" />;
  if (['ppt', 'pptx'].includes(t)) return <PlayCircle className="w-5 h-5 text-orange-500" />;
  if (['xls', 'xlsx'].includes(t)) return <FileText className="w-5 h-5 text-green-500" />;
  if (['mp4', 'avi', 'mov'].includes(t)) return <PlayCircle className="w-5 h-5 text-purple-500" />;
  if (['jpg', 'jpeg', 'png', 'gif'].includes(t)) return <ImageIcon className="w-5 h-5 text-teal-500" />;
  if (['zip', 'rar'].includes(t)) return <Archive className="w-5 h-5 text-yellow-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
};

const DEFAULT_CATEGORIES = ['Notes', 'Assignments', 'Lab', 'Previous Year Questions', 'Question Bank', 'Books', 'Videos', 'Others'];

export function CourseDetails() {
  const { id } = useParams();
  const { courses, updateCourse, loading: coursesLoading } = useCourses();
  const { isAdmin } = useAuth();
  const { files, addFile, addLink, updateFileRecord, deleteFileRecord, incrementDownload, loading: filesLoading } = useFiles(id);
  
  const course = courses.find(c => c.id === id);
  const courseCategories = course?.categories?.length ? course.categories : DEFAULT_CATEGORIES;
  
  const categories = courseCategories.map(cat => {
    if (typeof cat === 'string') return { id: cat, name: cat, icon: 'Folder', color: '#9b59b6' };
    return cat as any; // Assuming it's an object with id, name
  });

  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 'Notes');
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [fileToDelete, setFileToDelete] = useState<{id: string, storagePath?: string} | null>(null);
  
  // Upload state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTab, setUploadTab] = useState<'file' | 'link'>('file');
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [customFileName, setCustomFileName] = useState('');
  
  // Link state
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkImageUrl, setLinkImageUrl] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  
  // Replace file state
  const [fileToReplace, setFileToReplace] = useState<any>(null);

  // Category state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Context Menu
  const ctxMenu = useContextMenu();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        setIsUploadModalOpen(true);
      }
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Delete') {
        // If we had a focused file selection we could delete it here
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (coursesLoading || filesLoading) {
    return <CourseDetailsSkeleton />;
  }

  if (!course) {
    return <div className="p-20 text-center text-muted-foreground">Course not found.</div>;
  }

  const currentFiles = files.filter(f => f.category === activeCategory);
  
  const filteredFiles = currentFiles.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStorageBytes = files.reduce((acc, file) => acc + (file.size || 0), 0);
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: globalThis.File) => {
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Maximum size: 50 MB. Supported: PDF, DOCX, PPT, PPTX, ZIP, RAR, PNG, JPG, MP4');
      return;
    }
    setSelectedFile(file);
    setCustomFileName(file.name);
  };

  const executeUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      if (fileToReplace) {
        // Here we could delete old storage and upload new, but for simplicity we upload new and delete old record
        await deleteFileRecord(fileToReplace.id, fileToReplace.storagePath);
      }
      await addFile(selectedFile, course.id, activeCategory, customFileName, 'Admin', (progress) => {
        setUploadProgress(progress);
      });
      toast.success(fileToReplace ? 'File replaced successfully!' : 'File uploaded successfully!');
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setFileToReplace(null);
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const executeAddLink = async () => {
    if (!linkUrl || !linkTitle) return;
    setUploading(true);
    try {
      if (fileToReplace) {
        await deleteFileRecord(fileToReplace.id, fileToReplace.storagePath);
      }
      await addLink(linkUrl, linkTitle, linkImageUrl, linkDescription, course.id, activeCategory, 'Admin');
      toast.success('Link added successfully!');
      setIsUploadModalOpen(false);
      setFileToReplace(null);
      setLinkUrl('');
      setLinkTitle('');
      setLinkImageUrl('');
      setLinkDescription('');
    } catch (error: any) {
      toast.error('Failed to add link: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return;
    const newCategory = { id: categoryName.toLowerCase().replace(/\s+/g, '-'), name: categoryName.trim() };
    const newCategories = [...categories, newCategory];
    try {
      await updateCourse(course.id, { categories: newCategories });
      toast.success('Category created!');
      setIsCategoryModalOpen(false);
      setCategoryName('');
      setActiveCategory(newCategory.id);
    } catch (e: any) {
      toast.error('Failed to create category');
    }
  };

  const handleDownload = (file: any) => {
    incrementDownload(file.id);
    const a = document.createElement('a');
    a.href = file.downloadUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleRename = async (file: any) => {
      const newName = prompt('Enter new filename:', file.name);
      if (newName && newName.trim()) {
          try {
             await updateFileRecord(file.id, { name: newName.trim() });
             toast.success('File renamed');
          } catch(e) {
             toast.error('Failed to rename file');
          }
      }
  };

  const contextActions = [
    { label: 'Download', icon: Download, onClick: handleDownload },
    ...(isAdmin ? [
        { label: 'Rename', icon: Edit2, onClick: handleRename },
        { label: 'Replace', icon: RefreshCw, onClick: (f: any) => { setFileToReplace(f); setIsUploadModalOpen(true); } },
        { label: 'Delete', icon: Trash2, danger: true, onClick: (f: any) => setFileToDelete({id: f.id, storagePath: f.storagePath}) }
    ] : []),
    { label: 'Copy Link', icon: LinkIcon, onClick: (f: any) => { navigator.clipboard.writeText(f.downloadUrl); toast.success('Link copied to clipboard!'); } }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 font-sans">
      
      {/* Breadcrumb */}
      <div className="px-4 sm:px-8 lg:px-12 pt-6">
        <nav className="flex items-center text-sm font-medium text-muted-foreground gap-2">
            <Link to="/admin" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 opacity-50" />
            <Link to="/admin" className="hover:text-primary transition-colors">Courses</Link>
            <ChevronRight className="w-4 h-4 opacity-50" />
            <span className="text-foreground">{course.title}</span>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="px-4 sm:px-8 lg:px-12 py-6 sm:py-8 max-w-[1600px] mx-auto">
        <div className="bg-card rounded-[24px] border border-card-border shadow-sm p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl bg-opacity-80">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" />
          
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg text-sm">{course.code}</span>
            <span className="px-3 py-1 bg-accent/10 text-accent font-bold rounded-lg text-sm">{course.credits} Credits</span>
            <span className="px-3 py-1 bg-muted text-muted-foreground font-bold rounded-lg text-sm">{course.category}</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-8 tracking-tight">{course.title}</h1>
          
          <div className="flex flex-wrap gap-6 md:gap-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Folder className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{categories.length}</p>
                <p className="text-xs font-medium text-muted-foreground">Categories</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{files.length}</p>
                <p className="text-xs font-medium text-muted-foreground">Files</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{formatBytes(totalStorageBytes)}</p>
                <p className="text-xs font-medium text-muted-foreground">Storage Used</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Recently</p>
                <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar */}
          <div className="w-full lg:w-64 shrink-0 space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider mb-4 px-2">Course Categories</h3>
            {categories.map((category: any) => {
              const fileCount = files.filter(f => f.category === category.id || f.category === category.name).length;
              const isActive = activeCategory === category.id || activeCategory === category.name;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id || category.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Folder className={`w-4 h-4 ${isActive ? 'text-primary-foreground/80' : 'text-primary/70'}`} />
                    {category.name}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted-foreground/10'}`}>
                    {fileCount}
                  </span>
                </button>
              );
            })}
            {isAdmin && (
              <button onClick={() => setIsCategoryModalOpen(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-4 rounded-xl text-sm font-bold text-primary border border-dashed border-primary/30 hover:bg-primary/5 transition-all">
                <Plus className="w-4 h-4" /> Add Category
              </button>
            )}
          </div>

          {/* Right Panel */}
          <div className="flex-1 min-w-0">
            <div className="bg-card rounded-[24px] border border-card-border shadow-sm min-h-[600px] overflow-hidden">
              
              {/* Toolbar */}
              <div className="px-6 py-4 border-b border-card-border flex flex-wrap items-center justify-between gap-4 bg-muted/10">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  {categories.find(c => c.id === activeCategory || c.name === activeCategory)?.name || activeCategory}
                </h2>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <input 
                      ref={searchInputRef}
                      type="text" 
                      placeholder="Search files (Ctrl+F)" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 w-48 focus:w-64 transition-all rounded-full border border-card-border bg-background text-sm font-medium focus:outline-none focus:border-primary/50" 
                    />
                  </div>
                  
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors" title="Rename Category">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-muted-foreground hover:text-error hover:bg-error/10 rounded-full transition-colors" title="Delete Category">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="w-px h-6 bg-card-border mx-1"></div>
                      <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:bg-primary/90 shadow-[0_4px_14px_0_rgba(155,89,182,0.39)] hover:shadow-[0_6px_20px_rgba(155,89,182,0.23)] hover:-translate-y-0.5 transition-all">
                        <Upload className="w-4 h-4" /> Upload
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* File Table */}
              <div className="p-6 overflow-x-auto">
                {filteredFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-20 h-20 mb-4 bg-muted rounded-full flex items-center justify-center opacity-80">
                        <Archive className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">No files here yet</h3>
                    <p className="text-muted-foreground font-medium mb-6">Upload documents, videos, and resources to this category.</p>
                    {isAdmin && (
                      <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-full font-bold hover:bg-primary/20 transition-all">
                        <Upload className="w-4 h-4" /> Upload First File
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFiles.map((file, i) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onContextMenu={(e) => ctxMenu.open(e, file)}
                        className="bg-background rounded-[20px] border border-card-border overflow-hidden flex flex-col group hover:shadow-lg transition-all"
                      >
                        {file.imageUrl ? (
                          <div className="aspect-video w-full overflow-hidden bg-muted relative">
                            <img src={file.imageUrl} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <button onClick={() => handleDownload(file)} className="w-full py-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white font-bold rounded-xl transition-all">
                                  Open Link
                                </button>
                            </div>
                            <div className="absolute top-3 right-3">
                              <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm border border-white/10">{file.type}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video w-full bg-gradient-to-br from-muted/30 to-muted/10 flex flex-col items-center justify-center relative group-hover:from-muted/40 group-hover:to-muted/20 transition-colors">
                            <div className="w-16 h-16 bg-background rounded-2xl shadow-sm border border-card-border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                               {getFileIcon(file.type)}
                            </div>
                            <span className="px-2.5 py-1 bg-background border border-card-border text-foreground text-[10px] font-bold rounded-lg uppercase tracking-wider">{file.type}</span>
                             <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                <button onClick={() => handleDownload(file)} className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg transition-transform hover:scale-105">
                                  Open Link
                                </button>
                            </div>
                          </div>
                        )}
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-bold text-foreground text-lg line-clamp-2 mb-2 leading-tight">{file.name}</h3>
                          {file.description && (
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{file.description}</p>
                          )}
                          <div className="mt-auto pt-4 border-t border-card-border flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground/70">{file.date}</span>
                            <div className="flex gap-1.5">
                              <button onClick={() => handleDownload(file)} className="p-2 bg-muted/30 text-foreground hover:bg-primary hover:text-primary-foreground rounded-xl transition-colors" title="Open Link">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={(e) => ctxMenu.open(e, file)} className="p-2 bg-muted/30 text-muted-foreground hover:text-foreground rounded-xl transition-colors" title="More Actions">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ContextMenu 
         position={ctxMenu.position} 
         isOpen={ctxMenu.isOpen} 
         item={ctxMenu.item} 
         onClose={ctxMenu.close} 
         actions={contextActions} 
      />

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-lg rounded-3xl border border-card-border shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-card-border flex items-center justify-between bg-white/5 backdrop-blur-sm">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">{fileToReplace ? 'Replace File' : `Add Content to ${categories.find(c => c.id === activeCategory)?.name || activeCategory}`}</h3>
                <button onClick={() => {setIsUploadModalOpen(false); setSelectedFile(null); setUploadProgress(0); setFileToReplace(null); setLinkUrl(''); setLinkTitle(''); setLinkImageUrl(''); setLinkDescription('');}} className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground bg-muted rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 sm:p-8 space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Resource URL *</label>
                    <input 
                      type="url" 
                      value={linkUrl} 
                      onChange={e => setLinkUrl(e.target.value)} 
                      placeholder="https://..."
                      className="w-full px-5 py-3 rounded-2xl border border-card-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all shadow-inner" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Title *</label>
                    <input 
                      type="text" 
                      value={linkTitle} 
                      onChange={e => setLinkTitle(e.target.value)} 
                      placeholder="e.g. Online Textbook"
                      className="w-full px-5 py-3 rounded-2xl border border-card-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all shadow-inner" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Preview Image URL (Optional)</label>
                    <input 
                      type="url" 
                      value={linkImageUrl} 
                      onChange={e => setLinkImageUrl(e.target.value)} 
                      placeholder="https://..."
                      className="w-full px-5 py-3 rounded-2xl border border-card-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all shadow-inner" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Description (Optional)</label>
                    <textarea 
                      value={linkDescription} 
                      onChange={e => setLinkDescription(e.target.value)} 
                      placeholder="Add a brief description..."
                      rows={3}
                      className="w-full px-5 py-3 rounded-2xl border border-card-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all shadow-inner resize-none" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 sm:px-8 sm:py-5 border-t border-card-border flex justify-end gap-3 bg-muted/30">
                <button onClick={() => {setIsUploadModalOpen(false); setSelectedFile(null); setFileToReplace(null); setLinkUrl(''); setLinkTitle(''); setLinkImageUrl(''); setLinkDescription('');}} className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground">Cancel</button>
                <button 
                  onClick={executeAddLink} 
                  disabled={!linkUrl || !linkTitle || uploading} 
                  className="px-4 py-2 sm:px-6 sm:py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50"
                >
                  {uploading ? 'Adding...' : 'Add Link'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-md rounded-3xl border border-card-border shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-card-border flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Create Category</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 sm:p-8 space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Category Name</label>
                  <input 
                    type="text" 
                    value={categoryName} 
                    onChange={e => setCategoryName(e.target.value)} 
                    placeholder="e.g. Midterm Papers"
                    className="w-full px-5 py-3 rounded-2xl border border-card-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all shadow-inner" 
                  />
                </div>
              </div>
              <div className="px-6 py-4 sm:px-8 sm:py-5 border-t border-card-border flex justify-end gap-3 bg-muted/30">
                <button onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground">Cancel</button>
                <button 
                  onClick={handleAddCategory}
                  disabled={!categoryName.trim()}
                  className="px-4 py-2 sm:px-6 sm:py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50"
                >
                  Save Category
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!fileToDelete}
        title="Delete File"
        message="Are you sure you want to delete this file? This action cannot be undone."
        onConfirm={() => {
          if (fileToDelete) {
            deleteFileRecord(fileToDelete.id, fileToDelete.storagePath);
            setFileToDelete(null);
            toast.success('File deleted successfully');
          }
        }}
        onCancel={() => setFileToDelete(null)}
      />
    </div>
  );
}
