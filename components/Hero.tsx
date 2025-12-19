
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Instagram, Linkedin, Facebook, Send, ArrowRight, FileText, Twitter, Github, Mail } from 'lucide-react';
import { PROJECTS } from '../constants';
import { Project, Profile } from '../types';

const MotionDiv = motion.div as any;

const iconMap: Record<string, React.ComponentType<any>> = {
  Instagram,
  Linkedin,
  Facebook,
  Telegram: Send,
  Twitter,
  Github,
  Mail
};

interface HeroProps {
  profile: Profile;
  uiText: Record<string, string>;
  onOpenCaseStudy: (project: Project) => void;
  onNavigateToWork: () => void;
}

const Hero: React.FC<HeroProps> = ({ profile, uiText, onNavigateToWork }) => {
  const heroVisual = PROJECTS.find(p => p.id === 'p2') || PROJECTS[0];
  
  const handleScrollDown = () => {
    document.getElementById('intro-manifesto')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col w-full bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-300">
      <section id="home" className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-neutral-950">
        <div className="absolute inset-0 z-0">
          {heroVisual.videoUrl ? (
            <video src={heroVisual.videoUrl} poster={heroVisual.imageUrl} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-80" />
          ) : (
            <img src={heroVisual.imageUrl} alt="Hero Background" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/50 z-10 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-20 container mx-auto px-4 text-center">
          <MotionDiv initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col items-center w-full max-w-6xl mx-auto">
            <span className="inline-block py-1 px-3 border border-white/20 rounded-full bg-white/5 backdrop-blur-md text-[10px] md:text-sm font-mono text-neutral-300 mb-8 tracking-[0.2em] uppercase">
              {profile.role} — Vietnam
            </span>
            {/* Clamped font size for better responsiveness */}
            <h1 className="text-[12vw] md:text-[8vw] lg:text-[7vw] font-bold text-white leading-tight tracking-tighter mb-12 mix-blend-screen max-w-full">
              Digital <span className="font-serif italic font-light text-neutral-300">Artisan</span>
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex gap-8 items-center justify-center">
                {profile.socials.map((social, idx) => {
                  const Icon = iconMap[social.iconName] || Mail;
                  return (
                    <a key={idx} href={social.url} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-all">
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
              <div className="hidden md:block w-px h-8 bg-white/20"></div>
              <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full text-white text-sm font-mono tracking-widest uppercase transition-all">
                <FileText size={18} /> Resume
              </a>
            </div>
          </MotionDiv>
        </div>
        <div className="absolute bottom-8 left-0 right-0 w-full z-20 flex justify-center cursor-pointer" onClick={handleScrollDown}>
           <ArrowDown size={20} className="text-white/50 animate-bounce" />
        </div>
      </section>

      <section id="intro-manifesto" className="py-24 md:py-40 px-6 md:px-12 bg-neutral-50 dark:bg-neutral-950 min-h-[80vh] flex items-center">
        <div className="container mx-auto max-w-screen-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
             <div className="lg:col-span-3">
                <div className="sticky top-32">
                    <span className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-neutral-500 mb-8">
                        <span className="w-8 h-px bg-neutral-400 dark:bg-neutral-600"></span>
                        {uiText.hero_about_me}
                    </span>
                    <div className="hidden lg:flex flex-col gap-4 text-xs font-mono text-neutral-400">
                        <p>EXP: 8+ YEARS</p>
                        <p>BASED: HANOI</p>
                        <p>FOCUS: 3D / BRAND</p>
                    </div>
                </div>
             </div>
             <div className="lg:col-span-9">
                <MotionDiv initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium leading-tight text-neutral-900 dark:text-white mb-12 tracking-tight">
                       {profile.tagline}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-neutral-300 dark:border-neutral-800 pt-12">
                        <div className="text-neutral-700 dark:text-neutral-400 text-lg leading-relaxed">
                            <p className="mb-6">{profile.bio}</p>
                            <p className="text-sm font-mono text-neutral-500">Softwares: Blender, Houdini, C4D, AE, Figma, React.</p>
                        </div>
                        <div className="flex flex-col justify-between items-start h-full gap-8">
                             <p className="text-neutral-500 text-sm italic">"{uiText.hero_manifesto_quote}"</p>
                             <button onClick={onNavigateToWork} className="group flex items-center justify-between w-full py-8 border-y border-neutral-300 dark:border-neutral-800 text-2xl md:text-4xl font-light text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-900 transition-all">
                                <span>{uiText.hero_view_all}</span>
                                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                             </button>
                        </div>
                    </div>
                </MotionDiv>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
