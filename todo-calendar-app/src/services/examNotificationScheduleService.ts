import { collection, doc, setDoc, deleteDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Exam } from '../models/Exam';

// Get notification settings from localStorage
function getNotificationSettings(): number[] {
  try {
    const stored = localStorage.getItem('notificationSettings');
    if (stored) {
      const settings = JSON.parse(stored);
      return settings.daysBefore || [7, 3];
    }
  } catch (error) {
    console.warn('Failed to load notification settings:', error);
  }
  return [7, 3]; // Default fallback
}

const NOTIFICATION_SCHEDULES_COLLECTION = 'examNotificationSchedules';

interface NotificationSchedule {
  examId: string;
  examTitle: string;
  examDate: Date;
  notificationDate: Date;
  daysBefore: number;
  createdAt: Date;
}

// Store notification schedules in Firestore for Cloud Functions to process
export async function storeExamNotificationSchedules(exam: Exam): Promise<void> {
  try {
    if (!exam.notificationEnabled || !exam.id) {
      return;
    }

    const daysBefore = getNotificationSettings();

    const examDate = exam.date instanceof Date 
      ? exam.date 
      : exam.date.toDate ? exam.date.toDate() : new Date(exam.date);

    const now = new Date();
    const examDateOnly = new Date(examDate);
    examDateOnly.setHours(0, 0, 0, 0);

    // Delete existing schedules for this exam
    await deleteExamNotificationSchedules(exam.id);

    // Create schedules for each reminder day
    for (const days of daysBefore) {
      if (days < 0 || days > 365) continue;

      const notificationDate = new Date(examDateOnly);
      notificationDate.setDate(notificationDate.getDate() - days);
      notificationDate.setHours(9, 0, 0, 0); // 9 AM

      // Skip if notification time is in the past
      if (notificationDate < now) {
        continue;
      }

      // Create a unique document ID for this schedule
      const scheduleId = `${exam.id}_${days}`;
      const scheduleRef = doc(db, NOTIFICATION_SCHEDULES_COLLECTION, scheduleId);

      await setDoc(scheduleRef, {
        examId: exam.id,
        examTitle: exam.title,
        examSubject: exam.subject || '',
        examDate: Timestamp.fromDate(examDateOnly),
        notificationDate: Timestamp.fromDate(notificationDate),
        daysBefore: days,
        createdAt: Timestamp.now(),
        sent: false
      });

      console.log(`Stored notification schedule for exam ${exam.title} (${days} days before)`);
    }
  } catch (error) {
    console.error('Error storing exam notification schedules:', error);
    throw error;
  }
}

// Delete notification schedules for an exam
export async function deleteExamNotificationSchedules(examId: string): Promise<void> {
  try {
    const q = query(
      collection(db, NOTIFICATION_SCHEDULES_COLLECTION),
      where('examId', '==', examId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log(`Deleted notification schedules for exam: ${examId}`);
  } catch (error) {
    console.error('Error deleting exam notification schedules:', error);
    throw error;
  }
}

// Store schedules for all exams
export async function storeAllExamNotificationSchedules(exams: Exam[]): Promise<void> {
  for (const exam of exams) {
    if (exam.notificationEnabled) {
      await storeExamNotificationSchedules(exam);
    }
  }
}

