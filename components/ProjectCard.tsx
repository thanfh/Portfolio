
import React, { useState } from 'react';
import { Project } from '../types';
import { motion } from 'framer-motion';
import { Play, ArrowUpRight } from 'lucide-react';

const MotionDiv = motion.div as any;
const MotionImg = motion.img as any;

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  className?: string;
  showCategory?: boolean;
  variant?: 'default' | 'image-only';
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onClick, 
  className = "", 
  showCategory = false,
  variant = 'default' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <MotionDiv
      variants={cardVariants}
      className={`group relative cursor-pointer break-inside-avoid select-none flex flex-col ${className}`}
      onClick={() => onClick(project)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-sm bg-neutral-200 dark:bg-neutral-900 aspect-[4/3] w-full transition-colors">
        <MotionImg 
          src={project.imageUrl} 
          alt={project.title} 
          draggable="false"
          onDragStart={(e: any) => e.preventDefault()}
          className="w-full h-full object-cover will-change-transform"
          animate={{ scale: isHovered ? 1.05 : 1 }} 
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-black/10 dark:bg-black/20">
          <div className="w-20 h-20 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md rounded-full flex items-center justify-center text-black dark:text-white border border-white/40 shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
             {project.videoUrl ? <Play size={28} fill="currentColor" /> : <ArrowUpRight size={28} />}
          </div>
        </div>
      </div>

      {variant === 'default' && (
        <div className="mt-4 flex flex-col gap-1">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white leading-tight group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                {project.title}
            </h3>
            <span className="text-sm text-neutral-500 dark:text-neutral-500 font-mono mt-1">
                {project.year}
            </span>
          </div>
          
          {showCategory && (
            <div className="flex gap-2 mt-1">
               <span className="text-xs font-medium uppercase tracking-wider px-2 py-1 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-600 dark:text-neutral-400">
                  {project.category}
               </span>
            </div>
          )}
        </div>
      )}

    </MotionDiv>
  );
};

export default ProjectCard;
