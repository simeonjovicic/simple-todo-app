export interface Exam {
  id?: string; // Firestore document ID
  title: string;
  subject?: string;
  date: Date | any; // Firestore Timestamp
  time?: string; // e.g., "14:30"
  location?: string;
  notes?: string;
  notificationEnabled: boolean;
  notificationTime?: Date | any; // Firestore Timestamp (when to send notification)
  createdAt: Date | any; // Firestore Timestamp
}

export interface ExamFormData {
  title: string;
  subject?: string;
  date: Date;
  time?: string;
  location?: string;
  notes?: string;
  notificationEnabled: boolean;
  notificationTime?: Date; // When to send notification (e.g., 1 day before)
}

