/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Courses } from './pages/Courses';
import { CourseDetails } from './pages/CourseDetails';
import { AdminDashboard } from './pages/AdminDashboard';
import { About } from './pages/About';
import { Announcements } from './pages/Announcements';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="cosmic-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetails />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="about" element={<About />} />
            <Route path="admin" element={<AdminDashboard />} />
          </Route>        </Routes>
      </Router>
      <Toaster position="top-center" toastOptions={{ style: { background: 'var(--color-card)', color: 'var(--color-foreground)', border: '1px solid var(--color-card-border)' } }} />
    </ThemeProvider>
  );
}
