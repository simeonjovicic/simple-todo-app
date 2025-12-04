import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Todo, TodoFormData } from '../models/Todo';

const TODOS_COLLECTION = 'todos';

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

// Get all todos
export async function getAllTodos(): Promise<Todo[]> {
  try {
    const q = query(collection(db, TODOS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        completed: data.completed || false,
        createdAt: timestampToDate(data.createdAt),
        dueDate: data.dueDate ? timestampToDate(data.dueDate) : undefined,
      } as Todo;
    });
  } catch (error) {
    console.error('Error getting todos:', error);
    throw error;
  }
}

// Add a new todo
export async function addTodo(todoData: TodoFormData): Promise<string> {
  try {
    const newTodo: any = {
      title: todoData.title,
      description: todoData.description || '',
      completed: false,
      createdAt: Timestamp.now(),
    };

    // Only add dueDate if it exists (Firestore doesn't accept undefined)
    if (todoData.dueDate) {
      newTodo.dueDate = dateToTimestamp(todoData.dueDate);
    }

    const docRef = await addDoc(collection(db, TODOS_COLLECTION), newTodo);
    return docRef.id;
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
}

// Update a todo
export async function updateTodo(todoId: string, updates: Partial<Todo>): Promise<void> {
  try {
    const todoRef = doc(db, TODOS_COLLECTION, todoId);
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.completed !== undefined) updateData.completed = updates.completed;
    if (updates.dueDate !== undefined) {
      updateData.dueDate = updates.dueDate ? dateToTimestamp(updates.dueDate as Date) : null;
    }

    await updateDoc(todoRef, updateData);
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
}

// Toggle todo completion
export async function toggleTodoComplete(todoId: string, completed: boolean): Promise<void> {
  try {
    await updateTodo(todoId, { completed });
  } catch (error) {
    console.error('Error toggling todo:', error);
    throw error;
  }
}

// Delete a todo
export async function deleteTodo(todoId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, TODOS_COLLECTION, todoId));
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
}

