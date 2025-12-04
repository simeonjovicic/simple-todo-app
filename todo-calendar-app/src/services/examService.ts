import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Exam, ExamFormData } from '../models/Exam';

const EXAMS_COLLECTION = 'exams';

// Convert Firestore Timestamp to Date
function timestampToDate(timestamp: any): Date {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date();
}

// Convert Date to Firestore Timestamp
function dateToTimestamp(date?: Date): Timestamp | undefined {
  if (!date) return undefined;
  return Timestamp.fromDate(date);
}

// Get all exams
export async function getAllExams(): Promise<Exam[]> {
  try {
    const q = query(collection(db, EXAMS_COLLECTION), orderBy('date', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        subject: data.subject,
        date: timestampToDate(data.date),
        time: data.time,
        location: data.location,
        notes: data.notes,
        notificationEnabled: data.notificationEnabled || false,
        notificationTime: data.notificationTime ? timestampToDate(data.notificationTime) : undefined,
        createdAt: timestampToDate(data.createdAt),
      } as Exam;
    });
  } catch (error) {
    console.error('Error getting exams:', error);
    throw error;
  }
}

// Get exams for a specific date range
export async function getExamsByDateRange(startDate: Date, endDate: Date): Promise<Exam[]> {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    const q = query(
      collection(db, EXAMS_COLLECTION),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        subject: data.subject,
        date: timestampToDate(data.date),
        time: data.time,
        location: data.location,
        notes: data.notes,
        notificationEnabled: data.notificationEnabled || false,
        notificationTime: data.notificationTime ? timestampToDate(data.notificationTime) : undefined,
        createdAt: timestampToDate(data.createdAt),
      } as Exam;
    });
  } catch (error) {
    console.error('Error getting exams by date range:', error);
    throw error;
  }
}

// Add a new exam
export async function addExam(examData: ExamFormData): Promise<string> {
  try {
    const newExam = {
      title: examData.title,
      subject: examData.subject || '',
      date: Timestamp.fromDate(examData.date),
      time: examData.time || '',
      location: examData.location || '',
      notes: examData.notes || '',
      notificationEnabled: examData.notificationEnabled || false,
      notificationTime: examData.notificationTime ? Timestamp.fromDate(examData.notificationTime) : null,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, EXAMS_COLLECTION), newExam);
    return docRef.id;
  } catch (error) {
    console.error('Error adding exam:', error);
    throw error;
  }
}

// Update an exam
export async function updateExam(examId: string, updates: Partial<Exam>): Promise<void> {
  try {
    const examRef = doc(db, EXAMS_COLLECTION, examId);
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.subject !== undefined) updateData.subject = updates.subject;
    if (updates.date !== undefined) {
      updateData.date = Timestamp.fromDate(updates.date as Date);
    }
    if (updates.time !== undefined) updateData.time = updates.time;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.notificationEnabled !== undefined) updateData.notificationEnabled = updates.notificationEnabled;
    if (updates.notificationTime !== undefined) {
      updateData.notificationTime = updates.notificationTime 
        ? Timestamp.fromDate(updates.notificationTime as Date) 
        : null;
    }

    await updateDoc(examRef, updateData);
  } catch (error) {
    console.error('Error updating exam:', error);
    throw error;
  }
}

// Delete an exam
export async function deleteExam(examId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, EXAMS_COLLECTION, examId));
  } catch (error) {
    console.error('Error deleting exam:', error);
    throw error;
  }
}

