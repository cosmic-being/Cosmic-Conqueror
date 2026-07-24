import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { SiteSettings } from '../types';

const defaultSettings: SiteSettings = {
  title: "Cosmic Conqueror",
  semester: "Semester 3",
  theme: "system",
  footerText: "Semester 3 Repository",
  aboutText: "Veni, Vidi, Vici"
};

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'global');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings({ ...defaultSettings, ...docSnap.data() } as SiteSettings);
      } else {
        setSettings(defaultSettings);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const docRef = doc(db, 'settings', 'global');
    await setDoc(docRef, { ...settings, ...newSettings }, { merge: true });
  };

  return { settings, loading, updateSettings };
}
