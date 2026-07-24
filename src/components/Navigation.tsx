import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Moon, Sun, LogIn, LogOut, Shield, FileText } from 'lucide-react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useAuth } from '../lib/useAuth';
import { useSettings } from '../lib/useSettings';
import { cn } from '../lib/utils';
import { useTheme } from './ThemeProvider';
import { ConfirmModal } from './ConfirmModal';
import { useState } from 'react';

export function Navigation() {
  const { user, isAdmin } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email !== 'cosmicpc8@gmail.com') {
        await signOut(auth);
        alert('Access denied. Only the admin (cosmicpc8@gmail.com) can log in.');
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // User cancelled the login
      } else {
        console.error('Login failed', error);
        if (error.code === 'auth/popup-blocked') {
          alert('Login popup was blocked by your browser. Please allow popups or open this app in a new tab.');
        } else {
          alert('Login failed: ' + error.message);
        }
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const executeLogout = async () => {
    try {
      await signOut(auth);
      setIsLogoutModalOpen(false);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };


  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Announcements', path: '/announcements' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-card/70 border-b border-card-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-background font-bold">
              {settings.title.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              {settings.title}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative py-2",
                  location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.name}
                <span 
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full transition-transform duration-300 ease-out origin-left",
                    location.pathname === link.path ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/courses')}
              className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-muted"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-muted"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="w-px h-6 bg-card-border mx-2" />
            
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link to="/admin" className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors" title="Admin Dashboard">
                    <Shield className="w-5 h-5" />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-card border border-card-border rounded-full hover:bg-muted transition-colors shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-background bg-foreground rounded-full hover:bg-foreground transition-colors shadow-sm disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">{isLoggingIn ? 'Logging in...' : 'Admin Login'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        onConfirm={executeLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </header>
  );
}
