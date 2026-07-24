import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

export interface FileItem {
  id: string;
  name: string;
  uploaderName?: string;
  type: string;
  size: number;
  date: string;
  category: string;
  courseId: string;
  downloadUrl: string;
  downloadCount: number;
  storagePath?: string;
  imageUrl?: string | null;
  description?: string | null;
}

export function useFiles(courseId?: string) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, 'files');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fileData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FileItem));
      if (courseId) {
        setFiles(fileData.filter(f => f.courseId === courseId));
      } else {
        setFiles(fileData);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [courseId]);

  const addFile = async (file: File, courseId: string, category: string, customName?: string, uploaderName?: string, onProgress?: (progress: number) => void) => {
    return new Promise<void>((resolve, reject) => {
      const storageRef = ref(storage, `files/${courseId}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => reject(error),
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            const finalName = customName && customName.trim() ? customName.trim() : file.name;
            
            await addDoc(collection(db, 'files'), {
              name: finalName,
              uploaderName: uploaderName || 'Admin',
              type: file.name.split('.').pop() || 'unknown',
              size: file.size,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              category,
              courseId,
              downloadUrl,
              downloadCount: 0,
              storagePath: uploadTask.snapshot.ref.fullPath
            });
            resolve();
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  };

  const addLink = async (url: string, title: string, imageUrl: string, description: string, courseId: string, category: string, uploaderName?: string) => {
    await addDoc(collection(db, 'files'), {
      name: title,
      uploaderName: uploaderName || 'Admin',
      type: 'link',
      size: 0,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      category,
      courseId,
      downloadUrl: url,
      downloadCount: 0,
      imageUrl: imageUrl || null,
      description: description || null
    });
  };

  const updateFileRecord = async (fileId: string, data: Partial<FileItem>) => {
    await updateDoc(doc(db, 'files', fileId), data);
  };

  const deleteFileRecord = async (fileId: string, storagePath?: string) => {
    await deleteDoc(doc(db, 'files', fileId));
    if (storagePath) {
      try {
        await deleteObject(ref(storage, storagePath));
      } catch (e) {
        console.error("Failed to delete from storage", e);
      }
    }
  };

  const incrementDownload = async (fileId: string) => {
    const downloadedKey = `downloaded_${fileId}`;
    if (!localStorage.getItem(downloadedKey)) {
      localStorage.setItem(downloadedKey, 'true');
      await updateDoc(doc(db, 'files', fileId), {
        downloadCount: increment(1)
      });
    }
  };

  return { files, loading, addFile, addLink, updateFileRecord, deleteFileRecord, incrementDownload };
}
