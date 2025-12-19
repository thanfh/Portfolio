
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Plus, Trash2, Save, ArrowLeft, Image as ImageIcon, 
  Briefcase, LogOut, Type, LayoutGrid, 
  Quote as QuoteIcon, Columns, Edit3, X, Camera, Beaker, 
  Home as HomeIcon, Globe, Music, Link as LinkIcon,
  GripVertical, Video, MoveVertical, Eye, EyeOff, Maximize2,
  Code as CodeIcon, Minus, AlignLeft, AlignCenter, AlignRight,
  Palette, CaseUpper, User, FileText, AtSign, ArrowRight,
  Calendar, Users, Star, Search, Flag, Globe2, Layers,
  Square, MousePointer, MonitorPlay, Minus as MinusIcon, Box,
  Bold, Italic, Underline as UnderlineIcon, Play, ChevronLeft
} from 'lucide-react';
import { 
  Project, ProjectBlock, ProjectCategory, BlockType, BaseBlock,
  GalleryCollection, GalleryImage, PlaygroundSection, PlaygroundItem, HomeContent, SocialLink
} from '../types';
import { 
  getProjects, saveProjects, 
  getGallery, saveGallery, 
  getPlayground, savePlayground,
  getHomeContent, saveHomeContent
} from '../services/contentService';

// IMPORT ACTUAL COMPONENTS FOR PREVIEW
import Hero from './Hero';
import CaseStudyView from './CaseStudyView';
import JustifiedGrid from './Shared/JustifiedGrid';

// --- MOCK TYPES IF NOT IMPORTED (For standalone usage safety) ---
type ExtendedBlock = BaseBlock & {
    // Basic Text / Heading
    content?: string;
    title?: string;
    align?: 'left' | 'center' | 'right';
    textStyle?: 'normal' | 'serif' | 'mono';
    textColor?: 'default' | 'muted' | 'accent';
    fontSize?: 'sm' | 'base' | 'lg'; 
    fontWeight?: 'normal' | 'bold'; 
    italic?: boolean; 
    underline?: boolean; 
    headingLevel?: 'h2' | 'h3';

    // Media (Image/Video) Advanced Settings
    imageUrl?: string;
    videoUrl?: string;
    aspectRatio?: any; 
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'full'; 
    shadow?: boolean; 
    caption?: string;
    autoPlay?: boolean; 
    loop?: boolean; 

    // Image Grid
    images?: string[];
    layout?: string;

    // Quote
    text?: string;
    author?: string;

    // Two Column
    leftContent?: string;
    leftTitle?: string;
    rightContent?: string;
    rightImage?: string;

    // New Block Types
    code?: string; 
    language?: 'javascript' | 'typescript' | 'html' | 'css' | 'python' | 'json'; 
    
    buttonText?: string; 
    buttonUrl?: string; 
    buttonStyle?: 'solid' | 'outline' | 'ghost'; 

    height?: string; // For spacer
    
    isCollapsed?: boolean; // UI state
}

interface AdminProject extends Project {
    client?: string;
    role?: string;
    liveUrl?: string;
    featured?: boolean;
    seoDescription?: string;
}
// -----------------------------------------------------------

const MotionDiv = motion.div as any;

interface AdminDashboardProps {
  onBack: () => void;
  onRefresh: () => void;
  onLogout: () => void;
}

type AdminTab = 'home' | 'projects' | 'gallery' | 'drafts';
type ProjectSubTab = 'essentials' | 'narrative' | 'builder' | 'settings';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onRefresh, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('projects'); 
  
  // Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [gallery, setGallery] = useState<GalleryCollection[]>([]);
  const [playground, setPlayground] = useState<PlaygroundSection[]>([]);
  const [homeData, setHomeData] = useState<HomeContent | null>(null);

  // Project Editing State
  const [isEditingProj, setIsEditingProj] = useState(false);
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [activeProjectTab, setActiveProjectTab] = useState<ProjectSubTab>('essentials');
  
  // Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'home' | 'project'>('home');
  const [isSaving, setIsSaving] = useState(false); // Added loading state for saves

  const initialProjectState: Partial<AdminProject> = {
    title: '', year: new Date().getFullYear().toString(), category: 'Branding',
    description: '', imageUrl: '', videoUrl: '', challenge: '', solution: '',
    tools: [], blocks: [], client: '', role: '', liveUrl: '', featured: false
  };
  
  const [projForm, setProjForm] = useState<Partial<AdminProject>>(initialProjectState);
  const [toolsInput, setToolsInput] = useState('');

  // Fetch Data on Mount (FIXED: ASYNC/AWAIT)
  useEffect(() => {
    const fetchData = async () => {
        try {
            const [p, g, pg, h] = await Promise.all([
                getProjects(),
                getGallery(),
                getPlayground(),
                getHomeContent()
            ]);
            setProjects(p);
            setGallery(g);
            setPlayground(pg);
            setHomeData(h);
        } catch (error) {
            console.error("Failed to load admin data", error);
        }
    };
    fetchData();
  }, []);

  // --- HELPER: DRAG & DROP REORDER ---
  const handleReorderBlocks = (newOrder: any[]) => {
      setProjForm({ ...projForm, blocks: newOrder });
  };

  const updateBlock = (blockId: string, data: Partial<ExtendedBlock>) => {
    const updatedBlocks = projForm.blocks?.map(b => b.id === blockId ? { ...b, ...data } : b);
    setProjForm({ ...projForm, blocks: updatedBlocks as ProjectBlock[] });
  };

  const toggleBlockCollapse = (blockId: string) => {
    const updatedBlocks = projForm.blocks?.map((b: any) => b.id === blockId ? { ...b, isCollapsed: !b.isCollapsed } : b);
    setProjForm({ ...projForm, blocks: updatedBlocks as ProjectBlock[] });
  };

  const duplicateBlock = (block: ProjectBlock) => {
      const newBlock = { ...block, id: `b-${Date.now()}` };
      const blocks = projForm.blocks || [];
      const index = blocks.findIndex(b => b.id === block.id);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setProjForm({ ...projForm, blocks: newBlocks as ProjectBlock[] });
  }

  // --- HOME ACTIONS ---
  const handleSaveHome = async () => {
    if (homeData) {
      setIsSaving(true);
      await saveHomeContent(homeData);
      onRefresh();
      setIsSaving(false);
      alert("Home content updated successfully!");
    }
  };

  const updateProfile = (data: any) => {
    if (homeData) setHomeData({ ...homeData, profile: { ...homeData.profile, ...data } });
  };

  const updateUiText = (key: string, value: string) => {
    if (homeData) setHomeData({ ...homeData, uiText: { ...homeData.uiText, [key]: value } });
  };

  const addSocial = () => {
    if (homeData) {
      const newSocial: SocialLink = { id: `s-${Date.now()}`, platform: 'Platform', url: '', iconName: 'Instagram' };
      setHomeData({ ...homeData, profile: { ...homeData.profile, socials: [...homeData.profile.socials, newSocial] } });
    }
  };

  // --- PROJECT ACTIONS ---
  const handleSaveProject = async () => {
    if (!projForm.title) return alert("Title is required");
    setIsSaving(true);
    
    // Clean up temporary UI states like isCollapsed before saving
    const cleanBlocks = projForm.blocks?.map(({ isCollapsed, ...rest }: any) => rest) as any[] as ProjectBlock[] || [];

    const projectData: Project = {
      ...(projForm as Project),
      id: editingProjId || `p-${Date.now()}`,
      blocks: cleanBlocks,
      tools: toolsInput.split(',').map(t => t.trim()).filter(t => t !== ''),
      displayOrder: projForm.displayOrder || projects.length + 1
    };
    
    const updated = editingProjId 
        ? projects.map(p => p.id === editingProjId ? projectData : p) 
        : [...projects, projectData];
        
    setProjects(updated);
    await saveProjects(updated);
    setIsSaving(false);
    alert("Project saved successfully!");
    onRefresh();
  };

  const deleteProject = async (id: string) => {
    if (confirm("Delete project? This cannot be undone.")) {
      setIsSaving(true);
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      await saveProjects(updated);
      onRefresh();
      if (editingProjId === id) {
          setIsEditingProj(false);
          setEditingProjId(null);
      }
      setIsSaving(false);
    }
  };

  const addBlock = (type: BlockType | 'video' | 'spacer' | 'heading' | 'code' | 'button' | 'divider') => {
    const newBlock: any = { id: `b-${Date.now()}`, type, isCollapsed: false };
    
    // Default values
    if (type === 'text') { 
        newBlock.content = ''; 
        newBlock.align = 'left'; 
        newBlock.textStyle = 'normal'; 
        newBlock.fontSize = 'base';
        newBlock.fontWeight = 'normal'; 
        newBlock.italic = false; 
        newBlock.underline = false; 
    }
    if (type === 'heading') { newBlock.content = ''; newBlock.headingLevel = 'h2'; newBlock.align = 'left'; }
    if (type === 'full-image') { newBlock.imageUrl = ''; newBlock.caption = ''; newBlock.aspectRatio = 'auto'; newBlock.radius = 'md'; newBlock.shadow = false; }
    if (type === 'image-grid') { newBlock.images = ['', '']; newBlock.layout = 'simple-2'; }
    if (type === 'quote') { newBlock.text = ''; newBlock.author = ''; }
    if (type === 'two-column') { newBlock.leftContent = ''; newBlock.rightImage = ''; }
    if (type === 'video') { newBlock.videoUrl = ''; newBlock.caption = ''; newBlock.aspectRatio = '16/9'; newBlock.autoPlay = false; }
    if (type === 'spacer') { newBlock.height = '64px'; }
    if (type === 'code') { newBlock.code = ''; newBlock.language = 'javascript'; }
    if (type === 'button') { newBlock.buttonText = 'View Live'; newBlock.buttonUrl = ''; newBlock.buttonStyle = 'solid'; }
    if (type === 'divider') { newBlock.height = '1px'; }

    setProjForm({ ...projForm, blocks: [...(projForm.blocks || []), newBlock] as ProjectBlock[] });
  };

  // --- GALLERY & DRAFTS ACTIONS ---
  const addGalleryCollection = async () => { const newCol: GalleryCollection = { id: `gal-${Date.now()}`, title: 'New Collection', location: 'Location', date: 'Date', images: [] }; const updated = [newCol, ...gallery]; setGallery(updated); await saveGallery(updated); onRefresh(); };
  const updateGalleryCollection = async (id: string, data: Partial<GalleryCollection>) => { const updated = gallery.map(g => g.id === id ? { ...g, ...data } : g); setGallery(updated); await saveGallery(updated); onRefresh(); };
  const deleteGalleryCollection = async (id: string) => { if (confirm("Delete?")) { const updated = gallery.filter(g => g.id !== id); setGallery(updated); await saveGallery(updated); onRefresh(); } };
  const addImageToGallery = async (colId: string) => { const updated = gallery.map(g => g.id === colId ? { ...g, images: [...g.images, { src: '', width: 800, height: 1200, id: `img-${Date.now()}` }] } : g); setGallery(updated); await saveGallery(updated); onRefresh(); };
  const addPlaygroundSection = async () => { const newSec: PlaygroundSection = { id: `play-${Date.now()}`, title: 'New Experiment', description: 'Describe...', items: [] }; const updated = [newSec, ...playground]; setPlayground(updated); await savePlayground(updated); onRefresh(); };
  const updatePlaygroundSection = async (id: string, data: Partial<PlaygroundSection>) => { const updated = playground.map(p => p.id === id ? { ...p, ...data } : p); setPlayground(updated); await savePlayground(updated); onRefresh(); };

  // --- PREVIEW RENDERER ---
  const renderPreview = () => {
      if (previewMode === 'home' && homeData) {
          return (
              <div className="bg-neutral-950 w-full min-h-screen overflow-y-auto">
                   <Hero 
                        profile={homeData.profile} 
                        uiText={homeData.uiText} 
                        onOpenCaseStudy={() => {}} 
                        onNavigateToWork={() => setIsPreviewOpen(false)} 
                   />
              </div>
          );
      }

      if (previewMode === 'project') {
          // Construct a temporary full Project object from form data
          const tempProject: Project = {
              ...(projForm as Project),
              id: editingProjId || 'preview-id',
              blocks: projForm.blocks as ProjectBlock[] || [],
              tools: toolsInput.split(',').map(t => t.trim()).filter(t => t !== ''),
              displayOrder: 99
          };

          return (
              <div className="bg-neutral-950 w-full min-h-screen overflow-y-auto">
                  <CaseStudyView 
                    project={tempProject} 
                    allProjects={projects} // Pass existing projects for "More Projects" section
                    uiText={homeData?.uiText || {}}
                    onBack={() => setIsPreviewOpen(false)}
                    onOpenCaseStudy={() => {}}
                  />
              </div>
          );
      }
      return null;
  }

  // --- UI COMPONENTS FOR BLOCKS ---
  const renderBlockEditor = (block: any) => {
      if (block.isCollapsed) return null;

      switch(block.type) {
          case 'heading':
              return (
                  <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                              {['left', 'center', 'right'].map((align) => (
                                  <button key={align} onClick={() => updateBlock(block.id, { align: align as any })} className={`p-1.5 rounded-md transition-all ${block.align === align ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}>
                                      {align === 'left' && <AlignLeft size={14} />} {align === 'center' && <AlignCenter size={14} />} {align === 'right' && <AlignRight size={14} />}
                                  </button>
                              ))}
                          </div>
                          <select value={block.headingLevel || 'h2'} onChange={e => updateBlock(block.id, { headingLevel: e.target.value as any })} className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg text-xs font-mono outline-none">
                              <option value="h2">H2 (Big)</option><option value="h3">H3 (Medium)</option>
                          </select>
                      </div>
                      <input value={block.content} onChange={e => updateBlock(block.id, { content: e.target.value })} placeholder="Heading Text..." className={`w-full bg-white dark:bg-neutral-950 p-3 rounded-lg font-bold outline-none border border-neutral-200 dark:border-neutral-800 ${block.align === 'center' ? 'text-center' : block.align === 'right' ? 'text-right' : 'text-left'} ${block.headingLevel === 'h3' ? 'text-lg' : 'text-xl'}`} />
                  </div>
              );
          case 'text': 
              return (
                <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {/* Alignment */}
                        <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                             {['left', 'center', 'right'].map((align) => (
                                  <button key={align} onClick={() => updateBlock(block.id, { align: align as any })} className={`p-1.5 rounded-md transition-all ${block.align === align ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}>
                                      {align === 'left' && <AlignLeft size={14} />} {align === 'center' && <AlignCenter size={14} />} {align === 'right' && <AlignRight size={14} />}
                                  </button>
                              ))}
                        </div>

                        {/* Formatting: Bold, Italic, Underline */}
                        <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 gap-1">
                            <button onClick={() => updateBlock(block.id, { fontWeight: block.fontWeight === 'bold' ? 'normal' : 'bold' })} className={`p-1.5 rounded-md transition-all ${block.fontWeight === 'bold' ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}>
                                <Bold size={14} />
                            </button>
                            <button onClick={() => updateBlock(block.id, { italic: !block.italic })} className={`p-1.5 rounded-md transition-all ${block.italic ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}>
                                <Italic size={14} />
                            </button>
                            <button onClick={() => updateBlock(block.id, { underline: !block.underline })} className={`p-1.5 rounded-md transition-all ${block.underline ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}>
                                <UnderlineIcon size={14} />
                            </button>
                        </div>

                        {/* Font Style */}
                        <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 gap-1">
                             {['normal', 'serif', 'mono'].map(style => (
                                 <button key={style} onClick={() => updateBlock(block.id, { textStyle: style as any })} className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${block.textStyle === style || (!block.textStyle && style==='normal') ? 'bg-white shadow text-black' : 'text-neutral-400'}`}>{style}</button>
                             ))}
                        </div>
                        {/* Font Size */}
                        <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 gap-1">
                             {['sm', 'base', 'lg'].map(size => (
                                 <button key={size} onClick={() => updateBlock(block.id, { fontSize: size as any })} className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${block.fontSize === size || (!block.fontSize && size==='base') ? 'bg-white shadow text-black' : 'text-neutral-400'}`}>
                                     {size === 'sm' ? 'S' : size === 'base' ? 'M' : 'L'}
                                 </button>
                             ))}
                        </div>
                        {/* Color */}
                         <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 px-2">
                             <Palette size={12} className="text-neutral-400" />
                             <select value={block.textColor || 'default'} onChange={e => updateBlock(block.id, { textColor: e.target.value as any })} className="bg-transparent text-[10px] font-bold uppercase outline-none cursor-pointer">
                                 <option value="default">Default</option><option value="muted">Muted</option><option value="accent">Accent</option>
                             </select>
                         </div>
                    </div>
                    <textarea 
                        value={block.content} 
                        onChange={e => updateBlock(block.id, { content: e.target.value })} 
                        placeholder="Write your paragraph..." 
                        rows={4} 
                        className={`w-full bg-white dark:bg-neutral-950 p-4 rounded-lg leading-relaxed outline-none border border-neutral-200 dark:border-neutral-800 
                            ${block.align === 'center' ? 'text-center' : block.align === 'right' ? 'text-right' : 'text-left'} 
                            ${block.textStyle === 'serif' ? 'font-serif' : block.textStyle === 'mono' ? 'font-mono' : 'font-sans'} 
                            ${block.fontSize === 'sm' ? 'text-xs' : block.fontSize === 'lg' ? 'text-lg' : 'text-sm'} 
                            ${block.textColor === 'muted' ? 'text-neutral-500' : block.textColor === 'accent' ? 'text-emerald-600' : 'text-neutral-900 dark:text-white'}
                            ${block.fontWeight === 'bold' ? 'font-bold' : 'font-normal'} 
                            ${block.italic ? 'italic' : ''} 
                            ${block.underline ? 'underline underline-offset-4' : ''}
                        `} 
                    />
                </div>
              );
          case 'full-image':
              return (
                <div className="space-y-4">
                    <div className="flex gap-4">
                         <div className="flex-grow space-y-3">
                             <input value={block.imageUrl} onChange={e => updateBlock(block.id, { imageUrl: e.target.value })} placeholder="Image URL (https://...)" className="w-full bg-white dark:bg-neutral-950 p-3 rounded-lg text-sm outline-none border border-neutral-200 dark:border-neutral-800" />
                             <input value={block.caption || ''} onChange={e => updateBlock(block.id, { caption: e.target.value })} placeholder="Image Caption (Optional)" className="w-full bg-white dark:bg-neutral-950 p-3 rounded-lg text-sm outline-none border border-neutral-200 dark:border-neutral-800" />
                             
                             {/* Advanced Image Settings */}
                             <div className="flex gap-3 flex-wrap">
                                 <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-lg">
                                     <span className="text-[9px] font-mono uppercase text-neutral-400 pl-1">Ratio</span>
                                     <select value={block.aspectRatio || 'auto'} onChange={e => updateBlock(block.id, { aspectRatio: e.target.value as any })} className="bg-transparent text-[10px] font-bold uppercase outline-none">
                                         <option value="auto">Auto</option><option value="16/9">16:9</option><option value="4/3">4:3</option><option value="1/1">1:1</option><option value="9/16">9:16</option>
                                     </select>
                                 </div>
                                 <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-lg">
                                     <span className="text-[9px] font-mono uppercase text-neutral-400 pl-1">Radius</span>
                                     <select value={block.radius || 'md'} onChange={e => updateBlock(block.id, { radius: e.target.value as any })} className="bg-transparent text-[10px] font-bold uppercase outline-none">
                                         <option value="none">None</option><option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option><option value="full">Full</option>
                                     </select>
                                 </div>
                                 <button onClick={() => updateBlock(block.id, { shadow: !block.shadow })} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border ${block.shadow ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-transparent border-neutral-300 dark:border-neutral-700 text-neutral-500'}`}>Shadow</button>
                             </div>
                         </div>
                         <div className={`w-32 self-start bg-neutral-200 dark:bg-neutral-800 flex-shrink-0 overflow-hidden ${block.radius === 'full' ? 'rounded-full aspect-square' : `rounded-${block.radius || 'md'} aspect-[${block.aspectRatio === 'auto' ? 'video' : block.aspectRatio?.replace(':','/')}]`}`}>
                            {block.imageUrl ? <img src={block.imageUrl} className={`w-full h-full object-cover ${block.shadow ? 'opacity-90' : ''}`} /> : <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">Preview</div>}
                         </div>
                    </div>
                </div>
              );
          case 'video':
              return (
                <div className="space-y-4">
                    <input value={block.videoUrl || ''} onChange={e => updateBlock(block.id, { videoUrl: e.target.value })} placeholder="Video URL (Vimeo/YouTube/MP4)" className="w-full bg-white dark:bg-neutral-950 p-3 rounded-lg text-sm outline-none border border-neutral-200 dark:border-neutral-800" />
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg">
                             <span className="text-[9px] font-mono uppercase text-neutral-400">Ratio</span>
                             <select value={block.aspectRatio || '16/9'} onChange={e => updateBlock(block.id, { aspectRatio: e.target.value as any })} className="bg-transparent text-[10px] font-bold uppercase outline-none">
                                 <option value="16/9">16:9</option><option value="4/3">4:3</option><option value="1/1">1:1</option><option value="9/16">9:16</option>
                             </select>
                        </div>
                        <label className="flex items-center gap-2 text-xs font-mono uppercase cursor-pointer">
                            <input type="checkbox" checked={block.autoPlay} onChange={e => updateBlock(block.id, { autoPlay: e.target.checked })} className="accent-emerald-500" /> Autoplay
                        </label>
                        <label className="flex items-center gap-2 text-xs font-mono uppercase cursor-pointer">
                            <input type="checkbox" checked={block.loop} onChange={e => updateBlock(block.id, { loop: e.target.checked })} className="accent-emerald-500" /> Loop
                        </label>
                    </div>
                </div>
              );
          case 'code':
              return (
                  <div className="space-y-3">
                      <div className="flex justify-between items-center bg-neutral-100 dark:bg-neutral-800 p-2 rounded-t-lg">
                          <span className="text-[10px] font-mono uppercase text-neutral-500 pl-2">Code Snippet</span>
                          <select value={block.language || 'javascript'} onChange={e => updateBlock(block.id, { language: e.target.value as any })} className="bg-white dark:bg-neutral-900 px-2 py-1 rounded text-xs font-mono outline-none">
                              <option value="javascript">JavaScript</option><option value="typescript">TypeScript</option><option value="html">HTML</option><option value="css">CSS</option><option value="python">Python</option><option value="json">JSON</option>
                          </select>
                      </div>
                      <textarea value={block.code} onChange={e => updateBlock(block.id, { code: e.target.value })} placeholder="// Write your code here..." rows={6} className="w-full bg-neutral-900 text-neutral-200 p-4 rounded-b-lg font-mono text-xs outline-none resize-none" spellCheck={false} />
                  </div>
              );
          case 'button':
              return (
                  <div className="flex gap-4 items-end">
                      <div className="flex-grow space-y-1">
                          <label className="text-[9px] font-mono uppercase text-neutral-400">Button Text</label>
                          <input value={block.buttonText} onChange={e => updateBlock(block.id, { buttonText: e.target.value })} className="w-full bg-white dark:bg-neutral-950 p-2 rounded-lg text-sm border border-neutral-200 dark:border-neutral-800" placeholder="Click Me" />
                      </div>
                      <div className="flex-grow space-y-1">
                          <label className="text-[9px] font-mono uppercase text-neutral-400">URL</label>
                          <input value={block.buttonUrl} onChange={e => updateBlock(block.id, { buttonUrl: e.target.value })} className="w-full bg-white dark:bg-neutral-950 p-2 rounded-lg text-sm border border-neutral-200 dark:border-neutral-800" placeholder="https://..." />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[9px] font-mono uppercase text-neutral-400">Style</label>
                          <select value={block.buttonStyle || 'solid'} onChange={e => updateBlock(block.id, { buttonStyle: e.target.value as any })} className="h-10 bg-neutral-100 dark:bg-neutral-800 px-3 rounded-lg text-xs font-mono outline-none">
                              <option value="solid">Solid</option><option value="outline">Outline</option><option value="ghost">Ghost</option>
                          </select>
                      </div>
                  </div>
              );
          case 'divider':
              return (
                  <div className="flex items-center gap-4 py-2">
                      <div className="h-px bg-neutral-300 dark:bg-neutral-700 flex-grow"></div>
                      <span className="text-[10px] font-mono uppercase text-neutral-400">Divider</span>
                      <div className="h-px bg-neutral-300 dark:bg-neutral-700 flex-grow"></div>
                  </div>
              );
          case 'spacer':
               return (
                  <div className="flex items-center gap-4">
                      <label className="text-xs uppercase font-mono text-neutral-400">Height:</label>
                      <select value={block.height || '64px'} onChange={e => updateBlock(block.id, { height: e.target.value })} className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded text-xs font-mono">
                          <option value="32px">Small (32px)</option>
                          <option value="64px">Medium (64px)</option>
                          <option value="128px">Large (128px)</option>
                      </select>
                      <div className="h-px bg-neutral-200 dark:bg-neutral-800 flex-grow border-dashed border-t border-neutral-400"></div>
                  </div>
               );
          case 'image-grid':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-fit">
                            <span className="text-[10px] font-mono uppercase text-neutral-400 ml-2">Columns:</span>
                            {['2', '3', '4'].map(num => (
                                <button key={num} onClick={() => updateBlock(block.id, { layout: `simple-${num}` })} className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-all ${block.layout === `simple-${num}` ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-black'}`}>{num}</button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {block.images.map((img: string, i: number) => (
                                <div key={i} className="flex gap-2 group relative">
                                    <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 rounded-lg flex-shrink-0 overflow-hidden">
                                        {img && <img src={img} className="w-full h-full object-cover" />}
                                    </div>
                                    <input value={img} onChange={e => { const newImgs = [...block.images]; newImgs[i] = e.target.value; updateBlock(block.id, { images: newImgs }); }} placeholder={`Image URL ${i+1}`} className="flex-grow bg-white dark:bg-neutral-950 p-2 rounded-lg text-xs outline-none border border-neutral-200 dark:border-neutral-800 self-start" />
                                    <button onClick={() => { const newImgs = block.images.filter((_, idx) => idx !== i); updateBlock(block.id, { images: newImgs }); }} className="absolute top-1 right-1 p-1 bg-white text-red-500 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                </div>
                            ))}
                            <button onClick={() => updateBlock(block.id, { images: [...block.images, ''] })} className="h-16 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center justify-center text-neutral-400 hover:text-emerald-500 hover:border-emerald-500 transition-all"><Plus size={20} /></button>
                        </div>
                    </div>
                );
          case 'quote':
               return (
                   <div className="flex gap-4">
                       <div className="w-1 bg-emerald-500 rounded-full"></div>
                       <div className="flex-grow space-y-3">
                           <textarea value={block.text} onChange={e => updateBlock(block.id, { text: e.target.value })} placeholder="Quote text..." rows={2} className="w-full bg-white dark:bg-neutral-950 p-3 rounded-lg text-lg italic outline-none border border-neutral-200 dark:border-neutral-800 font-serif" />
                           <input value={block.author || ''} onChange={e => updateBlock(block.id, { author: e.target.value })} placeholder="— Author name" className="w-full bg-transparent text-sm text-neutral-500 outline-none text-right" />
                       </div>
                   </div>
               );
          default: return <div className="text-red-500">Unknown block type</div>;
      }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white pt-20 px-4 md:px-8 pb-32 transition-colors font-sans selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {isPreviewOpen && (
            <MotionDiv 
                initial={{ opacity: 0, y: 100 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 100 }}
                className="fixed inset-0 z-[200] bg-neutral-950 flex flex-col"
            >
                <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-black text-white relative z-50">
                    <span className="font-mono text-xs uppercase tracking-widest text-emerald-500 flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Live Preview Mode</span>
                    <button onClick={() => setIsPreviewOpen(false)} className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors">Close Preview</button>
                </div>
                {renderPreview()}
            </MotionDiv>
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 sticky top-0 z-40 py-4 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center font-bold text-xl">P.</div>
              <div>
                  <h1 className="text-2xl font-bold tracking-tight">CMS Dashboard</h1>
                  <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest">v5.0 • Firebase Connected</p>
              </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all flex items-center gap-2"><ArrowLeft size={14} /> Back to Site</button>
            <button onClick={onLogout} className="px-4 py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-2"><LogOut size={14} /> Logout</button>
          </div>
        </div>

        {/* MAIN NAV TABS */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 mb-8 overflow-x-auto no-scrollbar">
            {[
                { id: 'home', label: 'Home', icon: HomeIcon },
                { id: 'projects', label: 'Projects', icon: Briefcase },
                { id: 'gallery', label: 'Gallery', icon: Camera },
                { id: 'drafts', label: 'Playground', icon: Beaker },
            ].map(tab => (
                 <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)} 
                    className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${activeTab === tab.id ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
                >
                    <tab.icon size={14} /> {tab.label}
                </button>
            ))}
        </div>

        <AnimatePresence mode="wait">
          
          {/* --- PROJECTS TAB (ADVANCED & DETAILED) --- */}
          {activeTab === 'projects' && (
            <MotionDiv key="proj-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">
               
               {/* LEFT LIST - SIDEBAR (Hidden on mobile if editing) */}
               <div className={`lg:col-span-3 flex flex-col gap-4 h-full ${isEditingProj ? 'hidden lg:flex' : 'flex'}`}>
                  <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold uppercase text-neutral-400">All Projects</h3>
                      <button onClick={() => { setProjForm(initialProjectState); setEditingProjId(null); setIsEditingProj(true); setActiveProjectTab('essentials'); }} className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity"><Plus size={16}/></button>
                  </div>
                  <div className="flex-grow overflow-y-auto pr-2 space-y-2 no-scrollbar">
                      {projects.map(p => (
                          <div key={p.id} onClick={() => { setProjForm(p); setEditingProjId(p.id); setIsEditingProj(true); setActiveProjectTab('essentials'); setToolsInput(p.tools?.join(', ') || ''); }} className={`p-3 rounded-xl border cursor-pointer transition-all hover:border-emerald-500 group ${editingProjId === p.id ? 'bg-white dark:bg-neutral-900 border-emerald-500 shadow-md' : 'bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900'}`}>
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                                      {p.imageUrl && <img src={p.imageUrl} className="w-full h-full object-cover" />}
                                  </div>
                                  <div className="min-w-0 flex-grow">
                                      <h4 className="font-bold text-sm truncate">{p.title}</h4>
                                      <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                                          <span>{p.category}</span>
                                          <span>•</span>
                                          <span>{p.year}</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
               </div>

               {/* RIGHT EDITOR - MAIN AREA (Hidden on mobile if NOT editing) */}
               <div className={`lg:col-span-9 bg-white dark:bg-neutral-925 rounded-3xl border border-neutral-200 dark:border-neutral-900 shadow-sm flex flex-col h-full overflow-hidden relative ${!isEditingProj ? 'hidden lg:flex' : 'flex'}`}>
                   
                   {!isEditingProj ? (
                       <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-4">
                           <Briefcase size={48} className="opacity-20" />
                           <p>Select a project to edit or create a new one.</p>
                       </div>
                   ) : (
                       <>
                           {/* EDITOR HEADER */}
                           <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-900 bg-white/50 dark:bg-neutral-925/50 backdrop-blur-sm z-20 gap-4">
                               <div className="flex items-center gap-4">
                                   <button onClick={() => setIsEditingProj(false)} className="lg:hidden p-2 text-neutral-500 hover:text-black dark:hover:text-white"><ChevronLeft size={20}/></button>
                                   <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                       <input value={projForm.title} onChange={e => setProjForm({...projForm, title: e.target.value})} placeholder="Untitled Project" className="bg-transparent text-lg md:text-xl font-bold outline-none placeholder:text-neutral-300 min-w-[200px]" />
                                       <span className="hidden md:block h-4 w-px bg-neutral-300"></span>
                                       <select value={projForm.category} onChange={e => setProjForm({...projForm, category: e.target.value as any})} className="bg-transparent text-xs font-mono uppercase outline-none text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer w-fit">
                                           <option>Branding</option><option>3D</option><option>Motion</option><option>2D</option>
                                       </select>
                                   </div>
                               </div>
                               <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => { setPreviewMode('project'); setIsPreviewOpen(true); }} className="px-3 py-2 border border-neutral-700 text-neutral-400 hover:text-white rounded-lg font-bold text-[10px] md:text-xs flex items-center gap-2 hover:bg-neutral-800 transition-all"><Eye size={14} /> <span className="hidden sm:inline">Preview</span></button>
                                    <button onClick={() => deleteProject(editingProjId!)} className="p-2 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"><Trash2 size={18} /></button>
                                    <button onClick={handleSaveProject} disabled={isSaving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] md:text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20">{isSaving ? 'Saving...' : 'Save'}</button>
                               </div>
                           </div>

                           {/* SUB-TABS NAVIGATION */}
                           <div className="px-4 border-b border-neutral-100 dark:border-neutral-900 flex gap-6 overflow-x-auto no-scrollbar">
                               {[
                                   { id: 'essentials', label: 'Essentials' },
                                   { id: 'narrative', label: 'Case Study' },
                                   { id: 'builder', label: 'Story Blocks' },
                                   { id: 'settings', label: 'Settings & SEO' }
                               ].map(t => (
                                   <button 
                                        key={t.id} 
                                        onClick={() => setActiveProjectTab(t.id as ProjectSubTab)}
                                        className={`py-4 text-xs font-bold uppercase tracking-wider relative flex-shrink-0 ${activeProjectTab === t.id ? 'text-emerald-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                                   >
                                       {t.label}
                                       {activeProjectTab === t.id && <motion.div layoutId="projTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
                                   </button>
                               ))}
                           </div>

                           {/* EDITOR CONTENT - SCROLLABLE AREA */}
                           <div className="flex-grow overflow-y-auto p-4 md:p-8 space-y-10 custom-scrollbar relative">
                               
                               {/* === TAB 1: ESSENTIALS === */}
                               {activeProjectTab === 'essentials' && (
                                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">
                                       
                                       {/* Cover Media */}
                                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                           <div className="md:col-span-2 space-y-4">
                                               <label className="text-[10px] font-mono uppercase text-neutral-400">Cover Image (Thumbnail & Hero)</label>
                                               <div className="aspect-video bg-neutral-100 dark:bg-neutral-900 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-center relative group overflow-hidden">
                                                    {projForm.imageUrl ? <img src={projForm.imageUrl} className="w-full h-full object-cover" /> : <div className="text-center"><ImageIcon className="mx-auto mb-2 opacity-20" /><span className="text-xs text-neutral-400">Paste URL</span></div>}
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                                        <input value={projForm.imageUrl} onChange={e => setProjForm({...projForm, imageUrl: e.target.value})} placeholder="Paste Image URL" className="w-full bg-white text-black p-2 rounded text-xs outline-none" />
                                                    </div>
                                                </div>
                                           </div>
                                           <div className="space-y-4">
                                                <label className="text-[10px] font-mono uppercase text-neutral-400">Hero Video (Optional)</label>
                                                <div className="aspect-[9/16] md:aspect-square bg-neutral-100 dark:bg-neutral-900 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-center relative p-4">
                                                    <div className="text-center space-y-2 w-full">
                                                        <Video className="mx-auto opacity-20" />
                                                        <input value={projForm.videoUrl} onChange={e => setProjForm({...projForm, videoUrl: e.target.value})} placeholder="Video URL" className="w-full bg-transparent text-center text-xs outline-none border-b border-neutral-300 dark:border-neutral-700 pb-1" />
                                                    </div>
                                                </div>
                                           </div>
                                       </div>

                                       {/* Core Metadata */}
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-[10px] font-mono uppercase text-neutral-400"><Calendar size={12}/> Year</label>
                                                <input value={projForm.year} onChange={e => setProjForm({...projForm, year: e.target.value})} className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl text-sm outline-none border border-neutral-100 dark:border-neutral-800" placeholder="e.g. 2024" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-[10px] font-mono uppercase text-neutral-400"><Globe2 size={12}/> Live Link</label>
                                                <input value={projForm.liveUrl || ''} onChange={e => setProjForm({...projForm, liveUrl: e.target.value})} className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl text-sm outline-none border border-neutral-100 dark:border-neutral-800" placeholder="https://..." />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-[10px] font-mono uppercase text-neutral-400"><User size={12}/> Client / Agency</label>
                                                <input value={projForm.client || ''} onChange={e => setProjForm({...projForm, client: e.target.value})} className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl text-sm outline-none border border-neutral-100 dark:border-neutral-800" placeholder="Client Name" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-[10px] font-mono uppercase text-neutral-400"><Users size={12}/> My Role</label>
                                                <input value={projForm.role || ''} onChange={e => setProjForm({...projForm, role: e.target.value})} className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl text-sm outline-none border border-neutral-100 dark:border-neutral-800" placeholder="e.g. Art Director, Lead Dev" />
                                            </div>
                                       </div>

                                       {/* Tools / Tech Stack */}
                                       <div className="space-y-2">
                                            <label className="text-[10px] font-mono uppercase text-neutral-400">Tools & Technologies</label>
                                            <input value={toolsInput} onChange={e => setToolsInput(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl text-sm outline-none border border-neutral-100 dark:border-neutral-800" placeholder="React, Figma, Blender (comma separated)" />
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {toolsInput.split(',').filter(t=>t.trim()).map((t, i) => (
                                                    <span key={i} className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-[10px] font-mono uppercase text-neutral-500">{t.trim()}</span>
                                                ))}
                                            </div>
                                       </div>
                                   </motion.div>
                               )}

                               {/* ... (Other Tabs Content remains same but wrapped in responsive container if needed) ... */}
                               {activeProjectTab === 'narrative' && (
                                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">
                                       <div className="space-y-2">
                                           <label className="text-[10px] font-mono uppercase text-neutral-400">Abstract / Overview</label>
                                           <textarea value={projForm.description} onChange={e => setProjForm({...projForm, description: e.target.value})} rows={3} className="w-full bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl text-base outline-none resize-none border border-neutral-100 dark:border-neutral-800" placeholder="A brief summary of the project..." />
                                       </div>

                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                           <div className="space-y-2">
                                               <label className="text-[10px] font-mono uppercase text-neutral-400">The Challenge</label>
                                               <textarea value={projForm.challenge} onChange={e => setProjForm({...projForm, challenge: e.target.value})} rows={12} className="w-full bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl text-sm leading-relaxed outline-none resize-none border border-neutral-100 dark:border-neutral-800" placeholder="What problems did you face?" />
                                           </div>
                                           <div className="space-y-2">
                                               <label className="text-[10px] font-mono uppercase text-neutral-400">The Solution</label>
                                               <textarea value={projForm.solution} onChange={e => setProjForm({...projForm, solution: e.target.value})} rows={12} className="w-full bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl text-sm leading-relaxed outline-none resize-none border border-neutral-100 dark:border-neutral-800" placeholder="How did you solve them?" />
                                           </div>
                                       </div>
                                   </motion.div>
                               )}

                               {activeProjectTab === 'builder' && (
                                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
                                       <div className="flex items-center justify-between mb-6">
                                            <h3 className="font-bold text-lg flex items-center gap-2"><LayoutGrid size={18} className="text-emerald-500" /> Story Blocks</h3>
                                            <span className="text-xs text-neutral-400">Drag to reorder</span>
                                       </div>

                                       <Reorder.Group axis="y" values={projForm.blocks || []} onReorder={handleReorderBlocks} className="space-y-4">
                                            {projForm.blocks?.map((block) => (
                                                <Reorder.Item key={block.id} value={block} className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm group">
                                                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 cursor-grab active:cursor-grabbing">
                                                        <div className="flex items-center gap-3">
                                                            <GripVertical size={16} className="text-neutral-300" />
                                                            <span className="text-[10px] font-mono uppercase font-bold px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded text-neutral-600 dark:text-neutral-400">{block.type}</span>
                                                            <span className="text-xs text-neutral-400 truncate max-w-[150px] md:max-w-[200px]">
                                                                {block.type === 'text' && (block.content?.substring(0, 30) + '...')}
                                                                {block.type === 'full-image' && 'Image Block'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={() => toggleBlockCollapse(block.id)} className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors" title="Toggle Collapse">
                                                                {block.isCollapsed ? <EyeOff size={14}/> : <Minus size={14}/>}
                                                            </button>
                                                            <button onClick={() => duplicateBlock(block)} className="p-1.5 text-neutral-400 hover:text-emerald-500 transition-colors" title="Duplicate"><Maximize2 size={14}/></button>
                                                            <button onClick={() => setProjForm({...projForm, blocks: projForm.blocks?.filter(b => b.id !== block.id)})} className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors" title="Remove"><X size={14}/></button>
                                                        </div>
                                                    </div>
                                                    <div className={`p-5 transition-all ${block.isCollapsed ? 'hidden' : 'block'}`}>
                                                        {renderBlockEditor(block)}
                                                    </div>
                                                </Reorder.Item>
                                            ))}
                                       </Reorder.Group>
                                        
                                       <div className="mt-8 pt-8 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                                           <p className="text-center text-xs font-mono uppercase text-neutral-400 mb-4">Add Content Block</p>
                                           <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                {[
                                                    { type: 'heading', label: 'Heading', icon: Type },
                                                    { type: 'text', label: 'Paragraph', icon: Edit3 },
                                                    { type: 'full-image', label: 'Image', icon: ImageIcon },
                                                    { type: 'video', label: 'Video', icon: Video },
                                                    { type: 'image-grid', label: 'Gallery', icon: LayoutGrid },
                                                    { type: 'code', label: 'Code', icon: CodeIcon }, 
                                                    { type: 'button', label: 'Button', icon: MousePointer },
                                                    { type: 'quote', label: 'Quote', icon: QuoteIcon },
                                                    { type: 'divider', label: 'Divider', icon: MinusIcon }, 
                                                    { type: 'spacer', label: 'Spacer', icon: MoveVertical },
                                                ].map(item => (
                                                    <button key={item.type} onClick={() => addBlock(item.type as any)} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all group">
                                                        <item.icon size={18} className="text-neutral-400 group-hover:text-emerald-500" />
                                                        <span className="text-[9px] font-bold uppercase">{item.label}</span>
                                                    </button>
                                                ))}
                                           </div>
                                       </div>
                                   </motion.div>
                               )}

                               {activeProjectTab === 'settings' && (
                                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-2xl mx-auto">
                                       <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                            <h4 className="font-bold text-sm uppercase mb-4 flex items-center gap-2"><Flag size={16} /> Visibility & Status</h4>
                                            <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
                                                <div>
                                                    <p className="font-bold text-sm">Featured Project</p>
                                                    <p className="text-xs text-neutral-400">Show this project on the home page or top of list.</p>
                                                </div>
                                                <button 
                                                    onClick={() => setProjForm({...projForm, featured: !projForm.featured})} 
                                                    className={`w-12 h-6 rounded-full relative transition-colors ${projForm.featured ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${projForm.featured ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                       </div>

                                       <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-4">
                                            <h4 className="font-bold text-sm uppercase mb-2 flex items-center gap-2"><Search size={16} /> SEO & Metadata</h4>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-mono uppercase text-neutral-400">Project Slug (URL)</label>
                                                <input value={projForm.id} disabled className="w-full bg-neutral-200 dark:bg-neutral-800 p-4 rounded-xl text-sm outline-none text-neutral-500 cursor-not-allowed" />
                                                <p className="text-[10px] text-neutral-400">Auto-generated from ID. To change, duplicate project.</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-mono uppercase text-neutral-400">SEO Description</label>
                                                <textarea value={projForm.seoDescription || projForm.description} onChange={e => setProjForm({...projForm, seoDescription: e.target.value})} rows={3} className="w-full bg-white dark:bg-neutral-950 p-4 rounded-xl text-sm outline-none border border-neutral-200 dark:border-neutral-800" placeholder="Meta description for search engines..." />
                                            </div>
                                       </div>
                                   </motion.div>
                               )}

                               <div className="h-20"></div> {/* Bottom Spacer */}
                           </div>
                       </>
                   )}
               </div>
            </MotionDiv>
          )}

          {/* ... (Home, Gallery, Drafts tabs remain unchanged in logic but benefit from global style tweaks) ... */}
           {/* --- HOME TAB (VISUAL REDESIGN) --- */}
          {activeTab === 'home' && homeData && (
            <MotionDiv key="home-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12 pb-32">
               
               {/* 0. SITE IDENTITY (Favicon) */}
               <div className="space-y-4">
                   <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 ml-2">Site Identity</h3>
                   <div className="bg-white dark:bg-neutral-925 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-900">
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center border border-neutral-200 dark:border-neutral-700 flex-shrink-0 overflow-hidden">
                                {homeData.faviconUrl ? (
                                    <img src={homeData.faviconUrl} alt="Favicon" className="w-10 h-10 object-contain" />
                                ) : (
                                    <Globe size={24} className="text-neutral-400" />
                                )}
                            </div>
                            <div className="flex-grow w-full space-y-4">
                                {/* Site Title Input */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-400">
                                        Browser Tab Title
                                    </label>
                                    <input 
                                        value={homeData.siteTitle || ''} 
                                        onChange={e => setHomeData({ ...homeData, siteTitle: e.target.value })} 
                                        placeholder="Page Title (e.g. My Portfolio)" 
                                        className="w-full bg-neutral-50 dark:bg-neutral-900 p-3 rounded-xl outline-none border border-neutral-100 dark:border-neutral-800 focus:border-emerald-500 transition-colors text-sm" 
                                    />
                                </div>

                                {/* Favicon Input */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-400">
                                        Favicon URL (PNG/ICO)
                                    </label>
                                    <input 
                                        value={homeData.faviconUrl || ''} 
                                        onChange={e => setHomeData({ ...homeData, faviconUrl: e.target.value })} 
                                        placeholder="https://example.com/favicon.png" 
                                        className="w-full bg-neutral-50 dark:bg-neutral-900 p-3 rounded-xl outline-none border border-neutral-100 dark:border-neutral-800 focus:border-emerald-500 transition-colors text-sm" 
                                    />
                                    <p className="text-[10px] text-neutral-400">Recommended size: 32x32px or 64x64px. Supports transparent PNGs.</p>
                                </div>
                            </div>
                        </div>
                   </div>
               </div>

               {/* 1. HERO SECTION CONFIGURATION */}
               <div className="space-y-4">
                   <div className="flex justify-between items-end">
                       <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 ml-2">Hero Section Configuration</h3>
                       <button onClick={() => { setPreviewMode('home'); setIsPreviewOpen(true); }} className="text-xs font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 flex items-center gap-2 mb-2"><Play size={12} fill="currentColor" /> Live Preview</button>
                   </div>
                   
                   {/* Visual Hero Editor - Dark Theme Simulation */}
                   <div className="bg-neutral-900 rounded-3xl p-8 md:p-12 relative overflow-hidden border border-neutral-800 shadow-xl group">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50"></div>
                       
                       <div className="flex flex-col items-center gap-8 relative z-10">
                           {/* Role Pill */}
                           <div className="relative">
                               <label className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-neutral-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Role Pill Text</label>
                               <input 
                                    value={homeData.profile.role} 
                                    onChange={e => updateProfile({ role: e.target.value })} 
                                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 text-white text-center text-sm font-mono tracking-widest outline-none focus:bg-white/20 transition-all w-[280px]" 
                                    placeholder="DIGITAL ARTISAN — VIETNAM" 
                                />
                           </div>

                           {/* Main Title (Static visual representation) */}
                           <h1 className="text-4xl md:text-6xl font-bold text-white/20 select-none text-center leading-tight tracking-tighter">
                               Digital <span className="font-serif italic font-light">Artisan</span>
                           </h1>

                           {/* Socials & Resume Row */}
                           <div className="flex items-center gap-8 w-full justify-center">
                               {/* Socials Visual Editor */}
                               <div className="flex gap-4">
                                   {homeData.profile.socials.map((s, i) => (
                                       <div key={s.id} className="relative group/icon">
                                           <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                                               {/* Just a visual icon based on name, simplified logic */}
                                               <span className="text-[10px]">{s.iconName.substring(0, 2)}</span>
                                           </div>
                                            <button onClick={() => { const u = homeData.profile.socials.filter(x => x.id !== s.id); updateProfile({socials:u})}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/icon:opacity-100 transition-opacity"><X size={10}/></button>
                                       </div>
                                   ))}
                                   <button onClick={addSocial} className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all"><Plus size={16}/></button>
                               </div>

                               <div className="w-px h-8 bg-white/10"></div>

                               {/* Resume Link */}
                               <div className="relative">
                                    <label className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-neutral-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Resume URL</label>
                                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                                        <FileText size={14} className="text-white" />
                                        <input 
                                            value={homeData.profile.cvUrl} 
                                            onChange={e => updateProfile({ cvUrl: e.target.value })} 
                                            className="bg-transparent text-white text-xs font-mono uppercase tracking-widest outline-none w-[100px]" 
                                            placeholder="LINK URL" 
                                        />
                                    </div>
                               </div>
                           </div>
                       </div>
                   </div>

                   {/* Social Links Detailed Editor (Below visual) */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                      {homeData.profile.socials.map((s, i) => (
                         <div key={s.id} className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
                            <select value={s.iconName} onChange={e => {
                               const updated = [...homeData.profile.socials]; updated[i].iconName = e.target.value as any; updateProfile({ socials: updated });
                            }} className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg text-[10px] font-mono uppercase outline-none">
                               {['Instagram', 'Twitter', 'Linkedin', 'Mail', 'Github', 'Facebook', 'Telegram'].map(opt => <option key={opt}>{opt}</option>)}
                            </select>
                            <input value={s.url} onChange={e => {
                               const updated = [...homeData.profile.socials]; updated[i].url = e.target.value; updateProfile({ socials: updated });
                            }} placeholder="https://..." className="flex-grow bg-transparent text-xs outline-none" />
                         </div>
                      ))}
                   </div>
               </div>

               {/* 2. MANIFESTO / STORY CONFIGURATION */}
               <div className="space-y-4">
                   <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 ml-2">Story & Introduction</h3>
                   <div className="bg-white dark:bg-neutral-925 p-8 md:p-12 rounded-3xl border border-neutral-200 dark:border-neutral-900 space-y-12">
                       
                       {/* Tagline / Main Headline */}
                       <div className="space-y-2">
                           <label className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-600 mb-2">
                               <Type size={14}/> Headline / Tagline
                           </label>
                           <textarea 
                                value={homeData.profile.tagline} 
                                onChange={e => updateProfile({ tagline: e.target.value })} 
                                rows={2}
                                className="w-full bg-transparent text-3xl md:text-5xl font-medium leading-tight outline-none placeholder:text-neutral-200 dark:placeholder:text-neutral-800 resize-none" 
                                placeholder="Write a compelling headline..."
                           />
                       </div>

                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                           {/* Bio / Description */}
                           <div className="space-y-4">
                               <label className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-400">
                                   <User size={14}/> Biography
                               </label>
                               <textarea 
                                    value={homeData.profile.bio} 
                                    onChange={e => updateProfile({ bio: e.target.value })} 
                                    rows={6}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl text-lg leading-relaxed outline-none border border-neutral-100 dark:border-neutral-800 resize-none font-sans" 
                                    placeholder="Tell your story..."
                               />
                           </div>

                           {/* Metadata & Labels */}
                           <div className="space-y-6">
                               <div className="space-y-2">
                                   <label className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-400">
                                       <AtSign size={14}/> Contact Email
                                   </label>
                                   <input value={homeData.profile.email} onChange={e => updateProfile({ email: e.target.value })} placeholder="hello@example.com" className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl outline-none border border-neutral-100 dark:border-neutral-800" />
                               </div>
                               <div className="space-y-2">
                                   <label className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-400">
                                       <Music size={14}/> Background Music
                                   </label>
                                   <input value={homeData.profile.musicUrl} onChange={e => updateProfile({ musicUrl: e.target.value })} placeholder="Audio URL" className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl outline-none border border-neutral-100 dark:border-neutral-800" />
                               </div>
                               <div className="space-y-2">
                                   <label className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-400">
                                       <CaseUpper size={14}/> Full Name (SEO)
                                   </label>
                                   <input value={homeData.profile.name} onChange={e => updateProfile({ name: e.target.value })} placeholder="Your Name" className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl outline-none border border-neutral-100 dark:border-neutral-800" />
                               </div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 3. INTERFACE LABELS (UI TEXT) */}
               <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 ml-2">Interface Labels</h3>
                  <div className="bg-white dark:bg-neutral-925 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-900">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {Object.keys(homeData.uiText).map(key => (
                             <div key={key} className="space-y-1">
                                <label className="text-[9px] font-mono uppercase text-neutral-400 px-1">{key.replace(/_/g, ' ')}</label>
                                <input value={homeData.uiText[key]} onChange={e => updateUiText(key, e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-900 p-2.5 rounded-lg text-xs outline-none border border-neutral-100 dark:border-neutral-800 focus:border-black dark:focus:border-white transition-colors" />
                             </div>
                          ))}
                      </div>
                  </div>
               </div>

               <button onClick={handleSaveHome} disabled={isSaving} className="fixed bottom-12 right-12 z-50 px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold uppercase tracking-widest text-sm shadow-2xl transition-all flex items-center gap-3 hover:scale-105 active:scale-95">
                  <Save size={18} /> {isSaving ? "Saving..." : "Save Updates"}
               </button>
            </MotionDiv>
          )}

          {activeTab === 'gallery' && (
            <MotionDiv key="gal-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
               <div className="flex items-center justify-between"><h2 className="text-3xl font-bold uppercase tracking-tighter">Photography Collections</h2><button onClick={addGalleryCollection} className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2"><Plus size={14} /> New Collection</button></div>
               <div className="grid grid-cols-1 gap-12">
                  {gallery.map(col => (
                    <div key={col.id} className="bg-white dark:bg-neutral-925 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-900">
                        <div className="flex justify-between items-start mb-6"><input value={col.title} onChange={e => updateGalleryCollection(col.id, { title: e.target.value })} className="bg-transparent text-2xl font-bold uppercase tracking-tight outline-none w-full mr-4" /><button onClick={() => deleteGalleryCollection(col.id)} className="text-neutral-400 hover:text-red-500"><Trash2 size={18} /></button></div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                           <input value={col.location} onChange={e => updateGalleryCollection(col.id, { location: e.target.value })} placeholder="Location" className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg text-xs font-mono uppercase outline-none" />
                           <input value={col.date} onChange={e => updateGalleryCollection(col.id, { date: e.target.value })} placeholder="Date" className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg text-xs font-mono uppercase outline-none" />
                        </div>
                        <p className="text-[10px] font-mono uppercase text-neutral-400 mb-4">Collection Images ({col.images.length})</p>
                        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                           {col.images.map((img, idx) => (
                              <div key={img.id} className="flex gap-2 items-center">
                                 <input value={img.src} onChange={e => { const newImgs = [...col.images]; newImgs[idx].src = e.target.value; updateGalleryCollection(col.id, { images: newImgs }); }} placeholder="Image URL" className="flex-grow bg-neutral-100 dark:bg-neutral-900 p-2 rounded text-[10px] outline-none" />
                                 <button onClick={() => { const newImgs = col.images.filter((_, i) => i !== idx); updateGalleryCollection(col.id, { images: newImgs }); }} className="text-red-400 p-1"><X size={12} /></button>
                              </div>
                           ))}
                        </div>
                        <button onClick={() => addImageToGallery(col.id)} className="w-full py-3 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl text-[10px] font-mono uppercase text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 mb-6">+ Add Photo</button>
                        
                        {/* INLINE PREVIEW FOR GALLERY */}
                        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
                            <span className="text-[10px] font-mono uppercase text-emerald-500 block mb-4">Live Grid Preview</span>
                            <div className="w-full">
                                <JustifiedGrid 
                                    items={col.images.map(img => ({ id: img.id || Math.random(), src: img.src, width: img.width || 800, height: img.height || 600, originalData: img }))}
                                    targetRowHeight={200}
                                    gap={4}
                                    renderItem={(item) => (
                                        <div className="relative group overflow-hidden bg-neutral-800 h-full w-full">
                                            <img src={item.src} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                  ))}
               </div>
            </MotionDiv>
          )}

          {activeTab === 'drafts' && (
            <MotionDiv key="play-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="flex items-center justify-between"><h2 className="text-3xl font-bold uppercase tracking-tighter">Playground Sections</h2><button onClick={addPlaygroundSection} className="px-6 py-2 bg-emerald-600 text-white rounded-full text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2"><Plus size={14} /> New Experiment</button></div>
                <div className="space-y-12">
                  {playground.map(sec => (
                    <div key={sec.id} className="bg-white dark:bg-neutral-925 p-10 rounded-3xl border border-neutral-200 dark:border-neutral-900">
                        <div className="flex justify-between gap-8 mb-8">
                            <div className="flex-grow space-y-4"><input value={sec.title} onChange={e => updatePlaygroundSection(sec.id, { title: e.target.value })} className="bg-transparent text-4xl font-bold uppercase tracking-tighter outline-none w-full" placeholder="Section Title" /><textarea value={sec.description} onChange={e => updatePlaygroundSection(sec.id, { description: e.target.value })} className="bg-transparent text-neutral-500 text-lg font-light outline-none w-full resize-none" rows={1} placeholder="Brief description..." /></div>
                            <button onClick={() => { if(confirm("Delete section?")){ const updated = playground.filter(p => p.id !== sec.id); setPlayground(updated); savePlayground(updated); onRefresh(); } }} className="text-neutral-400 hover:text-red-500 h-fit"><Trash2 size={24} /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {sec.items.map((item, idx) => (
                                <div key={item.id} className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 relative group">
                                    <div className="aspect-[4/5] bg-neutral-200 dark:bg-neutral-800 rounded-xl mb-4 overflow-hidden">{item.src && <img src={item.src} className="w-full h-full object-cover" />}</div>
                                    <div className="space-y-3">
                                        <input value={item.src} onChange={e => { const newItems = [...sec.items]; newItems[idx].src = e.target.value; updatePlaygroundSection(sec.id, { items: newItems }); }} placeholder="Source URL" className="w-full bg-white dark:bg-neutral-950 p-2 rounded text-[10px] outline-none border border-neutral-200 dark:border-neutral-800" />
                                        <div className="flex gap-2"><input value={item.tag} onChange={e => { const newItems = [...sec.items]; newItems[idx].tag = e.target.value; updatePlaygroundSection(sec.id, { items: newItems }); }} placeholder="Tag" className="flex-grow bg-white dark:bg-neutral-950 p-2 rounded text-[9px] uppercase font-mono outline-none border border-neutral-200 dark:border-neutral-800" /><button onClick={() => { const newItems = sec.items.filter((_, i) => i !== idx); updatePlaygroundSection(sec.id, { items: newItems }); }} className="bg-red-500/10 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={12}/></button></div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => { const newItems = [...sec.items, { id: `item-${Date.now()}`, title: '', src: '', width: 800, height: 1000, tag: 'Experiment' }]; updatePlaygroundSection(sec.id, { items: newItems }); }} className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-4 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-neutral-900 transition-all min-h-[300px]"><Plus size={32} /><span className="text-xs font-mono uppercase tracking-widest">Add Item</span></button>
                        </div>
                        
                        {/* INLINE PREVIEW FOR DRAFTS */}
                        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
                            <span className="text-[10px] font-mono uppercase text-emerald-500 block mb-4">Live Layout Preview</span>
                             <div className="w-full">
                                <JustifiedGrid 
                                    items={sec.items.map(item => ({ ...item, originalData: item }))}
                                    targetRowHeight={200}
                                    gap={4}
                                    renderItem={(item) => (
                                        <div className="relative group overflow-hidden bg-neutral-800 h-full w-full">
                                            <img src={item.src} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                  ))}
                </div>
            </MotionDiv>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
