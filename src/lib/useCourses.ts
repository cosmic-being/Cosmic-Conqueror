import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Course } from '../types';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'courses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      setCourses(coursesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addCourse = async (course: Omit<Course, 'id'>) => {
    await addDoc(collection(db, 'courses'), course);
  };

  const updateCourse = async (id: string, course: Partial<Course>) => {
    const docRef = doc(db, 'courses', id);
    await updateDoc(docRef, course);
  };

  const removeCourse = async (id: string) => {
    const docRef = doc(db, 'courses', id);
    await deleteDoc(docRef);
  };

  return { courses, loading, addCourse, updateCourse, removeCourse };
}
