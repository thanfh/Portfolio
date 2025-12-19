
import { Project, GalleryCollection, PlaygroundSection, HomeContent } from '../types';
import { PROJECTS, GALLERY_SECTIONS, PLAYGROUND_SECTIONS, PROFILE, UI_TEXT, CV_URL, LOFI_MUSIC_URL } from '../constants';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Collection Names in Firestore
const KEYS = {
  HOME: 'content_home',
  PROJECTS: 'content_projects',
  GALLERY: 'content_gallery',
  PLAYGROUND: 'content_playground'
};

// --- DATA FETCHING (READ) ---

export const getHomeContent = async (): Promise<HomeContent> => {
  try {
    const docRef = doc(db, 'portfolio', KEYS.HOME);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as HomeContent;
    } else {
      // Initialize if not exists
      const initial: HomeContent = {
        profile: {
          ...PROFILE,
          cvUrl: CV_URL,
          musicUrl: LOFI_MUSIC_URL,
          socials: PROFILE.socials.map((s, i) => ({ ...s, id: `s-${i}` })) as any
        },
        uiText: UI_TEXT
      };
      // We don't await saving here to return fast, but we trigger it
      saveHomeContent(initial); 
      return initial;
    }
  } catch (error) {
    console.error("Error fetching Home:", error);
    // Fallback for offline or error
    return {
        profile: { ...PROFILE, cvUrl: CV_URL, musicUrl: LOFI_MUSIC_URL, socials: PROFILE.socials.map((s, i) => ({ ...s, id: `s-${i}` })) as any },
        uiText: UI_TEXT
    };
  }
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    const docRef = doc(db, 'portfolio', KEYS.PROJECTS);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().items as Project[];
    } else {
      saveProjects(PROJECTS);
      return PROJECTS;
    }
  } catch (error) {
    console.error("Error fetching Projects:", error);
    return PROJECTS;
  }
};

export const getGallery = async (): Promise<GalleryCollection[]> => {
  try {
    const docRef = doc(db, 'portfolio', KEYS.GALLERY);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().items as GalleryCollection[];
    } else {
      saveGallery(GALLERY_SECTIONS);
      return GALLERY_SECTIONS;
    }
  } catch (error) {
    console.error("Error fetching Gallery:", error);
    return GALLERY_SECTIONS;
  }
};

export const getPlayground = async (): Promise<PlaygroundSection[]> => {
  try {
    const docRef = doc(db, 'portfolio', KEYS.PLAYGROUND);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().items as PlaygroundSection[];
    } else {
      savePlayground(PLAYGROUND_SECTIONS);
      return PLAYGROUND_SECTIONS;
    }
  } catch (error) {
    console.error("Error fetching Playground:", error);
    return PLAYGROUND_SECTIONS;
  }
};

// --- DATA SAVING (WRITE) ---

export const saveHomeContent = async (content: HomeContent) => {
  try {
    await setDoc(doc(db, 'portfolio', KEYS.HOME), content);
  } catch (e) {
    console.error("Error saving Home:", e);
    alert("Error saving data. Check console/permissions.");
  }
};

export const saveProjects = async (projects: Project[]) => {
  try {
    // We store the whole array in one document for simplicity
    // Better scalability would be separate docs, but this fits the current app structure best
    await setDoc(doc(db, 'portfolio', KEYS.PROJECTS), { items: projects });
  } catch (e) {
    console.error("Error saving Projects:", e);
    alert("Error saving data. Check console/permissions.");
  }
};

export const saveGallery = async (gallery: GalleryCollection[]) => {
  try {
    await setDoc(doc(db, 'portfolio', KEYS.GALLERY), { items: gallery });
  } catch (e) {
    console.error("Error saving Gallery:", e);
    alert("Error saving data. Check console/permissions.");
  }
};

export const savePlayground = async (playground: PlaygroundSection[]) => {
  try {
    await setDoc(doc(db, 'portfolio', KEYS.PLAYGROUND), { items: playground });
  } catch (e) {
    console.error("Error saving Playground:", e);
    alert("Error saving data. Check console/permissions.");
  }
};
