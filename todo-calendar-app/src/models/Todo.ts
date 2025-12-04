export interface Todo {
  id?: string; // Firestore document ID
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date | any; // Firestore Timestamp
  dueDate?: Date | any; // Firestore Timestamp (optional)
}

export interface TodoFormData {
  title: string;
  description?: string;
  dueDate?: Date;
}

