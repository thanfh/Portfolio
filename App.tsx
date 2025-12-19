
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProjectGrid from './components/ProjectGrid';
import CaseStudyView from './components/CaseStudyView';
import GalleryView from './components/GalleryView';
import PlaygroundView from './components/PlaygroundView';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import CustomCursor from './components/CustomCursor';
import { Project, GalleryCollection, PlaygroundSection, HomeContent } from './types';
import { AnimatePresence } from 'framer-motion';
import { getProjects, getGallery, getPlayground, getHomeContent } from './services/contentService';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminLogin = lazy(() => import('./components/AdminLogin'));

type ViewState = 'home' | 'work' | 'case-study' | 'gallery' | 'draft' | 'admin';

const AppContent = () => {
  const { profile, t } = useLanguage();
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [gallery, setGallery] = useState<GalleryCollection[]>([]);
  const [playground, setPlayground] = useState<PlaygroundSection[]>([]);
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const loadAllContent = async () => {
    // Parallel fetching for speed
    const [p, g, pg, h] = await Promise.all([
        getProjects(),
        getGallery(),
        getPlayground(),
        getHomeContent()
    ]);

    setProjects(p);
    setGallery(g);
    setPlayground(pg);
    setHomeContent(h);
  };

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    const init = async () => {
        await loadAllContent();
        setLoadingProgress(100);
        setTimeout(() => setIsLoading(false), 500);
    };
    init();

    document.documentElement.classList.add('dark');
    return () => unsubscribe();
  }, []);

  // Effect to update Favicon & Document Title
  useEffect(() => {
    if (homeContent) {
        // Favicon
        if (homeContent.faviconUrl) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
            if (!link) {
                link = document.createElement('link');
                link.type = 'image/x-icon';
                link.rel = 'shortcut icon';
                document.head.appendChild(link);
            }
            link.href = homeContent.faviconUrl;
        }

        // Title
        if (homeContent.siteTitle) {
            document.title = homeContent.siteTitle;
        } else if (profile.name) {
            // Fallback to profile name if no specific title set
            document.title = `${profile.name} | Portfolio`;
        }
    }
  }, [homeContent, profile.name]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (audioRef.current && profile.musicUrl) {
      audioRef.current.volume = 0.3;
      if (isMusicPlaying) {
        audioRef.current.play().catch(() => setIsMusicPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying, profile.musicUrl]);

  const handleOpenCaseStudy = (project: Project) => {
    setCurrentProject(project);
    setCurrentView('case-study');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleViewChange = (view: ViewState) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    // If loading failed or still processing, show minimal fallback
    const safeUiText = homeContent?.uiText || {};
    const safeProfile = homeContent?.profile || profile;

    switch (currentView) {
      case 'home':
        return <Hero 
                  profile={safeProfile} 
                  uiText={safeUiText} 
                  onOpenCaseStudy={handleOpenCaseStudy} 
                  onNavigateToWork={() => handleViewChange('work')} 
               />;
      case 'work':
        return <ProjectGrid 
                  projects={projects} 
                  uiText={safeUiText}
                  onOpenCaseStudy={handleOpenCaseStudy} 
                  onNavigateHome={() => handleViewChange('home')} 
               />;
      case 'gallery':
        return <GalleryView collections={gallery} drafts={playground} onNavigateHome={() => handleViewChange('home')} />;
      case 'draft':
        return <PlaygroundView sections={playground} onNavigateHome={() => handleViewChange('home')} />;
      case 'admin':
        return (
          <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white font-mono text-xs uppercase">Initializing CMS...</div>}>
            {isAuthenticated ? (
              <AdminDashboard 
                onBack={() => handleViewChange('home')} 
                onRefresh={loadAllContent} 
                onLogout={() => auth.signOut()}
              />
            ) : (
              <AdminLogin 
                onSuccess={() => setIsAuthenticated(true)} 
                onCancel={() => handleViewChange('home')} 
              />
            )}
          </Suspense>
        );
      case 'case-study':
        return currentProject ? (
          <CaseStudyView 
            project={currentProject} 
            allProjects={projects}
            uiText={safeUiText}
            onBack={() => handleViewChange('work')}
            onOpenCaseStudy={handleOpenCaseStudy}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence>{isLoading && <LoadingScreen progress={loadingProgress} />}</AnimatePresence>
      <div className={`min-h-screen font-sans transition-opacity duration-1000 flex flex-col bg-neutral-950 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <CustomCursor />
        {profile.musicUrl && <audio ref={audioRef} src={profile.musicUrl} loop hidden />}
        <Header 
          profile={homeContent?.profile || profile}
          currentView={currentView as any} 
          onViewChange={handleViewChange as any} 
          isMusicPlaying={isMusicPlaying} 
          toggleMusic={() => setIsMusicPlaying(!isMusicPlaying)} 
        />
        <main className="w-full flex-grow">{renderContent()}</main>
        <Footer profile={homeContent?.profile || profile} />
      </div>
    </>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
