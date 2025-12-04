<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Home</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleDarkMode">
            <ion-icon :icon="isDark ? sunnyOutline : moonOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="home-content">
      <div class="home-container">
        <!-- Current Date & Time -->
        <div class="date-time-section">
          <div class="current-time">{{ currentTime }}</div>
          <div class="current-date">{{ currentDate }}</div>
        </div>

        <!-- Analytics Cards -->
        <div class="analytics-section">
          <div class="stat-card">
            <div class="stat-value">{{ todos.length }}</div>
            <div class="stat-label">Total Tasks</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ completedTodosCount }}</div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ upcomingExamsCount }}</div>
            <div class="stat-label">Upcoming Exams</div>
          </div>
        </div>

        <!-- Quick Add Todo -->
        <div class="quick-add-section">
          <AddTodoForm @add="handleAddTodo" />
        </div>

        <!-- Upcoming Exams -->
        <div v-if="upcomingExams.length > 0" class="section">
          <div class="section-header">
            <h3 class="section-title">Upcoming Exams</h3>
            <ion-button fill="clear" size="small" router-link="/calendar">
              View All
              <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
            </ion-button>
          </div>
          <div class="exams-list">
            <div
              v-for="exam in upcomingExams.slice(0, 3)"
              :key="exam.id"
              class="exam-item"
              @click="goToCalendar"
            >
              <div class="exam-info">
                <div class="exam-title">{{ exam.title }}</div>
                <div class="exam-meta">
                  <span v-if="exam.subject" class="exam-subject">{{ exam.subject }}</span>
                  <span class="exam-date">{{ formatExamDate(exam.date) }}</span>
                </div>
              </div>
              <ion-icon :icon="chevronForwardOutline" class="chevron-icon"></ion-icon>
            </div>
          </div>
        </div>

        <!-- Recent Todos -->
        <div v-if="recentTodos.length > 0" class="section">
          <div class="section-header">
            <h3 class="section-title">Recent Tasks</h3>
            <ion-button fill="clear" size="small" @click="showAllTodos = !showAllTodos">
              {{ showAllTodos ? 'Show Less' : 'Show All' }}
            </ion-button>
          </div>
          <div class="todos-list">
            <TodoItem
              v-for="todo in displayedTodos"
              :key="todo.id"
              :todo="todo"
              @toggle="handleToggleTodo"
              @delete="handleDeleteTodo"
              @edit="handleEditTodo"
            />
          </div>
        </div>

        <!-- Empty States -->
        <div v-if="!loading && !error && todos.length === 0 && upcomingExams.length === 0" class="empty-state">
          <ion-icon :icon="checkmarkDoneOutline" size="large" color="medium"></ion-icon>
          <h2>Welcome!</h2>
          <p>Add a task or exam to get started</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <ion-spinner></ion-spinner>
          <p>Loading...</p>
        </div>

        <!-- Error State -->
        <div v-if="error" class="error-state">
          <ion-icon :icon="alertCircleOutline" size="large" color="medium"></ion-icon>
          <p>{{ error }}</p>
          <ion-button fill="outline" @click="loadData">Try Again</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonSpinner, 
  IonIcon, 
  IonButton,
  IonButtons,
  toastController 
} from '@ionic/vue';
import { 
  alertCircleOutline, 
  checkmarkDoneOutline, 
  moonOutline, 
  sunnyOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { useDarkMode } from '../composables/useDarkMode';
import TodoItem from '../components/TodoItem.vue';
import AddTodoForm from '../components/AddTodoForm.vue';
import { getAllTodos, addTodo, toggleTodoComplete, deleteTodo, updateTodo } from '../services/todoService';
import { getAllExams } from '../services/examService';
import type { Todo, TodoFormData } from '../models/Todo';
import type { Exam } from '../models/Exam';
import { useRouter } from 'vue-router';

const router = useRouter();
const todos = ref<Todo[]>([]);
const exams = ref<Exam[]>([]);
const loading = ref(true);
const error = ref('');
const showAllTodos = ref(false);
const currentTime = ref('');
const currentDate = ref('');
let timeInterval: ReturnType<typeof setInterval> | null = null;

const { isDark, toggleDarkMode } = useDarkMode();

// Update time and date
function updateDateTime() {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  currentDate.value = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Analytics
const completedTodosCount = computed(() => {
  return todos.value.filter(todo => todo.completed).length;
});

const upcomingExamsCount = computed(() => {
  return upcomingExams.value.length;
});

// Upcoming exams (next 3)
const upcomingExams = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return exams.value
    .filter(exam => {
      const examDate = exam.date instanceof Date 
        ? exam.date 
        : exam.date.toDate ? exam.date.toDate() : new Date(exam.date);
      const examDateOnly = new Date(examDate);
      examDateOnly.setHours(0, 0, 0, 0);
      return examDateOnly >= today;
    })
    .sort((a, b) => {
      const dateA = a.date instanceof Date 
        ? a.date 
        : a.date.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date instanceof Date 
        ? b.date 
        : b.date.toDate ? b.date.toDate() : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3);
});

// Recent todos (incomplete first, then completed)
const recentTodos = computed(() => {
  return [...todos.value].sort((a, b) => {
    // Incomplete todos first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Then by creation date (newest first)
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
});

const displayedTodos = computed(() => {
  if (showAllTodos.value) {
    return recentTodos.value;
  }
  return recentTodos.value.slice(0, 5);
});

function formatExamDate(date: Date | any): string {
  const examDate = date instanceof Date 
    ? date 
    : date.toDate ? date.toDate() : new Date(date);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDateOnly = new Date(examDate);
  examDateOnly.setHours(0, 0, 0, 0);
  
  const diffTime = examDateOnly.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays < 7) {
    return `In ${diffDays} days`;
  } else {
    return examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

async function loadData() {
  try {
    loading.value = true;
    error.value = '';
    
    const [todosData, examsData] = await Promise.all([
      getAllTodos(),
      getAllExams()
    ]);
    
    todos.value = todosData;
    exams.value = examsData;
  } catch (err: any) {
    console.error('Error loading data:', err);
    error.value = err.message || 'Failed to load data';
  } finally {
    loading.value = false;
  }
}

async function handleAddTodo(todoData: TodoFormData) {
  try {
    await addTodo(todoData);
    await loadData();
    
    const toast = await toastController.create({
      message: 'Task added!',
      duration: 1500,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  } catch (err: any) {
    console.error('Error adding todo:', err);
    const toast = await toastController.create({
      message: 'Failed to add task',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
}

async function handleToggleTodo(id: string) {
  try {
    const todo = todos.value.find(t => t.id === id);
    if (todo) {
      await toggleTodoComplete(id, !todo.completed);
      await loadData();
    }
  } catch (err: any) {
    console.error('Error toggling todo:', err);
  }
}

async function handleDeleteTodo(id: string) {
  try {
    await deleteTodo(id);
    await loadData();
    
    const toast = await toastController.create({
      message: 'Task deleted',
      duration: 1500,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  } catch (err: any) {
    console.error('Error deleting todo:', err);
  }
}

async function handleEditTodo(id: string, title: string) {
  try {
    await updateTodo(id, { title });
    await loadData();
    
    const toast = await toastController.create({
      message: 'Task updated',
      duration: 1500,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  } catch (err: any) {
    console.error('Error updating todo:', err);
  }
}

function goToCalendar() {
  router.push('/calendar');
}

onMounted(() => {
  updateDateTime();
  timeInterval = setInterval(updateDateTime, 1000);
  loadData();
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<style scoped>
.home-content {
  --background: #f5f5f7;
}

.home-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}

/* Date & Time Section */
.date-time-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.current-time {
  font-size: 48px;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: -1px;
}

.current-date {
  font-size: 16px;
  opacity: 0.9;
  font-weight: 400;
}

/* Analytics Section */
.analytics-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #007AFF;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #86868b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Quick Add Section */
.quick-add-section {
  margin-bottom: 24px;
}

/* Section */
.section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

/* Exams List */
.exams-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exam-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f5f5f7;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.exam-item:active {
  background: #e5e5ea;
}

.exam-info {
  flex: 1;
}

.exam-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 6px;
}

.exam-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 14px;
  color: #86868b;
}

.exam-subject {
  font-weight: 500;
  color: #007AFF;
}

.exam-date {
  color: #86868b;
}

.chevron-icon {
  color: #86868b;
  font-size: 20px;
}

/* Todos List */
.todos-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #86868b;
}

.empty-state h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 16px 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #86868b;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #86868b;
}

.loading-state p {
  margin-top: 16px;
  font-size: 14px;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #86868b;
}

.error-state p {
  margin: 16px 0;
  font-size: 14px;
}

/* Dark Mode */
.dark .stat-card {
  background: #1c1c1e;
}

.dark .section {
  background: #1c1c1e;
}

.dark .exam-item {
  background: #2c2c2e;
}

.dark .section-title {
  color: #ffffff;
}

.dark .exam-title {
  color: #ffffff;
}

.dark .empty-state h2 {
  color: #ffffff;
}
</style>
