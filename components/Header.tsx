
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NAV_LINKS } from '../constants';
import { Profile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Headphones } from 'lucide-react';

const MotionDiv = motion.div as any;

interface HeaderProps {
  profile?: Profile;
  currentView: 'home' | 'work' | 'gallery' | 'draft' | 'admin';
  onViewChange: (view: 'home' | 'work' | 'gallery' | 'draft' | 'admin') => void;
  isMusicPlaying: boolean;
  toggleMusic: () => void;
}

const Header: React.FC<HeaderProps> = ({ profile, currentView, onViewChange, isMusicPlaying, toggleMusic }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => { setIsScrolled(window.scrollY > 20); };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    onViewChange(href as any);
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 w-full z-[90] transition-all duration-300 ease-in-out flex items-center border-b ${
          isScrolled 
            ? 'bg-white/90 dark:bg-neutral-950/90 backdrop-blur-lg h-[52px] md:h-[68px] border-neutral-200 dark:border-neutral-800 shadow-sm' 
            : 'bg-transparent backdrop-blur-sm h-[72px] md:h-[96px] border-transparent'
        }`}
      >
        <div className="w-full px-4 md:px-12 flex items-center justify-between">
          <button 
            onClick={() => handleNavClick('home')}
            className="text-xl md:text-2xl font-semibold tracking-tighter uppercase z-50 transition-colors text-neutral-900 dark:text-white"
          >
            {profile?.name || "PORTFOLIO"}
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button 
                key={link.label} 
                onClick={() => handleNavClick(link.href)}
                className={`relative text-base font-medium transition-colors tracking-wide ${
                  currentView === link.href 
                    ? 'text-neutral-900 dark:text-white font-bold' 
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {link.label}
                {currentView === link.href && (
                  <MotionDiv
                    layoutId="active-nav-dot"
                    className="absolute -bottom-1 left-0 w-full h-[1px] bg-neutral-900 dark:bg-white"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
            <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700 mx-2" />
            <div className="flex items-center gap-6">
              <button
                onClick={toggleMusic}
                className={`transition-colors ${isMusicPlaying ? 'text-black dark:text-white animate-pulse' : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'}`}
              >
                <Headphones size={22} />
              </button>
            </div>
          </nav>

          <div className="md:hidden flex items-center gap-4 z-50">
            <button onClick={toggleMusic} className={`transition-colors text-neutral-900 dark:text-neutral-200 ${isMusicPlaying ? 'animate-pulse' : 'opacity-80'}`}><Headphones size={20} /></button>
            <button className="text-neutral-900 dark:text-neutral-200" onClick={() => setMobileMenuOpen(true)}><Menu size={24} /></button>
          </div>
        </div>
      </header>

      {createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <MotionDiv
              initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 w-full h-full bg-white dark:bg-neutral-950 flex flex-col items-center justify-center gap-8 md:hidden p-8 z-[1000]"
            >
              <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 rounded-full"><X size={24} /></button>
              
              <button 
                onClick={() => handleNavClick('home')}
                className={`text-4xl font-light uppercase tracking-widest ${currentView === 'home' ? 'text-neutral-900 dark:text-white font-bold' : 'text-neutral-400 dark:text-neutral-500'}`}
              >
                Home
              </button>

              {NAV_LINKS.map((link) => (
                  <button key={link.label} onClick={() => handleNavClick(link.href)} className={`text-4xl font-light uppercase tracking-widest ${currentView === link.href ? 'text-neutral-900 dark:text-white font-bold' : 'text-neutral-400 dark:text-neutral-500'}`}>{link.label}</button>
              ))}
            </MotionDiv>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Header;
