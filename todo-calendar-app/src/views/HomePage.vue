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
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      
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
  IonRefresher,
  IonRefresherContent,
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

async function handleRefresh(event: CustomEvent) {
  await loadData();
  (event.target as HTMLIonRefresherElement).complete();
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

.dark .home-content {
  --background: #000000;
}

.home-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Date & Time Section */
.date-time-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 32px 24px;
  margin-bottom: 24px;
  text-align: center;
  color: white;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
  position: relative;
  overflow: hidden;
}

.date-time-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

.current-time {
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: -2px;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.current-date {
  font-size: 17px;
  opacity: 0.95;
  font-weight: 500;
  position: relative;
  z-index: 1;
  letter-spacing: 0.3px;
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
  border-radius: 18px;
  padding: 24px 16px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #007AFF, #5AC8FA);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-card:hover::before {
  transform: scaleX(1);
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: #86868b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* Quick Add Section */
.quick-add-section {
  margin-bottom: 24px;
}

/* Section */
.section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.section:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
  letter-spacing: -0.3px;
}

/* Exams List */
.exams-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exams-list > * {
  animation: slideIn 0.3s ease-out backwards;
}

.exams-list > *:nth-child(1) { animation-delay: 0.1s; }
.exams-list > *:nth-child(2) { animation-delay: 0.15s; }
.exams-list > *:nth-child(3) { animation-delay: 0.2s; }

.exam-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f5f5f7 100%);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}

.exam-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #007AFF, #5AC8FA);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.exam-item:hover {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.exam-item:hover::before {
  transform: scaleY(1);
}

.exam-item:active {
  transform: translateX(2px) scale(0.98);
}

.exam-info {
  flex: 1;
}

.exam-title {
  font-size: 17px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 8px;
  letter-spacing: -0.2px;
}

.exam-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 14px;
  color: #86868b;
}

.exam-subject {
  font-weight: 600;
  color: #007AFF;
  background: rgba(0, 122, 255, 0.1);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 13px;
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
  gap: 10px;
}

.todos-list > * {
  animation: slideIn 0.3s ease-out backwards;
}

.todos-list > *:nth-child(1) { animation-delay: 0.05s; }
.todos-list > *:nth-child(2) { animation-delay: 0.1s; }
.todos-list > *:nth-child(3) { animation-delay: 0.15s; }
.todos-list > *:nth-child(4) { animation-delay: 0.2s; }
.todos-list > *:nth-child(5) { animation-delay: 0.25s; }

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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
  border-color: rgba(255, 255, 255, 0.08);
}

.dark .stat-card:hover {
  background: #242426;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.dark .section {
  background: #1c1c1e;
  border-color: rgba(255, 255, 255, 0.08);
}

.dark .section:hover {
  background: #242426;
}

.dark .exam-item {
  background: linear-gradient(135deg, #2c2c2e 0%, #242426 100%);
  border-color: rgba(255, 255, 255, 0.06);
}

.dark .exam-item:hover {
  background: linear-gradient(135deg, #333335 0%, #2c2c2e 100%);
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

.dark .exam-subject {
  background: rgba(0, 122, 255, 0.2);
  color: #5AC8FA;
}
</style>
