export interface CourseCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  category: string;
  credits: number;
  colorTheme?: string;
  imageUrl?: string;
  categories?: (string | CourseCategory)[]; // support old string array or new objects
}

export interface MaterialCategory {
  id: string;
  name: string;
  courseId: string;
}

export interface Material {
  id: string;
  courseId: string;
  categoryId: string;
  name: string;
  url: string;
  path: string;
  type: string;
  size: number;
  uploadDate: number;
  uploadedBy: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: number;
}

export interface SiteSettings {
  title: string;
  semester: string;
  theme: string;
  footerText: string;
  aboutText: string;
  heroImageUrl?: string;
}

export const ADMIN_EMAIL = "cosmicpc8@gmail.com";
