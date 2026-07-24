import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Key } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  const [password, setPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
    }
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  const handleConfirm = () => {
    const savedPassword = localStorage.getItem('admin_password') || 'Cosmic-ae';
    if (password === savedPassword) {
      onConfirm();
    } else {
      toast.error('Incorrect password');
    }
  };

  const handleChangePassword = () => {
    const savedPassword = localStorage.getItem('admin_password') || 'Cosmic-ae';
    if (currentPassword === savedPassword) {
      if (newPassword.trim()) {
        localStorage.setItem('admin_password', newPassword);
        toast.success('Password changed successfully');
        setIsChangingPassword(false);
      } else {
        toast.error('New password cannot be empty');
      }
    } else {
      toast.error('Incorrect current password');
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm overflow-hidden rounded-3xl bg-card border border-card-border shadow-2xl text-left align-middle"
            >
              <div className="px-6 py-4 border-b border-card-border flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{isChangingPassword ? 'Change Password' : title}</h3>
                <button onClick={onCancel} className="p-2 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                {!isChangingPassword ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{message}</p>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Enter Password
                      </label>
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-card-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
                        placeholder="Password required"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Current Password</label>
                      <input 
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-card-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
                        placeholder="Current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">New Password</label>
                      <input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-card-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
                        placeholder="New password"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-card-border flex justify-between items-center bg-muted/50">
                {!isChangingPassword ? (
                  <button 
                    onClick={() => setIsChangingPassword(true)} 
                    className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg"
                    title="Change Password"
                  >
                    <Key className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsChangingPassword(false)} 
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Back
                  </button>
                )}
                
                <div className="flex gap-3">
                  <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                  {!isChangingPassword ? (
                    <button 
                      onClick={handleConfirm} 
                      disabled={!password}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                    >
                      Confirm
                    </button>
                  ) : (
                    <button 
                      onClick={handleChangePassword}
                      disabled={!currentPassword || !newPassword}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
