import { Course } from './types';

export const INITIAL_COURSES: Omit<Course, 'id'>[] = [
  {
    code: 'MA23313',
    title: 'Discrete Mathematics for AI',
    category: 'Basic Science',
    credits: 4,
    colorTheme: 'purple'
  },
  {
    code: 'CD23331',
    title: 'Design Processes and Perspectives',
    category: 'Professional Core',
    credits: 4,
    colorTheme: 'blue'
  },
  {
    code: 'CS23331',
    title: 'Design and Analysis of Algorithms',
    category: 'Professional Core',
    credits: 4,
    colorTheme: 'green'
  },
  {
    code: 'CD23332',
    title: 'UI and UX Design',
    category: 'Professional Core',
    credits: 4,
    colorTheme: 'pink'
  },
  {
    code: 'CS23332',
    title: 'Database Management Systems',
    category: 'Professional Core',
    credits: 5,
    colorTheme: 'orange'
  },
  {
    code: 'CD23321',
    title: 'Python Programming for Design',
    category: 'Professional Core Laboratory',
    credits: 3,
    colorTheme: 'yellow'
  }
];

export const DEFAULT_CATEGORIES = [
  { id: 'notes', name: 'Notes', icon: 'FileText' },
  { id: 'tutorials', name: 'Tutorials', icon: 'Video' },
  { id: 'assignments', name: 'Assignments', icon: 'ClipboardList' },
  { id: 'syllabus', name: 'Syllabus', icon: 'BookOpen' }
];

export const THEMES = [
  'purple', 'blue', 'green', 'pink', 'orange', 
  'yellow', 'red', 'teal', 'cyan', 'indigo', 
  'violet', 'fuchsia', 'rose', 'emerald', 'lime', 
  'amber', 'sky', 'slate', 'zinc', 'neutral'
];
