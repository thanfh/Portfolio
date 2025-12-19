
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Asterisk, MoveLeft } from 'lucide-react';
import { GalleryCollection, PlaygroundSection } from '../types';
import JustifiedGrid from './Shared/JustifiedGrid';

const MotionDiv = motion.div as any;
const MotionImg = motion.img as any;

interface GalleryViewProps {
  collections: GalleryCollection[];
  drafts: PlaygroundSection[];
  onNavigateHome: () => void;
}

const GalleryView: React.FC<GalleryViewProps> = ({ collections, drafts, onNavigateHome }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rowHeight, setRowHeight] = useState(300);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const handleResize = () => {
      // Mobile: 160px input * 0.7 internal scale = ~112px actual height. 
      // 3 items * 112px (approx width) ~= 336px < screen width, fitting 3 cols.
      if (window.innerWidth < 640) setRowHeight(160); 
      else if (window.innerWidth < 1024) setRowHeight(300); 
      else setRowHeight(400);                              
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white font-sans relative transition-colors duration-300">
      <div className="pt-36 md:pt-48 pb-16 md:pb-24 px-4 md:px-12 border-b border-neutral-200 dark:border-neutral-900 relative overflow-hidden">
          <h1 className="text-[15vw] md:text-[14vw] font-bold tracking-tighter text-neutral-200 dark:text-neutral-900/80 select-none absolute top-24 md:top-32 left-0 w-full text-center z-0 leading-none pointer-events-none uppercase">GALLERY</h1>
          <div className="relative z-10 max-w-4xl pt-12 md:pt-24">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-emerald-600 dark:text-emerald-500 font-mono text-sm uppercase tracking-widest block">Photography & Curations</span>
                <Asterisk size={14} className="text-emerald-600 dark:text-emerald-500 animate-spin" />
              </div>
              <p className="text-2xl md:text-5xl font-medium text-neutral-800 dark:text-neutral-300 leading-tight">Visual captures from various journeys and experimental explorations.</p>
          </div>
      </div>

      <div className="w-full px-4 md:px-12 py-12 md:py-20 flex flex-col gap-24">
        {collections.map((section) => (
          <section key={section.id} className="relative">
            <div className="sticky top-[52px] md:top-[68px] z-30 flex flex-col md:flex-row md:items-end justify-between pb-2 pt-4 w-full mix-blend-difference pointer-events-none">
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white mix-blend-difference uppercase">{section.title}</h2>
                <div className="flex items-center gap-4 md:gap-8 mt-2 md:mt-0 text-[10px] md:text-xs font-mono uppercase tracking-[0.15em] text-neutral-300 mix-blend-difference">
                    <div className="flex items-center gap-2"><MapPin size={12} /><span>{section.location}</span></div>
                    <span className="opacity-50">•</span><span>{section.date}</span>
                </div>
            </div>
            <div className="pt-2">
              <JustifiedGrid 
                items={section.images.map(img => ({ id: img.id || Math.random(), src: img.src, width: img.width || 800, height: img.height || 600, originalData: img }))}
                targetRowHeight={rowHeight}
                gap={4}
                renderItem={(item) => (
                  <div 
                    className="relative group overflow-hidden bg-neutral-900 cursor-zoom-in h-full w-full"
                    onClick={() => setSelectedImage(item.src)}
                  >
                    <img src={item.src} alt="" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" />
                  </div>
                )}
              />
            </div>
          </section>
        ))}

        <div className="w-full flex justify-center pt-20 border-t border-neutral-200 dark:border-neutral-900">
           <button onClick={onNavigateHome} className="group flex flex-col items-center gap-4 py-8">
              <div className="flex items-center gap-4 text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors duration-500 text-center">
                  <MoveLeft size={32} className="group-hover:-translate-x-4 transition-transform duration-500" />
                  <span className="text-4xl md:text-7xl font-bold tracking-tighter uppercase">Take Me Home</span>
              </div>
           </button>
        </div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-8 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
            <MotionImg src={selectedImage} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="max-w-full max-h-[90vh] object-contain shadow-2xl" />
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryView;
