import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function useContextMenu() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState<any>(null);

  const open = (e: React.MouseEvent, targetItem: any) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setItem(targetItem);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setItem(null);
  };

  useEffect(() => {
    const handleClick = () => setIsOpen(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return { position, isOpen, item, open, close };
}

export function ContextMenu({ position, isOpen, item, onClose, actions }: any) {
  const menuRef = useRef<HTMLDivElement>(null);
  
  if (!isOpen || !item) return null;

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none"
    >
      <div 
        ref={menuRef}
        className="absolute z-50 min-w-[200px] bg-card border border-card-border rounded-xl shadow-xl overflow-hidden py-1 pointer-events-auto backdrop-blur-md bg-opacity-95"
        style={{ top: position.y, left: position.x }}
      >
        {actions.map((action: any, idx: number) => (
          <button
            key={idx}
            className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-3 transition-colors ${action.danger ? 'text-error hover:bg-error/10' : 'text-foreground hover:bg-muted/80'}`}
            onClick={() => { action.onClick(item); onClose(); }}
          >
            {action.icon && <action.icon className="w-4 h-4 opacity-70" />}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
