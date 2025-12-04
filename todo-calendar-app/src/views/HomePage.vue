<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Tasks</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="todo-content">
      <div class="todo-container">
        <!-- Add Todo Form -->
        <AddTodoForm @add="handleAddTodo" />

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <ion-spinner></ion-spinner>
          <p>Loading tasks...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <ion-icon :icon="alertCircleOutline" size="large" color="medium"></ion-icon>
          <p>{{ error }}</p>
          <ion-button fill="outline" @click="loadTodos">Try Again</ion-button>
        </div>

        <!-- Empty State -->
        <div v-else-if="todos.length === 0" class="empty-state">
          <ion-icon :icon="checkmarkDoneOutline" size="large" color="medium"></ion-icon>
          <h2>No tasks yet</h2>
          <p>Add a task above to get started</p>
        </div>

        <!-- Todo List -->
        <div v-else class="todo-list">
          <TodoItem
            v-for="todo in todos"
            :key="todo.id"
            :todo="todo"
            @toggle="handleToggleTodo"
            @delete="handleDeleteTodo"
          />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonSpinner, 
  IonIcon, 
  IonButton,
  toastController 
} from '@ionic/vue';
import { alertCircleOutline, checkmarkDoneOutline } from 'ionicons/icons';
import TodoItem from '../components/TodoItem.vue';
import AddTodoForm from '../components/AddTodoForm.vue';
import { getAllTodos, addTodo, toggleTodoComplete, deleteTodo } from '../services/todoService';
import type { Todo } from '../models/Todo';

const todos = ref<Todo[]>([]);
const loading = ref(true);
const error = ref('');

async function loadTodos() {
  try {
    loading.value = true;
    error.value = '';
    todos.value = await getAllTodos();
  } catch (err: any) {
    error.value = err.message || 'Failed to load tasks';
    console.error('Error loading todos:', err);
  } finally {
    loading.value = false;
  }
}

async function handleAddTodo(title: string) {
  try {
    await addTodo({ title });
    await loadTodos();
    
    const toast = await toastController.create({
      message: 'Task added',
      duration: 1500,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  } catch (err: any) {
    const toast = await toastController.create({
      message: 'Failed to add task',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
    console.error('Error adding todo:', err);
  }
}

async function handleToggleTodo(id: string) {
  try {
    const todo = todos.value.find(t => t.id === id);
    if (todo) {
      await toggleTodoComplete(id, !todo.completed);
      await loadTodos();
    }
  } catch (err: any) {
    console.error('Error toggling todo:', err);
    const toast = await toastController.create({
      message: 'Failed to update task',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
}

async function handleDeleteTodo(id: string) {
  try {
    await deleteTodo(id);
    await loadTodos();
    
    const toast = await toastController.create({
      message: 'Task deleted',
      duration: 1500,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  } catch (err: any) {
    console.error('Error deleting todo:', err);
    const toast = await toastController.create({
      message: 'Failed to delete task',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
}

onMounted(() => {
  loadTodos();
});
</script>

<style scoped>
.todo-content {
  --background: #f5f5f7;
}

.todo-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-state ion-spinner {
  margin-bottom: 16px;
}

.loading-state p,
.error-state p,
.empty-state p {
  color: #86868b;
  font-size: 16px;
  margin-top: 12px;
}

.empty-state h2 {
  font-size: 22px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 16px 0 8px 0;
}

.error-state ion-icon,
.empty-state ion-icon {
  margin-bottom: 8px;
  opacity: 0.6;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Smooth animations */
.todo-list > * {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
