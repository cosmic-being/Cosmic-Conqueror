import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import config from './firebase-config.json';

const firebaseConfig = {
  ...config,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || config.apiKey,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = initializeFirestore(app, {}, config.firestoreDatabaseId);
export const storage = getStorage(app);