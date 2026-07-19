// Modal component with backdrop and slide-in animation

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus trap
      const firstFocusable = contentRef.current?.querySelector(
        'input, button, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (firstFocusable) setTimeout(() => firstFocusable.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const sizeClass = size === 'sm' ? 'max-w-[400px]' : size === 'lg' ? 'max-w-[640px]' : 'max-w-[520px]';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div
        className={`w-full ${sizeClass} bg-surface border border-border rounded-2xl animate-scale-in`}
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-txt">{title}</h2>
          <button className="flex items-center justify-center w-7 h-7 rounded-lg border-none bg-transparent text-txt-tertiary cursor-pointer transition-all duration-150 hover:bg-overlay hover:text-txt" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
