
import React, { useEffect, useRef } from 'react';
import { Project, ProjectBlock } from '../types';
import ProjectCard from './ProjectCard';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

const MotionDiv = motion.div as any;

const RenderBlock: React.FC<{ block: ProjectBlock }> = ({ block }) => {
    switch (block.type) {
        case 'text':
            return (
                <div className="max-w-4xl mx-auto py-12 md:py-24">
                    {block.title && <h3 className="text-2xl md:text-3xl font-bold mb-6 text-neutral-900 dark:text-white uppercase tracking-tight">{block.title}</h3>}
                    <p className="text-xl md:text-2xl text-neutral-700 dark:text-neutral-400 leading-relaxed font-light">{block.content}</p>
                </div>
            );
        case 'full-image':
            return (
                <div className="w-full py-12">
                    <img src={block.imageUrl} alt={block.caption || ""} className="w-full h-auto rounded-sm shadow-xl" />
                    {block.caption && <p className="mt-4 text-xs font-mono text-neutral-500 uppercase tracking-widest text-center">{block.caption}</p>}
                </div>
            );
        case 'image-grid':
            let gridCols = 'md:grid-cols-2';
            if (block.layout === 'simple-3') gridCols = 'md:grid-cols-3';
            if (block.layout === 'simple-4') gridCols = 'md:grid-cols-4';

            return (
                <div className={`grid gap-4 py-12 grid-cols-1 ${gridCols}`}>
                    {block.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-full h-auto rounded-sm object-cover aspect-square" />
                    ))}
                </div>
            );
        case 'quote':
            return (
                <div className="max-w-5xl mx-auto py-24 md:py-40 text-center">
                    <blockquote className="text-3xl md:text-6xl font-serif italic text-neutral-900 dark:text-white mb-8">"{block.text}"</blockquote>
                    {block.author && <cite className="text-sm font-mono text-neutral-500 uppercase tracking-[0.2em]">— {block.author}</cite>}
                </div>
            );
        case 'two-column':
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 py-12 md:py-24 items-center">
                    <div>
                        {block.leftTitle && <h3 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white uppercase tracking-tight">{block.leftTitle}</h3>}
                        <p className="text-lg md:text-xl text-neutral-700 dark:text-neutral-400 leading-relaxed">{block.leftContent}</p>
                    </div>
                    {block.rightImage ? <img src={block.rightImage} alt="" className="w-full h-auto rounded-sm" /> : <p className="text-lg md:text-xl text-neutral-700 dark:text-neutral-400 leading-relaxed">{block.rightContent}</p>}
                </div>
            );
        default: return null;
    }
};

interface CaseStudyViewProps {
  project: Project;
  allProjects: Project[];
  uiText: Record<string, string>;
  onBack: () => void;
  onOpenCaseStudy: (project: Project) => void;
}

const CaseStudyView: React.FC<CaseStudyViewProps> = ({ project, allProjects, uiText, onBack, onOpenCaseStudy }) => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [project.id]);

  const relatedProjects = allProjects.filter(p => p.category === project.category && p.id !== project.id);

  return (
    <MotionDiv key={project.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-neutral-50 dark:bg-neutral-950 w-full relative transition-colors duration-300">
        <section ref={heroRef} className="pt-32 md:pt-48 px-4 md:px-12 max-w-screen-2xl mx-auto mb-24 md:mb-40">
            <MotionDiv className="flex justify-between items-center mb-16 border-b border-neutral-300 dark:border-neutral-700 pb-6">
                <button onClick={onBack} className="flex items-center gap-3 text-sm font-mono uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                    <ArrowLeft size={18} /> {uiText.case_study_back}
                </button>
                <div className="flex gap-4 text-sm font-mono uppercase text-neutral-500"><span>{project.category}</span><span>/</span><span>{project.year}</span></div>
            </MotionDiv>
            <MotionDiv className="mb-24"><h1 className="text-[12vw] leading-[0.85] font-bold text-neutral-900 dark:text-white tracking-tighter uppercase break-words">{project.title}</h1></MotionDiv>
            <MotionDiv className="grid grid-cols-1 md:grid-cols-4 border-t border-neutral-300 dark:border-neutral-700 mb-16">
                <div className="col-span-1 md:col-span-2 py-8 md:pr-16 border-b md:border-b-0 border-neutral-300 dark:border-neutral-700">
                     <span className="block text-xs uppercase tracking-widest text-neutral-500 mb-4">{uiText.case_study_overview}</span>
                     <p className="text-2xl md:text-4xl leading-tight font-medium text-neutral-800 dark:text-neutral-200">{project.description}</p>
                </div>
                <div className="col-span-1 py-8 md:px-8 md:border-l border-neutral-300 dark:border-neutral-700 border-b md:border-b-0">
                    <span className="block text-xs uppercase tracking-widest text-neutral-500 mb-4">{uiText.case_study_services}</span>
                    <ul className="flex flex-col gap-2">{project.tools?.map(t => <li key={t} className="text-base font-mono text-neutral-700 dark:text-neutral-400">{t}</li>)}</ul>
                </div>
                <div className="col-span-1 py-8 md:pl-8 md:border-l border-neutral-300 dark:border-neutral-700">
                    <span className="block text-xs uppercase tracking-widest text-neutral-500 mb-4">{uiText.case_study_client}</span>
                    <p className="text-base font-mono text-neutral-700 dark:text-neutral-400 mb-8">{uiText.confidential}</p>
                    <span className="block text-xs uppercase tracking-widest text-neutral-500 mb-4">{uiText.case_study_year}</span>
                    <p className="text-base font-mono text-neutral-700 dark:text-neutral-400">{project.year}</p>
                </div>
            </MotionDiv>
            <div className="relative w-full aspect-video overflow-hidden rounded-sm bg-neutral-200 dark:bg-neutral-900">
                <MotionDiv style={{ y }} className="w-full h-full">
                    {project.videoUrl ? <video src={project.videoUrl} autoPlay muted loop playsInline className="w-full h-[120%] object-cover -mt-[10%]" /> : <img src={project.imageUrl} alt={project.title} className="w-full h-[120%] object-cover -mt-[10%]" />}
                </MotionDiv>
            </div>
        </section>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-12 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 mb-32 border-b border-neutral-200 dark:border-neutral-900 pb-32">
              <div>
                <span className="text-amber-700 text-sm uppercase tracking-widest font-bold mb-6 block">{uiText.case_study_challenge}</span>
                <p className="text-neutral-800 dark:text-neutral-400 text-xl md:text-2xl leading-relaxed font-light">{project.challenge || "Pushing boundaries of digital form."}</p>
              </div>
              <div>
                <span className="text-emerald-700 text-sm uppercase tracking-widest font-bold mb-6 block">{uiText.case_study_solution}</span>
                <p className="text-neutral-800 dark:text-neutral-400 text-xl md:text-2xl leading-relaxed font-light">{project.solution || "Integrated procedural workflows."}</p>
              </div>
          </div>
          <div className="space-y-0">{project.blocks?.map((block) => <RenderBlock key={block.id} block={block} />)}</div>
          {relatedProjects.length > 0 && (
            <div className="mt-32 border-t border-neutral-300 dark:border-neutral-800 pt-32">
               <h3 className="text-3xl md:text-5xl font-semibold text-neutral-900 dark:text-white uppercase tracking-tighter mb-16">{uiText.case_study_more}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">{relatedProjects.slice(0, 2).map(p => <ProjectCard key={p.id} project={p} onClick={() => onOpenCaseStudy(p)} />)}</div>
            </div>
          )}
          <div className="mt-32 border-t border-neutral-300 dark:border-neutral-800 pt-12 flex justify-end">
             <button onClick={onBack} className="text-4xl md:text-7xl font-bold hover:text-neutral-500 transition-colors tracking-tighter flex items-center gap-6 uppercase">{uiText.case_study_view_all} <ArrowUpRight size={48} /></button>
          </div>
      </div>
    </MotionDiv>
  );
};

export default CaseStudyView;
