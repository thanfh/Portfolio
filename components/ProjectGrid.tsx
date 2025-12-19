
import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { motion } from 'framer-motion';
import { ArrowUpRight, MoveLeft, SearchX } from 'lucide-react';
import JustifiedGrid from './Shared/JustifiedGrid';

const MotionDiv = motion.div as any;
const MotionImg = motion.img as any;

const ProjectGrid: React.FC<{ projects: Project[]; uiText: Record<string, string>; onOpenCaseStudy: (project: Project) => void; onNavigateHome: () => void }> = ({ projects, uiText, onOpenCaseStudy, onNavigateHome }) => {
  const [rowHeight, setRowHeight] = useState(400);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setRowHeight(280); 
      else if (window.innerWidth < 1024) setRowHeight(380); 
      else setRowHeight(440); // Reduced from 550 to prevent huge items on 22inch+ screens                             
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const gridItems = projects.map(p => ({
    id: p.id,
    src: p.imageUrl,
    width: 1.5, // Target fixed aspect ratio for projects to keep it cleaner
    height: 1,
    originalData: p
  }));

  return (
    <section id="work" className="w-full bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white overflow-hidden min-h-screen">
      <div className="pt-36 md:pt-48 pb-16 md:pb-24 px-4 md:px-12 border-b border-neutral-200 dark:border-neutral-900 relative">
          <h1 className="text-[15vw] font-bold tracking-tighter text-neutral-200 dark:text-neutral-900/80 absolute top-24 left-0 w-full text-center z-0 pointer-events-none">{uiText.work_title}</h1>
          <div className="relative z-10 max-w-4xl pt-24">
              <span className="text-amber-600 font-mono text-sm uppercase tracking-widest mb-6 block">{uiText.work_selected_works}</span>
              <p className="text-2xl md:text-5xl font-medium text-neutral-800 dark:text-neutral-300 leading-tight">A curated selection of commercial and personal projects exploring the boundaries of digital design.</p>
          </div>
      </div>
      
      <div className="w-full px-4 md:px-12 py-20 flex flex-col gap-24">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-neutral-400">
              <SearchX size={64} strokeWidth={1} className="mb-6 opacity-20" />
              <h3 className="text-2xl font-bold uppercase tracking-widest">No matches found</h3>
          </div>
        ) : (
          <section className="relative">
              <div className="sticky top-[68px] z-30 flex items-end justify-between pb-2 pt-4 w-full mix-blend-difference pointer-events-none">
                  <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white uppercase">{uiText.work_featured_projects}</h2>
                  <div className="text-[10px] font-mono uppercase text-neutral-300">2022 — 2024</div>
              </div>
              <div className="pt-2">
                  <JustifiedGrid 
                    items={gridItems} 
                    targetRowHeight={rowHeight} 
                    gap={8}
                    renderItem={(item, style) => {
                      const project = item.originalData as Project;
                      return (
                        <MotionDiv layoutId={`project-img-${project.id}`} className="relative group overflow-hidden bg-neutral-900 cursor-pointer h-full w-full" onClick={() => onOpenCaseStudy(project)}>
                          <MotionImg src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 md:p-10">
                              <div className="transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500">
                                  <div className="flex items-center gap-3 mb-3">
                                      <span className="px-3 py-1 border border-white/30 rounded-full text-[10px] font-mono uppercase tracking-widest text-white/80">{project.category}</span>
                                      <span className="text-[10px] font-mono text-white/50">{project.year}</span>
                                  </div>
                                  <h3 className="text-xl md:text-5xl font-bold text-white mb-4 tracking-tighter">{project.title}</h3>
                                  <div className="flex items-center gap-2 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest">
                                      <span>{uiText.work_view_project}</span>
                                      <ArrowUpRight size={14} />
                                  </div>
                              </div>
                          </div>
                        </MotionDiv>
                      );
                    }}
                  />
              </div>
          </section>
        )}

        <div className="w-full flex justify-center pt-20 border-t border-neutral-200 dark:border-neutral-900">
           <button onClick={onNavigateHome} className="group flex flex-col items-center gap-4 py-8">
              <div className="flex items-center gap-4 text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors duration-500">
                  <MoveLeft size={32} className="group-hover:-translate-x-4 transition-transform duration-500" />
                  <span className="text-4xl md:text-7xl font-bold tracking-tighter uppercase">Take Me Home</span>
              </div>
           </button>
        </div>
      </div>
    </section>
  );
};

export default ProjectGrid;
